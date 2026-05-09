#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = [
#   "rich>=13.7",
# ]
# ///

from __future__ import annotations

import json
import subprocess
import sys
import threading
import time
import tomllib
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path

from rich import box
from rich.console import Console
from rich.live import Live
from rich.panel import Panel
from rich.rule import Rule
from rich.table import Table
from rich.text import Text

console = Console()

SCRIPT_DIR = Path(__file__).parent
PROMPTS_DIR = SCRIPT_DIR / "prompts"
LOGS_DIR    = SCRIPT_DIR / "logs"
CONFIG_PATH = SCRIPT_DIR / "ralph.toml"

MODES = {
    "1": ("Implement All Feats from Kanban", "implement-userstory.md"),
    "2": ("Create User Stories",             "create-userstories.md"),
    "3": ("Implement from User Story",       "implement-userstory.md"),
}

COMPLETION_SIGNAL = "<promise>COMPLETE</promise>"

PLACEHOLDER_PATHS = {
    "/path/to/your/project",
    "/path/to/your/project/kanban.json",
}
PLACEHOLDER_ITEM = "Your Backlog Item or US-ID Here"


# ── Config ─────────────────────────────────────────────────────────────────────

def load_config() -> dict:
    if not CONFIG_PATH.exists():
        abort(f"Config file not found: {CONFIG_PATH}\nCreate ralph.toml before running.")
    with CONFIG_PATH.open("rb") as f:
        return tomllib.load(f)

def require(config: dict, *keys: str) -> str:
    value = config
    for key in keys:
        value = value.get(key) if isinstance(value, dict) else None
    if not value:
        abort(f"Missing required config: [{'.'.join(keys[:-1])}] {keys[-1]}")
    if str(value) in PLACEHOLDER_PATHS or str(value) == PLACEHOLDER_ITEM:
        abort(f"Placeholder value detected in ralph.toml — set [{'.'.join(keys[:-1])}] {keys[-1]}")
    return str(value)


# ── Helpers ────────────────────────────────────────────────────────────────────

def abort(message: str) -> None:
    console.print(Panel(f"[red]{message}[/red]", title="[bold red]Error[/bold red]", border_style="red"))
    sys.exit(1)


# ── Kanban I/O ─────────────────────────────────────────────────────────────────

def load_kanban(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)

def save_kanban(path: Path, data: dict) -> None:
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

def set_status(data: dict, task_id: str, status: str) -> None:
    def walk(tasks: list) -> bool:
        for task in tasks:
            if task.get("id") == task_id:
                task["status"] = status
                return True
            if walk(task.get("children", [])):
                return True
        return False
    walk(data.get("tasks", []))


# ── Task queries ───────────────────────────────────────────────────────────────

def get_feats(kanban: dict) -> list[dict]:
    return [
        t for t in kanban.get("tasks", [])
        if t.get("type") == "feat" and t.get("status") != "done"
    ]

def get_open_stories(feat: dict) -> list[dict]:
    return [c for c in feat.get("children", []) if c.get("status") != "done"]

def get_feats_without_stories(kanban: dict) -> list[dict]:
    return [
        t for t in kanban.get("tasks", [])
        if t.get("type") == "feat"
        and t.get("status") != "done"
        and not t.get("children", [])
    ]

def get_unblocked_todos(stories: list[dict], kanban: dict) -> list[dict]:
    status_map: dict[str, str] = {}

    def collect(tasks: list) -> None:
        for t in tasks:
            status_map[t["id"]] = t["status"]
            collect(t.get("children", []))

    collect(kanban.get("tasks", []))

    return [
        s for s in stories
        if s.get("status") == "todo"
        and all(status_map.get(b) == "done" for b in s.get("blocked", []))
    ]


# ── Git ────────────────────────────────────────────────────────────────────────

def git_commit(project_path: Path, message: str) -> bool:
    stage = subprocess.run(["git", "add", "-A"], cwd=project_path)
    if stage.returncode != 0:
        return False
    commit = subprocess.run(["git", "commit", "-m", message], cwd=project_path)
    return commit.returncode == 0


# ── Prompt building ────────────────────────────────────────────────────────────

def build_prompt(template_path: Path, item: str, project: Path, kanban: Path) -> str:
    return (
        template_path.read_text()
        .replace("{{ITEM_NAME}}", item)
        .replace("{{PROJECT_PATH}}", str(project))
        .replace("{{KANBAN_PATH}}", str(kanban))
        .replace("{{KANBAN_CONTENT}}", kanban.read_text())
    )


# ── Live dashboard ─────────────────────────────────────────────────────────────

_SPINNER = "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏"


@dataclass
class _AgentStatus:
    last_line: str = ""
    start: float = field(default_factory=time.monotonic)


class LiveDashboard:
    """
    Renders one status row per active agent.
    Worker threads call update(); main thread calls tick() in a poll loop.
    """

    def __init__(self) -> None:
        self._state: dict[str, _AgentStatus] = {}
        self._lock  = threading.Lock()
        self._live  = Live("", refresh_per_second=4, console=console, transient=False)

    def add(self, agent_id: str) -> None:
        with self._lock:
            self._state[agent_id] = _AgentStatus()

    def update(self, agent_id: str, line: str) -> None:
        stripped = line.strip()
        if not stripped:
            return
        with self._lock:
            if agent_id in self._state:
                self._state[agent_id].last_line = stripped

    def remove(self, agent_id: str) -> None:
        with self._lock:
            self._state.pop(agent_id, None)

    def tick(self) -> None:
        self._live.update(self._render())

    def print(self, *args, **kwargs) -> None:
        """Permanently print above the live rows."""
        self._live.console.print(*args, **kwargs)

    def _render(self) -> Table:
        frame = _SPINNER[int(time.monotonic() * 8) % len(_SPINNER)]
        table = Table(box=None, show_header=False, padding=(0, 1), expand=True)
        table.add_column(width=1)
        table.add_column(style="bold cyan", no_wrap=True, width=14)
        table.add_column(style="dim", ratio=1)
        table.add_column(style="yellow", no_wrap=True, width=7)

        with self._lock:
            items = list(self._state.items())

        for agent_id, status in items:
            elapsed = time.monotonic() - status.start
            elapsed_str = (
                f"{int(elapsed)}s" if elapsed < 60
                else f"{int(elapsed // 60)}m{int(elapsed % 60)}s"
            )
            table.add_row(frame, f"[{agent_id}]", status.last_line, elapsed_str)

        return table

    def __enter__(self) -> "LiveDashboard":
        self._live.start()
        return self

    def __exit__(self, *args) -> None:
        self._live.update("")
        self._live.stop()


# ── Claude runner ──────────────────────────────────────────────────────────────

def run_claude(
    prompt: str,
    project: Path,
    log_path: Path,
    agent_id: str = "",
    log_lock: threading.Lock | None = None,
    dashboard: LiveDashboard | None = None,
) -> tuple[bool, bool]:
    """
    Spawn a Claude Code instance. Lines feed the dashboard (if provided) and the log.
    Returns (clean_exit, completion_signal_found).
    --verbose is always passed so the dashboard receives live tool-call output.
    """
    output_chunks: list[str] = []
    log_buffer: list[str] = []

    sep = f" [{agent_id}]" if agent_id else ""
    log_buffer.append(f"\n{'─' * 60}\n{datetime.now().isoformat()}{sep}\n{'─' * 60}\n")

    process = subprocess.Popen(
        ["claude", "--dangerously-skip-permissions", "--print", "--verbose"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        cwd=project,
    )

    process.stdin.write(prompt)
    process.stdin.close()

    for line in process.stdout:
        output_chunks.append(line)
        log_buffer.append(f"[{agent_id}] {line}" if agent_id else line)
        if dashboard is not None:
            dashboard.update(agent_id, line)

    process.wait()

    log_text = "".join(log_buffer)
    if log_lock:
        with log_lock:
            with log_path.open("a", encoding="utf-8") as f:
                f.write(log_text)
    else:
        with log_path.open("a", encoding="utf-8") as f:
            f.write(log_text)

    complete = COMPLETION_SIGNAL in "".join(output_chunks)
    return process.returncode == 0, complete


def _run_in_dashboard(
    prompt: str,
    project: Path,
    log_path: Path,
    agent_id: str,
    dashboard: LiveDashboard,
    log_lock: threading.Lock | None = None,
) -> tuple[bool, bool]:
    """Push run_claude to a thread; main thread drives dashboard ticks. Single-agent helper."""
    result: list[tuple[bool, bool]] = []

    def _target() -> None:
        result.append(run_claude(prompt, project, log_path, agent_id, log_lock, dashboard))

    t = threading.Thread(target=_target, daemon=True)
    t.start()
    while t.is_alive():
        dashboard.tick()
        time.sleep(0.25)
    dashboard.tick()
    t.join()
    return result[0]


# ── Mode 1 orchestrator ────────────────────────────────────────────────────────

def run_mode1(
    project_path: Path,
    kanban_path: Path,
    max_iter: int,
    max_workers: int = 3,
) -> None:
    template_path = PROMPTS_DIR / "implement-userstory.md"
    if not template_path.exists():
        abort(f"Prompt template not found: {template_path}")

    LOGS_DIR.mkdir(exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_path  = LOGS_DIR / f"mode1_{timestamp}.log"

    info = Table(box=box.SIMPLE, show_header=False, padding=(0, 1))
    info.add_column(style="bold cyan", no_wrap=True)
    info.add_column(style="white")
    info.add_row("Mode",    "[bold]1[/bold] — Implement All Feats from Kanban")
    info.add_row("Project", str(project_path))
    info.add_row("Kanban",  str(kanban_path))
    info.add_row("Workers", str(max_workers))
    info.add_row("Log",     str(log_path))

    console.print()
    console.print(Panel(info, title="[bold cyan]Ralph Loop Executor[/bold cyan]", border_style="cyan"))
    console.print()

    kanban = load_kanban(kanban_path)
    feats  = get_feats(kanban)

    if not feats:
        console.print(Panel("[yellow]No open feats found in kanban.[/yellow]", border_style="yellow"))
        return

    for feat in feats:
        feat_id    = feat["id"]
        feat_title = feat["title"]
        console.print(Rule(f"[cyan]FEAT {feat_id}: {feat_title}[/cyan]"))
        console.print()

        attempts: dict[str, int] = {}

        while True:
            kanban     = load_kanban(kanban_path)
            feat_fresh = next((t for t in kanban.get("tasks", []) if t["id"] == feat_id), None)
            if feat_fresh is None:
                console.print(f"  [yellow]{feat_id} not found in kanban — skipping.[/yellow]\n")
                break

            all_stories = feat_fresh.get("children", [])

            # ── Feat with no stories: run Claude directly on the feat ──────────
            if not all_stories:
                attempts[feat_id] = attempts.get(feat_id, 0) + 1
                if attempts[feat_id] > max_iter:
                    console.print(Panel(
                        f"[red]{feat_id} hit max attempts ({max_iter}) — skipping.[/red]",
                        border_style="red",
                    ))
                    break

                console.print(Rule(
                    f"[yellow]Feat {feat_id}: {feat_title} (attempt {attempts[feat_id]}/{max_iter})[/yellow]"
                ))

                set_status(kanban, feat_id, "inprogress")
                save_kanban(kanban_path, kanban)

                prompt = build_prompt(template_path, feat_id, project_path, kanban_path)

                with LiveDashboard() as dash:
                    dash.add(feat_id)
                    clean_exit, complete = _run_in_dashboard(prompt, project_path, log_path, feat_id, dash)
                    dash.remove(feat_id)
                    kanban = load_kanban(kanban_path)
                    if complete:
                        set_status(kanban, feat_id, "done")
                        save_kanban(kanban_path, kanban)
                        if not git_commit(project_path, f"feat({feat_id}): implement {feat_title}"):
                            dash.print(f"  [yellow]Warning: git commit failed for {feat_id}.[/yellow]")
                        dash.print(f"  [green]{feat_id} done.[/green]")
                    else:
                        set_status(kanban, feat_id, "todo")
                        save_kanban(kanban_path, kanban)
                        result_str = "[green]clean exit[/green]" if clean_exit else "[yellow]non-zero exit[/yellow]"
                        dash.print(f"  {result_str} — no completion signal. Resetting {feat_id} to todo.")

                console.print()
                if complete:
                    break
                continue

            # ── Feat with stories: parallel wave execution ─────────────────────
            open_stories = get_open_stories(feat_fresh)

            if not open_stories:
                set_status(kanban, feat_id, "done")
                save_kanban(kanban_path, kanban)
                console.print(f"  [green]FEAT {feat_id} complete.[/green]\n")
                break

            unblocked = get_unblocked_todos(open_stories, kanban)
            if not unblocked:
                console.print(Panel(
                    f"[yellow]All remaining stories for {feat_id} are blocked — skipping.[/yellow]",
                    border_style="yellow",
                ))
                break

            wave: list[dict] = []
            for story in unblocked:
                sid = story["id"]
                attempts[sid] = attempts.get(sid, 0) + 1
                if attempts[sid] > max_iter:
                    console.print(Panel(
                        f"[red]{sid} hit max attempts ({max_iter}) — skipping.[/red]",
                        border_style="red",
                    ))
                    continue
                wave.append(story)
                if len(wave) == max_workers:
                    break

            if not wave:
                console.print(Panel(
                    f"[red]All unblocked stories for {feat_id} hit max attempts — skipping feat.[/red]",
                    border_style="red",
                ))
                break

            wave_ids = ", ".join(s["id"] for s in wave)
            console.print(Rule(f"[yellow]Wave [{wave_ids}] — {len(wave)} worker(s)[/yellow]"))
            console.print()

            for story in wave:
                set_status(kanban, story["id"], "inprogress")
            save_kanban(kanban_path, kanban)

            log_lock      = threading.Lock()
            wave_results: dict[str, tuple[dict, bool, bool]] = {}

            with LiveDashboard() as dash:
                for story in wave:
                    dash.add(story["id"])

                def _run_story(s: dict) -> tuple[dict, bool, bool]:
                    p = build_prompt(template_path, s["id"], project_path, kanban_path)
                    clean, done = run_claude(p, project_path, log_path, s["id"], log_lock, dash)
                    return s, clean, done

                with ThreadPoolExecutor(max_workers=max_workers) as executor:
                    futures = {executor.submit(_run_story, s): s for s in wave}
                    while not all(f.done() for f in futures):
                        dash.tick()
                        time.sleep(0.25)
                    dash.tick()

                for future in as_completed(futures):
                    s, clean_exit, complete = future.result()
                    wave_results[s["id"]] = (s, clean_exit, complete)

                kanban    = load_kanban(kanban_path)
                completed: list[dict] = []

                for sid, (story, clean_exit, complete) in wave_results.items():
                    dash.remove(sid)
                    if complete:
                        set_status(kanban, sid, "done")
                        completed.append(story)
                        dash.print(f"  [green]{sid} done.[/green]")
                    else:
                        set_status(kanban, sid, "todo")
                        result_str = "[green]clean exit[/green]" if clean_exit else "[yellow]non-zero exit[/yellow]"
                        dash.print(f"  {result_str} — no completion signal. Resetting {sid} to todo.")

                save_kanban(kanban_path, kanban)

            console.print()

            if completed:
                ids_str    = ", ".join(s["id"] for s in completed)
                titles_str = " + ".join(s["title"] for s in completed)
                if not git_commit(project_path, f"feat({ids_str}): implement {titles_str}"):
                    console.print(f"  [yellow]Warning: git commit failed for wave [{ids_str}].[/yellow]")


# ── Mode 2 orchestrator ────────────────────────────────────────────────────────

def run_mode2(
    project_path: Path,
    kanban_path: Path,
    max_iter: int,
) -> None:
    template_path = PROMPTS_DIR / "create-userstories.md"
    if not template_path.exists():
        abort(f"Prompt template not found: {template_path}")

    LOGS_DIR.mkdir(exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_path  = LOGS_DIR / f"mode2_{timestamp}.log"

    info = Table(box=box.SIMPLE, show_header=False, padding=(0, 1))
    info.add_column(style="bold cyan", no_wrap=True)
    info.add_column(style="white")
    info.add_row("Mode",    "[bold]2[/bold] — Write User Stories for All Feats")
    info.add_row("Project", str(project_path))
    info.add_row("Kanban",  str(kanban_path))
    info.add_row("Max",     f"{max_iter} iterations per feat")
    info.add_row("Log",     str(log_path))

    console.print()
    console.print(Panel(info, title="[bold cyan]Ralph Loop Executor[/bold cyan]", border_style="cyan"))
    console.print()

    kanban = load_kanban(kanban_path)
    feats  = get_feats_without_stories(kanban)

    if not feats:
        console.print(Panel(
            "[yellow]No open feats without user stories found in kanban.[/yellow]",
            border_style="yellow",
        ))
        return

    for feat in feats:
        feat_id    = feat["id"]
        feat_title = feat["title"]
        console.print(Rule(f"[cyan]FEAT {feat_id}: {feat_title}[/cyan]"))
        console.print()

        for attempt in range(1, max_iter + 1):
            console.print(Rule(f"[yellow]Attempt {attempt} / {max_iter}[/yellow]"))
            console.print()

            kanban = load_kanban(kanban_path)
            prompt = build_prompt(template_path, feat_title, project_path, kanban_path)

            with LiveDashboard() as dash:
                dash.add(feat_id)
                clean_exit, complete = _run_in_dashboard(prompt, project_path, log_path, feat_id, dash)
                dash.remove(feat_id)
                if complete:
                    if not git_commit(project_path, f"feat({feat_id}): write user stories for {feat_title}"):
                        dash.print(f"  [yellow]Warning: git commit failed for {feat_id}.[/yellow]")
                    dash.print(f"  [green]{feat_id} done.[/green]")
                else:
                    status = "[green]clean exit[/green]" if clean_exit else "[yellow]non-zero exit[/yellow]"
                    dash.print(f"  {status} — no completion signal. Retrying...")

            console.print()
            if complete:
                break
        else:
            console.print(Panel(
                f"[red]{feat_id} hit max attempts ({max_iter}) without completion — skipping.[/red]",
                border_style="red",
            ))


# ── Main ───────────────────────────────────────────────────────────────────────

def main() -> None:
    config = load_config()

    project_path = Path(require(config, "project", "path")).expanduser().resolve()
    kanban_path  = Path(require(config, "project", "kanban")).expanduser().resolve()
    mode         = require(config, "task", "mode")
    max_iter     = config.get("loop", {}).get("max_iterations", 20)
    max_workers  = config.get("claude", {}).get("max_workers", 3)

    if not project_path.is_dir():
        abort(f"Project directory not found: {project_path}")
    if not kanban_path.is_file():
        abort(f"Kanban file not found: {kanban_path}")
    if mode not in MODES:
        abort(f"Invalid mode '{mode}' — must be 1, 2, or 3")

    if mode == "1":
        run_mode1(project_path, kanban_path, max_iter, max_workers)
        return

    if mode == "2":
        run_mode2(project_path, kanban_path, max_iter)
        return

    item = require(config, "task", "item")

    mode_label, prompt_file = MODES[mode]
    template_path = PROMPTS_DIR / prompt_file

    if not template_path.exists():
        abort(f"Prompt template not found: {template_path}")

    LOGS_DIR.mkdir(exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_path  = LOGS_DIR / f"mode{mode}_{timestamp}.log"

    prompt = build_prompt(template_path, item, project_path, kanban_path)

    info = Table(box=box.SIMPLE, show_header=False, padding=(0, 1))
    info.add_column(style="bold cyan", no_wrap=True)
    info.add_column(style="white")
    info.add_row("Mode",    f"[bold]{mode}[/bold] — {mode_label}")
    info.add_row("Item",    item)
    info.add_row("Project", str(project_path))
    info.add_row("Kanban",  str(kanban_path))
    info.add_row("Max",     f"{max_iter} iterations")
    info.add_row("Log",     str(log_path))

    console.print()
    console.print(Panel(info, title="[bold cyan]Ralph Loop Executor[/bold cyan]", border_style="cyan"))
    console.print()

    for iteration in range(1, max_iter + 1):
        console.print(Rule(f"[yellow]Iteration {iteration} / {max_iter}[/yellow]"))
        console.print()

        with LiveDashboard() as dash:
            dash.add(item)
            clean_exit, complete = _run_in_dashboard(prompt, project_path, log_path, item, dash)
            dash.remove(item)
            if complete:
                dash.print(Text.assemble(
                    ("Finished in ", "white"),
                    (str(iteration), "bold green"),
                    (" iteration(s) — Log: ", "white"),
                    (str(log_path), "dim underline"),
                ))
            else:
                status = "[green]clean exit[/green]" if clean_exit else "[yellow]non-zero exit[/yellow]"
                dash.print(f"  {status} — no completion signal. Looping...")

        console.print()

        if complete:
            console.print(Panel(
                Text.assemble(
                    ("Finished in ", "white"),
                    (str(iteration), "bold green"),
                    (" iteration(s)\n\n", "white"),
                    ("Log: ", "dim"),
                    (str(log_path), "dim underline"),
                ),
                title="[bold green]COMPLETE[/bold green]",
                border_style="green",
            ))
            sys.exit(0)

    console.print(Panel(
        Text.assemble(
            ("Max iterations (", "white"),
            (str(max_iter), "bold red"),
            (") reached without completion.\n\n", "white"),
            ("Refine [task] item or the prompt templates in prompts/\n", "white"),
            ("Log: ", "dim"),
            (str(log_path), "dim underline"),
        ),
        title="[bold red]STOPPED[/bold red]",
        border_style="red",
    ))
    sys.exit(1)


if __name__ == "__main__":
    main()

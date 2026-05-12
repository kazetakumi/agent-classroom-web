# Next Session Prompt

Paste the block below as your first message.

---

Read `/Users/dreaminds/Desktop/POCs/AgentClassroom/v1/docs/design-handoff.md` and your memory for this project, then build `all-screens.html` at the project root.

## What to build

A single HTML file that shows all seven locked screens as faithful phone mockups, one at a time. A sidebar or tab strip lets the user click any screen name and see only that screen rendered — no scrolling through all of them at once.

## Seven screens to include (in order)

1. **Onboarding (Name)** — Concept A: The Break (locked spec in handoff doc + `docs/superpowers/specs/2026-05-12-onboarding-name-design.md`)
2. **Welcome** — B-Break structure (locked spec in handoff doc)
3. **Question Card** — Annotated + Footer Bar (locked spec in handoff doc)
4. **Ask Sage Sheet** — Full screen + pill handle dismiss (locked spec in handoff doc)
5. **Results** — C: The Ledger (locked spec in handoff doc)
6. **Review Grid** — D: Seat Map, BookMyShow circles 4×3 (locked spec in handoff doc)
7. **Explanation** — A: Four Fields (locked spec in handoff doc)

## File requirements

- Single `.html` file, no external dependencies except Google Fonts
- Google Fonts link: Cormorant Garamond (ital, 300–500) + IBM Plex Mono (300–500) + DM Sans (300–500)
- Phone mockup: `390×800px`, `border-radius: 44px`, shadow matching existing concept files
- Left sidebar or top tab strip: clicking a screen name shows that screen, hides all others
- Active screen tab is visually distinct
- Each screen must faithfully reproduce the locked spec from the handoff doc — correct fonts, weights, colors, layout structure, column grid where applicable
- Use the same CSS variables and class patterns as the locked concept files (`review-concepts.html`, `sage-concepts-3.html`, `explanation-concepts-2.html`) for consistency
- The dark control bar at the top can be reused for the screen selector

## Design system reminder (do not deviate)

- Background: `#FFFFFF`
- Ink: `#111111`
- Labels/muted: `#C8C8C8`–`#D8D8D8`
- Rules/borders: `#F0F0F0`–`#EBEBEB`
- Column grid: `grid-template-columns: 72px 1px 1fr`, gap `16px`
- No accent colours anywhere

## Reference files at project root

- `welcome-concepts.html` — Welcome screen locked frame (B-Break)
- `question-concepts-2.html` — Question Card locked frame
- `sage-concepts-3.html` — Ask Sage Sheet locked frame
- `results-concepts.html` — Results locked frame (C)
- `review-concepts.html` — Review Grid locked frame (D)
- `explanation-concepts-2.html` — Explanation locked frame (A)

Read these concept files to extract the exact HTML/CSS for each screen before writing `all-screens.html` — do not reconstruct from memory.

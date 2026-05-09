# Reading Room Redesign — Design Spec

**Date:** 2026-05-09  
**Status:** Approved  
**Scope:** Full visual redesign of all 5 screens in the Agent Classroom app

---

## Overview

A full UI overhaul replacing the current dark purple gaming aesthetic with a warm, editorial "Reading Room" identity — calm, intelligent, premium. Target audience: students in exam-prep mode. The redesign touches every screen and establishes a coherent design system from scratch.

---

## Design System

### Typography

| Role | Font | Usage |
|------|------|-------|
| Display | DM Serif Display | Question text, score hero number, idle headline, question numbers in review grid |
| UI | DM Sans | All labels, metadata, options text, buttons, explanations, body copy |

Both loaded from Google Fonts. No other typefaces.

**Scale (DM Sans):**
- Eyebrow / meta: `10px`, weight 500, `0.1em` letter-spacing, uppercase
- Option / body: `12–13px`, weight 400
- Button: `12–13px`, weight 500–600, uppercase
- Hint / caption: `10–11px`, weight 400

### Colour Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#f5f0e8` | All screen backgrounds |
| `--ink` | `#1a1714` | Primary text, primary buttons |
| `--terracotta` | `#c96842` | Accent: progress fill, letter badges, eyebrows, chip borders, CTA button |
| `--text-secondary` | `#4a4541` | Option text, body copy |
| `--text-muted` | `#9a8e82` | Metadata, placeholders, pagination |
| `--border` | `#e2d9ce` | Dividers, card borders, progress track |
| `--surface` | `#faf7f2` | Card tile backgrounds |
| `--correct` | `#2d6a4f` | Correct outcome indicators only |
| `--correct-bg` | `#edf7f2` | Correct tinted backgrounds |
| `--wrong` | `#9b2226` | Wrong outcome indicators only |
| `--wrong-bg` | `#fdf0f0` | Wrong tinted backgrounds |
| `--skipped-bg` | `#f2f0ed` | Skipped tinted backgrounds |
| `--skipped-border`| `#ddd8d0` | Skipped tile borders |

### Texture

A very subtle CSS noise grain overlay applied to `body` using an inline SVG `feTurbulence` filter:

```css
/* In index.css */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: 0.035;
  z-index: 9999;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 128px 128px;
}
```

Opacity must stay at or below `0.035` — the effect should be felt, not seen. Test on both light monitors and warm-toned displays before committing the value.

### Spacing

Base unit: `4px`. Common values: `8 / 12 / 14 / 16 / 18 / 22 / 24 / 28px`.

### Border Radius

- Cards / tiles: `8px`
- Buttons: `6–8px`
- Pill chips: `20px`
- Phone-frame wrappers (design only): `18px`

---

## Screen Designs

### 1. Idle Screen

**Layout:** Brief & Direct — personality-led headline, bottom-anchored CTA.

**Structure (top → bottom):**
1. Terracotta chip tag with dot: `● Mathematics` — pill border `#e2c4b5`, text `#c96842`, 10px DM Sans 500
2. DM Serif Display headline: `"Your next` / `revision` *(italic)* / `session."` — 28–32px
3. Sub-copy (DM Sans 11px muted): `17 questions, randomised order. Swipe right to skip, left to go back.`
4. Meta row (DM Sans 10px): `📚 17 questions` · `⏱ ~8 min`
5. **Spacer — pushes footer to bottom**
6. Full-width terracotta CTA button: `Start Revision` — `#c96842` bg, `#f5f0e8` text, 13px DM Sans 500, `border-radius: 8px`, `padding: 13px`
7. Hint text centred below button (DM Sans 10px muted): `Swipe up anytime to pause`

**Padding:** `32px 22px 28px`

---

### 2. Question Card

**Layout:** Progress rail at top, DM Serif Display question, four Soft Card answer tiles.

**Structure:**
1. **Progress section** — `padding: 16px 20px 0`
   - Meta row: `Mathematics · 6 / 17` in 10px DM Sans 500 small-caps muted, space-between
   - Progress rail: 2px height, `#e2d9ce` track, `#c96842` fill, width = `(currentIndex / total) * 100%`, `border-radius: 1px`
   - `margin-bottom: 18px` after rail
2. **Question text** — DM Serif Display, 16px, `line-height: 1.5`, `#1a1714`, `padding: 0 20px 18px`
3. **Answer options** — `padding: 4px 20px 20px`, `gap: 8px`

**Option tile (default state):**
- `border: 1.5px solid #e2d9ce`
- `border-radius: 8px`
- `background: #faf7f2`
- `padding: 10px 14px`
- Letter badge: 20×20px, `#c96842` text, `#f5f0e8` bg, `border: 1px solid #e2d9ce`, `border-radius: 4px`, 10px DM Sans 600
- Option text: 12px DM Sans 400 `#4a4541`

**Option tile (selected state):**
- `border-color: #c96842`
- `background: #fdf5f1`
- Letter badge: `background: #c96842`, `border-color: #c96842`, text `#fff`
- Option text: `#1a1714`

**Gestures (unchanged):** swipe right = skip, swipe left = back, swipe up = companion sheet. No visible swipe buttons.

**Auto-advance:** 1.5s delay after selection — unchanged behaviour.

---

### 3. Results Screen

**Layout:** Score as Hero — giant centred serif number, secondary stats below.

**Structure (centred, `text-align: center`):**
1. Eyebrow: `Session Complete` — 10px DM Sans 500 small-caps `#c96842`, `margin-bottom: 6px`
2. **Score number** — DM Serif Display, 88px, `#1a1714`, `line-height: 1`
3. Denominator: `out of 17` — DM Sans 14px `#9a8e82`, `margin-bottom: 4px`
4. Subtitle: `correct answers · 6 min 42 sec` — DM Sans 11px `#9a8e82`, `margin-bottom: 20px`
5. Thin rule: 32px wide, 1.5px, `#e2d9ce`, centred, `margin-bottom: 16px`
6. **Secondary stats row** — three columns separated by 1px `#e2d9ce` vertical dividers:
   - Correct: DM Serif Display 20px `#2d6a4f` number + 9px DM Sans 500 uppercase muted label
   - Wrong: same, `#9b2226`
   - Skipped: same, `#9a8e82`
   - `margin-bottom: 24px`
7. **Buttons** (full width):
   - Primary: `Review Questions` — `#1a1714` bg, `#f5f0e8` text, 12px DM Sans 600 uppercase, `border-radius: 6px`, `padding: 11px`
   - Ghost: `Start Again` — no bg, `border: 1.5px solid #e2d9ce`, `#9a8e82` text, same size, `margin-top: 8px`

**Padding:** `28px 22px 24px`

---

### 4. Review Grid

**Layout:** Full Tint Background — tile colour communicates outcome at a glance.

**Header structure:**
1. Back link: `← Results` — 10px DM Sans 500 small-caps `#9a8e82`
2. Heading: `Review` — DM Serif Display 20px `#1a1714`
3. Filter pills row: `All · Correct · Wrong · Skipped`
   - Pill: `border: 1.5px solid #e2d9ce`, `border-radius: 20px`, 10px DM Sans 500 `#9a8e82`, `padding: 4px 10px`
   - Active pill: `border-color: #1a1714`, text `#1a1714`

**Grid:** 2 columns, `gap: 8px`, 6 tiles per page

**Tile states:**

| Outcome | Background | Border | Icon | Number colour |
|---------|-----------|--------|------|---------------|
| Correct | `#edf7f2` | `#b8deca` | `✓` `#2d6a4f` | `#2d6a4f` |
| Wrong | `#fdf0f0` | `#e8b4b4` | `✕` `#9b2226` | `#9b2226` |
| Skipped | `#f2f0ed` | `#ddd8d0` | `–` `#b5a99e` | `#9a8e82` |

**Tile layout:**
- Top row: DM Serif Display 18px number (left) + outcome icon 11px bold (right)
- Below: 10px DM Sans `#9a8e82` question preview, 2-line clamp

**Pagination:** `← · 1 / 3 · →` centred, arrow buttons with `border: 1.5px solid #e2d9ce`, `border-radius: 4px`

**Padding:** header `18px 18px 0`, grid `0 18px 14px`, pagination `0 18px 16px`

---

### 5. Explanation Screen

**Layout:** Full Card Stack — all 4 answer options shown as cards with outcome tags, numbered step cards below.

**Structure:**
1. **Header** — `padding: 16px 18px 12px`, `border-bottom: 1px solid #e2d9ce`
   - Back link: `← Review` — 10px DM Sans 500 small-caps `#9a8e82`
   - Meta: `Mathematics · Q02` — 10px DM Sans 500 small-caps `#c96842`
   - Question text: DM Serif Display 14–15px `#1a1714`

2. **Answer options** — `padding: 10px 18px`, `gap: 5px`, `border-bottom: 1px solid #e2d9ce`

   All 4 options rendered as soft cards (matching quiz style):
   - Default: `border: 1.5px solid #e2d9ce`, `background: #faf7f2`, text `#9a8e82`
   - Correct: `border-color: #2d6a4f`, `background: #edf7f2`, text `#2d6a4f`, tag `Correct`
   - Wrong (user's pick): `border-color: #9b2226`, `background: #fdf0f0`, text `#9b2226`, tag `Your pick`
   - Outcome tag: 9px DM Sans 600 uppercase, `margin-left: auto`
   - Letter badge: 10px DM Sans 600, min-width 12px; inherits outcome colour

3. **Step cards** — `padding: 10px 18px 14px`, `gap: 6px`
   - Section label: `Explanation` — 10px DM Sans 600 small-caps `#c96842`
   - Each step: `background: #faf7f2`, `border: 1.5px solid #e2d9ce`, `border-radius: 7px`, `padding: 8px 10px`
   - Step number: DM Serif Display 16px `#e2d9ce` (muted — decorative)
   - Step text: DM Sans 11px `#4a4541`, `line-height: 1.5`

---

## What Does Not Change

- Gesture system (swipe right/left/up)
- Auto-advance timing (1.5s)
- CompanionSheet (pause/resume/end) — visual polish only, no structural change
- State machine and session logic
- Question bank and explanation data
- Routing between screens

---

## Implementation Notes

- **No Tailwind** — project uses pure CSS; all new styles go into existing `.css` files or new component `.css` files
- **Google Fonts** — add `<link>` tags to `index.html` for DM Serif Display and DM Sans
- **CSS custom properties** — define all palette tokens as variables on `:root` in `index.css`, replace hardcoded values throughout
- **Existing dark theme** — `QuestionCard.css` currently hardcodes dark colours (`#0f0f1a`, `#a78bfa`). All colour, background, and font-family values in this file are replaced with Reading Room equivalents. Structural rules (max-width, padding scale, touch-target sizes, responsive breakpoints) are preserved.
- **Grain texture** — implement as a `body::after` pseudo-element or an SVG filter; keep opacity ≤ 0.03
- **Progress rail** — new element added to `QuestionCard.tsx`; width driven by `(currentIndex / total) * 100%`
- **ExplanationScreen background** — currently `#fff`; changes to `#f5f0e8`

---

## Out of Scope

- Dark mode variant
- Session arc / pacing phases
- Timeline review view
- Any changes to question bank, routing logic, or test suite

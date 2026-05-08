# FEAT-001: Agentic Classroom — JEE Revision Feed

**Status:** todo
**Blocked By:** —

---

## Description

A mobile-first React web app that delivers JEE MCQ revision as an infinite swipe feed, styled after the interaction model of Instagram Reels. Students launch the app and immediately begin swiping through questions — no topic selection, no login, no setup.

## Full PRD

See `../backlogs/prd-agentic-classroom.md` for the complete product requirements document, including all 25 user stories, module design, gesture model, session lifecycle, tech stack, and testing decisions.

## Modules

- **QuestionBank** — loads and shuffles static JSON question data
- **QuestionFeed** — session state machine (idle → active → paused → ended), owns navigation and answer tracking
- **QuestionCard** — renders one MCQ card with answer feedback animation
- **SwipeLayer** — gesture detection (swipe right/left/up)
- **CompanionSheet** — pull-up bottom sheet with Pause + End Session commands
- **ResultsScreen** — end-of-session stats display

## Tech Stack

React (Vite), mobile-first CSS, static JSON question bank, no backend, no auth, no persistence.

## Children

See `kanban.json` for the full list of user stories under this FEAT.

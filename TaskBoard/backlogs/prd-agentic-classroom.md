# PRD: Agentic Classroom — JEE Revision Feed

## Problem Statement

Class 12 students preparing for JEE and other entrance exams spend hours doing passive revision using static question banks, mock tests, and video lectures. These formats feel like work — they require the student to sit down, choose a topic, and commit to a structured session. Meanwhile, the same students spend hours scrolling Instagram Reels and YouTube Shorts in an effortless, infinite loop.

There is no revision tool that meets students where they already are: in a frictionless, swipe-based mobile experience that makes practicing MCQs feel as easy and addictive as scrolling a social feed.

## Solution

Agentic Classroom is a mobile-first React web app that delivers JEE MCQ revision as an infinite swipe feed, styled after the interaction model of Instagram Reels. Students launch the app and immediately begin swiping through questions — no topic selection, no login, no setup. Each card is one MCQ. Tapping an answer auto-advances to the next card. A pull-up chat interface gives access to session controls (Pause, End Session). When a session ends, a clean results screen shows performance for that session.

The experience feels like training with a coach, not taking a test.

## User Stories

1. As a JEE aspirant, I want to launch the app and immediately see a question, so that I can start revising without any friction.
2. As a JEE aspirant, I want to see one MCQ at a time on a full-screen card, so that I can focus entirely on the current question.
3. As a JEE aspirant, I want to tap an answer option and immediately see whether I was right or wrong, so that I get instant feedback on my recall.
4. As a JEE aspirant, I want the card to automatically advance to the next question after I answer, so that the session flows like a feed without me having to manually swipe.
5. As a JEE aspirant, I want to see the correct answer highlighted for ~1.5 seconds before the auto-advance, so that I can absorb the right answer even when I get it wrong.
6. As a JEE aspirant, I want to swipe right manually to skip a question I don't want to answer, so that I can keep my momentum going without being forced to engage with every card.
7. As a JEE aspirant, I want to swipe left to go back to the previous card, so that I can revisit a question I just answered or skipped.
8. As a JEE aspirant, I want the feed to feel infinite, so that I never hit a dead end or a "you've finished" wall during a session.
9. As a JEE aspirant, I want to pull up a chat interface by swiping up from the bottom of the screen, so that I can access session controls without leaving the quiz flow.
10. As a JEE aspirant, I want to see predefined command suggestions in the pull-up chat (Pause, End Session), so that I can control my session with one tap.
11. As a JEE aspirant, I want to tap "Pause" in the pull-up chat to pause my session, so that I can step away and return without losing my place.
12. As a JEE aspirant, I want to tap "End Session" in the pull-up chat to finish my session, so that I can see my results whenever I choose to stop.
13. As a JEE aspirant, I want the pull-up chat to close automatically when I select "End Session", so that the transition to the results screen feels smooth.
14. As a JEE aspirant, I want to see a results screen after ending a session showing how many questions I got Correct, Wrong, and Skipped, so that I know how I performed.
15. As a JEE aspirant, I want the results screen to show the total number of questions attempted and total session duration, so that I have a full picture of my session.
16. As a JEE aspirant, I want a "Start Again" button on the results screen, so that I can immediately begin a new session.
17. As a JEE aspirant, I want a "Done" button on the results screen, so that I can exit cleanly.
18. As a JEE aspirant, I want questions to be drawn from Physics, Chemistry, and Mathematics, so that my revision covers all three JEE subjects.
19. As a JEE aspirant, I want questions to be shuffled randomly each session, so that I don't see the same sequence twice.
20. As a JEE aspirant, I want the app to work without logging in, so that I can use it instantly without creating an account.
21. As a JEE aspirant, I want the app to look and feel like a native mobile app even in my browser, so that the swipe interactions feel natural on my phone.
22. As a JEE aspirant, I want each MCQ card to clearly show the question text and four labeled answer options (A, B, C, D), so that the format matches what I'll see in the actual JEE exam.
23. As a JEE aspirant, I want wrong answers highlighted in red and the correct answer highlighted in green during the feedback moment, so that I can instantly parse the result.
24. As a JEE aspirant, I want the pull-up chat to partially overlay the question card rather than replacing it, so that I can still see the question while choosing a command.
25. As a JEE aspirant, I want the app to work smoothly on a mobile screen without horizontal scrolling or broken layouts, so that the experience is frictionless on my phone.

## Implementation Decisions

### Modules

**QuestionFeed (core)**
The central module. Manages the ordered list of questions for the current session, current card index, navigation state (answered, skipped, back-navigated), and session status (active, paused, ended). Exposes a simple interface: current question, answer submission, skip, go-back, and session control actions. All session logic lives here — no other module should own session state.

**QuestionCard**
Renders a single MCQ card. Accepts question data and interaction callbacks. Owns the feedback animation state (correct/wrong highlight, 1.5s delay before signalling advance). Stateless beyond its own animation cycle.

**SwipeLayer**
Handles touch gesture detection wrapping the QuestionCard. Translates swipe-right (skip), swipe-left (go back), and swipe-up (open companion) gestures into action callbacks. Decoupled from question logic — only emits gesture events.

**CompanionSheet**
The pull-up bottom sheet containing the chat-style command interface. Accepts a list of command definitions (label + action). Manages its own open/closed animation state. Emits command selections upward. Unaware of session state.

**ResultsScreen**
Displays end-of-session stats. Accepts a session summary object (correct count, wrong count, skipped count, total attempted, duration). Stateless — pure display. Exposes onStartAgain and onDone callbacks.

**QuestionBank**
A module that loads and shuffles the static JSON question data at session start. Returns a shuffled array of question objects. No network calls — pure data transformation.

### Data Shape

A question object contains: id, subject (Physics/Chemistry/Math), question text, four options (A/B/C/D), and the correct option key. This shape is fixed at the JSON level — no runtime schema changes.

### Gesture Model

- Swipe right → skip current question, advance feed
- Swipe left → go back to previous question
- Swipe up → open CompanionSheet
- Tap answer option → submit answer, trigger feedback, then auto-advance
- Tap outside CompanionSheet (or swipe down) → close CompanionSheet

### Session Lifecycle

`idle → active → paused → active → ended → idle`

The QuestionFeed module owns this state machine. The results screen is shown only in the `ended` state.

### Tech Stack

- React (mobile-first web app)
- CSS touch events / gesture library for swipe detection
- Static JSON file for question data
- No backend, no auth, no persistence — fully stateless

## Testing Decisions

Good tests for this codebase test external behavior, not implementation details. A test should answer: "given this user action or input, does the right thing happen?" — not "did this internal function get called?"

**QuestionFeed** — highest priority for tests. Test: session advances correctly after answer, skip moves forward, go-back restores previous card, session ends when End Session is triggered, session summary is calculated correctly at end.

**QuestionBank** — test that shuffle produces a different order across runs, that all questions are present after shuffle (no drops), and that the data shape matches the expected contract.

**ResultsScreen** — test that correct/wrong/skipped counts render from the summary object, and that onStartAgain and onDone callbacks fire on button press.

**QuestionCard** — test that tapping the correct option triggers the correct feedback state, tapping wrong triggers wrong feedback state, and the advance callback fires after the feedback delay.

CompanionSheet and SwipeLayer are gesture/animation-heavy and are lower priority for unit tests — validate these through manual device testing.

## Out of Scope

- User authentication or accounts
- Data persistence between sessions (localStorage or backend)
- Subject or topic selection before a session
- AI-powered freeform chat or doubt resolution
- Adaptive question selection based on performance
- Gamification (streaks, XP, leaderboards)
- Integer-type or subjective JEE Advanced question formats
- Admin CMS for question management
- Push notifications or session reminders
- Offline support / PWA
- Performance analytics over time

## Further Notes

- Previous Year Questions (PYQs) are the recommended source for the initial static JSON. They are trusted by JEE students, publicly available, and require no licensing.
- The 1.5-second feedback window before auto-advance is a deliberate UX decision — long enough to read the correct answer, short enough to maintain flow.
- The pull-up CompanionSheet is intentionally minimal (Pause + End Session only) for v1. The architecture should make it easy to add more commands later without restructuring the sheet.
- The "infinite" feed is implemented by looping or re-shuffling the question bank when the end is reached — students should never see a termination state unless they explicitly end the session.

# ASTERIA — Part 02: Life Systems

## Scope delivered

Part 02 consolidates the seven personal-life workspaces into a connected, local-first system:

1. **Command Center** — daily execution board, active missions, tasks, XP/credits, long-term goals, learning progress and upcoming deadlines.
2. **Mission Control** — mission lifecycle, difficulty-based XP, exactly-once completion rewards, and assignment into the Daily Planner.
3. **Daily Planner** — date-based tasks, scheduling, priorities, duration, completion, overdue review, conflict detection and mission-task synchronization.
4. **Dream Life & Vision** — life goals, reasons, next actions, milestones, progress calculation, status lifecycle and milestone-to-mission handoff.
5. **Personal Evolution** — habits and check-ins, skill practice, identity traits and growth reflections.
6. **Personal Journal** — dated entries, mood/category/tags, search, filters, favorites, streaks and Markdown export.
7. **System Reports** — date-scoped activity metrics, execution rate, trends, development summary and CSV export.

## Connected workflows

- Mission → Planner: assignment creates one linked task; duplicates are blocked; mission edits synchronize linked task details; mission deletion removes its linked task.
- Mission → Progression: completion requires an Active mission and awards the configured XP/credits once. Planner completion alone does not award mission rewards.
- Goal → Mission: goal milestones can be converted into missions while preserving goal/milestone references.
- Evolution → Progression: a current-day habit check-in awards its configured XP once; duplicate check-ins do not award again.
- Shared reporting: missions, planner tasks, goals, learning, habits, journal, videos and rewards feed the report engine from the same local data model.

## Verification

- Added four cross-module integration regression tests in `tests/life-systems.integration.test.mjs`.
- The tests cover mission assignment/synchronization/completion/reward idempotency, goal milestone progress, habit check-in idempotency, and journal/report consistency.
- Existing domain regression suites continue to cover individual module behavior.
- Branch CI is the authoritative automated verification gate; record the exact test count and build result after the Part 02 branch workflow completes.

## Owner acceptance

The implementation is prepared for the owner to review on desktop and mobile after deployment. This handoff does not claim physical-device visual acceptance. Check the app's responsive layout, theme contrast, keyboard interaction, real-data flows and export behavior on the devices/browsers you use.

All records remain in browser-local storage. Cloud sync, authentication and remote AI are not implied by this milestone.

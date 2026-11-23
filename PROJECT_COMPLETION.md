# ARVENA — 13-Part Completion Tracker

This checklist is the release acceptance record. A part may be checked only when its acceptance criteria are implemented and verified in the deployed PWA. A visible screen or a successful TypeScript/Vite build alone is not sufficient.

## Status key
- [ ] Pending / not yet verified complete
- [x] Complete only after implementation, functional verification, regression checks, and deployment verification

## 1. Command Center
- [ ] Live summary reflects the same underlying records as every module.
- [ ] Next-best-action recommendations are based on actual goals, deadlines, workload, and progress.
- [ ] Responsive desktop/mobile layouts are verified.
- [ ] Empty, loading, error, and populated states are usable.

## 2. Core System
- [ ] One typed shared data model and migration path preserves existing `uls-data-v1` records.
- [ ] Central event, XP, credits, level, progression, and reward rules are tested against duplicate actions and invalid data.
- [ ] Permission/consent boundary exists for every external or consequential action.
- [ ] Storage failure handling, recovery, and schema versioning are tested.

## 3. Mission Control
- [ ] Create, edit, schedule, prioritize, complete, reopen, and archive missions.
- [ ] Completion rewards are idempotent and linked to mission history.
- [ ] Mission assignment is strict-but-balanced and respects protected study time.
- [ ] Mission status and progress are reflected across the app.

## 4. Daily Planner
- [ ] Daily/weekly planning, time blocks, recurring tasks, deadlines, and rescheduling work.
- [ ] Completion state and planner history persist correctly.
- [ ] Conflicts, missed tasks, and overloaded days are handled transparently.
- [ ] Mobile planning interactions are verified.

## 5. Dream Life
- [ ] Goals support milestones, deadlines, priorities, and measurable progress.
- [ ] Goals can be converted into missions/tasks without losing links.
- [ ] Progress and review history are visible and accurate.

## 6. Universal Knowledge
- [ ] Search/discovery works for arbitrary subjects, not only seed courses.
- [ ] Generated curricula progress from fundamentals through advanced/research levels with clear source attribution.
- [ ] Textbook chapters, short notes, long notes, examples, diagrams, exercises, tests, revision, and saved notes/results are available where sources support them.
- [ ] Subject-specific practice modes are supported or clearly identified as unavailable.
- [ ] Unlocks, permanent ownership, mastery, and learning history persist.
- [ ] Offline/AI-unavailable states never pretend that generic fallback content is a complete course.

## 7. Video Learning Studio
- [ ] Video lessons are real playable media or clearly linked external lessons.
- [ ] Narration, subtitles, visuals, and animation capabilities are accurately represented.
- [ ] Any generation provider is actually connected and tested; pricing/limits are disclosed.
- [ ] No mock player or decorative lesson card is represented as generated video.

## 8. Personal Evolution
- [ ] Skills/habits and development areas have measurable records and milestones.
- [ ] Reflections and reviews connect to goals/missions where appropriate.
- [ ] Progress insights are based on recorded data, not fabricated metrics.

## 9. Rewards & Achievements
- [ ] XP and credits have explicit, consistent earning rules.
- [ ] Unlocks support both milestones and spending reward currency.
- [ ] Skills, archives/discoveries, titles/ranks, progression trees, and real-life rewards work.
- [ ] Rarity is separate from educational quality.
- [ ] Purchases/redemptions are atomic, reversible only by defined rules, and never double charged.

## 10. Personal Journal
- [ ] Create, edit, search, filter, and delete entries.
- [ ] Dates, tags, reflections, and optional links to goals/missions persist.
- [ ] Backup/restore includes journal data and handles older formats.

## 11. System Reports
- [ ] Reports aggregate all relevant modules and show their date range and data source.
- [ ] Trends distinguish recorded history from unavailable historical data.
- [ ] Export and empty-state behavior are verified.

## 12. Settings & Security
- [ ] Theme, preferences, and user controls persist.
- [ ] Privacy/storage disclosures match actual behavior.
- [ ] Backup validation, recovery, and destructive-action confirmation are tested.
- [ ] Secrets are never embedded in client source or exported in plain-text backups without explicit warning.
- [ ] Authentication/encryption claims are made only if implemented and verified.

## 13. Integration & Production
- [ ] AI provider connection is real, consent-based, secure, and reports connection/errors accurately.
- [ ] External integrations and automation are permission-gated and tested.
- [ ] PWA install, update, offline shell, and Android browser behavior are verified.
- [ ] Accessibility, responsive behavior, performance, and regression checks pass.
- [ ] Production build and GitHub Pages deployment pass for the final commit.
- [ ] User-facing documentation and known limitations are accurate.

## Release rule
Do not announce ARVENA complete until all 13 sections are checked and the final deployed commit has passed the full acceptance review. If a capability depends on a paid third-party service or unavailable credentials, document it as a limitation rather than marking it complete.

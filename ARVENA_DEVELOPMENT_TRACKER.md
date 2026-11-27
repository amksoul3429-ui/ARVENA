# ASTERIA — Master Development Tracker

## PART 01 — ASTERIA FOUNDATION (Phases 01–04)

> **Status: IN PROGRESS — not signed off.** Checkboxes describe verifiable deliverables, not intentions or documentation alone.

### Phase 01 — Architecture
- [x] Architecture boundaries and data flow documented
- [x] Existing domain modules and storage boundary identified
- [x] Record editor extracted into a dedicated component
- [x] Record form-to-domain mapping extracted into a testable core module
- [x] Every navigable workspace has an explicit typed data-collection mapping and tested scoped filtering/deletion
- [x] Mobile navigation overlay extracted into a dedicated component with centralized page definitions
- [x] Persistence, migration status and cross-tab synchronization encapsulated in useAsteriaData
- [x] Cross-tab explicit reset clears peer tabs without recreating the deleted storage snapshot
- [x] First-run empty state and confirmed reset do not immediately recreate an empty storage snapshot
- [x] Unrecognized legacy/current envelopes are rejected without destructive normalization
- [x] Mission and reward orchestration delegated to useAsteriaActions
- [x] Universal Explorer video library uses the shared app data model in the main app
- [x] Legacy standalone Explorer videos migrate into shared storage before the legacy copy is removed
- [x] Ordinary saves refuse to overwrite malformed or unsupported stored data; explicit confirmed restore has a separate validated write path
- [x] Service-worker activation only removes obsolete ASTERIA-owned caches
- [ ] App shell responsibilities fully refactored and verified against the documented boundary map
- [x] Build/test configuration and deployment workflows consolidated into one automated Pages workflow and verified
- [ ] Remove dead, duplicate or misleading foundation artifacts

### Phase 02 — Identity & Design
- [x] ASTERIA branding and theme tokens exist
- [x] Light/dark theme foundations exist
- [x] High-contrast light-theme overrides implemented across all major workspaces
- [ ] All workspace screens and controls visually verified for contrast and consistency in both themes
- [ ] Original user-approved Sacred Bloom artwork and complete app icon set integrated (placeholder is not accepted)
- [ ] Mobile and desktop visual acceptance completed

### Phase 03 — Core Interface
- [x] Universal Explorer integrated into first-class navigation
- [x] Centered mobile navigation overlay implemented
- [x] Native PWA install prompt and update-ready action are wired into the app shell
- [x] Responsive Explorer styles connected
- [x] Navigation and record dialogs have dialog semantics, initial focus and keyboard focus containment
- [ ] Navigation, overlay, keyboard/accessibility, all workspaces and interactions manually acceptance-tested
- [ ] Interface consistency and responsive behavior accepted across phone/tablet/desktop

### Phase 04 — Data & Storage
- [x] Historical storage key and backup identifier retained
- [x] Data validation, migration and backup/restore code exist
- [x] Import/export/restore paths have automated validation and safe-write regression coverage
- [ ] Import/export/restore tested on real browser/device with existing data and recovery copy
- [ ] Cross-tab updates and storage failures verified
- [ ] PWA installation, update and offline behavior verified on device

### Foundation verification and sign-off
- [x] CI passed: 103/103 automated tests, TypeScript/Vite production build and dependency install on latest completed run 46018051878 (103/103 tests, TypeScript/Vite production build); the subsequent tracker-only commit is also queued for CI
- [ ] Production deployment verified after merge
- [ ] Android/desktop device acceptance complete
- [ ] Part 01 sign-off

## PART 02 — LIFE SYSTEMS

> **Implementation status: DELIVERED — automated cross-module verification pending on this branch; owner desktop/mobile acceptance is intentionally handed off.** See [PART-02-LIFE-SYSTEMS.md](PART-02-LIFE-SYSTEMS.md).

- [x] Command Center — daily execution, system metrics, growth overview and deadlines
- [x] Mission Control — mission lifecycle, exactly-once XP/credit rewards and planner handoff
- [x] Daily Planner — task lifecycle, scheduling, calendar, overdue/conflict review and mission sync
- [x] Dream Life & Vision — goal lifecycle, milestone progress and mission conversion
- [x] Personal Evolution — habit check-ins, skills, identity traits and reflections
- [x] Personal Journal — editor, archive, filters, favorites, streaks and export
- [x] System Reports — cross-module metrics, date ranges, activity trends and CSV export
- [x] Added cross-module regression tests for mission→planner→rewards, goal milestones, habit check-ins, journal and reporting
- [x] Branch CI passed: 107/107 automated tests and TypeScript/Vite production build (workflow 46019743809)
- [ ] Owner desktop/mobile acceptance

## PART 03 — UNIVERSAL KNOWLEDGE

> **Implementation status: delivered; final branch CI and owner device acceptance tracked separately.** See [PART-03-UNIVERSAL-KNOWLEDGE.md](PART-03-UNIVERSAL-KNOWLEDGE.md).

- [x] Universal Knowledge Library — structured multi-subject course and lesson catalogue
- [x] Knowledge Marketplace — search, filters, previews, permanent credit unlocks
- [x] Learning pathways and skill trees — explicit prerequisites, milestone unlocks and optional paid early unlock
- [x] Video Learning Studio — linked videos, notes, chapters, provider validation and privacy-enhanced embeds
- [x] Practice and assessment — knowledge checks gate lesson completion; free retests
- [x] Spaced revision — due queue, 1/2/4… day intervals, incorrect-answer retry and persisted review history
- [x] Mastery analytics — review streak, mastered lesson count and assessment accuracy
- [x] Added pathway and mastery regression suites
- [x] Branch CI passed: 114/114 automated tests and TypeScript/Vite production build (workflow 46021614912)
- [ ] Owner desktop/mobile acceptance
- [ ] Owner YouTube API key configured and live discovery verified

## PART 04 — PROGRESSION & PERSONAL DEVELOPMENT

> **Implementation status: implemented on `part-04-progression-system`; CI and deployment verification pending.** See [PART-04-PROGRESSION.md](PART-04-PROGRESSION.md).

- [x] Shared, idempotent XP and credits award ledger using the existing activity collection
- [x] Centralized level thresholds, progress calculations, rank ladder and titles
- [x] Mission completion and achievement claims routed through duplicate-protected progression awards
- [x] Life-goal milestone completion rewards (20 XP + 2 credits), protected against repeat payouts
- [x] Habit check-in XP awards use stable habit/date event IDs
- [x] Skill practice levels use the shared capped progression rule
- [x] Regression tests for award integrity, duplicate prevention, levels, ranks and skill progression
- [x] Branch CI passed: 118/118 automated tests, TypeScript and Vite production build (workflow 46024178662)
- [x] Main deployment and GitHub Pages deployment passed (workflow 46024304553)
- [ ] Owner desktop/mobile acceptance

## PART 05 — SECURITY, INTEGRATION & PRODUCTION

> Implementation status: implemented on part-05-security-production; CI and deployment verification pending. See [PART-05-SECURITY-PRODUCTION.md](PART-05-SECURITY-PRODUCTION.md).

- [x] Passphrase-encrypted portable backups using AES-256-GCM and PBKDF2-SHA-256
- [x] Encrypted backup import with authenticated decryption, schema validation, restore confirmation and 20 MB limit
- [x] Existing standard and legacy backup compatibility retained; YouTube API key excluded
- [x] Explicit disclosure of local-storage, cloud-sync, remote-AI and encryption-at-rest boundaries
- [x] Lazy-load secondary workspaces to reduce initial application payload
- [x] Accessible keyboard skip-to-content link, workspace loading status and reduced-motion treatment
- [x] Branch CI passed: 121/121 automated tests and TypeScript/Vite production build (workflow 46026447549)
- [x] Main deployment and Pages deployment passed (workflow 46026671681)
- [ ] Owner desktop/mobile and real-device recovery/offline acceptance

**AERIS is a separate application. ASTERIA must not embed an AERIS interface or depend on AERIS to operate.**

**Acceptance handoff:** Implementation and automated checks are prepared on the foundation branch. The unchecked browser/device items are intentionally reserved for the owner to test on their own desktop and mobile devices after the branch is merged and deployed. Do not mark Part 01 signed off until those results are recorded. The original approved Sacred Bloom artwork remains an owner-supplied identity asset; the current mark is interim.
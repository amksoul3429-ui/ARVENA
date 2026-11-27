# ASTERIA — Celestial Dashboard Redesign

## Design direction
A full application-shell redesign inspired by the user's Baby AEGIS reference: persistent desktop navigation, compact global topbar, dense information-rich work area, and a right-side guidance/insight rail. The visual language uses a deep midnight/navy foundation with violet and cyan celestial accents, subtle borders, layered surfaces, and restrained glow.

## Delivered
- Persistent grouped desktop sidebar across all workspaces, with active route indication, operator level and local-first status.
- Redesigned topbar with breadcrumb, current-workspace filter, private-mode indicator, install/update actions, credits, level and theme switch.
- Three-zone desktop composition: navigation, responsive workspace, and right-side companion/insight rail.
- Local-only ASTERIA Guide shortcuts for navigating to existing modules. It explicitly discloses that remote AI is not connected; no fake chatbot or remote AI behavior is presented.
- Daily insight is derived from the user's locally stored tasks, missions and goal progress.
- Refined Command Center hero, metrics, quick actions, execution board, progress panels and deadlines.
- Complete dark and light theme styling with theme preference still persisted by the existing theme hook.
- Tablet layout moves the insight rail below the workspace; mobile layout collapses the desktop sidebar to the existing accessible navigation drawer, stacks the rail and dashboard cards, and keeps search/theme controls available.
- Existing modules, routes, data models, actions, records, backups, PWA and settings functionality are retained.

## Scope boundaries
- The Guide is local navigation and a data-derived briefing, not an AI assistant. Remote AI remains disconnected as already disclosed in Settings.
- Relationship, money-account and external device integrations are not fabricated; the dashboard surfaces ASTERIA's actual modules and locally available data.
- Existing user data and local storage schema are unchanged.

## Owner acceptance
Please review desktop and mobile layouts in both themes. Visual acceptance and real-device behavior remain owner-side checks.

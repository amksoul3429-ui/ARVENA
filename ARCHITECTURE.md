# ASTERIA Architecture — Phase 01

## Boundaries
- **Application shell:** app lifecycle, section navigation, theme selection, notices and modal orchestration.
- **Presentation:** React components in src/components; styles are component CSS and shared foundation tokens.
- **Domain logic:** src/core modules (missions, planner, goals, rewards, evolution, system); UI should call domain helpers rather than reimplement rules.
- **Persistence:** src/core/storage.ts validates, normalizes and serializes data; preserves the legacy storage key and backup compatibility. Cross-tab storage events, including explicit deletion/reset, update every open app instance.
- **External adapters:** permissions and media/service integration remain explicit and capability-gated.
- **Tests:** domain/storage test suite and GitHub Actions checks.

## Data flow
UI event → domain helper/validated state → storage envelope → UI projection. Storage validation is defensive and backup import/export remains the recovery boundary.

## Guardrails
- Keep API tokens and secrets out of committed files and browser storage where possible; never assume static PWA can securely store secrets.
- Preserve existing data formats and use explicit, recoverable migrations.
- Do not pretend offline data or external integrations are available without verification.
- The service worker precaches built entry HTML, JavaScript and CSS; caching only HTML is insufficient for offline startup.
- Settings reports actual persistence write health, not only whether the initial read succeeded.
- Keep modules cohesive and add tests to domain changes.

## Phase 01 follow-up
The app root remains the composition point for page-level workflows. Header, navigation overlay, theme preference, PWA controls, persistence and domain action rules are extracted into dedicated components/hooks/core modules. Remaining app-shell cleanup should preserve that composition role rather than introduce a risky wholesale rewrite.

- **Application boundary:** ASTERIA is an independent PWA. AERIS is a separate application and must not be imported into the ASTERIA interface or required for ASTERIA operation.

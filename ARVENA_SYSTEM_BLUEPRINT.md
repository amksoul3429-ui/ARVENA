# ASTRELIA AND AERIS — System Blueprint (Rebuild 2.0)

## Product identity
**ASTRELIA AND AERIS — Celestial Knowledge Universe & Personal Intelligence System**

The primary purpose is to let a user search for virtually any topic, question, skill, concept, problem or idea and turn it into an ongoing learning experience. A predefined catalogue must never restrict what can be searched or learned.

## Product principles
1. Universal search is the primary entry point; no mandatory subject/category selection.
2. ASTRELIA teaches and helps users understand, not merely link to search results.
3. Topic structures and learning paths are generated dynamically from the user's query and goals.
4. Research, external sources, media, practice and assessments are integrated into a unified learning workspace.
5. Learning is persistent: notes, history, progress and mastery records belong to the user's knowledge memory.
6. The knowledge experience and personal-life tools are connected but not conflated. Tasks are a subsystem, not the app's identity.
7. Mobile-first, lightweight, installable PWA, usable on constrained devices.
8. Dark and light themes follow the approved Sacred Bloom identity: dark celestial midnight/violet; light ethereal lavender-white with high-contrast charcoal text.
9. The Sacred Bloom logo is the brand mark; UI should be elegant, mysterious, premium, restrained and readable.
10. Build honestly: distinguish locally available features, external-service dependencies and unavailable capabilities. No fake search results or fabricated citations.

## Product identity and integrated intelligence\n- **ASTRELIA:** the celestial, elegant, mysterious knowledge universe and primary platform. It is the home for universal learning, research, personal intelligence and personal evolution.\n- **AERIS:** the hybrid intelligence integrated into ASTRELIA, not a separate app. Its three modes are Commander (missions, discipline and accountability), Companion (understanding, support and encouragement), and Strategist (analysis, teaching, planning and problem-solving).\n- **Unified experience:** one app, shared user-approved memory and connected capabilities. Preserve AERIS configuration and behavior while integrating it safely; never silently execute consequential actions.\n- **Voice and wake-word scope:** text and user-initiated voice are planned; always-on wake-word behavior must be validated against browser/PWA permissions and device constraints before being promised.\n\n## Core architecture (target)
- **Core shell:** app navigation, theming, responsive UI, routing, error states, accessibility.
- **Universal Search:** query entry, suggestions, history, intent handling and discovery without topic restrictions.
- **Learning Engine:** adaptive explanations, dynamically constructed paths, chapters, prerequisite handling and teaching modes.
- **Research Engine:** source discovery, retrieval, citations, source quality signals and saved research.
- **Media Engine:** video, audio and reading resources integrated into topic context.
- **Practice & Assessment:** exercises, quizzes, recall, feedback and mastery estimates.
- **Knowledge Memory:** user notes, bookmarks, learning history, progress and portable backup.
- **Knowledge Graph:** relationships between concepts, topics, skills, prerequisites and cross-domain links.
- **Personal System:** goals, missions, projects, planner, health routines, business/finance records and journal; integrated via shared state and events.
- **Evolution & Analytics:** meaningful progress, skill development, analytics, achievements and configurable rewards.
- **Data & integration layer:** versioned storage, migration, validation, import/export, service adapters and optional sync.

## Search-to-learning flow (target)
1. User enters any natural-language query.
2. ASTRELIA identifies a useful learning/research intent; user can override it.
3. Create a subject workspace with overview, suggested structure and relevant resource modes.
4. Teach the requested topic, adapting depth and prerequisites.
5. Offer source-backed research and relevant media as available.
6. Provide practice and assessment; use outcomes to adapt next steps.
7. Save user-approved notes, progress and related concepts.
8. Connect the learning to goals, projects or skills only where useful and optional.

## Design standard
- Sacred Bloom symbol; refined serif or elegant display accent only where appropriate, modern highly legible sans-serif for interface and body.
- Dark theme: midnight/indigo, violet/lavender highlights, restrained cyan and champagne accents.
- Light theme: luminous lavender-white surfaces, deep charcoal/black text and purple/blue accents.
- Mobile-first; home centered on universal search, not task widgets.
- Avoid generic admin-dashboard grids, overuse of cards, excessive glow, clutter and low-contrast text.

## Data and migration safeguards
- Existing user data must be preserved and migrated deliberately.
- Keep the existing storage key/data available until a tested migration path is implemented.
- AERIS is an integral intelligence layer within ASTRELIA. Preserve existing AERIS configuration and functionality; inventory it before refactoring, then integrate it with ASTRELIA's shared memory, knowledge and personal-system data through explicit permissions and user-approved actions.
- Validate imports, back up before destructive migration, and test rollback/recovery.
- Prefer modular adapters and progressively replace old screens instead of a risky all-at-once rewrite.

## Phase plan
1. Foundation & Architecture
2. Brand & UI System
3. Core Interface
4. Universal Search Engine
5. Universal Learning Engine
6. Research & Discovery
7. Media & Resources
8. Practice & Mastery
9. Knowledge Memory
10. Personal Intelligence System
11. Integration & Intelligence
12. Testing & Production

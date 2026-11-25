# ASTRELIA — The Knowledge Universe

**Curiosity has no boundaries.**

ASTRELIA is being rebuilt around a universal knowledge experience: enter any topic, question, skill, concept or idea and create a persistent learning space with six connected modes — Learn, Explore, Watch, Read, Test and Practice.

## Release 1 scope

Release 1 establishes the knowledge foundation:
- A mobile-first, installable PWA with celestial dark and high-contrast light themes.
- Open-ended topic workspaces, not a fixed subject catalogue.
- A seven-stage learning roadmap for each topic, with local progress and notes.
- Discovery directions and direct searches for academic research, reference material and the wider web.
- Direct YouTube topic search and book/article discovery.
- User-created flashcards and practice checklists.
- Local knowledge-space persistence.

**Honest capability boundary:** the current learning roadmap is a structured framework, not an AI-generated textbook. Research and media links open their source services; this build does not yet provide in-app ranked search results, video playback, source verification, AI tutoring or live citations. Those require dedicated integrations and will not be simulated with invented results.

## Existing data protection

The new knowledge workspace uses its own `astrelia-knowledge-v1` browser key. The previous `uls-data-v1` data and legacy modules are not deleted or migrated by this first interface switch. Keep existing browser data and backups until a deliberate, tested migration is delivered.

## Run locally

```bash
npm ci
npm run dev
```

## Verify

```bash
npm test
npm run build
npm run preview
```

Automated build success is not release acceptance. Test topic creation, reload persistence, note saving, flashcards, practice checklists, external links, mobile layouts, light/dark contrast, PWA installation and offline shell behavior on a real device.

## Current platform limits

Knowledge spaces are stored locally in this browser and do not sync across devices. AI model access, accounts, cloud sync, encrypted storage and native Android background capabilities are not connected in this release.

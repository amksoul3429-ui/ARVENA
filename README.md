# ASTRELIA — The Knowledge Universe

**Curiosity has no boundaries.**

Release 1 brings together open-topic discovery, a structured learning library, educational video search, book and research discovery, personal bookmarks, search history, notes and portable backups.

## Release 1 features currently implemented

- **Discover:** open-ended search through Wikipedia's live encyclopedia index; open and read source articles; save an article into the learning library as a source-based reading lesson.
- **Learn:** curated learning paths across broad disciplines, full lesson text, learning objectives, lesson checks, completion tracking and persistent progress. Starter pathways are open in Release 1.
- **Watch:** the existing Video Learning Studio, including YouTube Data API discovery (up to 50 ranked results, English/Hindi/both), video library, saved links, notes and supported embedded playback.
- **Read:** live book search through Open Library and scholarly work search through Crossref.
- **My Library:** saved books, papers and articles, private notes, and recent search history.
- **Data & Backup:** versioned JSON export and validated restore for courses, videos, bookmarks, notes and history.
- **PWA shell:** mobile-responsive interface, dark/light themes, install metadata and versioned offline shell cache.
- **Legacy protection:** on first launch, existing ULS/ARVENA knowledge and video records can be copied into the new ASTRELIA store. The original `uls-data-v1` key is not erased or rewritten by ASTRELIA.

## Important limits — not yet Release 1 acceptance

- The curated curriculum is a substantial starter library, not an infinite catalogue. Arbitrary topics can be searched and saved as source-reading lessons, but a universal AI teacher that generates complete, adaptive, beginner-to-expert textbooks is **not connected yet**.
- Wikipedia search and extracts, Open Library and Crossref are live external sources. Availability, coverage and response times depend on those services; source content should be checked against independent references.
- YouTube Data API discovery requires the user's own API key. The current studio stores that key in this browser's local storage. Restrict the key to the app's website origin and the YouTube Data API v3 in Google Cloud; never commit it to GitHub or share it. A secure server-side proxy is preferable for a production deployment.
- Video playback depends on the video's embed permissions and YouTube/Vimeo availability.
- Knowledge data is local to this browser/device. There is no account or automatic cross-device sync, encrypted cloud storage or native Android background service.
- The approved Sacred Bloom logo asset has not yet been added to this branch; the current header mark is a temporary icon.
- Offline mode caches the app shell and assets. Live search and external source retrieval still require an internet connection.
- AI tutoring, adaptive generated curricula, full citation-backed synthesis and universal subject coverage require a configured AI service and a secure backend. The app does not pretend those capabilities exist.

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

Automated tests and a successful build are necessary, not sufficient. Manual acceptance is still required on Android and desktop: topic search, course completion, YouTube key validation, language filters, playback, book/paper results, bookmarks, note persistence, export/restore, light/dark contrast, install and offline shell.

## Data and privacy

ASTRELIA uses `astrelia-release1-v1` for its new knowledge data. Export regular JSON backups and keep them private. The browser storage and backup file are not encrypted. Legacy ULS data remains in its original key as a safety copy.

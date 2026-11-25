# ASTRELIA — The Knowledge Universe

**Curiosity has no boundaries.**

Release 1 brings together open-topic discovery, a structured learning library, educational video search, book and research discovery, personal bookmarks, search history, notes and portable backups.

## Release 1 features currently implemented

- **Discover:** open-ended search through Wikipedia's live encyclopedia index; open and read source articles; save an article into the learning library as a source-based reading lesson.
- **AI Teacher:** Gemini-powered arbitrary-topic course generation (8–12 progressive lessons with objectives and checks), plus contextual tutor Q&A. Requires the user's own Google AI Studio API key; the key stays in browser local storage and is not included in backups.
- **Learn:** curated learning paths across broad disciplines, full lesson text, learning objectives, lesson checks, completion tracking and persistent progress. AI-generated courses can be saved into the same library.
- **Practice:** persistent flashcards with reveal/hide answers, exercise and project checklists, completion tracking and migrated practice records from the first prototype.
- **Watch:** the existing Video Learning Studio, including YouTube Data API discovery (up to 50 ranked results, English/Hindi/both), video library, saved links, notes and supported embedded playback.
- **Read:** live book search through Open Library and scholarly work search through Crossref.
- **My Library:** saved books, papers and articles, private notes, and recent search history.
- **Data & Backup:** versioned JSON export and validated restore for courses, videos, bookmarks, notes and history.
- **PWA shell:** mobile-responsive interface, dark/light themes, install metadata and versioned offline shell cache.
- **Legacy protection:** on first launch, existing ULS/ARVENA knowledge and video records can be copied into the new ASTRELIA store. The original `uls-data-v1` and first-prototype `astrelia-knowledge-v1` keys are not erased or rewritten by ASTRELIA; the new app reads and copies compatible records into its own store.

## Important limits — not yet Release 1 acceptance

- AI Teacher uses a bring-your-own-key Gemini connection. It is not a bundled or private server-side AI service. The user must create and enter a key, check model availability and quotas, and accept Google's applicable data terms. API keys stored in browser storage are not secret from someone with access to that browser.
- Wikipedia search and extracts, Open Library and Crossref are live external sources. Availability, coverage and response times depend on those services; source content should be checked against independent references.
- YouTube Data API discovery requires the user's own API key. The current studio stores that key in this browser's local storage. Restrict the key to the app's website origin and the YouTube Data API v3 in Google Cloud; never commit it to GitHub or share it. A secure server-side proxy is preferable for a production deployment.
- Video playback depends on the video's embed permissions and YouTube/Vimeo availability.
- Knowledge data is local to this browser/device. There is no account or automatic cross-device sync, encrypted cloud storage or native Android background service.
- The approved Sacred Bloom logo asset has not yet been added to this branch; the current header mark is a temporary icon.
- Offline mode caches the app shell and assets. Live search and external source retrieval still require an internet connection.
- AI course generation and tutoring become available after the user configures Gemini. A secure backend is still recommended before a public multi-user production launch; direct browser key use is a personal-use integration, not a production secret-management design. AI-generated content can be inaccurate and must be checked.

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

The current GitHub Actions run passes all 91 automated tests and the production build. Automated tests and a successful build are necessary, not sufficient. Manual acceptance is still required on Android and desktop: topic search, course completion, YouTube key validation, language filters, playback, book/paper results, bookmarks, note persistence, export/restore, light/dark contrast, install and offline shell.

## Data and privacy

ASTRELIA uses `astrelia-release1-v1` for its new knowledge data. Export regular JSON backups and keep them private. The browser storage and backup file are not encrypted. Legacy ULS data remains in its original key as a safety copy.

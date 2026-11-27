# ASTERIA — Personal Intelligence System

**Explore anything. Understand everything.**

ASTERIA is a local-first personal operating system built as an installable Progressive Web App (PWA). It brings life planning, learning, personal development, rewards and reports into a responsive workspace.

## Workspaces
- Command Center
- Mission Control
- Daily Planner
- Dream Life goals and milestones
- Universal Knowledge Library
- Video Learning Studio (live YouTube discovery requires a restricted YouTube Data API key)
- Personal Evolution
- Rewards & Achievements
- Personal Journal
- System Reports
- Settings & Security

## Run locally
```bash
npm ci
npm run dev
```

## Verify and build
```bash
npm test
npm run build
npm run preview
```

GitHub Actions runs quality checks and the production build in one workflow, with Pages deployment restricted to the `main` branch. A successful branch build does not mean a production deploy or device acceptance has been verified.

## Install
Production URL: https://amksoul3429-ui.github.io/ARVENA/

Open the URL in Chrome on Android or a supported browser and use **Install app** / **Add to Home screen**. A service worker caches the built shell and entry assets for offline startup. Where supported, the app offers a native install prompt and an explicit update-ready action; both still require on-device acceptance.

## Data, compatibility and privacy
- Records are saved locally in the browser under the backward-compatible `uls-data-v1` key.
- Data is device/browser-local. Cloud sync and user accounts are not connected.
- JSON backup and restore are available in Settings & Security. Keep exports private.
- Local browser storage and exported backups are not encrypted in this build.
- AI processing, secure cloud storage, authentication, encrypted backup and external actions are not connected.
- The YouTube API key is saved locally in browser settings only, excluded from backups, and never committed. Restrict the key to YouTube Data API v3 and the site referrer. Rotate any exposed key.

## Acceptance status
**Part 01 — ASTERIA Foundation remains in progress.** The tracker is evidence-based and does not claim completion from styling commits or documentation. Remaining work includes architecture cleanup, visual acceptance of all workspace themes, original approved identity artwork, real-browser storage/backup/restore checks, production deployment verification and manual Android/desktop acceptance of navigation, installation, offline and update behavior. AERIS is separate and is not an ASTERIA runtime dependency.

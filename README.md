# ARVENA — Personal Intelligence System

**Think beyond. Evolve beyond.**

ARVENA is a local-first personal operating system built as an installable Progressive Web App (PWA). It combines life planning, learning, personal development, rewards and reporting in one responsive workspace.

## Workspaces

- Command Center
- Mission Control
- Daily Planner
- Dream Life goals and milestones
- Universal Knowledge Library
- Video Learning Studio (YouTube discovery requires the user's own restricted YouTube Data API key)
- Personal Evolution (habits, skills, identity and reflections)
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

GitHub Actions runs the automated regression suite and production build, then deploys the production artifact to GitHub Pages from `main`.

## Install the PWA

Open [ARVENA](https://amksoul3429-ui.github.io/ARVENA/) in Chrome on Android or a supported desktop browser, then choose **Install app** or **Add to Home Screen**. The app shell is cached by a service worker for offline startup. A device-level offline test is still required after each release.

## Data and privacy

- App records are stored in browser local storage under the backward-compatible `uls-data-v1` key.
- Records are local to each browser/device. There is no account or cross-device cloud synchronization.
- Versioned JSON backup and restore are available in Settings & Security. Keep exported backups private.
- Local storage and exported backups are not encrypted by this build.
- AI model access, remote AI processing, login/authentication, encrypted cloud storage, Health Connect and external actions are not connected.
- The YouTube API key is stored in the browser only and excluded from app backups. Never commit or share it. Use a restricted key and rotate any key previously pasted into chat or exposed.

## Release acceptance

Automated tests and production builds are necessary but do not replace manual acceptance on Android and desktop. Confirm navigation, data persistence, backup/restore, PWA installation, offline shell behavior and update delivery on the actual devices before calling a release fully accepted.

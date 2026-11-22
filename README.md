# ARVENA — Personal Intelligence System

**Think beyond. Evolve beyond.**

ARVENA is a private, local-first personal evolution workspace. It is built on the reusable Universal Life System foundation.

## Included in this foundation
- Command Center, Mission Control, Daily Planner
- Dream Life goals, Personal Evolution, Knowledge Library
- Rewards, Journal, Reports, Settings
- Mission XP and reward-credit progression
- Local JSON backup and restore
- Installable PWA foundation with offline app-shell caching

## AERIS
AERIS is the planned hybrid intelligence interface for ARVENA. The current first build focuses on the app foundation and local functionality. A live AI model connection, persistent background wake-word listening, cloud sync, authentication, encrypted sync and native Android packaging are not yet included.

## Run locally
```bash
npm install
npm run dev
``

Production build:
```bash
npm run build
npm run preview
``

## Data and privacy
Your app records are stored in this browser's localStorage. They are not encrypted or synced to a server. Export backups regularly and keep them private. Clearing browser storage can erase app data.

## Install
Deploy the production build to an HTTPS host, then use your browser's Install app / Add to Home Screen option. PWA installation and offline behavior must be verified on the target device after deployment.

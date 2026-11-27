# Part 05 — Security, Integration & Production

## Implemented
- Optional encrypted portable backups using AES-256-GCM authenticated encryption and PBKDF2-SHA-256 (310,000 iterations), with fresh random salt and IV per export.
- Passphrases are requested locally and are never uploaded or persisted by ASTERIA. A forgotten passphrase cannot be recovered.
- Restore detects encrypted and standard versioned/legacy backups, decrypts before schema validation, confirms replacement, and enforces a 20 MB file limit.
- Existing standard JSON backup format and historical local-storage key remain compatible. YouTube API key remains excluded.
- Secondary workspaces are lazy-loaded to reduce initial application payload; an accessible loading status is provided.
- Added a keyboard-visible skip-to-content link and reduced-motion-aware focus treatment.
- Existing validated storage writes, restore confirmation, cross-tab handling, permission-on-demand, service-worker cache ownership and PWA update flow remain in place.

## Explicit integration boundaries
- Cloud sync, authentication, remote AI, encrypted-at-rest browser storage and server-side integrations remain disconnected. This repository has no authenticated backend or owner-provided service credentials; no mock connection is represented as live.
- Encrypted backup files are protected, but local browser data is not encrypted at rest. Keep backup passphrases separately.

## Owner acceptance
Desktop/mobile visual acceptance, real-device offline/install/update, keyboard/screen-reader review and restore from an independently stored encrypted backup remain owner-side acceptance tasks.

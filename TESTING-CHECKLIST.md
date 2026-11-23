# ARVENA — Manual Acceptance Checklist

Use this checklist on the deployed app after the GitHub Actions build and deployment succeed. Test on Android Chrome first, then on desktop if available.

## Before testing

- [ ] Open the production app: https://amksoul3429-ui.github.io/ARVENA/
- [ ] Confirm the page loads without a blank screen or browser error.
- [ ] If an older version appears, close the installed PWA/tab completely, reopen the URL, and refresh once.
- [ ] Create a backup in Settings & Security before testing restore/reset features.
- [ ] Do not use Reset Local Data during ordinary testing.

## A. Navigation and responsive layout

- [ ] Tap the hamburger/menu button.
- [ ] Confirm the navigation panel appears horizontally and vertically centred on the screen.
- [ ] Confirm the menu is not attached to the left edge.
- [ ] Confirm the background dims while the menu is open.
- [ ] Tap each navigation item; confirm the correct workspace opens and the menu closes.
- [ ] Reopen the menu and close it with the X button.
- [ ] Tap outside the menu; confirm the menu closes if the overlay supports outside dismissal.
- [ ] Repeat in both dark and light themes.
- [ ] Confirm the main workspace remains readable and is not shifted or redesigned by the menu change.

## B. Core workspaces

- [ ] Command Center loads and its summary cards display without errors.
- [ ] Mission Control: create a test mission, edit it, activate it, complete it, and verify XP/credits update once.
- [ ] Daily Planner: create a task, change its date, mark it complete, and undo completion.
- [ ] Dream Life: create a goal and update its progress/milestones.
- [ ] Personal Evolution: create a habit/skill record and test its check-in flow.
- [ ] Knowledge Library: create a course, add a lesson, open it, and test lesson progress.
- [ ] Video Learning Studio: open the workspace and test the checks in section G below.
- [ ] Rewards & Achievements: inspect an achievement, claim an eligible one once, and verify credits/XP.
- [ ] Personal Journal: create an entry, edit it, and confirm it remains after refresh.
- [ ] System Reports: open reports and confirm they render with empty and populated data.
- [ ] Settings & Security: inspect storage status, notification controls, and backup/restore.

## C. Persistence and data safety

- [ ] Create one harmless test record in two different workspaces.
- [ ] Refresh the page; confirm both records remain.
- [ ] Close and reopen the app; confirm the records remain.
- [ ] Export a backup and confirm a JSON file is downloaded.
- [ ] Keep the backup private; it may contain personal journal and life-planning data.
- [ ] If testing restore, use a copy of the backup and verify records return.
- [ ] Confirm ordinary refresh/navigation does not erase records.
- [ ] Do not test destructive reset unless you have a verified backup and intentionally want to test reset.

## D. PWA and offline checks

- [ ] In Android Chrome, use the browser menu to install ARVENA / Add to Home screen.
- [ ] Open ARVENA from its installed icon.
- [ ] Confirm the app shell opens and navigation works.
- [ ] With the app loaded once, briefly enable airplane mode and reopen it.
- [ ] Confirm the cached app shell appears; online YouTube discovery is expected to require internet.
- [ ] Turn internet back on and confirm the app recovers.
- [ ] Confirm a new deployment is eventually reflected after reopening/reloading the app.

## E. Theme and usability

- [ ] Switch dark to light theme.
- [ ] Navigate to another workspace; confirm the selected theme remains.
- [ ] Refresh; confirm the selected theme remains.
- [ ] Check that buttons, forms, dialogs, text, and navigation remain readable.
- [ ] Check the layout at narrow phone width and in portrait orientation.

## F. Automated checks

GitHub Actions workflow `.github/workflows/build.yml` is configured to run:

1. `npm ci`
2. `npm test`
3. `npm run build`
4. GitHub Pages deployment from `main`

A successful local build or test suite does not replace the device checks above. Treat deployment as accepted only after the Actions run succeeds and the deployed app is opened and tested.

## G. Step 7 — Video Learning Studio / YouTube API verification

### One-time Google Cloud setup

- [ ] Open the Google Cloud Console: https://console.cloud.google.com/apis/library/youtube.googleapis.com
- [ ] Select or create a Google Cloud project.
- [ ] Enable **YouTube Data API v3** for that project.
- [ ] Create an API key under APIs & Services → Credentials.
- [ ] Under API restrictions, restrict the key to **YouTube Data API v3**.
- [ ] Under website/referrer restrictions, allow the production origin, for example `https://amksoul3429-ui.github.io/*`.
- [ ] If testing on a local Vite server, add the exact localhost origin/referrer you use (for example `http://localhost:5173/*`) temporarily.
- [ ] Never commit the API key, add it to source code, put it in a public issue, or paste it into chat. Enter it only in ARVENA's password-style API-key field.
- [ ] Do not assume that saving a key means it is valid; the app now labels the key as unverified until a real search succeeds.

### Live discovery test

- [ ] Open Video Learning Studio → YouTube API Settings.
- [ ] Enter the key in the app and press **Save Key**.
- [ ] Confirm the message says the key is saved locally and still needs verification.
- [ ] Enter a clear topic such as `JEE Main Physics Rotational Motion`.
- [ ] Select an appropriate level and press **Find & Rank Videos**.
- [ ] A successful test should show real existing YouTube videos, channel names, durations, view counts, thumbnails, and ranking signals.
- [ ] Open one result on YouTube and confirm it is a real video relevant to the topic.
- [ ] Save one result to the library.
- [ ] Confirm the saved video appears in the library and can be selected.
- [ ] Confirm the embedded player loads; use **Open Original** if the creator, region, or YouTube settings prevent embedding.
- [ ] Mark the video In Progress, then Watched; confirm the counters update.
- [ ] Add study notes and chapters; refresh and confirm they persist.
- [ ] If a Knowledge Library course exists, link the video to a course and lesson and verify the course connection.
- [ ] Search for the same topic again and confirm an already-saved video is not added twice.

### If discovery fails

- [ ] Read the exact error shown in Video Learning Studio.
- [ ] `API key not valid`: check the key and ensure YouTube Data API v3 is enabled for the same project.
- [ ] `API has not been used / is disabled`: enable YouTube Data API v3 and allow time for Google changes to propagate.
- [ ] `RefererNotAllowedMapError`: add the exact deployed site referrer to the key's website restrictions.
- [ ] `quotaExceeded`: check the project's YouTube Data API quota and retry after quota availability resets.
- [ ] `403` or `accessNotConfigured`: review API enablement and key restrictions.
- [ ] If the app finds no results, try a broader topic; this is different from an API connection error.
- [ ] Never remove key restrictions as a permanent workaround. Fix the allowed API and website referrer settings instead.

### Step 7 acceptance criteria

Step 7 is accepted only when a real search using the user's restricted key succeeds, results are relevant existing YouTube videos, a result can be saved and played (or opened on YouTube if embedding is blocked), notes/status persist, and the API key is not present in GitHub source or app backup exports.

## Test result log

- Device/browser:
- Date:
- GitHub Actions build/test result:
- Navigation result:
- Core workspace result:
- Backup/restore result:
- PWA/offline result:
- YouTube API result:
- Issues/screenshots to report:

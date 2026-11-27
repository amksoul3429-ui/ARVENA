# ASTERIA — Part 03: Universal Knowledge

## Scope delivered

Part 03 makes learning a connected system rather than a standalone list:

1. **Universal Knowledge Library** — structured courses and lessons across science, mathematics, technology, health, psychology, humanities, philosophy, economics, business, communication, creative practice and sustainability.
2. **Knowledge Marketplace** — searchable and filterable catalogue, course previews, one-time credit unlocks, permanent access, lesson objectives and source references.
3. **Learning pathways and skill trees** — prerequisite relationships connect subject foundations to downstream courses. Completing a prerequisite unlocks its dependent course automatically. Credit unlocks remain an explicit early-access path where a positive cost is configured.
4. **Video Learning Studio** — video library, YouTube/Vimeo URL validation, privacy-enhanced YouTube embeds, notes, chapters, watch status and links from videos to course lessons.
5. **Practice, assessment, revision and mastery** — knowledge checks gate lesson completion; completed lessons can be retested; spaced revision schedules correct answers at increasing intervals (1, 2, 4… up to 90 days), while incorrect answers reset the interval to one day. Review attempts, accuracy and mastery streaks persist with the lesson.

## Learning progression

- Lesson completion awards 10 XP; completing all lessons in a course awards a one-time 50 XP course bonus.
- Assessments are free and do not award XP merely for retrying.
- Revision is available for completed lessons and stores attempts, correct answers, interval, streak and next due date in the shared knowledge data.
- Mastery analytics report reviewed lessons, lessons with a three-review correct streak, assessment accuracy and due revision count.
- The starter catalogue assigns explicit prerequisite edges for technology, health, psychology, environment, economics, business, philosophy and creative practice.

## External service disclosure

- The core catalogue, course authoring/learning data, assessment engine, revision schedule and progress work locally.
- Automatic YouTube discovery requires the owner's own YouTube Data API v3 key. The key is configured in Video Learning Studio, stored in that browser's local storage, excluded from ASTERIA backups, and should be restricted in Google Cloud. No API key or live YouTube search is included or claimed by this delivery.
- Cloud course sync, remote AI tutoring and a hosted marketplace backend are not connected.

## Verification

- Added spaced-revision and mastery regression tests, including correct/incorrect scheduling, due queues, accuracy, persisted metadata and pathway relationships.
- Added pathway catalogue tests for prerequisite links and automatic successor unlock.
- Existing knowledge and video tests continue to cover course unlocks, lesson assessments, exactly-once XP, legacy compatibility, video validation, embeds, watch status and YouTube search ranking.
- Branch CI is required to pass on the final Part 03 commit before merge; the final test count and production build result will be recorded in the merged delivery.

## Owner acceptance

The implementation is handed off for the owner's desktop and mobile review after deployment. Real-device visual acceptance, API-key setup and live YouTube search are not claimed as performed here.

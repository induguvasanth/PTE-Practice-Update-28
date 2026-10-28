# Student progress: section and question palette fix

Deploy all files in this folder to the existing GitHub Pages repository. In particular, replace `student-progress.js`, `cloud-sync.js`, and `question-palette.js`. Do not clear browser storage or delete existing Google Sheet rows.

On each page, log in as the student, wait for Google Sheets synchronization, and open a topic. The question palette uses the Sheet question ID where available, including IDs that differ from question positions. The section/topic counters use the same locally merged records.

Test a previously finished Reading question, a Listening question and a Speaking question, and verify a second student's results do not appear. After a new completion, reload and test on a second device. The first visit to a topic may be needed to load its question bank and establish its question-ID mapping.

No Apps Script deployment changes are required for this client-side fix. The Sheet is not modified by this package, but normal website sync may write newly completed records. Back up the Sheet before deployment.

Caution: old records without a usable topic or question ID cannot always be mapped automatically. They remain visible in the dashboard; a unique mapping requires a matching question bank ID.

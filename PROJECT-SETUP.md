# PTE Practice — Deployment and Maintenance

## GitHub Pages
Upload the contents of this project folder to the publishing directory of your GitHub Pages repository. Keep all HTML, JS, and `pronunciation-assets/` files together. GitHub Pages must use HTTPS for microphone access.

## Browser Whisper
The `browser-whisper-worker.js` worker runs Whisper locally on mobile/tablet after recording. It downloads model assets on first use. The PC speech recognition implementation remains in the page scripts. Do not delete `browser-whisper-worker.js`, `browser-acoustics.js`, `whisper-config.js`, or `pronunciation-assets/`.

## Student progress
Keep `student-progress.js`, `cloud-sync.js`, `student-auth.js`, `sync-config.js`, and `Google-Apps-Script/`. Before changing the Apps Script deployment, back up the existing Google Sheet. Deploy `Code.gs` and `Bridge.html` to the existing script project, verify its URL in `sync-config.js`, then test login, completed questions, score saving, and retrieval from a second device.

## Scoring
Keep `pte-mcq-scoring.js`, `task-scoring.js`, `free-evaluator.js`, `pronunciation-evaluator.js`, and related assets. Test multiple-answer partial credit and speaking scoring before student use.

## Removed items
Old update-by-update guides, optional Python/Whisper server experiments, build-time pronunciation source, duplicate reference files, and obsolete change manifests were removed. This does not delete or change data in your Google Sheet.

## Verification
Files were retained based on the current static website references and required assets; this cleanup is not a full browser/device regression test.


## Resource links and pronunciation fixes (Update 28 October 2026)

- Keep `question-resources.js` beside `speaking.html`; it reads resource URL fields from the active question object.
- In the Google Sheet, put resource links in columns named `Resource URL`, `Resource PDF URL`, `Resource YouTube URL`, `Resource Image URL`, or `Resource Web Page URL`. Common alternatives such as `PDF Link`, `YouTube Link`, `Web Link`, `Resource Link`, `Resources`, and `Study Material` are also recognized.
- For each question, put its own links in that question's row. The first Read Aloud question will only show a link if that row has a populated resource field. A spreadsheet URL pasted as a resource should be shared so the website/backend can access it; a private sheet cannot be read by anonymous visitors.
- After updating `Google-Apps-Script/Code.gs`, deploy a new web-app version and clear the script cache/reload the practice page. Keep the website and Apps Script reading the same spreadsheet.
- Pronunciation assets must be published at `pronunciation-assets/` next to `pronunciation-evaluator.js`. The evaluator now resolves assets relative to its own script URL (not the page URL), which supports nested GitHub Pages paths and subfolders.
- Pronunciation is evaluated for Read Aloud and Repeat Sentence against the expected text; for open-response speaking tasks (Describe Image, Retell Lecture, Summarize Group Discussion, Respond to a Situation), the recognized transcript is used as the reference. This is an experimental phoneme-similarity practice estimate, not an official Pearson score.

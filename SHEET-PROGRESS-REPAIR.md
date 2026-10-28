# Google Sheets progress repair

Upload all project files to GitHub Pages. Existing Google Sheets data is not modified by this package.

## Fixed
- Cloud records now retain the task key used in the sheet and map known speaking and reading task keys to their website sections.
- Question palettes can match a saved task key and question ID without requiring the saved module label to match.
- Topic counters recognize saved task keys.

## Verify
1. Deploy and hard-refresh the site. Log in as student 1234.
2. In Read Aloud, questions 1,2,3,4,5,6,9 should show finished.
3. In Reading MCQ Multiple, questions 1,3,4,5,7,8,9,10 should show finished.
4. Log in as 2345 and verify only that student's records appear.
5. Check browser console for `[PTE Cloud Sync]` errors and confirm `Progress synced with Google Sheets`.

## Known limits
- Generic legacy tasks `Reading` and `Speaking___Writing` cannot be safely assigned to a specific topic.
- The Google Apps Script deployment must be operational and up to date.
- No live Google Sheets or mobile-browser test was possible here.

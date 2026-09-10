# Project Rules & Workflow Instructions

## Auto-Push on Verified Updates
Whenever you modify or update any script or configuration file in this repository:
1. **Verification**: Verify that the changes work as intended.
2. **Auto-Push**: If the changes are confirmed working as intended, automatically stage, commit, and push them to GitHub (`git push origin main`).
3. **Safety**: If the changes do NOT work as intended, do NOT push them to GitHub.
 
## Mandatory Version Incrementation Rule
Whenever you (or any AI assistant) modify or update `valence-stealth.js` or any core engine script:
1. **Increment Version**: Always bump the version number in the header (e.g. `v3.1.0` -> `v3.1.1`).
2. **Changelog Entry**: Add an entry into the file's header changelog with the new version, date, and a concise summary of what was changed.

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

## Continuous AI Autonomous Audit Protocol
When tasked with auditing, improving, or validating `valence-stealth.js`:
1. **Run Unified Suite**: Execute `node test-suite.js` (or open `test-suite.html` in browser) to check baseline compliance and integrity.
2. **Expand Probes**: Formulate and append new adversarial interrogation probes to `test-suite.js` targeting edge cases (e.g. async workers, timing jitter, deep prototype traps, cross-realm iframe leaks).
3. **Identify Flaws**: Run the suite to expose leaks in `valence-stealth.js`.
4. **Remediate**: Patch `valence-stealth.js` cleanly to eliminate the detected loopholes while preserving W3C specification compliance.
5. **Verify & Auto-Push**: Re-run the suite until 100% clean passes (0 failures) are achieved, then commit and push to GitHub (`git push origin main`).


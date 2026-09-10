// Valence Stealth Browser Linux Default Preferences
pref("app.update.enabled", false);
pref("app.update.auto", false);
pref("app.update.service.enabled", false);
pref("app.update.staging.enabled", false);
pref("app.update.silent", false);
pref("toolkit.telemetry.enabled", false);
pref("toolkit.telemetry.unified", false);
pref("datareporting.healthreport.uploadEnabled", false);
pref("datareporting.policy.dataSubmissionEnabled", false);
pref("browser.discovery.enabled", false);
pref("browser.urlbar.quicksuggest.enabled", false);
pref("browser.startup.homepage", "https://google.com");
pref("browser.newtabpage.enabled", true);
pref("full-screen-api.warning.timeout", 0);
pref("dom.security.https_only_mode", false);
pref("general.useragent.override", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.7977.82 Safari/537.36");
// Restore full timer precision (Firefox reduces to 1ms by default)
pref("privacy.reduceTimerPrecision", false);
// CRITICAL: Do NOT enable resistFingerprinting — it fights with the stealth engine
pref("privacy.resistFingerprinting", false);
// WebRTC: only use default route, prevent private IP leaks
pref("media.peerconnection.ice.default_address_only", true);
pref("media.peerconnection.ice.no_host", true);
pref("media.peerconnection.ice.proxy_only", false);
// Ensure fingerprint-relevant APIs stay enabled
pref("dom.webaudio.enabled", true);
pref("webgl.disabled", false);
pref("media.navigator.enabled", true);
// Disable Firefox-specific features that can leak identity
pref("browser.send_pings", false);
pref("beacon.enabled", false);
pref("browser.safebrowsing.enabled", false);
pref("browser.safebrowsing.malware.enabled", false);
pref("network.dns.disablePrefetch", true);
pref("network.prefetch-next", false);
// Prevent "Firefox is your default browser" popups
pref("browser.shell.checkDefaultBrowser", false);
// Suppress fullscreen transition warning
pref("full-screen-api.transition-duration.enter", "0 0");
pref("full-screen-api.transition-duration.leave", "0 0");
pref("full-screen-api.allow-trusted-requests-only", false);

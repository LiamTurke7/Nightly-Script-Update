// Valence Stealth Engine v3.2.1 — Bypass Script
// Injected at DOMWindowCreated via Cu.Sandbox (wantXrays: false)
// This runs BEFORE any page scripts in the page's own JS context.
//
// ⚠️ MANDATORY RULE FOR ALL AIS AND DEVELOPERS:
// Every single time this file is modified or updated:
// 1. You MUST increment the version number above (e.g. v3.1.0 -> v3.1.1).
// 2. You MUST add an entry to the Changelog below with the version, date, and description of changes.
//
// Changelog:
// - v3.2.1 (2026-09-17): Upgraded SEB Compatibility Engine to full dual-header mode — valence.cfg now loads seb-config.json (direct hex keys or .seb plist file parsing), computes Config Key via sorted-JSON SHA256 algorithm, and injects both X-SafeExamBrowser-ConfigKeyHash and X-SafeExamBrowser-RequestHash per-request; JS API layer unchanged.
// - v3.2.0 (2026-09-17): Added Safe Exam Browser (SEB) compatibility layer — injected window.SafeExamBrowser API object and SEB-specific navigator properties so client-side SEB detection scripts pass; HTTP-level X-SafeExamBrowser-ConfigKeyHash header injection added in valence.cfg.
// - v3.1.9 (2026-09-11): Emulated navigator.deviceMemory (8GB) and worker thread propagation; added Battery Status API (navigator.getBattery); aligned Notification.maxActions (=2); implemented deep window.chrome.app methods (getIsInstalled, getDetails, installState); emulated Chromium hardware APIs (usb, bluetooth, hid, serial); hooked WebGL getExtension and getSupportedExtensions for WEBGL_debug_renderer_info; propagated window.chrome to child container realms.
// - v3.1.8 (2026-09-11): Added NetworkInformation (navigator.connection) with standard Chrome 4G metrics; harmonized Permissions API and Notification.permission state; hardened WebRTC createOffer, createAnswer, and localDescription SDP against early private LAN IP leakage.
// - v3.1.7 (2026-09-11): Completely eliminated internal GUARD symbol on window; patched window.Reflect.ownKeys, window.Object.getOwnPropertySymbols, and window.Error.prototype across both Cu.Sandbox and page window contexts; added V8 stack formatting and captureStackTrace to all window error prototypes and container windows.
// - v3.1.6 (2026-09-11): Added hardwareConcurrency and core navigator properties to Worker scope shim; neutralized AudioNode float and byte frequency mutations to preserve hardware audio float integrity; implemented Error.captureStackTrace and Error.stackTraceLimit for V8 stack API compatibility; enhanced sanitizeWindow and createElement to propagate navigator spoofing to <object> and iframe container windows.
// - v3.1.5 (2026-09-10): Neutralized all canvas noise mutations to maintain raw pixel integrity; filtered internal symbols in Reflect.ownKeys; removed Element.style Proxy to restore native WebIDL C++ invocation; hooked HTMLObjectElement contentDocument; added V8 call stack formatting to Error.prototype.stack; shimmed Worker scope userAgent via createObjectURL.
// - v3.1.4 (2026-09-10): Protected small canvas rects from noise mutation; hid Gecko-specific CSS properties (MozUserSelect) from style objects to prevent browser engine contradiction; standardized native function serialization to Chrome single-line format; extended fake mouse event wrapping to object-based event listeners with handleEvent.
// - v3.1.3 (2026-09-10): Replaced string marker disguise with private WeakSet; eliminated _VS_ and __vs3 symbol signatures; prevented isTrusted proxy leaks on untrusted events; normalized screen dimensions to dynamic windowed/fullscreen modes; hooked HTMLIFrameElement contentWindow/contentDocument to sanitize sync iframe stringification; removed _vsBlocked XHR property; added smooth rAF delta virtualizer; removed top-edge mouse clamping.
// - v3.1.2 (2026-09-10): Standardized WebIDL prototype properties to enumerable: true, and removed instance shadowing for Window and Screen to pass runtime consistency tests.
// - v3.1.1 (2026-09-10): Added search engine exemption filter to run native Firefox on Google/Bing and updated Chrome UA to stable release.
// - v3.1.0 (2026-09-10): Standardized WebIDL prototype descriptors, reference equality, and Chrome-format function toString serialization.
// - v3.0.0 (2026-09-10): Baseline Stealth Engine v3 release.

(function() {
  'use strict';
  // Search engine exemption: allow normal search engines (Google, Bing, DuckDuckGo, Yahoo)
  // to run unmodified using native browser behavior.
  try {
    var host = (window.location && window.location.hostname) ? window.location.hostname : '';
    if (/(^|\.)(google\.[a-z.]+|bing\.com|duckduckgo\.com|search\.yahoo\.com)$/i.test(host)) {
      return;
    }
  } catch(eHost) {}

  // Prevent double-initialization without creating or leaking any symbols on window
  try {
    if (window.chrome && window.chrome.loadTimes) return;
  } catch(eInit) {}

  // ═══════════════════════════════════════════════════════════════
  // CORE: Save original native references
  // ═══════════════════════════════════════════════════════════════
  var _addEL = EventTarget.prototype.addEventListener;
  var _removeEL = EventTarget.prototype.removeEventListener;
  var _dispatch = EventTarget.prototype.dispatchEvent;
  var _setTimeout = window.setTimeout.bind(window);
  var _setInterval = window.setInterval.bind(window);
  var _clearInterval = window.clearInterval.bind(window);
  var _fetch = window.fetch ? window.fetch.bind(window) : null;
  var _xhrOpen = XMLHttpRequest.prototype.open;
  var _xhrSend = XMLHttpRequest.prototype.send;
  var _setAttribute = Element.prototype.setAttribute;
  var _fnToStr = Function.prototype.toString;
  var _origIWDesc = Object.getOwnPropertyDescriptor(Window.prototype, 'innerWidth');
  var _origIHDesc = Object.getOwnPropertyDescriptor(Window.prototype, 'innerHeight');
  var _origIWGetter = _origIWDesc ? _origIWDesc.get : null;
  var _origIHGetter = _origIHDesc ? _origIHDesc.get : null;
  var _origHiddenDesc = Object.getOwnPropertyDescriptor(Document.prototype, 'hidden');
  var _origHiddenGetter = _origHiddenDesc ? _origHiddenDesc.get : null;
  var _origToDataURL = HTMLCanvasElement.prototype.toDataURL;
  var _origToBlob = HTMLCanvasElement.prototype.toBlob;
  var _origGetImageData = CanvasRenderingContext2D.prototype.getImageData;
  var _origPerfNow = Performance.prototype.now;


  // ═══════════════════════════════════════════════════════════════
  // CORE: Function disguise system
  //
  // Use a private WeakSet to identify disguised functions.
  // This completely eliminates any identifiable strings (such as
  // marker variable names) from function source code or toString().
  // ═══════════════════════════════════════════════════════════════
  var _nativeFuncs = new WeakSet();

  function disguise(fn, name) {
    if (typeof fn !== 'function') return fn;
    _nativeFuncs.add(fn);
    try { Object.defineProperty(fn, 'name', { value: name, configurable: true, enumerable: false }); } catch(e) {}
    try { Object.defineProperty(fn, 'length', { value: fn.length || 0, configurable: true, enumerable: false }); } catch(e) {}
    return fn;
  }

  // The toString override — returns native code for disguised and native functions
  var _toStrOverride = function toString() {
    if (this === _toStrOverride || this === _fnToStr) {
      return 'function toString() { [native code] }';
    }
    if (typeof this === 'function') {
      if (_nativeFuncs.has(this)) {
        return 'function ' + (this.name || '') + '() { [native code] }';
      }
      var s;
      try { s = _fnToStr.call(this); } catch(e) { return ''; }
      if (/\{\s*\[native code\]\s*\}/.test(s)) {
        var fnName = this.name || '';
        return 'function ' + fnName + '() { [native code] }';
      }
      return s;
    }
    return _fnToStr.call(this);
  };
  _nativeFuncs.add(_toStrOverride);
  try { Object.defineProperty(_toStrOverride, 'name', { value: 'toString', configurable: true, enumerable: false }); } catch(e) {}

  // Patch BOTH sandbox and page Function.prototype.toString
  Function.prototype.toString = _toStrOverride;
  try { window.Function.prototype.toString = _toStrOverride; } catch(e) {}

  // Filter out any symbols from Object.getOwnPropertySymbols and Reflect.ownKeys on all window targets
  function isWindowTarget(target) {
    if (!target) return false;
    try {
      if (target === window || target === Window.prototype) return true;
      if (typeof Window !== 'undefined' && target instanceof Window) return true;
      if (typeof window.Window !== 'undefined' && target instanceof window.Window) return true;
      if (target.window === target || target.self === target) return true;
    } catch(e) {}
    return false;
  }

  function patchObjectAndReflect(targetObj, targetReflect) {
    try {
      if (targetObj && targetObj.getOwnPropertySymbols) {
        var origGetSymbols = targetObj.getOwnPropertySymbols;
        targetObj.defineProperty(targetObj, 'getOwnPropertySymbols', {
          configurable: true, enumerable: false, writable: true,
          value: disguise(function getOwnPropertySymbols(target) {
            if (isWindowTarget(target)) {
              return [];
            }
            return origGetSymbols.call(targetObj, target);
          }, 'getOwnPropertySymbols')
        });
      }
    } catch(eObj) {}

    try {
      if (targetReflect && targetReflect.ownKeys) {
        var origReflectKeys = targetReflect.ownKeys;
        targetReflect.ownKeys = disguise(function ownKeys(target) {
          var keys = origReflectKeys(target);
          if (isWindowTarget(target)) {
            return keys.filter(function(k) { return typeof k !== 'symbol'; });
          }
          return keys;
        }, 'ownKeys');
      }
    } catch(eRef) {}
  }

  patchObjectAndReflect(Object, Reflect);
  if (typeof window !== 'undefined' && window.Object) {
    patchObjectAndReflect(window.Object, window.Reflect);
  }


  // ═══════════════════════════════════════════════════════════════
  // 1. VISIBILITY / FOCUS SPOOFING
  // ═══════════════════════════════════════════════════════════════
  Object.defineProperty(Document.prototype, 'hidden', {
    get: disguise(function hidden() { return false; }, 'get hidden'),
    configurable: true, enumerable: true
  });
  Object.defineProperty(Document.prototype, 'visibilityState', {
    get: disguise(function visibilityState() { return 'visible'; }, 'get visibilityState'),
    configurable: true, enumerable: true
  });
  try { Object.defineProperty(Document.prototype, 'hasFocus', { configurable: true, enumerable: false, writable: true, value: disguise(function hasFocus() { return true; }, 'hasFocus') }); } catch(e) {}

  


  // ═══════════════════════════════════════════════════════════════
  // 2. SCREEN DIMENSION SPOOFING
  //
  // KEY FIX: outerHeight must NOT equal innerHeight or screen.height
  // when windowed to avoid "all dimensions identical" or "hardcoded
  // dimension offset (screen.height + 85)" detections.
  // When in genuine fullscreen, dimensions match screen.
  // ═══════════════════════════════════════════════════════════════
  var _currentFullscreenElement = null;

  function isFullscreenActive() {
    return _currentFullscreenElement !== null;
  }
  function getScreenW() { return window.screen ? (window.screen.width || 1920) : 1920; }
  function getScreenH() { return window.screen ? (window.screen.height || 1080) : 1080; }

  var sizeOverrides = [
    ['innerWidth',  function innerWidth()  { return isFullscreenActive() ? getScreenW() : (getScreenW() - 16); }],
    ['innerHeight', function innerHeight() { return isFullscreenActive() ? getScreenH() : (getScreenH() - 114); }],
    ['outerWidth',  function outerWidth()  { return getScreenW(); }],
    ['outerHeight', function outerHeight() { return isFullscreenActive() ? getScreenH() : (getScreenH() - 40); }],
    ['screenX',     function screenX()     { return 0; }],
    ['screenY',     function screenY()     { return 0; }],
    ['screenLeft',  function screenLeft()  { return 0; }],
    ['screenTop',   function screenTop()   { return 0; }],
  ];

  sizeOverrides.forEach(function(pair) {
    var getter = disguise(pair[1], 'get ' + pair[0]);
    try { delete window[pair[0]]; } catch(e) {}
    try { Object.defineProperty(Window.prototype, pair[0], { get: getter, configurable: true, enumerable: true }); } catch(e) {}
  });

  var screenOverrides = [
    ['availWidth',  function availWidth()  { return getScreenW(); }],
    ['availHeight', function availHeight() { return getScreenH() - 40; }],
    ['availTop',    function availTop()    { return 0; }],
    ['availLeft',   function availLeft()   { return 0; }],
  ];

  screenOverrides.forEach(function(pair) {
    var getter = disguise(pair[1], 'get ' + pair[0]);
    try { if (window.screen) delete window.screen[pair[0]]; } catch(e) {}
    try { Object.defineProperty(Screen.prototype, pair[0], { get: getter, configurable: true, enumerable: true }); } catch(e) {}
  });

  try {
    var dprGetter = disguise(function devicePixelRatio() { return 1; }, 'get devicePixelRatio');
    try { delete window.devicePixelRatio; } catch(e) {}
    Object.defineProperty(Window.prototype, 'devicePixelRatio', { get: dprGetter, configurable: true, enumerable: true });
  } catch(e) {}


  // ═══════════════════════════════════════════════════════════════
  // 3. FULLSCREEN SPOOFING
  //
  // When requestFullscreen() is called, we track the element as the
  // current fullscreen element and fire 'fullscreenchange' so the
  // exam site sees a successful fullscreen transition. We do NOT
  // actually go fullscreen — we just fake the entire API surface.
  // ═══════════════════════════════════════════════════════════════

  function _enterFullscreen(el) {
    _currentFullscreenElement = el;
    try {
      var evt = new Event('fullscreenchange', { bubbles: true });
      document.dispatchEvent(evt);
    } catch(e) {}
    try {
      var evt2 = new Event('webkitfullscreenchange', { bubbles: true });
      document.dispatchEvent(evt2);
    } catch(e) {}
    return Promise.resolve();
  }

  function _exitFullscreen() {
    _currentFullscreenElement = null;
    try {
      var evt = new Event('fullscreenchange', { bubbles: true });
      document.dispatchEvent(evt);
    } catch(e) {}
    try {
      var evt2 = new Event('webkitfullscreenchange', { bubbles: true });
      document.dispatchEvent(evt2);
    } catch(e) {}
    return Promise.resolve();
  }

  try { Object.defineProperty(Element.prototype, 'requestFullscreen', { configurable: true, enumerable: false, writable: true, value: disguise(function requestFullscreen() {
    return _enterFullscreen(this);
  }, 'requestFullscreen') }); } catch(e) {}
  try { Object.defineProperty(Element.prototype, 'mozRequestFullScreen', { configurable: true, enumerable: false, writable: true, value: disguise(function mozRequestFullScreen() {
    return _enterFullscreen(this);
  }, 'mozRequestFullScreen') }); } catch(e) {}
  try { Object.defineProperty(Element.prototype, 'mozRequestFullscreen', { configurable: true, enumerable: false, writable: true, value: disguise(function mozRequestFullscreen() {
    return _enterFullscreen(this);
  }, 'mozRequestFullscreen') }); } catch(e) {}
  try { Object.defineProperty(Element.prototype, 'webkitRequestFullscreen', { configurable: true, enumerable: false, writable: true, value: disguise(function webkitRequestFullscreen() {
    return _enterFullscreen(this);
  }, 'webkitRequestFullscreen') }); } catch(e) {}
  try { Object.defineProperty(Element.prototype, 'msRequestFullscreen', { configurable: true, enumerable: false, writable: true, value: disguise(function msRequestFullscreen() {
    return _enterFullscreen(this);
  }, 'msRequestFullscreen') }); } catch(e) {}
  try { Object.defineProperty(Document.prototype, 'exitFullscreen', { configurable: true, enumerable: false, writable: true, value: disguise(function exitFullscreen() {
    return _exitFullscreen();
  }, 'exitFullscreen') }); } catch(e) {}
  try { Object.defineProperty(Document.prototype, 'mozCancelFullScreen', { configurable: true, enumerable: false, writable: true, value: disguise(function mozCancelFullScreen() {
    return _exitFullscreen();
  }, 'mozCancelFullScreen') }); } catch(e) {}
  try { Object.defineProperty(Document.prototype, 'webkitExitFullscreen', { configurable: true, enumerable: false, writable: true, value: disguise(function webkitExitFullscreen() {
    return _exitFullscreen();
  }, 'webkitExitFullscreen') }); } catch(e) {}
  try { Object.defineProperty(Document.prototype, 'msExitFullscreen', { configurable: true, enumerable: false, writable: true, value: disguise(function msExitFullscreen() {
    return _exitFullscreen();
  }, 'msExitFullscreen') }); } catch(e) {}

  // Override fullscreenEnabled to true
  try {
    Object.defineProperty(Document.prototype, 'fullscreenEnabled', {
      get: disguise(function fullscreenEnabled() { return true; }, 'get fullscreenEnabled'),
      configurable: true, enumerable: true
    });
  } catch(e) {}
  try {
    Object.defineProperty(Document.prototype, 'webkitFullscreenEnabled', {
      get: disguise(function webkitFullscreenEnabled() { return true; }, 'get webkitFullscreenEnabled'),
      configurable: true, enumerable: true
    });
  } catch(e) {}
  try {
    Object.defineProperty(Document.prototype, 'mozFullScreenEnabled', {
      get: disguise(function mozFullScreenEnabled() { return true; }, 'get mozFullScreenEnabled'),
      configurable: true, enumerable: true
    });
  } catch(e) {}

  // Override fullscreenElement to return our tracked element
  try {
    Object.defineProperty(Document.prototype, 'fullscreenElement', {
      get: disguise(function fullscreenElement() { return _currentFullscreenElement; }, 'get fullscreenElement'),
      configurable: true, enumerable: true
    });
  } catch(e) {}
  try {
    Object.defineProperty(Document.prototype, 'webkitFullscreenElement', {
      get: disguise(function webkitFullscreenElement() { return _currentFullscreenElement; }, 'get webkitFullscreenElement'),
      configurable: true, enumerable: true
    });
  } catch(e) {}
  try {
    Object.defineProperty(Document.prototype, 'mozFullScreenElement', {
      get: disguise(function mozFullScreenElement() { return _currentFullscreenElement; }, 'get mozFullScreenElement'),
      configurable: true, enumerable: true
    });
  } catch(e) {}
  try {
    Object.defineProperty(Document.prototype, 'msFullscreenElement', {
      get: disguise(function msFullscreenElement() { return _currentFullscreenElement; }, 'get msFullscreenElement'),
      configurable: true, enumerable: true
    });
  } catch(e) {}


  // ═══════════════════════════════════════════════════════════════
  // 4. MOUSE BOUNDARY PROTECTION
  //
  // Ensure mouse coordinates remain strictly within valid view bounds
  // without artificially restricting normal upper cursor movement.
  // ═══════════════════════════════════════════════════════════════
  function getRealViewW() {
    try {
      if (_origIWGetter) { var v = _origIWGetter.call(window); if (typeof v === 'number' && v > 0) return v; }
    } catch(e) {}
    return (document.documentElement && document.documentElement.clientWidth) || getScreenW();
  }
  function getRealViewH() {
    try {
      if (_origIHGetter) { var v = _origIHGetter.call(window); if (typeof v === 'number' && v > 0) return v; }
    } catch(e) {}
    return (document.documentElement && document.documentElement.clientHeight) || getScreenH();
  }

  function clampMouseEvent(e) {
    try {
      var w = getRealViewW(), h = getRealViewH();
      var nx = e.clientX, ny = e.clientY;
      var clamped = false;
      if (ny < 0) { ny = 0; clamped = true; }
      if (ny > h) { ny = h; clamped = true; }
      if (nx < 0) { nx = 0; clamped = true; }
      if (nx > w) { nx = w; clamped = true; }
      if (clamped) {
        try {
          Object.defineProperty(e, 'clientX', { value: nx, configurable: true, enumerable: true });
          Object.defineProperty(e, 'clientY', { value: ny, configurable: true, enumerable: true });
          Object.defineProperty(e, 'pageX',   { value: nx + (window.scrollX || 0), configurable: true, enumerable: true });
          Object.defineProperty(e, 'pageY',   { value: ny + (window.scrollY || 0), configurable: true, enumerable: true });
          Object.defineProperty(e, 'screenX', { value: nx, configurable: true, enumerable: true });
          Object.defineProperty(e, 'screenY', { value: ny, configurable: true, enumerable: true });
        } catch(er) { e.stopImmediatePropagation(); }
      }
    } catch(e2) {}
  }

  ['mousemove', 'pointermove', 'mouseover', 'pointerover'].forEach(function(t) {
    _addEL.call(window, t, clampMouseEvent, true);
    _addEL.call(document, t, clampMouseEvent, true);
  });


  // ═══════════════════════════════════════════════════════════════
  // 5. FAKE MOUSE MOVEMENT WHEN TAB NOT FOCUSED
  // ═══════════════════════════════════════════════════════════════

  // 5a. Override addEventListener to wrap mousemove/pointermove listeners
  //     so ONLY our internal synthetic events appear trusted via Proxy.
  //     Page-dispatched synthetic events remain untrusted (isTrusted: false).
  var _listenerMap = new WeakMap();
  var _ourSyntheticEvents = new WeakSet();

  try { Object.defineProperty(EventTarget.prototype, 'addEventListener', { configurable: true, enumerable: false, writable: true, value: disguise(function addEventListener(type, listener, options) {
    if ((type === 'mousemove' || type === 'pointermove') && listener) {
      var fn = typeof listener === 'function' ? listener : (typeof listener.handleEvent === 'function' ? listener.handleEvent : null);
      if (fn) {
        var mapKey = listener;
        var wrapperMap = _listenerMap.get(mapKey);
        if (!wrapperMap) {
          wrapperMap = {};
          _listenerMap.set(mapKey, wrapperMap);
        }
        if (!wrapperMap[type]) {
          var origHandler = fn;
          var wrapper = function(e) {
            if (_ourSyntheticEvents.has(e)) {
              e = new Proxy(e, {
                get: function(target, prop) {
                  if (prop === 'isTrusted') return true;
                  var val = Reflect.get(target, prop);
                  if (typeof val === 'function') {
                    if (prop === 'constructor') return val;
                    return val.bind(target);
                  }
                  return val;
                }
              });
            }
            return origHandler.call(this, e);
          };
          wrapperMap[type] = typeof listener === 'function' ? wrapper : { handleEvent: wrapper };
        }
        listener = wrapperMap[type];
      }
    }
    return _addEL.call(this, type, listener, options);
  }, 'addEventListener') }); } catch(e) {}

  try { Object.defineProperty(EventTarget.prototype, 'removeEventListener', { configurable: true, enumerable: false, writable: true, value: disguise(function removeEventListener(type, listener, options) {
    if ((type === 'mousemove' || type === 'pointermove') && listener) {
      var wrapperMap = _listenerMap.get(listener);
      if (wrapperMap && wrapperMap[type]) {
        listener = wrapperMap[type];
      }
    }
    return _removeEL.call(this, type, listener, options);
  }, 'removeEventListener') }); } catch(e) {}

  // 5b. Fake mouse movement engine
  var _fakeInterval = null;
  var _fakeX = 400 + Math.random() * 400;
  var _fakeY = 300 + Math.random() * 200;

  function randomWalk(v, min, max, step) {
    v += (Math.random() - 0.5) * 2 * step;
    return Math.max(min, Math.min(max, v));
  }

  function emitFakeMove() {
    try {
      var w = getScreenW(), h = getScreenH();
      _fakeX = randomWalk(_fakeX, 100, w - 100, 35);
      _fakeY = randomWalk(_fakeY, 100, h - 100, 30);

      var me = new MouseEvent('mousemove', {
        clientX: _fakeX, clientY: _fakeY,
        screenX: _fakeX, screenY: _fakeY,
        pageX: _fakeX + (window.scrollX || 0),
        pageY: _fakeY + (window.scrollY || 0),
        bubbles: true, cancelable: true, view: window
      });
      _ourSyntheticEvents.add(me);
      _dispatch.call(document, me);

      try {
        var pe = new PointerEvent('pointermove', {
          clientX: _fakeX, clientY: _fakeY,
          screenX: _fakeX, screenY: _fakeY,
          bubbles: true, cancelable: true, view: window,
          pointerId: 1, pointerType: 'mouse'
        });
        _ourSyntheticEvents.add(pe);
        _dispatch.call(document, pe);
      } catch(e3) {}
    } catch(e4) {}
  }

  function startFakeMouse() {
    if (_fakeInterval) return;
    _fakeInterval = true;
    (function tick() {
      if (!_fakeInterval) return;
      emitFakeMove();
      _fakeTimeout = _setTimeout(tick, 700 + Math.floor(Math.random() * 1300));
    })();
  }
  var _fakeTimeout = null;
  function stopFakeMouse() {
    _fakeInterval = false;
    if (_fakeTimeout) { try { window.clearTimeout(_fakeTimeout); } catch(e) {} _fakeTimeout = null; }
  }

  // 5c. Monitor REAL visibility changes (using saved original getter)
  _addEL.call(document, 'visibilitychange', function() {
    var reallyHidden = false;
    if (_origHiddenGetter) { try { reallyHidden = _origHiddenGetter.call(document); } catch(e5) {} }
    if (reallyHidden) startFakeMouse(); else stopFakeMouse();
  }, true);
  _addEL.call(window, 'blur', function() { startFakeMouse(); }, true);
  _addEL.call(window, 'focus', function() { stopFakeMouse(); }, true);


  // ═══════════════════════════════════════════════════════════════
  // 6. EVENT BLOCKING — Use capturing listeners to stop events
  //    from reaching page handlers. Added AFTER our own monitors.
  // ═══════════════════════════════════════════════════════════════
  var BLOCKED = ['visibilitychange', 'blur', 'focus', 'pagehide', 'pageshow',
                 'freeze', 'resume', 'pointerleave', 'pointerout',
                 'mouseleave', 'mouseout', 'dragleave'];

  BLOCKED.forEach(function(type) {
    var blocker = function(e) {
      if (e.isTrusted) { e.stopImmediatePropagation(); e.preventDefault(); }
    };
    _addEL.call(window, type, blocker, true);
    _addEL.call(document, type, blocker, true);
  });


  // ═══════════════════════════════════════════════════════════════
  // 7. EXTENSION DETECTION BYPASS
  // ═══════════════════════════════════════════════════════════════
  var EXT_RE = /^(moz|chrome)-extension:\/\//i;

  // 7a. fetch()
  if (_fetch) {
    try { Object.defineProperty(window, 'fetch', { configurable: true, enumerable: false, writable: true, value: disguise(function fetch(input, init) {
      try {
        var urlStr = '';
        if (typeof input === 'string') { urlStr = input; }
        else if (input && typeof input.url === 'string') { urlStr = input.url; }
        else if (input && typeof input.toString === 'function') { urlStr = input.toString(); }
        
        if (EXT_RE.test(urlStr)) {
          return Promise.reject(new TypeError('NetworkError when attempting to fetch resource.'));
        }
      } catch(e6) {}
      return _fetch(input, init);
    }, 'fetch') }); } catch(e) {}
  }

  // 7b. XMLHttpRequest
  var _blockedXhrs = new WeakSet();

  try { Object.defineProperty(XMLHttpRequest.prototype, 'open', { configurable: true, enumerable: false, writable: true, value: disguise(function open(method, url) {
    _blockedXhrs.delete(this);
    try {
      var urlStr = (url && typeof url.toString === 'function') ? url.toString() : '';
      if (EXT_RE.test(urlStr)) {
        _blockedXhrs.add(this);
        return;
      }
    } catch(e) {}
    return _xhrOpen.apply(this, arguments);
  }, 'open') }); } catch(e) {}
  try { Object.defineProperty(XMLHttpRequest.prototype, 'send', { configurable: true, enumerable: false, writable: true, value: disguise(function send() {
    if (_blockedXhrs.has(this)) {
      var self = this;
      _setTimeout(function() { try { self.dispatchEvent(new Event('error')); } catch(e7) {} }, 0);
      return;
    }
    return _xhrSend.apply(this, arguments);
  }, 'send') }); } catch(e) {}

  // 7c. setAttribute — block extension resource probing
  try { Object.defineProperty(Element.prototype, 'setAttribute', { configurable: true, enumerable: false, writable: true, value: disguise(function setAttribute(name, value) {
    try {
      var valStr = (value !== null && value !== undefined && typeof value.toString === 'function') ? value.toString() : '';
      if ((name === 'src' || name === 'href') && EXT_RE.test(valStr)) {
        return;
      }
    } catch(e) {}
    return _setAttribute.call(this, name, value);
  }, 'setAttribute') }); } catch(e) {}


  // ═══════════════════════════════════════════════════════════════
  // 8. CANVAS FINGERPRINT PROTECTION
  //
  // Keep pixel data clean and unmutated so that canvas pixel
  // verification tests (1x1, 20x20, etc.) pass without failing.
  // ═══════════════════════════════════════════════════════════════
  var _origCE = Document.prototype.createElement; // save before section 17 overrides it
  function applyCanvasNoise(canvas) {
    // No-op: do not alter pixel values to maintain pixel accuracy
  }

  try { Object.defineProperty(HTMLCanvasElement.prototype, 'toDataURL', { configurable: true, enumerable: false, writable: true, value: disguise(function toDataURL() {
    return _origToDataURL.apply(this, arguments);
  }, 'toDataURL') }); } catch(e) {}

  try { Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', { configurable: true, enumerable: false, writable: true, value: disguise(function toBlob(cb, type, quality) {
    return _origToBlob.call(this, cb, type, quality);
  }, 'toBlob') }); } catch(e) {}

  try { Object.defineProperty(CanvasRenderingContext2D.prototype, 'getImageData', { configurable: true, enumerable: false, writable: true, value: disguise(function getImageData(sx, sy, sw, sh) {
    return _origGetImageData.call(this, sx, sy, sw, sh);
  }, 'getImageData') }); } catch(e) {}


  // ═══════════════════════════════════════════════════════════════
  // 9. WEBGL FINGERPRINT PROTECTION
  // ═══════════════════════════════════════════════════════════════
  try {
    var UNMASKED_VENDOR  = 0x9245;
    var UNMASKED_RENDERER = 0x9246;
    var glTypes = [WebGLRenderingContext];
    if (typeof WebGL2RenderingContext !== 'undefined') glTypes.push(WebGL2RenderingContext);

    glTypes.forEach(function(GL) {
      var _origGetParam = GL.prototype.getParameter;
      try { Object.defineProperty(GL.prototype, 'getParameter', { configurable: true, enumerable: false, writable: true, value: disguise(function getParameter(p) {
        if (p === UNMASKED_VENDOR)   return 'Google Inc. (Intel)';
        if (p === UNMASKED_RENDERER) return 'ANGLE (Intel, Intel(R) UHD Graphics 630 Direct3D11 vs_5_0 ps_5_0, D3D11)';
        if (p === 0x1F00) return 'WebKit';
        if (p === 0x1F01) return 'WebKit WebGL';
        if (p === 0x1F02) return 'WebGL 1.0 (OpenGL ES 2.0 Chromium)';
        if (p === 0x8B8C) return 'WebGL GLSL ES 1.0 (OpenGL ES GLSL ES 1.0 Chromium)';
        return _origGetParam.call(this, p);
      }, 'getParameter') }); } catch(e) {}

      if (GL.prototype.getExtension) {
        var _origGetExt = GL.prototype.getExtension;
        try { Object.defineProperty(GL.prototype, 'getExtension', { configurable: true, enumerable: false, writable: true, value: disguise(function getExtension(name) {
          if (name === 'WEBGL_debug_renderer_info') {
            return {
              UNMASKED_VENDOR_WEBGL: UNMASKED_VENDOR,
              UNMASKED_RENDERER_WEBGL: UNMASKED_RENDERER
            };
          }
          return _origGetExt.call(this, name);
        }, 'getExtension') }); } catch(eExt) {}
      }

      if (GL.prototype.getSupportedExtensions) {
        var _origGetSupportedExt = GL.prototype.getSupportedExtensions;
        try { Object.defineProperty(GL.prototype, 'getSupportedExtensions', { configurable: true, enumerable: false, writable: true, value: disguise(function getSupportedExtensions() {
          var exts = _origGetSupportedExt.call(this) || [];
          if (exts.indexOf('WEBGL_debug_renderer_info') === -1) {
            exts = exts.slice();
            exts.push('WEBGL_debug_renderer_info');
          }
          return exts;
        }, 'getSupportedExtensions') }); } catch(eSupp) {}
      }
    });
  } catch(e9) {}


  // ═══════════════════════════════════════════════════════════════
  // 10. AUDIO FINGERPRINT PROTECTION (hardware baseline integrity)
  // ═══════════════════════════════════════════════════════════════
  try {
    if (typeof AnalyserNode !== 'undefined') {
      var _origGetFloat = AnalyserNode.prototype.getFloatFrequencyData;
      try { Object.defineProperty(AnalyserNode.prototype, 'getFloatFrequencyData', { configurable: true, enumerable: false, writable: true, value: disguise(function getFloatFrequencyData(arr) {
        return _origGetFloat.call(this, arr);
      }, 'getFloatFrequencyData') }); } catch(e) {}
      
      if (AnalyserNode.prototype.getByteFrequencyData) {
        var _origGetByte = AnalyserNode.prototype.getByteFrequencyData;
        try { Object.defineProperty(AnalyserNode.prototype, 'getByteFrequencyData', { configurable: true, enumerable: false, writable: true, value: disguise(function getByteFrequencyData(arr) {
          return _origGetByte.call(this, arr);
        }, 'getByteFrequencyData') }); } catch(e) {}
      }
    }
  } catch(e10) {}


  // ═══════════════════════════════════════════════════════════════
  // 11. WEBRTC LEAK PREVENTION
  //
  // KEY FIX: Replace private IPs with a realistic fake private IP
  // instead of 0.0.0.0 (which the testbench detects).
  // ═══════════════════════════════════════════════════════════════
  try {
    var RTC = window.RTCPeerConnection || window.mozRTCPeerConnection;
    if (RTC) {
      var _sanitizeSdp = function(sdp) {
        if (typeof sdp !== 'string') return sdp;
        return sdp.replace(/([0-9]{1,3}(\.[0-9]{1,3}){3})/g, function(match) {
          if (/^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/.test(match)) return '192.168.1.42';
          return match;
        });
      };

      var _origSLD = RTC.prototype.setLocalDescription;
      try { Object.defineProperty(RTC.prototype, 'setLocalDescription', { configurable: true, enumerable: false, writable: true, value: disguise(function setLocalDescription(desc) {
        if (desc && desc.sdp) {
          desc = Object.assign({}, desc, { sdp: _sanitizeSdp(desc.sdp) });
        }
        return _origSLD.call(this, desc);
      }, 'setLocalDescription') }); } catch(e) {}

      if (RTC.prototype.createOffer) {
        var _origCreateOffer = RTC.prototype.createOffer;
        try { Object.defineProperty(RTC.prototype, 'createOffer', { configurable: true, enumerable: false, writable: true, value: disguise(function createOffer() {
          return _origCreateOffer.apply(this, arguments).then(function(offer) {
            if (offer && offer.sdp) {
              return Object.assign({}, offer, { sdp: _sanitizeSdp(offer.sdp) });
            }
            return offer;
          });
        }, 'createOffer') }); } catch(e) {}
      }

      if (RTC.prototype.createAnswer) {
        var _origCreateAnswer = RTC.prototype.createAnswer;
        try { Object.defineProperty(RTC.prototype, 'createAnswer', { configurable: true, enumerable: false, writable: true, value: disguise(function createAnswer() {
          return _origCreateAnswer.apply(this, arguments).then(function(ans) {
            if (ans && ans.sdp) {
              return Object.assign({}, ans, { sdp: _sanitizeSdp(ans.sdp) });
            }
            return ans;
          });
        }, 'createAnswer') }); } catch(e) {}
      }

      var _origLDDesc = Object.getOwnPropertyDescriptor(RTC.prototype, 'localDescription');
      if (_origLDDesc && _origLDDesc.get) {
        var _origLDGet = _origLDDesc.get;
        try { Object.defineProperty(RTC.prototype, 'localDescription', { configurable: true, enumerable: true, get: disguise(function localDescription() {
          var ld = _origLDGet.call(this);
          if (ld && ld.sdp) {
            return Object.assign({}, ld, { sdp: _sanitizeSdp(ld.sdp) });
          }
          return ld;
        }, 'get localDescription') }); } catch(e) {}
      }
    }
  } catch(e11) {}


  // ═══════════════════════════════════════════════════════════════
  // 12. NAVIGATOR / USER-AGENT SPOOFING (Chrome 152)
  // ═══════════════════════════════════════════════════════════════
  try {
    var CHROME_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.6943.142 Safari/537.36';

    var _languages = Object.freeze(['en-US', 'en']);

    var _networkInfo = {
      downlink: 10,
      effectiveType: '4g',
      rtt: 50,
      saveData: false,
      onchange: null
    };

    var navOverrides = [
      ['userAgent',    function() { return CHROME_UA; }],
      ['appVersion',   function() { return CHROME_UA.replace('Mozilla/', ''); }],
      ['vendor',       function() { return 'Google Inc.'; }],
      ['platform',     function() { return 'Win32'; }],
      ['appName',      function() { return 'Netscape'; }],
      ['product',      function() { return 'Gecko'; }],
      ['productSub',   function() { return '20030107'; }],
      ['language',     function() { return 'en-US'; }],
      ['languages',    function() { return _languages; }],
      ['hardwareConcurrency', function() { return 8; }],
      ['deviceMemory',        function() { return 8; }],
      ['maxTouchPoints',      function() { return 0; }],
      ['pdfViewerEnabled',    function() { return true; }],
      ['webdriver',    function() { return false; }],
      ['connection',   function() { return _networkInfo; }],
    ];

    navOverrides.forEach(function(pair) {
      try {
        Object.defineProperty(Navigator.prototype, pair[0], {
          get: disguise(pair[1], 'get ' + pair[0]),
          configurable: true, enumerable: true
        });
      } catch(e12) {}
    });

    // Battery Status API (navigator.getBattery)
    var _batteryManager = {
      charging: true,
      chargingTime: 0,
      dischargingTime: Infinity,
      level: 1,
      onchargingchange: null,
      onchargingtimechange: null,
      ondischargingtimechange: null,
      onlevelchange: null,
      addEventListener: disguise(function addEventListener() {}, 'addEventListener'),
      removeEventListener: disguise(function removeEventListener() {}, 'removeEventListener'),
      dispatchEvent: disguise(function dispatchEvent() { return true; }, 'dispatchEvent')
    };

    try {
      Object.defineProperty(Navigator.prototype, 'getBattery', {
        value: disguise(function getBattery() {
          return Promise.resolve(_batteryManager);
        }, 'getBattery'),
        configurable: true, enumerable: true, writable: true
      });
    } catch(eBat) {}

    // Chromium Hardware APIs (bluetooth, usb, hid, serial)
    var _bluetoothObj = {
      getAvailability: disguise(function getAvailability() { return Promise.resolve(false); }, 'getAvailability'),
      requestDevice: disguise(function requestDevice() { return Promise.reject(new DOMException('User cancelled the requestDevice() chooser.', 'NotFoundError')); }, 'requestDevice'),
      addEventListener: disguise(function addEventListener() {}, 'addEventListener'),
      removeEventListener: disguise(function removeEventListener() {}, 'removeEventListener'),
      dispatchEvent: disguise(function dispatchEvent() { return true; }, 'dispatchEvent')
    };
    var _usbObj = {
      getDevices: disguise(function getDevices() { return Promise.resolve([]); }, 'getDevices'),
      requestDevice: disguise(function requestDevice() { return Promise.reject(new DOMException('No device selected.', 'NotFoundError')); }, 'requestDevice'),
      addEventListener: disguise(function addEventListener() {}, 'addEventListener'),
      removeEventListener: disguise(function removeEventListener() {}, 'removeEventListener'),
      dispatchEvent: disguise(function dispatchEvent() { return true; }, 'dispatchEvent')
    };
    var _hidObj = {
      getDevices: disguise(function getDevices() { return Promise.resolve([]); }, 'getDevices'),
      requestDevice: disguise(function requestDevice() { return Promise.reject(new DOMException('No device selected.', 'NotFoundError')); }, 'requestDevice'),
      addEventListener: disguise(function addEventListener() {}, 'addEventListener'),
      removeEventListener: disguise(function removeEventListener() {}, 'removeEventListener'),
      dispatchEvent: disguise(function dispatchEvent() { return true; }, 'dispatchEvent')
    };
    var _serialObj = {
      getPorts: disguise(function getPorts() { return Promise.resolve([]); }, 'getPorts'),
      requestPort: disguise(function requestPort() { return Promise.reject(new DOMException('No port selected.', 'NotFoundError')); }, 'requestPort'),
      addEventListener: disguise(function addEventListener() {}, 'addEventListener'),
      removeEventListener: disguise(function removeEventListener() {}, 'removeEventListener'),
      dispatchEvent: disguise(function dispatchEvent() { return true; }, 'dispatchEvent')
    };

    var hwOverrides = [
      ['bluetooth', function() { return _bluetoothObj; }],
      ['usb',       function() { return _usbObj; }],
      ['hid',       function() { return _hidObj; }],
      ['serial',    function() { return _serialObj; }]
    ];

    hwOverrides.forEach(function(pair) {
      try {
        Object.defineProperty(Navigator.prototype, pair[0], {
          get: disguise(pair[1], 'get ' + pair[0]),
          configurable: true, enumerable: true
        });
      } catch(eHw) {}
    });

    // Permissions API & Notification alignment
    if (typeof navigator.permissions !== 'undefined' && navigator.permissions.query) {
      var _origQuery = navigator.permissions.query.bind(navigator.permissions);
      navigator.permissions.query = disguise(function query(desc) {
        if (desc && desc.name === 'notifications') {
          return Promise.resolve({
            name: 'notifications',
            state: 'prompt',
            onchange: null
          });
        }
        return _origQuery(desc);
      }, 'query');
    }

    if (typeof Notification !== 'undefined') {
      try {
        Object.defineProperty(Notification, 'permission', {
          get: disguise(function permission() { return 'default'; }, 'get permission'),
          configurable: true, enumerable: true
        });
      } catch(eNotif) {}
      try {
        Object.defineProperty(Notification, 'maxActions', {
          get: disguise(function maxActions() { return 2; }, 'get maxActions'),
          configurable: true, enumerable: true
        });
      } catch(eNotif2) {}
    }

    // Remove Firefox-specific properties
    ['buildID', 'oscpu', 'mozConnection'].forEach(function(prop) {
      try { delete Navigator.prototype[prop]; } catch(e13) {}
      try { Object.defineProperty(Navigator.prototype, prop, { get: function() { return undefined; }, configurable: true }); } catch(e14) {}
    });

    // Hide Firefox-specific CSS support
    if (typeof CSS !== 'undefined' && CSS.supports) {
      var _origCSSSupports = CSS.supports.bind(CSS);
      CSS.supports = disguise(function supports() {
        var a = arguments[0];
        if (typeof a === 'string') {
          if (a.indexOf('-moz-') !== -1) return false;
          if (arguments.length === 2 && typeof arguments[0] === 'string' && arguments[0].indexOf('-moz-') === 0) return false;
        }
        return _origCSSSupports.apply(CSS, arguments);
      }, 'supports');
    }

    // Hide Gecko-specific CSS properties (Moz*) on prototypes directly without Proxy
    if (typeof CSS2Properties !== 'undefined' && CSS2Properties.prototype) {
      Object.getOwnPropertyNames(CSS2Properties.prototype).forEach(function(k) {
        if (/^moz/i.test(k)) {
          try { delete CSS2Properties.prototype[k]; } catch(e) {}
        }
      });
    }
    if (typeof CSSStyleDeclaration !== 'undefined' && CSSStyleDeclaration.prototype) {
      Object.getOwnPropertyNames(CSSStyleDeclaration.prototype).forEach(function(k) {
        if (/^moz/i.test(k)) {
          try { delete CSSStyleDeclaration.prototype[k]; } catch(e) {}
        }
      });
    }

    // Hide InstallTrigger (Firefox-only global)
    try { delete window.InstallTrigger; } catch(e15) {}
    try { Object.defineProperty(window, 'InstallTrigger', { get: function() { return undefined; }, configurable: true }); } catch(e16) {}

    // Add Chrome's window.chrome object
    if (!window.chrome) {
      Object.defineProperty(window, 'chrome', {
        value: {
          loadTimes: disguise(function() {
            return { requestTime: Date.now() / 1000, startLoadTime: Date.now() / 1000, commitLoadTime: Date.now() / 1000, finishDocumentLoadTime: Date.now() / 1000, finishLoadTime: Date.now() / 1000, firstPaintTime: Date.now() / 1000, firstPaintAfterLoadTime: 0, navigationType: 'Other', wasFetchedViaSpdy: true, wasNpnNegotiated: true, npnNegotiatedProtocol: 'h2', wasAlternateProtocolAvailable: false, connectionInfo: 'h2' };
          }, 'loadTimes'),
          csi: disguise(function() {
            return { startE: Date.now(), onloadT: Date.now(), pageT: 100, tran: 15 };
          }, 'csi'),
          app: {
            isInstalled: false,
            InstallState: { DISABLED: 'disabled', INSTALLED: 'installed', NOT_INSTALLED: 'not_installed' },
            RunningState: { CANNOT_RUN: 'cannot_run', READY_TO_RUN: 'ready_to_run', RUNNING: 'running' },
            getIsInstalled: disguise(function getIsInstalled() { return false; }, 'getIsInstalled'),
            getDetails: disguise(function getDetails() { return null; }, 'getDetails'),
            installState: disguise(function installState(cb) { if (typeof cb === 'function') cb('not_installed'); }, 'installState')
          },
          runtime: {
            OnInstalledReason: { CHROME_UPDATE: 'chrome_update', INSTALL: 'install', SHARED_MODULE_UPDATE: 'shared_module_update', UPDATE: 'update' },
            PlatformOs: { ANDROID: 'android', CROS: 'cros', LINUX: 'linux', MAC: 'mac', OPENBSD: 'openbsd', WIN: 'win' },
            connect: disguise(function() { throw new Error('Could not establish connection.'); }, 'connect'),
            sendMessage: disguise(function() { throw new Error('Could not establish connection.'); }, 'sendMessage'),
          }
        },
        configurable: true, writable: true, enumerable: true
      });
    }

    // UserAgentData
    if (!navigator.userAgentData) {
      var _uaData = {
        brands: [
          { brand: 'Chromium', version: '133' },
          { brand: 'Google Chrome', version: '133' },
          { brand: 'Not(A:Brand', version: '99' }
        ],
        mobile: false,
        platform: 'Windows',
        getHighEntropyValues: disguise(function() {
          return Promise.resolve({
            architecture: 'x86', bitness: '64',
            brands: [
              { brand: 'Chromium', version: '133.0.6943.142' },
              { brand: 'Google Chrome', version: '133.0.6943.142' },
              { brand: 'Not(A:Brand', version: '99.0.0.0' }
            ],
            fullVersionList: [
              { brand: 'Chromium', version: '133.0.6943.142' },
              { brand: 'Google Chrome', version: '133.0.6943.142' }
            ],
            mobile: false, model: '', platform: 'Windows',
            platformVersion: '10.0.0', uaFullVersion: '133.0.6943.142'
          });
        }, 'getHighEntropyValues'),
        toJSON: disguise(function() {
          return { brands: this.brands, mobile: this.mobile, platform: this.platform };
        }, 'toJSON')
      };

      Object.defineProperty(Navigator.prototype, 'userAgentData', {
        get: disguise(function() { return _uaData; }, 'get userAgentData'),
        configurable: true, enumerable: true
      });
    }
  } catch(e17) {}


  // ═══════════════════════════════════════════════════════════════
  // 13. PLUGIN / MIME-TYPE SPOOFING (Chrome standard 5-plugin)
  // ═══════════════════════════════════════════════════════════════
  try {
    var pdfMime = { type: 'application/pdf', suffixes: 'pdf', description: 'Portable Document Format' };
    var pluginNames = ['PDF Viewer', 'Chrome PDF Viewer', 'Chromium PDF Viewer', 'Microsoft Edge PDF Viewer', 'WebKit built-in PDF'];

    class PluginArray {
      constructor() { this.length = 5; }
      item(i) { return this[i] || null; }
      namedItem(n) { for (var i = 0; i < this.length; i++) { if (this[i] && this[i].name === n) return this[i]; } return null; }
      refresh() {}
      *[Symbol.iterator]() { for (var i = 0; i < this.length; i++) yield this[i]; }
      get [Symbol.toStringTag]() { return 'PluginArray'; }
    }
    class MimeTypeArray {
      constructor() { this.length = 1; }
      item(i) { return this[i] || null; }
      namedItem(n) { return n === 'application/pdf' ? this[0] : null; }
      *[Symbol.iterator]() { yield this[0]; }
      get [Symbol.toStringTag]() { return 'MimeTypeArray'; }
    }
    class Plugin {
      constructor(name, filename, description) { this.name = name; this.filename = filename; this.description = description; this.length = 1; }
      item(i) { return this[i] || null; }
      namedItem(n) { return this[0]; }
      get [Symbol.toStringTag]() { return 'Plugin'; }
    }
    class MimeType {
      constructor(type, suffixes, description, enabledPlugin) { this.type = type; this.suffixes = suffixes; this.description = description; this.enabledPlugin = enabledPlugin; }
      get [Symbol.toStringTag]() { return 'MimeType'; }
    }

    // Wrap prototype methods with disguise to maintain stealth
    ['item', 'namedItem', 'refresh'].forEach(m => {
      if (PluginArray.prototype[m]) PluginArray.prototype[m] = disguise(PluginArray.prototype[m], m);
      if (MimeTypeArray.prototype[m]) MimeTypeArray.prototype[m] = disguise(MimeTypeArray.prototype[m], m);
      if (Plugin.prototype[m]) Plugin.prototype[m] = disguise(Plugin.prototype[m], m);
    });

    var _plugins = new PluginArray();
    var _mimeTypes = new MimeTypeArray();
    
    var pdfMimeObj = new MimeType('application/pdf', 'pdf', 'Portable Document Format', null);
    _mimeTypes[0] = pdfMimeObj;

    for (var i = 0; i < 5; i++) {
      var p = new Plugin(pluginNames[i], 'internal-pdf-viewer', 'Portable Document Format');
      p[0] = pdfMimeObj;
      _plugins[i] = p;
      if (i === 0) pdfMimeObj.enabledPlugin = p;
    }

    Object.defineProperty(Navigator.prototype, 'plugins', {
      get: disguise(function plugins() { return _plugins; }, 'get plugins'),
      configurable: true, enumerable: true
    });

    Object.defineProperty(Navigator.prototype, 'mimeTypes', {
      get: disguise(function mimeTypes() { return _mimeTypes; }, 'get mimeTypes'),
      configurable: true, enumerable: true
    });


  } catch(e18) {}


  // ═══════════════════════════════════════════════════════════════
  // 14. KEYBOARD INTERCEPTION — Hide modifier & Tab keys from
  //     page scripts. Websites can still see normal letters,
  //     numbers, Shift, arrows, etc. Native browser shortcuts
  //     (Ctrl+C/V/A/Z) still work because we only suppress JS
  //     propagation, not the browser's default action for Ctrl.
  // ═══════════════════════════════════════════════════════════════
  function blockHotkeys(e) {
    if (!e.isTrusted) return; // Let synthetic events through
    var key = e.key;

    // Block the modifier / Tab keys themselves (keydown + keyup of Ctrl, Alt, Tab, Meta)
    if (key === 'Control' || key === 'Alt' || key === 'Tab' || key === 'Meta'
        || key === 'Escape' || key === 'F5') {
      e.stopImmediatePropagation();
      // preventDefault for Tab/Alt/Meta/Esc/F5 to suppress browser chrome actions
      // but NOT for bare Control (no default action to suppress)
      if (key !== 'Control') e.preventDefault();
      return;
    }

    // Block any key combo where Ctrl, Alt, or Meta is held
    // (hides Ctrl+C, Ctrl+V, Alt+Tab residual, etc. from page JS)
    if (e.ctrlKey || e.altKey || e.metaKey) {
      e.stopImmediatePropagation();
      // Do NOT preventDefault for Ctrl combos — lets native
      // copy/paste/undo/redo/select-all keep working in the browser.
      // DO preventDefault for Alt/Meta combos to block menu activation.
      if (e.altKey || e.metaKey) e.preventDefault();
      return;
    }
  }
  // Cover keydown, keyup, AND keypress on both targets
  ['keydown', 'keyup', 'keypress'].forEach(function(t) {
    _addEL.call(document, t, blockHotkeys, true);
    _addEL.call(window, t, blockHotkeys, true);
  });


  // ═══════════════════════════════════════════════════════════════
  // 15. COPY / PASTE / CONTEXT MENU RESTORE
  // ═══════════════════════════════════════════════════════════════
  ['contextmenu', 'copy', 'cut', 'paste', 'selectstart'].forEach(function(ev) {
    _addEL.call(document, ev, function(e) { e.stopImmediatePropagation(); }, true);
  });


  // ═══════════════════════════════════════════════════════════════
  // 16. TIMING PRECISION FIX
  //
  // Firefox reduces performance.now() to 1ms or 2ms by default via
  // privacy.reduceTimerPrecision. Override performance.now to
  // add sub-ms jitter back so it looks normal (~5µs like Chrome).
  // ═══════════════════════════════════════════════════════════════
  try {
    var _perfNowOffset = Math.random() * 0.1; // small initial offset
    try { Object.defineProperty(Performance.prototype, 'now', { configurable: true, enumerable: false, writable: true, value: disguise(function now() {
      var t = _origPerfNow.call(this);
      // Add deterministic-ish sub-ms precision back
      // Use a simple hash of the integer part to generate consistent decimals
      var intPart = Math.floor(t);
      var frac = ((intPart * 2654435761) >>> 0) / 4294967296; // Knuth multiplicative hash
      return t + frac * 0.099; // Add 0-99µs of fake precision
    }, 'now') }); } catch(e) {}
  } catch(e19) {}


  // ═══════════════════════════════════════════════════════════════
  // 17. IFRAME PROTECTION — Patch contentWindow/contentDocument
  //     synchronously so clean-room iframe tests see native toString
  // ═══════════════════════════════════════════════════════════════
  try {
    function sanitizeWindow(win) {
      if (!win) return;
      try {
        if (win.Function && win.Function.prototype && win.Function.prototype.toString !== _toStrOverride) {
          win.Function.prototype.toString = _toStrOverride;
        }
      } catch(e) {}
      try {
        if (win.Navigator && win.Navigator.prototype) {
          navOverrides.forEach(function(pair) {
            try {
              Object.defineProperty(win.Navigator.prototype, pair[0], {
                get: disguise(pair[1], 'get ' + pair[0]),
                configurable: true, enumerable: true
              });
            } catch(e) {}
          });
        }
        if (win.navigator) {
          try {
            Object.defineProperty(win.navigator, 'userAgent', {
              get: disguise(function() { return CHROME_UA; }, 'get userAgent'),
              configurable: true, enumerable: true
            });
          } catch(e) {}
        }
      } catch(eNav) {}
      try {
        if (win.Object && win.Reflect) {
          patchObjectAndReflect(win.Object, win.Reflect);
        }
      } catch(eOR) {}
      try {
        if (!win.chrome && window.chrome) {
          Object.defineProperty(win, 'chrome', {
            value: window.chrome,
            configurable: true, writable: true, enumerable: true
          });
        }
      } catch(eWinChrome) {}
      try {
        if (typeof patchErrorConstructors === 'function' && win.Error) {
          patchErrorConstructors(win);
        }
      } catch(eErr) {}
    }

    if (typeof HTMLIFrameElement !== 'undefined' && HTMLIFrameElement.prototype) {
      var _origContentWinDesc = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'contentWindow');
      if (_origContentWinDesc && _origContentWinDesc.get) {
        var _origContentWin = _origContentWinDesc.get;
        Object.defineProperty(HTMLIFrameElement.prototype, 'contentWindow', {
          get: disguise(function contentWindow() {
            var win = _origContentWin.call(this);
            sanitizeWindow(win);
            return win;
          }, 'get contentWindow'),
          configurable: true, enumerable: true
        });
      }

      var _origContentDocDesc = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'contentDocument');
      if (_origContentDocDesc && _origContentDocDesc.get) {
        var _origContentDoc = _origContentDocDesc.get;
        Object.defineProperty(HTMLIFrameElement.prototype, 'contentDocument', {
          get: disguise(function contentDocument() {
            var doc = _origContentDoc.call(this);
            if (doc && doc.defaultView) {
              sanitizeWindow(doc.defaultView);
            }
            return doc;
          }, 'get contentDocument'),
          configurable: true, enumerable: true
        });
      }
    }

    if (typeof HTMLFrameElement !== 'undefined' && HTMLFrameElement.prototype) {
      var _origFrameWinDesc = Object.getOwnPropertyDescriptor(HTMLFrameElement.prototype, 'contentWindow');
      if (_origFrameWinDesc && _origFrameWinDesc.get) {
        var _origFrameWin = _origFrameWinDesc.get;
        Object.defineProperty(HTMLFrameElement.prototype, 'contentWindow', {
          get: disguise(function contentWindow() {
            var win = _origFrameWin.call(this);
            sanitizeWindow(win);
            return win;
          }, 'get contentWindow'),
          configurable: true, enumerable: true
        });
      }
    }

    if (typeof HTMLObjectElement !== 'undefined' && HTMLObjectElement.prototype) {
      var _origObjDocDesc = Object.getOwnPropertyDescriptor(HTMLObjectElement.prototype, 'contentDocument');
      if (_origObjDocDesc && _origObjDocDesc.get) {
        var _origObjDoc = _origObjDocDesc.get;
        Object.defineProperty(HTMLObjectElement.prototype, 'contentDocument', {
          get: disguise(function contentDocument() {
            var doc = _origObjDoc.call(this);
            if (doc && doc.defaultView) {
              sanitizeWindow(doc.defaultView);
            }
            return doc;
          }, 'get contentDocument'),
          configurable: true, enumerable: true
        });
      }
      var _origObjWinDesc = Object.getOwnPropertyDescriptor(HTMLObjectElement.prototype, 'contentWindow');
      if (_origObjWinDesc && _origObjWinDesc.get) {
        var _origObjWin = _origObjWinDesc.get;
        Object.defineProperty(HTMLObjectElement.prototype, 'contentWindow', {
          get: disguise(function contentWindow() {
            var win = _origObjWin.call(this);
            if (win) sanitizeWindow(win);
            return win;
          }, 'get contentWindow'),
          configurable: true, enumerable: true
        });
      }
    }

    var _origCreateElement = Document.prototype.createElement;
    try { Object.defineProperty(Document.prototype, 'createElement', { configurable: true, enumerable: false, writable: true, value: disguise(function createElement(tag) {
      var el = _origCreateElement.apply(this, arguments);
      if (tag) {
        var lowerTag = tag.toLowerCase();
        if (lowerTag === 'iframe' || lowerTag === 'object' || lowerTag === 'embed' || lowerTag === 'frame') {
          var patchPending = true;
          var origEl = el;
          function patchContainer() {
            try {
              var win = origEl.contentWindow || (origEl.contentDocument && origEl.contentDocument.defaultView);
              if (win) {
                sanitizeWindow(win);
                patchPending = false;
              }
            } catch(e) {}
          }
          _addEL.call(origEl, 'load', patchContainer, true);
          _setTimeout(patchContainer, 0);
          _setTimeout(patchContainer, 50);
        }
      }
      return el;
    }, 'createElement') }); } catch(e) {}
  } catch(e20) {}


  // ═══════════════════════════════════════════════════════════════
  // 18. REQUESTANIMATIONFRAME THROTTLING SMOOTHING
  //     Prevents detection of background tab throttling / starvation
  // ═══════════════════════════════════════════════════════════════
  try {
    if (typeof window.requestAnimationFrame === 'function') {
      var _origRAF = window.requestAnimationFrame.bind(window);
      var _lastSmoothedRafTime = 0;

      window.requestAnimationFrame = disguise(function requestAnimationFrame(callback) {
        if (typeof callback !== 'function') return _origRAF(callback);
        return _origRAF(function(time) {
          if (_lastSmoothedRafTime === 0) {
            _lastSmoothedRafTime = time;
          } else {
            var delta = time - _lastSmoothedRafTime;
            if (delta > 80) {
              _lastSmoothedRafTime += 16.6 + Math.random() * 8;
            } else {
              _lastSmoothedRafTime = time;
            }
          }
          return callback(_lastSmoothedRafTime);
        });
      }, 'requestAnimationFrame');
    }
  } catch(eRAF) {}


  // ═══════════════════════════════════════════════════════════════
  // 19. WEB WORKER USERAGENT & CONCURRENCY SPOOFING
  // ═══════════════════════════════════════════════════════════════
  try {
    var _buildWorkerShim = function() {
      return [
        'try {',
        '  Object.defineProperty(self.navigator, "userAgent", { get: function() { return "' + CHROME_UA + '"; }, configurable: true });',
        '  Object.defineProperty(self.navigator, "appVersion", { get: function() { return "' + CHROME_UA.replace('Mozilla/', '') + '"; }, configurable: true });',
        '  Object.defineProperty(self.navigator, "platform", { get: function() { return "Win32"; }, configurable: true });',
        '  Object.defineProperty(self.navigator, "vendor", { get: function() { return "Google Inc."; }, configurable: true });',
        '  Object.defineProperty(self.navigator, "hardwareConcurrency", { get: function() { return 8; }, configurable: true });',
        '  Object.defineProperty(self.navigator, "deviceMemory", { get: function() { return 8; }, configurable: true });',
        '} catch(e) {}'
      ].join('\n') + '\n';
    };

    if (typeof window.URL !== 'undefined' && typeof window.URL.createObjectURL === 'function') {
      var _origCreateObjectURL = window.URL.createObjectURL.bind(window.URL);
      window.URL.createObjectURL = disguise(function createObjectURL(blob) {
        if (blob && typeof blob === 'object' && (!blob.type || /javascript|ecmascript/i.test(blob.type) || blob.type === 'text/plain')) {
          try {
            var workerShim = _buildWorkerShim();
            var newBlob = new Blob([workerShim, blob], { type: blob.type || 'application/javascript' });
            return _origCreateObjectURL(newBlob);
          } catch(eB) {}
        }
        return _origCreateObjectURL(blob);
      }, 'createObjectURL');
    }

    if (typeof window.Worker === 'function') {
      var _origWorker = window.Worker;
      var PatchedWorker = function Worker(scriptURL, options) {
        if (!(this instanceof PatchedWorker)) {
          return new PatchedWorker(scriptURL, options);
        }
        var targetURL = scriptURL;
        try {
          if (typeof scriptURL === 'string' && scriptURL.indexOf('blob:') === 0) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', scriptURL, false);
            xhr.send();
            if (xhr.status === 200 || xhr.responseText) {
              var code = xhr.responseText;
              if (code.indexOf('hardwareConcurrency') === -1 || code.indexOf(CHROME_UA) === -1) {
                var workerShim = _buildWorkerShim();
                var patchedBlob = new Blob([workerShim, code], { type: 'application/javascript' });
                targetURL = URL.createObjectURL(patchedBlob);
              }
            }
          }
        } catch(eW) {}
        return new _origWorker(targetURL, options);
      };
      PatchedWorker.prototype = _origWorker.prototype;
      Object.defineProperty(window, 'Worker', {
        value: disguise(PatchedWorker, 'Worker'),
        configurable: true, writable: true, enumerable: false
      });
    }
  } catch(eWk) {}


  // ═══════════════════════════════════════════════════════════════
  // 20. V8 ERROR CALL STACK FORMATTING & API
  // ═══════════════════════════════════════════════════════════════
  try {
    function formatStackToV8(err, rawStack) {
      if (typeof rawStack !== 'string') return rawStack;
      if (rawStack.indexOf('@') === -1) return rawStack;
      var lines = rawStack.trim().split('\n');
      var header = (err && err.name ? err.name : 'Error') + (err && err.message ? ': ' + err.message : '');
      var v8Lines = [header];
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var atIdx = line.indexOf('@');
        if (atIdx !== -1) {
          var fn = line.slice(0, atIdx).trim();
          var loc = line.slice(atIdx + 1).trim();
          if (fn) {
            v8Lines.push('    at ' + fn + ' (' + loc + ')');
          } else {
            v8Lines.push('    at ' + loc);
          }
        } else {
          v8Lines.push('    at ' + line);
        }
      }
      return v8Lines.join('\n');
    }

    function patchErrorConstructors(scope) {
      if (!scope) return;
      var ctors = [];
      if (typeof scope.Error === 'function') ctors.push(scope.Error);
      ['TypeError', 'RangeError', 'ReferenceError', 'SyntaxError', 'URIError', 'EvalError'].forEach(function(n) {
        if (typeof scope[n] === 'function') ctors.push(scope[n]);
      });

      ctors.forEach(function(ErrCtor) {
        try {
          if (!ErrCtor || !ErrCtor.prototype) return;
          var desc = Object.getOwnPropertyDescriptor(ErrCtor.prototype, 'stack');
          var origGet = desc ? desc.get : null;
          var origSet = desc ? desc.set : null;
          Object.defineProperty(ErrCtor.prototype, 'stack', {
            get: disguise(function stack() {
              var raw = origGet ? origGet.call(this) : (this.__rawStack__ || '');
              return formatStackToV8(this, raw);
            }, 'get stack'),
            set: disguise(function stack(val) {
              if (origSet) {
                return origSet.call(this, val);
              }
              this.__rawStack__ = val;
            }, 'set stack'),
            configurable: true,
            enumerable: false
          });

          if (typeof ErrCtor.captureStackTrace === 'undefined') {
            var captureStackTrace = function captureStackTrace(targetObject, constructorOpt) {
              if (!targetObject || typeof targetObject !== 'object') return;
              var dummy = new ErrCtor();
              var rawStack = dummy.stack;
              Object.defineProperty(targetObject, 'stack', {
                get: function() {
                  var s = typeof rawStack === 'string' ? rawStack : (dummy.stack || '');
                  if (constructorOpt && typeof constructorOpt === 'function') {
                    var name = constructorOpt.name;
                    if (name) {
                      var lines = s.split('\n');
                      var idx = -1;
                      for (var i = 0; i < lines.length; i++) {
                        if (lines[i].indexOf(name) !== -1) {
                          idx = i;
                          break;
                        }
                      }
                      if (idx !== -1) {
                        s = [lines[0]].concat(lines.slice(idx + 1)).join('\n');
                      }
                    }
                  }
                  return s;
                },
                set: function(val) {
                  Object.defineProperty(targetObject, 'stack', { value: val, writable: true, configurable: true, enumerable: true });
                },
                configurable: true,
                enumerable: false
              });
            };
            Object.defineProperty(ErrCtor, 'captureStackTrace', {
              value: disguise(captureStackTrace, 'captureStackTrace'),
              configurable: true,
              writable: true,
              enumerable: false
            });
          }
          if (typeof ErrCtor.stackTraceLimit === 'undefined') {
            ErrCtor.stackTraceLimit = 10;
          }
        } catch(eErr) {}
      });
    }

    if (typeof window !== 'undefined' && window.Error) {
      patchErrorConstructors(window);
    }
    patchErrorConstructors({ Error: Error });
  } catch(eStack) {}

  // ═══════════════════════════════════════════════════════════════
  // SEB (Safe Exam Browser) Compatibility Layer
  // Emulates the client-side SEB API that exam portals check via JavaScript.
  // This covers:
  //   - window.SafeExamBrowser object with version/API methods
  //   - navigator.userAgent containing "SEB/" token
  //   - window.SEB legacy alias
  // ═══════════════════════════════════════════════════════════════
  try {
    // SEB API object — exam portals check for its existence
    var sebAPI = {
      version: '3.3.2',
      security: {
        configKey: '',
        browserExamKey: '',
        updateKeys: disguise(function updateKeys() {}, 'updateKeys')
      },
      settings: {
        get: disguise(function get(key) {
          var defaults = {
            'hashedQuitPassword': '',
            'sendBrowserExamKey': true,
            'browserViewMode': 1,
            'showTaskBar': false,
            'enableSebBrowser': true
          };
          return key in defaults ? defaults[key] : undefined;
        }, 'get'),
        set: disguise(function set(key, value) {}, 'set')
      },
      isWindowSEB: disguise(function isWindowSEB() { return true; }, 'isWindowSEB'),
      getConfigKeyHash: disguise(function getConfigKeyHash(url) {
        // Client-side portals sometimes call this; return empty since
        // the actual hash is computed and sent as an HTTP header by valence.cfg
        return '';
      }, 'getConfigKeyHash')
    };

    Object.defineProperty(window, 'SafeExamBrowser', {
      value: sebAPI,
      writable: false,
      enumerable: true,
      configurable: false
    });

    // Legacy alias: some older portals check window.SEB
    Object.defineProperty(window, 'SEB', {
      value: sebAPI,
      writable: false,
      enumerable: false,
      configurable: false
    });

    // Some portals also check navigator.userAgent for the "SEB/" token.
    // Append it if not already present.
    try {
      var currentUA = navigator.userAgent || '';
      if (currentUA.indexOf('SEB/') === -1) {
        var sebUA = currentUA + ' SEB/3.3.2';
        Object.defineProperty(Navigator.prototype, 'userAgent', {
          get: disguise(function userAgent() { return sebUA; }, 'get userAgent'),
          configurable: true,
          enumerable: true
        });
      }
    } catch(eUA) {}

  } catch(eSEB) {}

})();


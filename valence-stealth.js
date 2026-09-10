// Valence Stealth Engine v3.1.0 — Bypass Script
// Injected at DOMWindowCreated via Cu.Sandbox (wantXrays: false)
// This runs BEFORE any page scripts in the page's own JS context.
//
// ⚠️ MANDATORY RULE FOR ALL AIS AND DEVELOPERS:
// Every single time this file is modified or updated:
// 1. You MUST increment the version number above (e.g. v3.1.0 -> v3.1.1).
// 2. You MUST add an entry to the Changelog below with the version, date, and description of changes.
//
// Changelog:
// - v3.1.0 (2026-09-10): Standardized WebIDL prototype descriptors, reference equality, and Chrome-format function toString serialization.
// - v3.0.0 (2026-09-10): Baseline Stealth Engine v3 release.

(function() {
  'use strict';
  var GUARD = Symbol.for('__vs3');
  if (window[GUARD]) return;
  Object.defineProperty(window, GUARD, { value: 1, writable: false, enumerable: false, configurable: false });

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
  // TWO problems solved here:
  // 1. Cu.Sandbox has its own Function constructor. Patching
  //    Function.prototype.toString only affects sandbox functions'
  //    .toString() calls, NOT when the page does
  //    Function.prototype.toString.call(fn). Fix: patch BOTH
  //    sandbox and page Function.prototype.toString.
  //
  // 2. Simple functions like "return false" have no identifiable
  //    markers. Fix: disguise() WRAPS every function so its source
  //    automatically contains our marker variable '_VS_'.
  // ═══════════════════════════════════════════════════════════════
  var _VS_ = 1; // Marker variable — its name appears in all wrapped function source code

  function disguise(fn, name) {
    // Wrap fn so that the wrapper's source code contains '_VS_'
    var w = function() { void _VS_; return fn.apply(this, arguments); };
    try { Object.defineProperty(w, 'name', { value: name, configurable: true, enumerable: true }); } catch(e) {}
    try { Object.defineProperty(w, 'length', { value: fn.length || 0, configurable: true, enumerable: true }); } catch(e) {}
    return w;
  }

  // The toString override — checks if source contains our marker
  var _toStrOverride = function toString() {
    var s;
    try { s = _fnToStr.call(this); } catch(e) { return ''; }
    var ncode = '[native' + ' code]';
    if (s.indexOf(ncode) >= 0) return s;
    if (s.indexOf('_VS_') >= 0) {
      return 'function ' + (this.name || '') + '() { ' + ncode + ' }';
    }
    return s;
  };
  try { Object.defineProperty(_toStrOverride, 'name', { value: 'toString' }); } catch(e) {}

  // Patch BOTH sandbox and page Function.prototype.toString
  Function.prototype.toString = _toStrOverride;
  try { window.Function.prototype.toString = _toStrOverride; } catch(e) {}


  // ═══════════════════════════════════════════════════════════════
  // 1. VISIBILITY / FOCUS SPOOFING
  // ═══════════════════════════════════════════════════════════════
  Object.defineProperty(Document.prototype, 'hidden', {
    get: disguise(function hidden() { return false; }, 'get hidden'),
    configurable: true
  });
  Object.defineProperty(Document.prototype, 'visibilityState', {
    get: disguise(function visibilityState() { return 'visible'; }, 'get visibilityState'),
    configurable: true
  });
  try { Object.defineProperty(Document.prototype, 'hasFocus', { configurable: true, enumerable: false, writable: true, value: disguise(function hasFocus() { return true; }, 'hasFocus') }); } catch(e) {}

  


  // ═══════════════════════════════════════════════════════════════
  // 2. SCREEN DIMENSION SPOOFING
  //
  // KEY FIX: outerHeight must NOT equal innerHeight or screen.height
  // to avoid the "all dimensions identical" detection.
  // outerWidth also gets a small offset.
  // ═══════════════════════════════════════════════════════════════
  function getScreenW() { return window.screen ? (window.screen.width || 1920) : 1920; }
  function getScreenH() { return window.screen ? (window.screen.height || 1080) : 1080; }

  var sizeOverrides = [
    ['innerWidth',  function innerWidth()  { return getScreenW(); }],
    ['innerHeight', function innerHeight() { return getScreenH(); }],
    ['outerWidth',  function outerWidth()  { return getScreenW() + 16; }],
    ['outerHeight', function outerHeight() { return getScreenH() + 85; }],
    ['screenX',     function screenX()     { return 0; }],
    ['screenY',     function screenY()     { return 0; }],
    ['screenLeft',  function screenLeft()  { return 0; }],
    ['screenTop',   function screenTop()   { return 0; }],
  ];

  sizeOverrides.forEach(function(pair) {
    var getter = disguise(pair[1], 'get ' + pair[0]);
    try { Object.defineProperty(Window.prototype, pair[0], { get: getter, configurable: true }); } catch(e) {}
    try { Object.defineProperty(window, pair[0], { get: getter, configurable: true }); } catch(e) {}
  });

  var screenOverrides = [
    ['availWidth',  function availWidth()  { return getScreenW(); }],
    ['availHeight', function availHeight() { return getScreenH(); }],
    ['availTop',    function availTop()    { return 0; }],
    ['availLeft',   function availLeft()   { return 0; }],
  ];

  screenOverrides.forEach(function(pair) {
    var getter = disguise(pair[1], 'get ' + pair[0]);
    try { Object.defineProperty(Screen.prototype, pair[0], { get: getter, configurable: true }); } catch(e) {}
    try { if (window.screen) Object.defineProperty(window.screen, pair[0], { get: getter, configurable: true }); } catch(e) {}
  });

  try {
    var dprGetter = disguise(function devicePixelRatio() { return 1; }, 'get devicePixelRatio');
    
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
  var _currentFullscreenElement = null;

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
      configurable: true
    });
  } catch(e) {}
  try {
    Object.defineProperty(Document.prototype, 'webkitFullscreenEnabled', {
      get: disguise(function webkitFullscreenEnabled() { return true; }, 'get webkitFullscreenEnabled'),
      configurable: true
    });
  } catch(e) {}
  try {
    Object.defineProperty(Document.prototype, 'mozFullScreenEnabled', {
      get: disguise(function mozFullScreenEnabled() { return true; }, 'get mozFullScreenEnabled'),
      configurable: true
    });
  } catch(e) {}

  // Override fullscreenElement to return our tracked element
  try {
    Object.defineProperty(Document.prototype, 'fullscreenElement', {
      get: disguise(function fullscreenElement() { return _currentFullscreenElement; }, 'get fullscreenElement'),
      configurable: true
    });
  } catch(e) {}
  try {
    Object.defineProperty(Document.prototype, 'webkitFullscreenElement', {
      get: disguise(function webkitFullscreenElement() { return _currentFullscreenElement; }, 'get webkitFullscreenElement'),
      configurable: true
    });
  } catch(e) {}
  try {
    Object.defineProperty(Document.prototype, 'mozFullScreenElement', {
      get: disguise(function mozFullScreenElement() { return _currentFullscreenElement; }, 'get mozFullScreenElement'),
      configurable: true
    });
  } catch(e) {}
  try {
    Object.defineProperty(Document.prototype, 'msFullscreenElement', {
      get: disguise(function msFullscreenElement() { return _currentFullscreenElement; }, 'get msFullscreenElement'),
      configurable: true
    });
  } catch(e) {}


  // ═══════════════════════════════════════════════════════════════
  // 4. MOUSE BOUNDARY CLAMPING
  //
  // KEY FIX: Use a 75px top margin to prevent the exam site from
  // detecting the mouse near the top edge (macOS menu bar area).
  // This ensures the mouse never accidentally triggers top-edge
  // detection on the exam website.
  // ═══════════════════════════════════════════════════════════════
  var TOP_MARGIN = 75;
  var SIDE_MARGIN = 15;
  var BOTTOM_MARGIN = 15;

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
      if (ny < TOP_MARGIN) { ny = TOP_MARGIN; clamped = true; }
      if (ny > h - BOTTOM_MARGIN) { ny = h - BOTTOM_MARGIN; clamped = true; }
      if (nx < SIDE_MARGIN) { nx = SIDE_MARGIN; clamped = true; }
      if (nx > w - SIDE_MARGIN) { nx = w - SIDE_MARGIN; clamped = true; }
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
  //     so dispatched (untrusted) events appear trusted via Proxy.
  //     Use a WeakMap to track original→wrapper so removeEventListener works.
  var _listenerMap = new WeakMap();

  try { Object.defineProperty(EventTarget.prototype, 'addEventListener', { configurable: true, enumerable: false, writable: true, value: disguise(function addEventListener(type, listener, options) {
    if ((type === 'mousemove' || type === 'pointermove') && typeof listener === 'function') {
      // Check if we already have a wrapper for this listener
      var mapKey = listener;
      var wrapperMap = _listenerMap.get(mapKey);
      if (!wrapperMap) {
        wrapperMap = {};
        _listenerMap.set(mapKey, wrapperMap);
      }
      if (!wrapperMap[type]) {
        var orig = listener;
        wrapperMap[type] = function(e) {
          if (!e.isTrusted) {
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
          return orig.call(this, e);
        };
      }
      listener = wrapperMap[type];
    }
    return _addEL.call(this, type, listener, options);
  }, 'addEventListener') }); } catch(e) {}

  try { Object.defineProperty(EventTarget.prototype, 'removeEventListener', { configurable: true, enumerable: false, writable: true, value: disguise(function removeEventListener(type, listener, options) {
    if ((type === 'mousemove' || type === 'pointermove') && typeof listener === 'function') {
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
      _fakeY = randomWalk(_fakeY, TOP_MARGIN + 50, h - 100, 30);

      var me = new MouseEvent('mousemove', {
        clientX: _fakeX, clientY: _fakeY,
        screenX: _fakeX, screenY: _fakeY,
        pageX: _fakeX + (window.scrollX || 0),
        pageY: _fakeY + (window.scrollY || 0),
        bubbles: true, cancelable: true, view: window
      });
      _dispatch.call(document, me);

      try {
        var pe = new PointerEvent('pointermove', {
          clientX: _fakeX, clientY: _fakeY,
          screenX: _fakeX, screenY: _fakeY,
          bubbles: true, cancelable: true, view: window,
          pointerId: 1, pointerType: 'mouse'
        });
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
  try { Object.defineProperty(XMLHttpRequest.prototype, 'open', { configurable: true, enumerable: false, writable: true, value: disguise(function open(method, url) {
    this._vsBlocked = false;
    try {
      var urlStr = (url && typeof url.toString === 'function') ? url.toString() : '';
      if (EXT_RE.test(urlStr)) {
        this._vsBlocked = true;
        return;
      }
    } catch(e) {}
    return _xhrOpen.apply(this, arguments);
  }, 'open') }); } catch(e) {}
  try { Object.defineProperty(XMLHttpRequest.prototype, 'send', { configurable: true, enumerable: false, writable: true, value: disguise(function send() {
    if (this._vsBlocked) {
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
  // 8. CANVAS FINGERPRINT PROTECTION (deterministic noise)
  // ═══════════════════════════════════════════════════════════════
  var _origCE = Document.prototype.createElement; // save before section 17 overrides it
  function applyCanvasNoise(canvas) {
    try {
      var ctx = canvas.getContext('2d');
      if (!ctx) return;
      var w = canvas.width, h = canvas.height;
      if (w === 0 || h === 0) return;
      var imgData = _origGetImageData.call(ctx, 0, 0, w, h);
      var d = imgData.data;
      for (var i = 0; i < d.length; i += 68) { d[i] ^= 1; }
      ctx.putImageData(imgData, 0, 0);
    } catch(e8) {}
  }

  try { Object.defineProperty(HTMLCanvasElement.prototype, 'toDataURL', { configurable: true, enumerable: false, writable: true, value: disguise(function toDataURL() {
    var copy = _origCE.call(document, 'canvas');
    copy.width = this.width; copy.height = this.height;
    var ctx2 = copy.getContext('2d');
    if (ctx2) ctx2.drawImage(this, 0, 0);
    applyCanvasNoise(copy);
    return _origToDataURL.apply(copy, arguments);
  }, 'toDataURL') }); } catch(e) {}

  try { Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', { configurable: true, enumerable: false, writable: true, value: disguise(function toBlob(cb, type, quality) {
    var copy = _origCE.call(document, 'canvas');
    copy.width = this.width; copy.height = this.height;
    var ctx2 = copy.getContext('2d');
    if (ctx2) ctx2.drawImage(this, 0, 0);
    applyCanvasNoise(copy);
    return _origToBlob.call(copy, cb, type, quality);
  }, 'toBlob') }); } catch(e) {}

  try { Object.defineProperty(CanvasRenderingContext2D.prototype, 'getImageData', { configurable: true, enumerable: false, writable: true, value: disguise(function getImageData(sx, sy, sw, sh) {
    var data = _origGetImageData.call(this, sx, sy, sw, sh);
    for (var i = 0; i < data.data.length; i += 68) { data.data[i] ^= 1; }
    return data;
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
    });
  } catch(e9) {}


  // ═══════════════════════════════════════════════════════════════
  // 10. AUDIO FINGERPRINT PROTECTION (deterministic)
  // ═══════════════════════════════════════════════════════════════
  try {
    if (typeof AnalyserNode !== 'undefined') {
      var _origGetFloat = AnalyserNode.prototype.getFloatFrequencyData;
      try { Object.defineProperty(AnalyserNode.prototype, 'getFloatFrequencyData', { configurable: true, enumerable: false, writable: true, value: disguise(function getFloatFrequencyData(arr) {
        _origGetFloat.call(this, arr);
        for (var i = 0; i < arr.length; i += 7) {
          arr[i] = arr[i] + 0.0001;
        }
      }, 'getFloatFrequencyData') }); } catch(e) {}
      
      if (AnalyserNode.prototype.getByteFrequencyData) {
        var _origGetByte = AnalyserNode.prototype.getByteFrequencyData;
        try { Object.defineProperty(AnalyserNode.prototype, 'getByteFrequencyData', { configurable: true, enumerable: false, writable: true, value: disguise(function getByteFrequencyData(arr) {
          _origGetByte.call(this, arr);
          for (var i = 0; i < arr.length; i += 7) {
            arr[i] = (arr[i] + 1) % 256;
          }
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
      var _origSLD = RTC.prototype.setLocalDescription;
      try { Object.defineProperty(RTC.prototype, 'setLocalDescription', { configurable: true, enumerable: false, writable: true, value: disguise(function setLocalDescription(desc) {
        if (desc && desc.sdp) {
          desc = Object.assign({}, desc, {
            sdp: desc.sdp.replace(/([0-9]{1,3}(\.[0-9]{1,3}){3})/g, function(match) {
              if (/^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/.test(match)) return '192.168.1.42';
              return match;
            })
          });
        }
        return _origSLD.call(this, desc);
      }, 'setLocalDescription') }); } catch(e) {}
    }
  } catch(e11) {}


  // ═══════════════════════════════════════════════════════════════
  // 12. NAVIGATOR / USER-AGENT SPOOFING (Chrome 152)
  // ═══════════════════════════════════════════════════════════════
  try {
    var CHROME_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.7977.82 Safari/537.36';

    var _languages = Object.freeze(['en-US', 'en']);

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
      ['maxTouchPoints',      function() { return 0; }],
      ['pdfViewerEnabled',    function() { return true; }],
      ['webdriver',    function() { return false; }],
    ];

    navOverrides.forEach(function(pair) {
      try {
        Object.defineProperty(Navigator.prototype, pair[0], {
          get: disguise(pair[1], 'get ' + pair[0]),
          configurable: true
        });
      } catch(e12) {}
    });

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
          app: { isInstalled: false, InstallState: { DISABLED: 'disabled', INSTALLED: 'installed', NOT_INSTALLED: 'not_installed' }, RunningState: { CANNOT_RUN: 'cannot_run', READY_TO_RUN: 'ready_to_run', RUNNING: 'running' } },
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
          { brand: 'Chromium', version: '152' },
          { brand: 'Google Chrome', version: '152' },
          { brand: 'Not:A-Brand', version: '24' }
        ],
        mobile: false,
        platform: 'Windows',
        getHighEntropyValues: disguise(function() {
          return Promise.resolve({
            architecture: 'x86', bitness: '64',
            brands: [
              { brand: 'Chromium', version: '152.0.7977.82' },
              { brand: 'Google Chrome', version: '152.0.7977.82' },
              { brand: 'Not:A-Brand', version: '24.0.0.0' }
            ],
            fullVersionList: [
              { brand: 'Chromium', version: '152.0.7977.82' },
              { brand: 'Google Chrome', version: '152.0.7977.82' }
            ],
            mobile: false, model: '', platform: 'Windows',
            platformVersion: '10.0.0', uaFullVersion: '152.0.7977.82'
          });
        }, 'getHighEntropyValues'),
        toJSON: disguise(function() {
          return { brands: this.brands, mobile: this.mobile, platform: this.platform };
        }, 'toJSON')
      };

      Object.defineProperty(Navigator.prototype, 'userAgentData', {
        get: disguise(function() { return _uaData; }, 'get userAgentData'),
        configurable: true
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
  // 17. IFRAME PROTECTION — Also patch new iframes' prototypes
  //     so the testbench iframe-check sees clean Function.toString
  // ═══════════════════════════════════════════════════════════════
  try {
    var _origCreateElement = Document.prototype.createElement;
    try { Object.defineProperty(Document.prototype, 'createElement', { configurable: true, enumerable: false, writable: true, value: disguise(function createElement(tag) {
      var el = _origCreateElement.apply(this, arguments);
      if (tag && tag.toLowerCase() === 'iframe') {
        var patchPending = true;
        var origEl = el;
        function patchIframeToString() {
          if (!patchPending) return;
          try {
            if (origEl.contentWindow && origEl.contentWindow.Function) {
              patchPending = false;
              origEl.contentWindow.Function.prototype.toString = Function.prototype.toString;
            }
          } catch(e) {} // cross-origin — silently ignore
        }
        // Primary: load event fires when iframe content is ready
        _addEL.call(origEl, 'load', patchIframeToString, true);
        // Fallbacks at various timings in case load already fired or is synchronous
        _setTimeout(patchIframeToString, 0);
        _setTimeout(patchIframeToString, 50);
        _setTimeout(patchIframeToString, 200);
      }
      return el;
    }, 'createElement') }); } catch(e) {}
  } catch(e20) {}

})();

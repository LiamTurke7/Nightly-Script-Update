// test-suite.js
// Validates W3C specification compliance and JS runtime consistency

(function runComplianceTests() {
  let failures = 0;

  function assert(condition, message) {
    if (!condition) {
      console.error('❌ FAIL: ' + message);
      failures++;
    } else {
      console.log('✅ PASS: ' + message);
    }
  }

  console.log('Running W3C API Compliance & Runtime Consistency Tests...');

  // 1. Reference Equality
  assert(navigator.plugins === navigator.plugins, 'Reference equality: navigator.plugins returns identical reference');
  assert(navigator.mimeTypes === navigator.mimeTypes, 'Reference equality: navigator.mimeTypes returns identical reference');
  if (typeof document !== 'undefined') {
    assert(document.hidden === document.hidden, 'Reference equality: document.hidden returns identical primitive');
  }

  // 2. Prototype Chain Integrity & Instance Shadowing
  if (typeof document !== 'undefined') {
    assert(!Object.prototype.hasOwnProperty.call(document, 'hidden'), 'Instance masking: document.hidden must NOT exist on document instance');
    assert(!Object.prototype.hasOwnProperty.call(document, 'visibilityState'), 'Instance masking: document.visibilityState must NOT exist on document instance');
  }
  if (typeof window !== 'undefined') {
    assert(!Object.prototype.hasOwnProperty.call(window, 'innerWidth'), 'Instance masking: window.innerWidth must NOT exist on window instance');
    assert(!Object.prototype.hasOwnProperty.call(window, 'devicePixelRatio'), 'Instance masking: window.devicePixelRatio must NOT exist on window instance');
  }

  // 3. Object Types and Prototype Chains
  assert(Object.prototype.toString.call(navigator.plugins) === '[object PluginArray]', 'Prototype integrity: navigator.plugins is [object PluginArray]');
  assert(navigator.plugins.constructor.name === 'PluginArray', 'Prototype integrity: navigator.plugins.constructor is PluginArray');
  
  assert(Object.prototype.toString.call(navigator.mimeTypes) === '[object MimeTypeArray]', 'Prototype integrity: navigator.mimeTypes is [object MimeTypeArray]');
  assert(navigator.mimeTypes.constructor.name === 'MimeTypeArray', 'Prototype integrity: navigator.mimeTypes.constructor is MimeTypeArray');
  
  if (navigator.plugins.length > 0) {
    assert(Object.prototype.toString.call(navigator.plugins[0]) === '[object Plugin]', 'Prototype integrity: navigator.plugins[0] is [object Plugin]');
    assert(navigator.plugins[0].constructor.name === 'Plugin', 'Prototype integrity: navigator.plugins[0].constructor is Plugin');
  }
  if (navigator.mimeTypes.length > 0) {
    assert(Object.prototype.toString.call(navigator.mimeTypes[0]) === '[object MimeType]', 'Prototype integrity: navigator.mimeTypes[0] is [object MimeType]');
    assert(navigator.mimeTypes[0].constructor.name === 'MimeType', 'Prototype integrity: navigator.mimeTypes[0].constructor is MimeType');
  }

  // 4. Function Serialization Validity
  if (typeof document !== 'undefined' && typeof document.exitFullscreen === 'function') {
    assert(Function.prototype.toString.call(document.exitFullscreen) === 'function exitFullscreen() { [native code] }', 'Serialization: exitFullscreen serializes to exact native string');
  }
  assert(Function.prototype.toString.call(Function.prototype.toString) === 'function toString() { [native code] }', 'Serialization: toString itself serializes to exact native string');
  if (typeof Document !== 'undefined') {
    const hiddenDesc = Object.getOwnPropertyDescriptor(Document.prototype, 'hidden');
    if (hiddenDesc && hiddenDesc.get) {
      assert(Function.prototype.toString.call(hiddenDesc.get) === 'function get hidden() { [native code] }', 'Serialization: get hidden serializes to exact native string');
    }
  }

  // 5. Constructor and Object Property Descriptors
  if (typeof Document !== 'undefined') {
    const desc = Object.getOwnPropertyDescriptor(Document.prototype, 'hidden');
    assert(desc && desc.enumerable === true, 'Descriptor: Document.prototype.hidden getter must be enumerable (WebIDL Attribute)');
    assert(desc && desc.configurable === true, 'Descriptor: Document.prototype.hidden getter must be configurable');
  }
  if (typeof Window !== 'undefined') {
    const desc = Object.getOwnPropertyDescriptor(Window.prototype, 'innerWidth');
    assert(desc && desc.enumerable === true, 'Descriptor: Window.prototype.innerWidth getter must be enumerable (WebIDL Attribute)');
    assert(desc && desc.configurable === true, 'Descriptor: Window.prototype.innerWidth getter must be configurable');
  }
  if (typeof Element !== 'undefined') {
    const desc = Object.getOwnPropertyDescriptor(Element.prototype, 'requestFullscreen');
    if (desc) {
      assert(desc.enumerable === false, 'Descriptor: Element.prototype.requestFullscreen must NOT be enumerable (WebIDL Operation)');
      assert(desc.configurable === true, 'Descriptor: Element.prototype.requestFullscreen must be configurable');
      assert(desc.writable === true, 'Descriptor: Element.prototype.requestFullscreen must be writable');
    }
  }

  console.log(`\nTest Run Complete. ${failures} Failures.`);
  if (failures > 0) {
    console.error('The environment does not meet strict W3C spec compliance.');
  } else {
    console.log('Environment fully complies with W3C specs!');
  }
})();

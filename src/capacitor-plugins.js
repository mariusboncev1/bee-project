/**
 * ApiNote Beekeeping – Capacitor Plugin Helpers
 * 
 * This module exposes native-device capabilities provided by Capacitor plugins
 * as simple functions that can be called from any page script.
 *
 * Usage (in an EJS view or a <script> tag):
 *   <script src="https://unpkg.com/@capacitor/core@latest/dist/capacitor.js"></script>
 *   <script src="/js/capacitor-plugins.js"></script>  <!-- copy this file to public/js/ -->
 *   <script>
 *     CapacitorPlugins.checkPlatform().then(console.log);
 *   </script>
 *
 * When running in a regular browser the functions gracefully degrade to no-ops
 * or return sensible web-based defaults.
 */
;(function (root) {
  'use strict';

  // ---------------------------------------------------------------------------
  // Capacitor core reference
  // ---------------------------------------------------------------------------
  var Capacitor = (root.Capacitor) || {};
  var Plugins   = Capacitor.Plugins || {};

  // Convenience: is this running inside a native iOS/Android shell?
  function isNative() {
    return typeof Capacitor.isNativePlatform === 'function' && Capacitor.isNativePlatform();
  }

  // ---------------------------------------------------------------------------
  // 1. Check Platform
  //    Returns { platform, isNative } – useful for conditional UI logic.
  // ---------------------------------------------------------------------------
  function checkPlatform() {
    var platform = 'web';
    if (typeof Capacitor.getPlatform === 'function') {
      platform = Capacitor.getPlatform(); // 'ios' | 'android' | 'web'
    }
    return Promise.resolve({
      platform: platform,
      isNative: isNative(),
    });
  }

  // ---------------------------------------------------------------------------
  // 2. Show a Native Toast
  //    Falls back to a console.log on the web.
  // ---------------------------------------------------------------------------
  function showNativeToast(message) {
    if (isNative() && Plugins.Toast) {
      return Plugins.Toast.show({ text: message, duration: 'long' });
    }
    // Web fallback
    console.log('[ApiNote Toast]', message);
    return Promise.resolve();
  }

  // ---------------------------------------------------------------------------
  // 3. Get Device Info
  //    Returns basic device details via @capacitor/device, or a web stub.
  // ---------------------------------------------------------------------------
  function getDeviceInfo() {
    if (Plugins.Device && typeof Plugins.Device.getInfo === 'function') {
      return Plugins.Device.getInfo();
    }
    // Web fallback – return whatever the browser can tell us.
    return Promise.resolve({
      platform: 'web',
      operatingSystem: navigator.platform || 'unknown',
      model: navigator.userAgent || 'unknown',
      isVirtual: false,
    });
  }

  // ---------------------------------------------------------------------------
  // 4. Set Status-Bar Colour (native only)
  // ---------------------------------------------------------------------------
  function setStatusBarColor(color) {
    if (!isNative()) {
      console.log('[ApiNote] setStatusBarColor is a no-op on the web. Color:', color);
      return Promise.resolve();
    }
    if (Plugins.StatusBar && typeof Plugins.StatusBar.setBackgroundColor === 'function') {
      return Plugins.StatusBar.setBackgroundColor({ color: color });
    }
    return Promise.resolve();
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
  root.CapacitorPlugins = {
    isNative:          isNative,
    checkPlatform:     checkPlatform,
    showNativeToast:   showNativeToast,
    getDeviceInfo:     getDeviceInfo,
    setStatusBarColor: setStatusBarColor,
  };

})(typeof window !== 'undefined' ? window : this);

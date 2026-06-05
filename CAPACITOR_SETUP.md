# ApiNote Beekeeping – Capacitor Mobile Setup Guide

This guide explains how to build the ApiNote Beekeeping web app as a native
Android and iOS application using [Capacitor](https://capacitorjs.com/).

---

## Prerequisites

| Tool            | Minimum Version | Purpose          |
| --------------- | --------------- | ---------------- |
| Node.js         | 18+             | JavaScript runtime |
| npm             | 9+              | Package manager  |
| Android Studio  | Hedgehog+       | Android builds   |
| Xcode           | 15+             | iOS builds (macOS only) |
| CocoaPods       | 1.14+           | iOS dependency manager |

> **Note:** Xcode and CocoaPods are only available on macOS. You cannot build
> the iOS app on Windows or Linux.

---

## 1. Install Dependencies

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios \
  @capacitor/status-bar @capacitor/splash-screen @capacitor/keyboard \
  @capacitor/push-notifications
```

These packages provide the Capacitor runtime, the CLI tooling, platform
projects, and the native plugins configured in `capacitor.config.ts`.

---

## 2. Add Platforms

### Android

```bash
npm run cap:add:android
```

This creates the `android/` directory with a full Android Studio project.

### iOS

```bash
npm run cap:add:ios
```

This creates the `ios/` directory with an Xcode workspace.

---

## 3. Sync Web Assets

Every time you change files in `public/` you need to sync them into the native
projects:

```bash
npm run cap:sync
# or equivalently
npm run build:mobile
```

---

## 4. Configure the Dev Server URL

`capacitor.config.ts` ships with `server.url` set to
`http://10.0.2.2:3000` — this is the special alias the **Android emulator**
uses to reach the host machine's `localhost`.

Update the URL depending on your target:

| Target               | `server.url`                          |
| -------------------- | ------------------------------------- |
| Android Emulator     | `http://10.0.2.2:3000`               |
| iOS Simulator        | `http://localhost:3000`               |
| Physical Device (LAN)| `http://<YOUR_LOCAL_IP>:3000`         |
| Production           | Remove the `server` block entirely    |

Make sure to start the Express dev server **before** launching the native app:

```bash
npm run dev
```

---

## 5. Open & Run in IDE

### Android

```bash
npm run cap:open:android
```

This opens the project in Android Studio. From there:

1. Select a device or emulator.
2. Click **Run ▶**.

### iOS

```bash
npm run cap:open:ios
```

This opens the project in Xcode. From there:

1. Select a simulator or connected device.
2. Click **Run ▶**.

---

## 6. Using Capacitor Plugins in Views

A helper module is provided at `src/capacitor-plugins.js`. Copy or symlink it
into `public/js/` so it can be loaded via a `<script>` tag:

```html
<!-- Load the Capacitor runtime (CDN or bundled) -->
<script src="https://unpkg.com/@capacitor/core@latest/dist/capacitor.js"></script>

<!-- Load the helper module -->
<script src="/js/capacitor-plugins.js"></script>

<script>
  // Example: detect platform
  CapacitorPlugins.checkPlatform().then(function (info) {
    console.log('Running on', info.platform, '| native:', info.isNative);
  });

  // Example: change status-bar colour on native
  CapacitorPlugins.setStatusBarColor('#F2A900');
</script>
```

All helper functions return Promises and gracefully fall back to no-ops when
running in a regular browser.

---

## 7. Building a Release APK / IPA

### Android

1. Open the project in Android Studio (`npm run cap:open:android`).
2. Go to **Build → Generate Signed Bundle / APK**.
3. Follow the signing wizard.

### iOS

1. Open the project in Xcode (`npm run cap:open:ios`).
2. Set your Apple Developer Team in **Signing & Capabilities**.
3. Select **Product → Archive** and follow the distribution wizard.

---

## 8. Troubleshooting

| Issue | Fix |
| ----- | --- |
| Blank screen on emulator | Ensure the Express server is running and `server.url` is correct. |
| `ERR_CLEARTEXT_NOT_PERMITTED` (Android) | Verify `server.cleartext: true` in `capacitor.config.ts`. |
| iOS build fails with CocoaPods error | Run `cd ios/App && pod install --repo-update`. |
| Changes not showing | Run `npm run cap:sync` to push latest assets. |
| `capacitor.config.ts` not found | Run commands from the project root (`d:\Docs\TAW\bee-project`). |

---

## Project Structure After Setup

```
bee-project/
├── android/               ← Android Studio project (generated)
├── ios/                    ← Xcode project (generated, macOS only)
├── public/                 ← webDir – static assets served to the WebView
│   ├── css/
│   ├── img/
│   ├── js/
│   ├── manifest.json
│   └── service-worker.js
├── src/
│   ├── capacitor-plugins.js  ← Capacitor plugin helper (IIFE)
│   ├── views/
│   └── ...
├── capacitor.config.ts     ← Capacitor configuration
├── package.json
└── CAPACITOR_SETUP.md      ← This file
```

# Android APK — build, packaging & UI optimization notes

Deliverable: `human-biology-lab-android-debug.apk` (root) — Capacitor 4 WebView
shell around the production `dist/` build. Package `ai.arena.humanbiologylab`,
minSdk 22 (Android 5.1+), targetSdk 32. Debug-signed; use a release keystore
for distribution.

## Reproduce

```bash
npm i && npm run build                 # web bundle → dist/
npx cap add android                    # (only if the android/ project is absent; config in capacitor.config.json)
npx cap sync android                   # copy dist into android/app/src/main/assets
cd android && ./gradlew assembleDebug  # → app/build/outputs/apk/debug/app-debug.apk
```

The `android/` project itself is intentionally not stored in the workspace — it is a
regenerable Capacitor skeleton (`cap add android`); only the recipe and web assets ship.

Toolchain used here: Temurin JDK 17 (`/home/user/jdk17`), Android SDK at
`/home/user/android-sdk` (platform 32/33, build-tools 33.0.2), Gradle wrapper.

## What is inside

- Full app: atlas, simulations, Kinesiology Theater, PWA assets, vendored
  MediaPipe wasm + pose model (works offline in the WebView).
- `server.androidScheme: https` — secure origin, so WebCrypto/ServiceWorker
  semantics match the web app; no mixed content.
- Permissions: **INTERNET only**. Camera is deliberately NOT declared: the
  optional webcam self-compare (E5-governed) fails gracefully in-app with its
  on-device disclosure copy. If a future release wants it on Android, add
  CAMERA + runtime request + `onPermissionRequest` grant AFTER a privacy
  re-review (docs/WEBCAM_PRIVACY_SPEC.md).

## Android UI optimizations applied

1. `viewport-fit=cover` + `interactive-widget=resizes-content`; theme-color set.
2. Safe-area insets honored (topbar, footer, FAB, theater transport).
3. Coarse-pointer tier: 44–52 px minimum tap targets across theater tools,
   action strip, camera/quality/ribbon buttons; horizontal scroll-snap tool
   rows instead of cramped wrapping; sticky transport above the gesture bar.
4. `overscroll-behavior: none`, no tap-highlight, text-size-adjust locked —
   app-like feel, no pull-to-refresh reloads.
5. Hardware back button: leaves a module screen first (clicks the visible
   back button), exits only from home (Capacitor App plugin).
6. WebView detection (`window.Capacitor` / `; wv)` UA) adds `.in-webview` so
   web-only PWA affordances can be hidden (`.pwa-only`).

## Known limits

- Debug build is ~38 MB (embedded assets incl. MediaPipe). A release pass
  should enable `shrinkResources`/R8 and split ABIs.
- No emulator in this sandbox (no KVM): behavior verified via the browser
  suite's phone tier + code review, not on-device. On-device smoke (install,
  boot, theater, back button, offline) is queued as a human test case.
- `dist-offline/` single-file bundle remains the viewer/offline path on web;
  the APK ships its own copy of `dist/` in assets.

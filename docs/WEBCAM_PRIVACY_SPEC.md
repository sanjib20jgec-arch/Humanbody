# Webcam self-compare — privacy specification (Phase 94, E5)

Governs the optional "self-compare" feature (Phase 94, C11).

1. **Default off.** The camera never starts without an explicit per-session toggle.
2. **On-device only.** Pose inference runs in-page (MediaPipe wasm + vendored model).
   No frame, landmark, or derived value leaves the device; no network requests are
   made by the feature (model + wasm are bundled assets).
3. **Ephemeral.** Frames are discarded after inference; landmarks are held only for
   the current frame; no recording, screenshots, or logs of camera data.
4. **No biometric templates.** Only a scalar knee angle is displayed; nothing
   identity-bearing is derived, stored, or persisted.
5. **Child-privacy posture.** Designed to satisfy COPPA (incl. 2025 biometric
   amendments) and GDPR-K without parental-consent flows by collecting *no*
   personal information: the app never obtains, stores, or transmits camera
   content. If any future change would persist or transmit camera-derived data,
   verifiable parental consent (COPPA) / guardian consent (GDPR-K) tooling must
   ship first.
6. **Disclosure copy (in-UI):** "Camera stays on your device. Frames are analysed
   in your browser and discarded instantly; nothing is stored or sent."
7. **Failure modes.** Camera denied/unavailable → feature button explains and the
   rest of the theater is unaffected.

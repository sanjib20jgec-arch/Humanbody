# Human Biology Lab deployment release checklist

## Build and verification

- [ ] Run `npm ci`.
- [ ] Run `npm run verify`.
- [ ] Run the Chromium job from `.github/workflows/verify.yml`.
- [ ] Review Brain & Nerves visual-review artifacts.
- [ ] Record real-device measurements for LCP, INP, CLS, first usable anatomy, decode time, geometry build time, draw calls, worst frame time, and GPU memory.

## Static hosting

- [ ] Publish the complete `dist/` directory with SPA fallback to `index.html`.
- [ ] Preserve `sw.js`, `manifest.webmanifest`, `_headers`, `robots.txt`, `models/`, `assets/`, and `ATTRIBUTION-BodyParts3D.md` at the site root.
- [ ] Serve `index.html` and `sw.js` with revalidation.
- [ ] Serve hashed assets and versioned atlas geometry with immutable caching.
- [ ] Confirm the host applies `public/_headers`; the file is a deployment contract, not a Vite development-server configuration.

## Security and privacy

- [ ] Confirm the Content-Security-Policy is active in the deployed response headers.
- [ ] Confirm `Permissions-Policy` disables camera, microphone, geolocation, and payment APIs.
- [ ] Confirm no provider API key is shipped in frontend assets.
- [ ] If enabling `/api/ai`, keep provider credentials server-side and review request logging/privacy retention.
- [ ] Keep performance telemetry local unless a separate consent and data-minimization review approves an analytics adapter.

## Offline and cache governance

- [ ] Bump `CACHE_VERSION` in `public/sw.js` when shell behavior or the shell asset set changes.
- [ ] Bump `MODEL_CACHE` when the atlas manifest or geometry source changes.
- [ ] Verify that stale shell caches are removed during service-worker activation.
- [ ] Verify that the atlas is not silently precached at installation.
- [ ] Test explicit atlas download, cancellation, retry, removal, and offline reload.
- [ ] Keep the BodyParts3D attribution and adult-male/simplified-model limitation visible in the product.

## Rollback

- [ ] Keep the previous `dist/` artifact available for rollback.
- [ ] Roll back the shell and service worker together when a deployment breaks startup or offline behavior.
- [ ] Do not reuse a geometry cache namespace after changing the atlas binary layout.
- [ ] Re-run `npm run verify:deployment` after changing headers, cache versions, or deployment rules.

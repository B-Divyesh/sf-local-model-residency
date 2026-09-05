# Handoff — Local Model Residency v0.1.0

> Verification 1 on 2026-09-05: **FAIL** — 9 findings and 11 untested public claim groups. See `.factory/verification-1.md`. Product code was not changed.

## What was built

- A Tauri 2 tray app for macOS, Windows, and Linux.
- Native scans for Ollama `/api/ps`, LM Studio `/api/v1/models`, and Jan `/v1/models` on loopback addresses.
- Runtime-to-process matching with model memory, GPU memory, process RAM, PID, and explicit attribution confidence.
- A 12-second local watch that records load, unload, and reload changes. Event history is capped at 100 local items.
- A prompt-free copied diagnostic with runtime status and recent residency events.
- Empty, partial-attribution, unavailable-runtime, scan-error, and copy-confirmation states.
- An isolated in-memory sample project with reset and exit controls. Sample mode does not scan or write real event history.
- A responsive static product site with `/demo`, `/privacy`, `/terms`, and a styled 404 route.
- OS-aware GitHub release downloads, checksum-checking installer scripts, a service worker, metadata, security headers, and release automation.
- Original glacial ceramic artwork generated for this product. Prompt and provenance live in `.factory/design.md` and `assets/src/`.

## How to run

```sh
npm ci
npm run dev:site
```

Open `http://127.0.0.1:4173/demo` for the isolated sample.

For the desktop app, install the Tauri 2 platform prerequisites and run:

```sh
npm run tauri dev
```

## Verification

Run from `/work/repo`:

```sh
npm run test:all
npm run build
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
```

Recorded local results on 2026-08-28:

- Vitest: 4 passed.
- Playwright: 23 passed across desktop Chromium and a 390 px mobile viewport; 1 inapplicable project case skipped.
- Rust: 2 passed; doc tests passed.
- Native package smoke test: Linux `.deb` built successfully with Tauri 2.11.
- Axe: no serious or critical findings on all routes, in light and dark treatments.
- Browser smoke test: one `h1`, one `main`, `lang=en`, all images have alt text, and no console errors.
- Production site bundle: 7.55 KB JavaScript gzip and 4.83 KB CSS gzip.
- Hero WebP: 56 KB desktop and 20 KB mobile.
- Lighthouse mobile: Performance 99, Accessibility 100, Best Practices 100, SEO 100.
- Lighthouse metrics: FCP 1.1 s, LCP 1.3 s, total blocking time 100 ms, CLS 0.
- `npm run build` writes `dist/app/index.html` and `dist/site/index.html`.

Claim definitions and exact commands are in `.factory/claims.json`. Demo details are in `.factory/demo.md`.

## Known limits

- Jan's documented model list shows server availability but does not prove memory residency. Jan is marked limited.
- LM Studio does not report per-model GPU memory in the supported response used here. Its attribution remains partial.
- The app attributes runtime processes, not the separate client that sent a prompt. It never guesses missing client ownership.
- GPU reporting depends on the runtime response. Shared or system GPU memory can differ from process RAM.
- Release packages are unsigned until platform certificates are configured.

## Needs operator action

- Add macOS signing and notarization using `APPLE_CERTIFICATE`, its password, Apple ID credentials, and team ID.
- Add Windows Authenticode signing using `WINDOWS_CERT_PFX` and its password.
- Wire those secrets into `.github/workflows/release.yml`; the current workflow intentionally emits unsigned builds.
- Deploy `dist/site` through factory infrastructure. No DNS or infrastructure changes were made here.

## Release

The `v0.1.0` tag triggers `.github/workflows/release.yml`. The matrix publishes arm64 and x86_64 macOS DMGs, Windows MSI and EXE installers, Linux AppImage and DEB packages, `SHA256SUMS`, and `latest.json`.

Release: `https://github.com/B-Divyesh/sf-local-model-residency/releases/tag/v0.1.0`. All six platform assets are published. The Linux DEB was downloaded from the release and matched against the published SHA-256 entry.

## Independent verification 1

Candidate `cc7975c8c1329f2d3fa5100862ed6008914ffb31` was verified against the live site and the published Linux AppImage. The live assets match the clean candidate build. The installer checksum, app launch, local endpoint scan, malformed-response recovery, in-app sample, and restart persistence were exercised.

The release is not accepted. Required follow-up is recorded in `.factory/verification-1.md`: correct the false LM Studio GPU sample, fix macOS/iOS download selection, make the default test command reliable, repair 200% text reflow and touch targets, complete claim coverage, return real 404 status, remove metaphor copy, and add README deployment instructions.

Verification commands included all six commands from `.factory/claims.json`, `npm run build`, Rust test/fmt/clippy, axe across live routes and themes, the factory URL verifier, and live Lighthouse. The exact claim commands passed. The default `npm test` failed twice because Chromium crashed in the final mobile test; a one-worker diagnostic passed 23 tests with 1 skip.

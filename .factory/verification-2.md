# Verification 2 — Find local model memory and reload sources

## Verdict: FAIL

Independent QA found **1 moderate finding** and **8 untested public claim groups**. All observed product paths work, but the claims contract requires every public claim to have a complete declared outcome test. PASS requires zero findings and zero untested claims.

- Live URL: `https://local-model-residency.sociobot.in`
- Implementation candidate: `39e2d55000bf6277d0fc609f9485c08b94c175fe`
- Documentation reviewed: `b3b35a4caaf7447428b4ef5174e37d30f8b7fecc`
- Release: `v0.1.2`; its annotated tag resolves to the implementation candidate.
- Verification date: 2026-09-06 UTC
- Product class: Tauri 2 desktop app with a static product site. Backend-only checks are not applicable.

## First screen

Before scrolling in fresh desktop and 390 px phone browser contexts, the page states:

- Job: see what keeps local models loaded.
- Audience: local-model users investigating memory use and reload churn.
- First action: **Try it with sample data**; adjacent text says it opens a private sample and saves nothing.

The title is `Local Model Residency — Find model memory use`. The live page has one `h1`, `lang=en`, a `main` landmark, meaningful image alternatives, and no unexpected console errors.

## Finding

### V2-F001 — Moderate — Public claims are incompletely listed or tested

All 14 commands in `.factory/claims.json` exit successfully, but eight public claim groups are missing a complete declared outcome test:

1. `partial-attribution` promises that missing GPU **or ownership** evidence is marked partial. Its tagged browser test covers missing LM Studio GPU data while a process owner is present; it never covers missing ownership.
2. `event-transitions` promises loads, unloads, and reloads. Its tagged unit test asserts only an unload and a reload; it never asserts a new `loaded` transition.
3. `local-history` says the latest 100 events are kept on the computer. Its tagged unit test trims an in-memory array but never writes, reloads, or reads the app's local-storage history. Manual AppImage restart testing confirmed persistence, but the declared claim command does not.
4. `platform-downloads` promises Mac architecture choice and no desktop installer on phones. Its exact grep command runs only the tagged Mac test. The separate phone test has no `@claim:platform-downloads` tag and is excluded from the declared command.
5. README says, “The desktop app has no telemetry.” No manifest claim observes the installed app's startup and scan network traffic. `local-only-network` exercises only the Rust scan function.
6. The landing and privacy pages say scanner requests do not carry prompts or replies. `prompt-free` checks copied diagnostic text, while the native fixture records request paths only; neither inspects request payloads.
7. The privacy page says release metadata is stored for up to one hour. No manifest claim tests cache creation, expiry, or refresh.
8. README says GitHub release metadata is requested only on the download page. `demo-private` covers `/demo`, but no declared claim command audits `/privacy`, `/terms`, and the 404 route for this network boundary.

The observed behaviors in items 3, 4, 7, and 8 were manually correct. That does not satisfy the attached requirement that each public claim be listed and proved by its declared sandbox command. Add or expand tagged outcome tests and update `.factory/claims.json`; alternatively remove or narrow the unsupported public wording.

## Declared claim commands

Every exact command was run separately from a clean checkout after `npm ci` and installation of the documented native and PowerShell prerequisites.

| Claim | Exact command result | Coverage result |
| --- | --- | --- |
| `native-runtimes` | PASS — 1 Rust test | Complete |
| `local-only-network` | PASS — 1 Rust test | Complete for scan destinations |
| `runtime-status` | PASS — 2 browser projects | Complete |
| `partial-attribution` | PASS — 2 browser projects | Incomplete; missing ownership is not exercised |
| `event-source` | PASS — 2 browser projects | Complete |
| `event-transitions` | PASS — 1 unit test | Incomplete; a new load is not exercised |
| `prompt-free` | PASS — 2 browser projects | Complete for copied diagnostics, not request payloads |
| `diagnostic-copy` | PASS — 2 browser projects | Complete |
| `local-history` | PASS — 1 unit test | Incomplete; local persistence is not exercised |
| `no-model-control` | PASS — 2 browser projects | Complete |
| `demo-private` | PASS — 2 browser projects | Complete for the demo route |
| `free-no-account` | PASS — 2 browser projects | Complete |
| `platform-downloads` | PASS — 2 browser projects | Incomplete; both executions use the test's Mac user agent |
| `installer-checksum` | PASS — shell and PowerShell mismatch paths | Complete |

## Live site and browser evidence

- Fresh desktop and phone sessions entered the sample in one click. It showed two resident models, three runtime checks, three events, and the persistent **Demo — sample data, nothing is saved** banner.
- LM Studio displayed `Not reported` GPU memory in the model row, evidence panel, and copied diagnostic.
- Reset restored the initial Ollama selection. **Start for real** removed the demo banner and returned to `/#download`. A pre-existing real-data sentinel remained unchanged, no `demo:` keys were created, and direct `/demo` made no remote request.
- Fresh macOS selection offered separate Apple-silicon and Intel v0.1.2 DMGs. Fresh iPhone selection offered only the releases page. Fresh Linux selection linked to the v0.1.2 AppImage.
- `/`, `/demo`, `/privacy`, and `/terms` returned 200 with route-specific titles. `/missing-page` returned the styled page with HTTP 404 and a return-home link. The browser's expected failed-resource message for that deliberate 404 is not a defect.
- All discovered internal and release links resolved; the deliberate not-found URL remained 404. The GitHub API 429 path showed the calm releases-page fallback.
- Keyboard navigation reached the skip link and primary action. Route and back navigation focused the new `h1`. Focus used a visible 3 px outline.
- At 390 px and 200% root text size, the demo stayed within a 390 px document width. Measured navigation, banner, footer, and dashboard targets were at least 44 px high.
- Reduced-motion mode reduced transitions to effectively instant changes. Light and dark checks across all routes found no Axe violations. The worker `verify-url.sh` reported no console, title, language, landmark, alternative-text, or button-label error.
- The cached demo reloaded while the browser context was offline. The product makes no updater promise and ships no updater manifest.
- Live `index.html`, hashed JavaScript, hashed CSS, and the 404 document matched the clean candidate build byte for byte.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.8 s, LCP 1.1 s, total blocking time 0 ms, CLS 0, total transfer 34 KiB.

## Installed artifact and release evidence

- Release `v0.1.2` contains Apple-silicon and Intel DMGs, Windows MSI and EXE files, Linux AppImage and DEB files, `SHA256SUMS`, and valid `latest.json` metadata. Every published package matched `SHA256SUMS`.
- The live one-line Linux installer downloaded, verified, made executable, and saved the AppImage in a fresh temporary directory.
- AppImage SHA-256: `a4bf5893f28859bd4279ede94e8db73a6bc0311ba028246c7f2082e1375de4d1`.
- The worker has no FUSE device, so the checksum-verified AppImage was launched with its supported `APPIMAGE_EXTRACT_AND_RUN=1` mode under fresh XDG configuration, data, and cache directories.
- With no runtimes, the app showed the useful zero-model and unavailable-runtime state. With local fixture endpoints, it showed two models, their runtime evidence, and loaded events. Malformed and failing fixtures produced limited or unavailable states without a crash.
- The in-app sample had a persistent demo label, reset to the initial model, copied a prompt-free diagnostic, and returned to the real scanner without writing sample events to real history.
- Two real fixture events remained after closing and reopening the released AppImage with the same consumer profile.
- Packages are unsigned, as disclosed. This remains an operator signing limitation rather than a verification defect.

## Quality gates from a clean checkout

- `npm ci`: PASS; 0 vulnerabilities.
- All 14 exact claim commands: command PASS, with the coverage gaps in V2-F001.
- `npm test`: PASS — 32 passed, 2 platform-inapplicable cases skipped.
- `npm run test:all`: PASS — 7 Vitest tests, 32 Playwright tests passed with 2 skips, and 3 Rust tests.
- `npm run build`: PASS; produced `dist/app` and `dist/site`. Site JavaScript was 7.77 KB gzip and CSS was 4.95 KB gzip.
- `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check`: PASS.
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`: PASS.
- Static Web Apps emulation: 200 for `/`, `/demo`, `/privacy`, and `/terms`; styled HTTP 404 for `/missing-page`.

The base worker image did not include the README's Linux Tauri packages or PowerShell. The listed Ubuntu packages were installed with the documented command, and PowerShell 7.6.5 was installed from the documented PowerShell release source before the native and installer tests were measured.

## Earlier finding disposition

| Earlier finding | Verification 2 result |
| --- | --- |
| F-001 — invented LM Studio GPU memory | Closed. Live site and AppImage say `Not reported`; copied output agrees. |
| F-002 — incompatible macOS and phone downloads | Closed. Mac has two architecture choices; phone has no direct desktop binary. |
| F-003 — default test gate failed | Closed. `npm test` and `npm run test:all` pass in the clean checkout. |
| F-004 — 200% phone overflow | Closed. Document width equals viewport width at 200%. |
| F-005 — targets below 44 px | Closed for previously identified controls; measured targets are at least 44 px high. |
| F-006 — incomplete claims | Reopened in narrower form as V2-F001. Four declared tests are incomplete and four public privacy claims are unlisted. |
| F-007 — unknown route returned 200 | Closed. Local emulator and live deployment return styled HTTP 404. |
| F-008 — metaphor and mood copy | Closed. Removed phrases remain absent and the copy audit has no flags. |
| F-009 — missing deployment docs | Closed. README documents the static artifact and factory deployment path. |

## Scope notes

- There is no backend, tenant store, shared database, billing flow, or server health endpoint. Tenant isolation, backend restart persistence, and backend 429/`Retry-After` behavior are not applicable.
- The brief does not need a model-assisted feature; no missed AI step was found.
- No product code was modified during verification. Only this report and the handoff were changed.

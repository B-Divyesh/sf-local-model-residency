# Handoff — Local Model Residency verification 2

Verification 2 verdict: **FAIL**. The live product and released AppImage work, but one moderate claims-coverage finding remains. See `.factory/verification-2.md`.

- Finding count: 1
- Untested public claim count: 8
- Implementation candidate: `39e2d55000bf6277d0fc609f9485c08b94c175fe`
- Documentation reviewed before this report: `b3b35a4caaf7447428b4ef5174e37d30f8b7fecc`

## Verification 2 result

All 14 commands declared in `.factory/claims.json` pass, as do `npm test`, `npm run test:all`, the production build, Rust formatting, and Clippy. Live desktop and phone flows, accessibility, responsive behavior, routing, offline demo recovery, release downloads, checksums, installer behavior, and the released AppImage were independently exercised.

The remaining finding is contractual: four declared claim tests do not cover every promised outcome, and four public privacy statements are not listed with complete outcome tests. Product behavior observed during manual checks was correct. Add the missing tagged tests or narrow the public wording before requesting another PASS verification.

No product code was changed in verification 2.

## Builder handoff for v0.1.2

Implementation candidate: `39e2d55000bf6277d0fc609f9485c08b94c175fe`.

## What changed

The shipped candidate addressed the nine original findings. Verification 2 confirmed the runtime repairs but found that the claims coverage is still incomplete.

| Finding | Current result |
| --- | --- |
| F001 — LM Studio GPU data | Sample LM Studio models now say `Not reported` for GPU memory. The copied diagnostic carries the same limitation. |
| F002 — macOS download choice | Mac browsers choose Apple silicon or Intel explicitly. iPhone and iPad visitors get the releases page, never a desktop binary. |
| F003 — default tests | Playwright runs in one worker. `npm test` and the full test command now finish reliably. |
| F004 — 200% reflow | The narrow header, download choices, and dashboard controls wrap without horizontal page overflow. |
| F005 — touch targets | Navigation, banner, footer, and controls meet the 44 px target. |
| F006 — claims | The manifest grew to 14 passing commands, but V2-F001 found four incomplete tests and four unlisted public privacy claims. |
| F007 — missing route status | Known client routes are rewritten explicitly; other paths return the styled `404.html` with HTTP 404. |
| F008 — unclear copy | The landing page, demo, errors, and 404 use direct task-focused wording. The copy audit has no flagged sentences. |
| F009 — deployment docs | README now documents static-site build and factory deployment, plus Linux desktop prerequisites. |

## Run and verify

From a clean checkout:

```sh
npm ci
npm run test:all
npm run build
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
```

All 14 commands in `.factory/claims.json` were also run individually from the clean install. They passed. The command set exercises the demo entry point and includes a local HTTP fixture for the native runtime scanner, a mocked failed checksum in both installer scripts, and observable browser outcomes rather than source-text checks.

Recorded results on 2026-09-06:

- `npm run test:all`: 7 Vitest tests, 34 Playwright tests (two platform-inapplicable cases skipped), and Rust tests passed.
- `npm run build`: passed. The static site output is 7.77 KB gzip JavaScript and 4.95 KB gzip CSS.
- Rust format and Clippy with warnings denied: passed.
- Local Static Web Apps emulation returned 200 for `/`, `/demo`, `/privacy`, and `/terms`; `/missing-page` returned the styled page with HTTP 404.
- Live HTTPS check passed: correct title, language, one main landmark and h1, no missing image alternatives, no unlabeled buttons, and no console errors.
- Live Playwright Axe check found no serious or critical issues. The standalone Axe CLI could not use the worker image's mismatched ChromeDriver, so the Playwright Axe integration was used instead.
- Live Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.1 s, total blocking time 0 ms, CLS 0.
- Fresh desktop and phone sessions stated the job as “See what keeps your models loaded,” the audience as local-model users investigating memory and reloads, and the first action as “Try it with sample data.” The sample showed populated data, kept its demo label, reset correctly, and did not change real storage.

## Release and deployment

Release `v0.1.2` is published from the implementation candidate:

`https://github.com/B-Divyesh/sf-local-model-residency/releases/tag/v0.1.2`

The successful GitHub Actions release run is `34016999372`. It publishes Apple-silicon and Intel macOS DMGs, Windows MSI and EXE files, Linux AppImage and DEB files, `SHA256SUMS`, and `latest.json`.

The Linux AppImage was downloaded into a fresh temporary directory, verified against the published `SHA256SUMS`, and launched under a new XDG configuration and data directory. It stayed open for the ten-second consumer smoke test. Fresh live Mac selection showed two v0.1.2 DMG choices; a fresh iPhone session showed no direct desktop-binary link.

The final static site was deployed to `https://local-model-residency.sociobot.in`. This is a static product; no application data or server state is required.

## Known limits and operator work

- LM Studio does not provide per-model GPU memory in the documented response used by the app. It is shown as not reported, not estimated.
- Jan's documented model endpoint shows availability, not model memory residency. It is marked limited.
- The app attributes a runtime process. It does not invent ownership by a separate client that sent a prompt.
- GPU values can differ from process RAM, especially for shared memory.
- Release packages are unsigned. macOS signing/notarization needs `APPLE_CERTIFICATE` and associated Apple signing credentials; Windows signing needs `WINDOWS_CERT_PFX` and its password. An operator must add those to the release workflow before distributing signed packages.
- The researched brief specifies a free product. There is no paid offer or billing dependency.

## References

- Demo behavior: `.factory/demo.md`
- Claim manifest: `.factory/claims.json`
- Design and asset provenance: `.factory/design.md`
- Earlier rejected verification: `.factory/verification-1.md`
- Plain-language audit: `.factory/copy-audit.md`

# Verification 1 — Find local model memory and reload sources

## Verdict: FAIL

Independent QA found **9 findings**: 3 major, 3 moderate, and 3 minor. There are **11 public claim groups without a complete automated claim test**. PASS requires zero findings and zero untested claims.

- Live URL: `https://local-model-residency.sociobot.in`
- Implementation candidate: `cc7975c8c1329f2d3fa5100862ed6008914ffb31`
- Documentation reviewed: `cc7975c8c1329f2d3fa5100862ed6008914ffb31`
- Release: `v0.1.0`; its tag resolves to the candidate commit.
- Verification date: 2026-09-05 UTC
- Product class: Tauri 2 desktop app with a static product site; backend-only checks are not applicable.

## First screen

Before scrolling on fresh desktop and 390 px phone contexts, the page states:

- Job: see what keeps local models loaded.
- Audience: local-model users investigating memory use and reload churn.
- First action: **Try it with sample data**; adjacent text says it opens a private sample and saves nothing.

The title is `Local Model Residency — Find model memory use`. The live site has one `h1`, `lang=en`, a `main` landmark, local images with alt text, and no normal-load console errors.

## Findings

### F-001 — Major — The sample invents LM Studio GPU memory

The live demo shows `qwen2.5-coder-7b-instruct` as `LM Studio · 3.82 GB GPU`, and the copied diagnostic repeats that value. The production adapter always sets LM Studio `vram_bytes` to `0`; the README also says this endpoint does not provide per-model GPU memory. The one-click sample therefore presents evidence the real product cannot obtain. Make the sample show `Not reported GPU`, matching the adapter and documentation.

### F-002 — Major — The detected macOS download can be incompatible

The page chooses the first `.dmg` returned by GitHub. An Intel Mac user agent received `Local.Model.Residency_0.1.0_aarch64.dmg`, which cannot serve that architecture. An iPhone user agent was also classified as macOS and offered the same desktop installer. Publish a universal macOS build or require an explicit architecture choice, and do not treat iOS as desktop macOS.

### F-003 — Major — The declared default test gate fails

From a fresh clone at the candidate commit, `npm test` failed twice at the final mobile overflow test because the Chromium process crashed with `SIGSEGV`; each run reported 22 passed, 1 failed, and 1 skipped. Consequently `npm run test:all` also failed. The isolated final test passed, and `npm test -- --workers=1` passed with 23 passed and 1 skipped, but the documented default command is still not reliable and does not satisfy the repository gate.

### F-004 — Moderate — Text at 200% clips horizontally on phone

At a 390 px viewport with root text enlarged to 200%, the document became 429 px wide. The header download action was visibly clipped beyond the right edge. The required 200% text-resize path must reflow without loss.

### F-005 — Moderate — Several phone targets are below 44 px

Measured live on `/demo`: **Reset demo** and **Start for real** were 38 px high, the wordmark link was 37 px high, and footer **Privacy** and **Terms** links were about 20 px high. These miss the required 44×44 CSS px touch target.

### F-006 — Moderate — Public claims lack complete claim tests

The following 11 public claim groups are absent from `.factory/claims.json` or have tests that do not prove the stated outcome:

1. Native adapters query the documented runtimes and operating-system process data; the current test uses only bundled demo objects.
2. Loads and unloads are detected between scans; no tagged claim test drives scan transitions.
3. The app never reads prompts, replies, model files, chat history, or account data; the tagged test only checks copied wording.
4. The desktop app has no telemetry and sends no product activity externally; the network test covers only the web demo.
5. Event history remains local and is capped at 100 items.
6. Diagnostics leave the app only after the user copies and shares them.
7. Missing ownership and memory evidence is always marked partial.
8. The app does not serve, download, stop, or delete models.
9. The app is free; the current combined test proves only that the demo has no sign-in fields.
10. Installer scripts reject a mismatched download; the tagged test checks source-code strings instead of executing a bad-checksum path.
11. Demo isolation; the tagged test checks only `demo:` keys and would miss writes to the real `lmr:` namespace.

Manual verification did confirm the current direct `/demo` flow used no storage, cookies, or remote requests, but that does not replace the required repeatable claim coverage.

### F-007 — Minor — Unknown routes return HTTP 200

`/missing-page` renders the designed not-found view and route title, but its HTTP response is `200`, not `404`. `public/staticwebapp.config.json` has no 404 response override. Return a deliberate 404 while retaining the current useful page.

### F-008 — Minor — Public copy uses metaphor and mood labels

Examples include `Stable models stay nested. A reload breaks the quiet.`, `Follow the load, not the guess`, `Memory observatory`, `404 · Nothing resident here`, and `This page has unloaded`. These conflict with the attached plain-words rule requiring task headings and no metaphor or brand-lore copy. The existing copy audit checks length and banned words but does not flag this rule.

### F-009 — Minor — README has no site deployment instructions

The README explains local development, testing, release tagging, and installers, but it does not say how to deploy `dist/site`. The repository definition of done requires deployment instructions in the README.

## Claim command results

Each exact command in `.factory/claims.json` was run separately from a fresh clone after `npm ci`:

| Claim | Exact command result |
| --- | --- |
| `runtime-status` | PASS — 2 browser projects |
| `event-source` | PASS — 2 browser projects |
| `prompt-free` | PASS — 2 browser projects |
| `demo-private` | PASS — 2 browser projects |
| `free-no-account` | PASS — 2 browser projects |
| `installer-checksum` | PASS — 2 browser projects; test adequacy remains F-006 |

These passes establish the narrow assertions implemented by the tests. They do not clear the broader and unlisted claims in F-006.

## Live and installed-artifact evidence

- Live JavaScript and CSS hashes exactly matched a clean production build from the candidate.
- The one-click demo showed two models, three runtime checks, three events, a persistent sample banner, reset, and start-for-real controls.
- Selecting the LM Studio row changed the evidence panel; reset restored the Ollama selection and original sample.
- A fresh direct demo context had no local storage, session storage, cookies, or remote requests. The copied diagnostic contained model/runtime evidence and `Prompts and replies: not collected`.
- Offline navigation to the cached demo worked after one online visit. GitHub API failure produced the documented release-page fallback.
- Back navigation restored heading focus; keyboard operation and reduced motion worked. Axe found zero violations across home, demo, privacy, terms, and not-found views in desktop light, desktop dark/reduced-motion, and phone contexts.
- `/opt/fleet/lib/verify-url.sh` passed. Live Lighthouse scored 100 in Performance, Accessibility, Best Practices, and SEO; FCP 0.8 s, LCP 1.1 s, TBT 20 ms, CLS 0, and total transfer 37 KiB.
- All site links resolved. The six promised platform installers plus `SHA256SUMS` and `latest.json` are published.
- The live installer command downloaded the Linux AppImage. SHA-256 `0153fc0d38953ac97691e0d17f5fe8875cfae6a2aef50e7cfae789dde4101159` matched the published checksum.
- The AppImage launched in a fresh XDG profile. It displayed the empty/unavailable state, loaded the in-app sample, showed two models from valid local fixture endpoints, marked malformed responses limited, and retained event history after restart.
- Release and desktop binaries are unsigned as disclosed.

## Clean-checkout command results

- `npm ci`: PASS; 0 vulnerabilities reported.
- Six exact claim commands: PASS.
- `npm run build`: PASS; produced `dist/app` and `dist/site`. Site JS was 7.55 KiB gzip and CSS was 4.83 KiB gzip.
- `cargo test --manifest-path src-tauri/Cargo.toml`: PASS after installing the documented Tauri Linux prerequisites; 2 passed.
- `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check`: PASS.
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`: PASS.
- `npm test`: FAIL twice as described in F-003. Diagnostic `npm test -- --workers=1`: PASS, 23 passed and 1 skipped.
- `npm run test:all`: FAIL because it invokes the failing default `npm test`.

## Earlier finding disposition

No earlier review or verification report exists in the repository, and the GitHub issue list is empty. Git history nevertheless records remediation work. Current disposition was checked as follows:

- `ae88427`: process RAM appears in the UI and diagnostic; desktop sample mode has a persistent label, reset, and start-for-real controls; route focus restoration passes.
- `a36e5a` through `cc7975c`: the latest release workflow completed successfully at the candidate; all six assets are present, `latest.json` is valid, and a Linux asset checksum matched.
- The live site matches the candidate build, so later report-only work does not require a new product image.

## Scope notes

- No backend exists, so tenant isolation, server restart persistence, service health, and backend 429/`Retry-After` checks are not applicable.
- The GitHub release-metadata 429 recovery path was exercised and showed a calm direct-release fallback.
- The brief does not benefit from an AI action; no missed AI feature was found.
- Product code was not modified during verification.


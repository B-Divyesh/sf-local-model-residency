# Local Model Residency

See which local runtime holds each model and when it reloads.

Local Model Residency is a free tray utility for people who run models on their own computers. It checks Ollama, LM Studio, and Jan loopback status. It matches reported loads with operating-system process memory. Partial evidence stays clearly marked.

It does not serve models, download models, or read conversations.

Try the private sample at [local-model-residency.sociobot.in/demo](https://local-model-residency.sociobot.in/demo). The demo needs no account and saves nothing.

## What it shows

- Resident model name and local runtime
- Reported model and GPU memory when the runtime provides it
- Matching process name, ID, and RAM use
- Loads and unloads seen between scans
- A copied diagnostic that contains no prompts or replies

Ollama supplies per-model GPU memory through `/api/ps`. LM Studio does not supply that value through the supported status response, so the app reports its process RAM and marks attribution as partial. Jan's model list proves that the server is available, but it does not prove residency.

## Run the website and demo

Requirements: Node.js 22 and npm.

```sh
npm ci
npm run dev:site
```

Open `http://127.0.0.1:4173/demo`.

## Run the desktop app

Install the [Tauri 2 system prerequisites](https://v2.tauri.app/start/prerequisites/) for your operating system. Then run:

```sh
npm ci
npm run tauri dev
```

The native core queries only these loopback URLs:

- `http://127.0.0.1:11434/api/ps` for Ollama
- `http://127.0.0.1:1234/api/v1/models` for LM Studio
- `http://127.0.0.1:1337/v1/models` for Jan

Published installers can also be downloaded and checksum-checked in one command:

```sh
curl -fsSL https://local-model-residency.sociobot.in/install.sh | sh
```

```powershell
irm https://local-model-residency.sociobot.in/install.ps1 | iex
```

## Test and build

```sh
npm test
npm run test:unit
cargo test --manifest-path src-tauri/Cargo.toml
npm run build
```

`npm run build:site` writes the deployable static site to `dist/site`. `npm run build:app` writes the Tauri frontend to `dist/app`.

## Release

Tag a tested commit with `v0.1.0` and push the tag. The release workflow builds unsigned `.dmg`, `.msi`/`.exe`, `.AppImage`, and `.deb` files. It also publishes `SHA256SUMS` and `latest.json`.

Unsigned macOS users must right-click the app and choose **Open**. Windows may show a SmartScreen notice. The workflow is ready for signing after the operator adds certificates.

## Privacy and security

The desktop app has no telemetry. Event history stays in local storage and holds at most 100 items. Diagnostics leave the app only when a user copies them. The website requests release metadata from GitHub only on the download page.

See [Privacy](https://local-model-residency.sociobot.in/privacy), [Terms](https://local-model-residency.sociobot.in/terms), and [the claim tests](.factory/claims.json).

## License

MIT. See [LICENSE](LICENSE).

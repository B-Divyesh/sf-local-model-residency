# Local Model Residency

See which local runtime holds each model and when it reloads.

Local Model Residency is a free tray utility for people who run models on their own computers. It checks Ollama, LM Studio, and Jan loopback status. It matches reported loads with operating-system process memory. Partial evidence stays clearly marked.

Its scanner sends status requests only to those local runtimes. Copied diagnostics contain no prompts or replies. It does not offer controls to serve, download, stop, or delete models.

Try the private sample at [local-model-residency.sociobot.in/demo](https://local-model-residency.sociobot.in/demo). The demo needs no account and saves nothing.

## What it shows

- Resident model name and local runtime
- Reported model and GPU memory when the runtime provides it
- Matching process name, ID, and RAM use
- Loads and unloads seen between scans
- A copied diagnostic that contains no prompts or replies

Ollama supplies per-model GPU memory through `/api/ps`. LM Studio does not supply that value through the supported status response, so the app shows **Not reported** for its GPU memory, reports process RAM, and marks attribution as partial. Jan's model list proves that the server is available, but it does not prove residency.

## Run the website and demo

Requirements: Node.js 22 and npm.

```sh
npm ci
npm run dev:site
```

Open `http://127.0.0.1:4173/demo`.

The full installer test also needs PowerShell 7 (`pwsh`). It is already available on the Windows GitHub runner and can be installed on Linux from the [PowerShell releases](https://github.com/PowerShell/PowerShell/releases).

## Run the desktop app

Install the [Tauri 2 system prerequisites](https://v2.tauri.app/start/prerequisites/) for your operating system. Then run:

```sh
npm ci
npm run tauri dev
```

On Ubuntu, the native test and build prerequisites are:

```sh
sudo apt-get update
sudo apt-get install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
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
npm run test:all
cargo test --manifest-path src-tauri/Cargo.toml
npm run build
```

`npm run build:site` writes the deployable static site to `dist/site`. `npm run build:app` writes the Tauri frontend to `dist/app`.

## Deploy the website

The static production artifact is `dist/site`. Build it with `npm ci && npm run build:site`, then publish that directory through the product's configured static-site deployment on `main`. The deployment must keep `public/staticwebapp.config.json`, `404.html`, `sw.js`, and the assets in the published directory. Do not publish `dist/app`; it is the Tauri webview bundle.

For the factory deployment, push the tested `main` commit to `origin`. The product static-site pipeline builds `dist/site` from that commit and serves it at `https://local-model-residency.sociobot.in`.

## Release

Tag a tested commit with a new `vX.Y.Z` version and push the tag. The release workflow builds unsigned `.dmg`, `.msi`/`.exe`, `.AppImage`, and `.deb` files. It also publishes `SHA256SUMS` and `latest.json`.

Unsigned macOS users must right-click the app and choose **Open**. Windows may show a SmartScreen notice. The workflow is ready for signing after the operator adds certificates.

## Privacy and security

The desktop app has no telemetry. Event history stays in local storage and holds at most 100 items. Diagnostics reach the clipboard only when a user chooses **Copy diagnostic**. The website requests release metadata from GitHub only on the download page.

See [Privacy](https://local-model-residency.sociobot.in/privacy), [Terms](https://local-model-residency.sociobot.in/terms), and [the claim tests](.factory/claims.json).

## License

MIT. See [LICENSE](LICENSE).

import { afterEach, describe, expect, it } from "vitest";
import { chmodSync, existsSync, mkdtempSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const temporaryDirectories: string[] = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) rmSync(directory, { recursive: true, force: true });
});

describe("installer verification", () => {
  it("@claim:installer-checksum rejects mismatched desktop downloads before saving them", () => {
    const root = mkdtempSync(join(tmpdir(), "lmr-installer-"));
    temporaryDirectories.push(root);
    const bin = join(root, "bin");
    const downloads = join(root, "downloads");
    mkdirSync(bin);
    mkdirSync(downloads);
    const curl = join(bin, "curl");
    writeFileSync(curl, `#!/bin/sh
out=""
url=""
while [ "$#" -gt 0 ]; do
  case "$1" in
    -o) out="$2"; shift 2 ;;
    -H) shift 2 ;;
    *) url="$1"; shift ;;
  esac
done
case "$url" in
  *releases/latest) printf '%s' '{"tag_name": "v0.1.0", "assets": [{"browser_download_url": "https://example.test/Local.Model.Residency_0.1.0_x86_64.AppImage"}]}' > "$out" ;;
  *SHA256SUMS*) printf '%s\\n' '0000000000000000000000000000000000000000000000000000000000000000  Local.Model.Residency_0.1.0_x86_64.AppImage' > "$out" ;;
  *) printf '%s' 'tampered desktop app' > "$out" ;;
esac
`);
    chmodSync(curl, 0o755);

    const result = spawnSync("sh", [join(process.cwd(), "public/install.sh")], {
      cwd: root,
      encoding: "utf8",
      env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, XDG_DOWNLOAD_DIR: downloads }
    });

    expect(result.status).not.toBe(0);
    expect(`${result.stdout}${result.stderr}`).toContain("Checksum failed. The download was removed.");
    expect(existsSync(join(downloads, "Local.Model.Residency_0.1.0_x86_64.AppImage"))).toBe(false);
    expect(readdirSync(downloads)).toEqual([]);

    const windowsRoot = mkdtempSync(join(tmpdir(), "lmr-installer-windows-"));
    temporaryDirectories.push(windowsRoot);
    const windowsDownloads = join(windowsRoot, "downloads");
    mkdirSync(windowsDownloads);
    const script = join(process.cwd(), "public/install.ps1").replace(/'/g, "''");
    const command = `
function Invoke-RestMethod {
  param($Uri, $Headers)
  return [pscustomobject]@{ tag_name = 'v0.1.0'; assets = @([pscustomobject]@{ name = 'Local.Model.Residency_0.1.0_x64.msi'; browser_download_url = 'https://example.test/Local.Model.Residency_0.1.0_x64.msi' }) }
}
function Invoke-WebRequest {
  param($Uri, $OutFile, [switch]$UseBasicParsing)
  if ($OutFile) { Set-Content -NoNewline -Path $OutFile -Value 'tampered desktop app'; return }
  return [pscustomobject]@{ Content = '0000000000000000000000000000000000000000000000000000000000000000  Local.Model.Residency_0.1.0_x64.msi' }
}
& '${script}'
`;
    const windowsResult = spawnSync("pwsh", ["-NoProfile", "-Command", command], {
      encoding: "utf8",
      env: { ...process.env, LMR_DOWNLOAD_DIR: windowsDownloads }
    });

    expect(windowsResult.status).not.toBe(0);
    expect(`${windowsResult.stdout}${windowsResult.stderr}`).toContain("Checksum failed. The download was removed.");
    expect(existsSync(join(windowsDownloads, "Local.Model.Residency_0.1.0_x64.msi"))).toBe(false);
    expect(readdirSync(windowsDownloads)).toEqual([]);
  });
});

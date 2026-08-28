#!/bin/sh
set -eu

repo="B-Divyesh/sf-local-model-residency"
api="https://api.github.com/repos/$repo/releases/latest"
work_dir="$(mktemp -d)"
trap 'rm -rf "$work_dir"' EXIT INT TERM

case "$(uname -s)" in
  Darwin) pattern='\.dmg$' ;;
  Linux) pattern='\.(AppImage|deb)$' ;;
  *) echo "Local Model Residency supports macOS, Windows, and Linux." >&2; exit 1 ;;
esac

release_json="$work_dir/release.json"
curl -fsSL -H 'Accept: application/vnd.github+json' "$api" -o "$release_json"
asset_url="$(sed -n 's/.*"browser_download_url": "\([^"]*\)".*/\1/p' "$release_json" | grep -E "$pattern" | head -n 1)"
[ -n "$asset_url" ] || { echo "A matching download is not published yet." >&2; exit 1; }

asset_name="${asset_url##*/}"
curl -fsSL "https://github.com/$repo/releases/latest/download/SHA256SUMS" -o "$work_dir/SHA256SUMS"
curl -fL "$asset_url" -o "$work_dir/$asset_name"
expected="$(grep "  $asset_name$" "$work_dir/SHA256SUMS" | cut -d ' ' -f 1)"
[ -n "$expected" ] || { echo "No checksum was published for $asset_name." >&2; exit 1; }
actual="$(sha256sum "$work_dir/$asset_name" 2>/dev/null | cut -d ' ' -f 1 || shasum -a 256 "$work_dir/$asset_name" | cut -d ' ' -f 1)"
[ "$actual" = "$expected" ] || { echo "Checksum failed. The download was removed." >&2; exit 1; }

download_dir="${XDG_DOWNLOAD_DIR:-$PWD}"
mv "$work_dir/$asset_name" "$download_dir/$asset_name"
case "$asset_name" in *.AppImage) chmod +x "$download_dir/$asset_name" ;; esac
echo "Verified and saved $download_dir/$asset_name"
echo "Open that file to install Local Model Residency."

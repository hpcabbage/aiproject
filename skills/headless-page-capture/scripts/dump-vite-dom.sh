#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 3 ]; then
  echo "Usage: $0 <frontend_dir> <route_url> <output_html> [port] [wait_ms]" >&2
  echo "Example: $0 /path/to/app 'http://127.0.0.1:4173/#/templates/5' /tmp/page-dom.html 4173 8000" >&2
  exit 1
fi

FRONTEND_DIR="$1"
ROUTE_URL="$2"
OUTPUT_HTML="$3"
PORT="${4:-4173}"
WAIT_MS="${5:-8000}"
CHROMIUM_BIN="${CHROMIUM_BIN:-/snap/bin/chromium}"
PREVIEW_LOG="${PREVIEW_LOG:-/tmp/vite-preview.log}"

if [ ! -d "$FRONTEND_DIR" ]; then
  echo "Frontend dir not found: $FRONTEND_DIR" >&2
  exit 1
fi

if [ ! -x "$CHROMIUM_BIN" ]; then
  echo "Chromium binary not executable: $CHROMIUM_BIN" >&2
  exit 1
fi

cleanup() {
  if [ -n "${PREVIEW_PID:-}" ]; then
    kill "$PREVIEW_PID" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

cd "$FRONTEND_DIR"
npx vite preview --host 127.0.0.1 --port "$PORT" >"$PREVIEW_LOG" 2>&1 &
PREVIEW_PID=$!
sleep 3

"$CHROMIUM_BIN" \
  --headless \
  --disable-gpu \
  --no-sandbox \
  --virtual-time-budget="$WAIT_MS" \
  --dump-dom \
  "$ROUTE_URL" > "$OUTPUT_HTML"

echo "Saved DOM to $OUTPUT_HTML"

#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 3 ]; then
  echo "Usage: $0 <frontend_dir> <route_url> <output_png> [port] [wait_ms] [window_size]" >&2
  echo "Example: $0 /path/to/app 'http://127.0.0.1:4173/#/templates/5' /tmp/template.png 4173 8000 1440,1400" >&2
  exit 1
fi

FRONTEND_DIR="$1"
ROUTE_URL="$2"
OUTPUT_PNG="$3"
PORT="${4:-4173}"
WAIT_MS="${5:-8000}"
WINDOW_SIZE="${6:-1440,1400}"
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
  --window-size="$WINDOW_SIZE" \
  --screenshot="$OUTPUT_PNG" \
  "$ROUTE_URL"

echo "Saved screenshot to $OUTPUT_PNG"

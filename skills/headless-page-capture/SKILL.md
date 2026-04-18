---
name: headless-page-capture
description: Capture and inspect local web pages with a headless browser for UI review, SPA route verification, and preview debugging. Use when a user asks to screenshot a page, verify what a frontend route actually renders, inspect local preview output, or debug cases like blank pages, 404 pages, hash/history routing issues, or page content not appearing in Chromium screenshots.
---

# Headless Page Capture

Capture a real page first, then judge UI from evidence instead of guessing.

## Workflow

1. Confirm the target URL and whether it is:
   - a direct remote URL
   - a local dev server
   - a local preview build
   - a SPA route that may require hash routing or history fallback

2. Prefer a short-lived preview flow over long-running dev servers.
   - Build first when needed.
   - Start preview just long enough to capture.
   - Kill the preview process in the same command when possible.

3. For static or preview environments, assume SPA history routes may fail.
   - If `/route/path` returns 404, test whether the page works under `#/route/path`.
   - If the app is temporarily switched to hash routing for capture/debug, also check code that depends on `window.location.pathname`.

4. Capture the page with Chromium headless.
   - Prefer `--headless --disable-gpu --no-sandbox`.
   - Add `--virtual-time-budget=8000` or similar when data-fetching/rendering needs time.
   - Set an explicit `--window-size`, usually `1440,1400` for page review.
   - Save screenshots into the workspace with descriptive names.

5. If the screenshot looks wrong, do not guess.
   - Check whether it is a 404 page, shell-only page, blank page, login redirect, or partially rendered page.
   - Use `--dump-dom` to inspect what actually rendered.
   - Read the relevant router, layout, and page files.

6. Only after a real screenshot is obtained, evaluate UI and propose changes.

## Bundled script

Use the bundled script when the target is a Vite frontend that should be previewed briefly and captured in one shot.

Script paths:
- `scripts/capture-vite-page.sh`
- `scripts/dump-vite-dom.sh`

Usage:

```bash
scripts/capture-vite-page.sh <frontend_dir> <route_url> <output_png> [port] [wait_ms] [window_size]
```

Example:

```bash
scripts/capture-vite-page.sh /path/to/app 'http://127.0.0.1:4173/#/templates/5' /tmp/template.png 4173 8000 1440,1400
```

The screenshot script:
- starts `vite preview`
- waits briefly
- captures the page with Chromium headless
- kills preview automatically

DOM dump usage:

```bash
scripts/dump-vite-dom.sh <frontend_dir> <route_url> <output_html> [port] [wait_ms]
```

Example:

```bash
scripts/dump-vite-dom.sh /path/to/app 'http://127.0.0.1:4173/#/templates/5' /tmp/page-dom.html 4173 8000
```

The DOM dump script:
- starts `vite preview`
- waits briefly
- dumps rendered DOM with Chromium headless
- kills preview automatically

## Recommended command patterns

### Build once

```bash
cd <frontend-dir> && npm run build
```

### Short-lived preview + screenshot

```bash
bash -lc 'cd <frontend-dir> && npx vite preview --host 127.0.0.1 --port 4173 >/tmp/vite-preview.log 2>&1 & PREVIEW_PID=$!; sleep 3; /snap/bin/chromium --headless --disable-gpu --no-sandbox --virtual-time-budget=8000 --window-size=1440,1400 --screenshot=<output.png> "http://127.0.0.1:4173/#/target-route"; STATUS=$?; kill $PREVIEW_PID >/dev/null 2>&1 || true; exit $STATUS'
```

### Dump DOM for debugging

```bash
bash -lc 'cd <frontend-dir> && npx vite preview --host 127.0.0.1 --port 4173 >/tmp/vite-preview.log 2>&1 & PREVIEW_PID=$!; sleep 3; /snap/bin/chromium --headless --disable-gpu --no-sandbox --dump-dom "http://127.0.0.1:4173/#/target-route" > /tmp/page-dom.html; STATUS=$?; kill $PREVIEW_PID >/dev/null 2>&1 || true; exit $STATUS'
```

## Debug checklist

When the screenshot is not the expected page, check in this order:

1. Route form is wrong
   - history route should be hash route, or vice versa
2. Preview server cannot serve SPA fallback
3. Page shell rendered but route content did not
   - inspect `router-view`
   - inspect route registration
4. Data request failed
   - API unavailable
   - missing auth
   - wrong template/app id
5. Hash-routing compatibility bug
   - code reads `window.location.pathname` and ignores `window.location.hash`
6. Runtime error in page component

## Output expectations

When reporting back:
- Say whether the screenshot is real target UI, 404, blank shell, login redirect, or other wrong page.
- If real, summarize the top UI issues.
- If not real, state the smallest next debugging step.

Keep it evidence-driven and avoid judging UI from non-target pages.

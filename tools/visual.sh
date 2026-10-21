#!/usr/bin/env sh
# Runs visual regression tests in the official Playwright image so baselines match CI.
# Usage: npm run visual            compare with baselines
#        npm run visual -- --update-snapshots   accept current rendering as the new baselines
# Reuses a demo server on :4200 if one is running (host network), otherwise starts one.
# DEMO_URL=http://127.0.0.1:4201 npm run visual  compares against another running server.
set -e
VERSION=$(node -p "require('@playwright/test/package.json').version")
exec docker run --rm --network host --ipc host \
  --user "$(id -u):$(id -g)" -e HOME=/tmp -e CI -e DEMO_URL \
  -v "$PWD":/work -w /work \
  "mcr.microsoft.com/playwright:v$VERSION-noble" \
  npx playwright test -c playwright.visual.config.ts "$@"

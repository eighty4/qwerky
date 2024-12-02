#!/bin/sh
set -e

# run through all the checks done for ci

cd ui
echo '\n*** [ui] pnpm check ***'
pnpm check
cd ..

echo '\n*** pnpm -r build ***'
pnpm -r build

cd ui
echo '\n*** [ui] pnpm test:unit ***'
pnpm test:unit
cd ..

cd ui
echo '\n*** [ui] pnpm exec playwright test ***'
pnpm exec playwright install
pnpm test:e2e
cd ..


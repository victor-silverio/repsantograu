#!/bin/bash
set -e

echo "Running npm install..."
npm install

echo "Running format..."
npm run format

echo "Running lint:fix..."
npm run lint:fix

echo "Running minify..."
npm run minify

echo "Running update-vacancy..."
npm run update-vacancy

echo "Running update-version..."
npm run update-version

echo "Running build..."
npm run build

echo "Running build:dist..."
npm run build:dist

echo "Running rating_update.py..."
python3 scripts/rating_update.py

echo "Running lastmod_update.py..."
python3 scripts/lastmod_update.py

echo "All tests passed successfully!"

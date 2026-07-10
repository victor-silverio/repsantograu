# AI Developer Guide - República Santo Grau

This document provides AI assistants with full context on the repository's architecture, workflows, and logic. It is excluded from the `dist/` build and will not be published to the public internet, acting strictly as an internal reference.

## 1. Project Overview & Architecture

- **Type**: Single Page Application (SPA) / Progressive Web App (PWA).
- **Goal**: Fast, SEO-optimized, accessible website for "República Santo Grau" (student housing).
- **Core Strategy**: Avoid heavy frameworks (no React/Vue). Use Vanilla HTML/JS + Tailwind CSS, with build-time content injection (SSG-lite) using Node.js scripts.

## 2. Tech Stack & Key Versions

- **Frontend**: HTML5, Vanilla JavaScript (ES6+), **Tailwind CSS v4.3.0**.
- **Build Tools**: Node.js (v24+ expected by CI), Terser (JS minification), html-minifier-terser, Workbox v7.4.1 (Service Worker generation).
- **Automation**: Python 3.12 (for SEO and Google Maps API synchronization).
- **Infra/Hosting**: Azure Static Web Apps (serverless hosting), Cloudflare (DNS, CDN, Security/Caching).

## 3. Directory Structure & Key Locations

- **`/` (Root)**: Core HTML files (`index.html`, `fotos.html`, `404.html`, `offline.html`), `package.json`, `staticwebapp.config.json` (Azure headers/routes).
- **`/src/`**: Source files for processing.
  - `input.css`: Tailwind base imports.
  - `script.js`: Main frontend logic (carousels, intersection observers, UI interactions).
  - `vagas.json` & `amenities.json`: Data sources for dynamic build-time injection.
- **`/scripts/`**: Build and automation scripts.
  - `build_dist.js`: The main packager. Minifies files, copies them to `dist/`, and generates `sw.js` (Workbox).
  - `update_vacancy.js`: Parses `vagas.json` and injects HTML badges/JSON-LD into `index.html`.
  - `rating_update.py`: Python script fetching Google Places ratings and updating HTML.
  - `lastmod_update.py`: Python script updating modification dates in `sitemap.xml`.
- **`/dist/`**: The ephemeral output directory. **DO NOT modify files here manually**. Azure SWA uploads this directory exclusively.
- **`/.github/workflows/`**: CI/CD pipelines (Azure deployment, and Cron Jobs).

## 4. The Build & Deployment Workflow (How it works)

The site is built and deployed automatically via GitHub Actions (`.github/workflows/azure-static-web-apps-*.yml`).

**When a commit is pushed to `main`:**

1. The CI checks out the code and sets up Node 24 and Python 3.12.
2. Runs `npm run format:check` and `npm run lint` (ESLint & Prettier).
3. The Azure SWA action executes `npm run build:dist`.
4. **`npm run build:dist` pipeline**:
   - Executes `npm run build` which triggers `build:data`, `build:css`, and `build:js`.
   - `node scripts/build_dist.js` runs concurrently using `fs/promises`:
     - Cleans and prepares `dist/`.
     - Copies specified explicit root files (`index.html`, `manifest.json`, `robots.txt`, etc.) and directories (`fonts/`, `icons/`, `imagens/`) to `dist/`. _(Note: this file `ai_developer_guide.md` is excluded from the array in `build_dist.js`, preventing public access)._
     - **Cache-Busting**: Automatically appends `?v=hash` to assets in the HTML files directly within `dist/` (avoiding git pollution in the root folder).
     - Runs minification (HTML, JS, JSON) on files in `dist/` concurrently.
     - Generates `sw.js` (Service Worker) inside `dist/` using `workbox-build` to provide offline PWA capabilities.
5. The `dist/` folder is uploaded to Azure.
6. Cloudflare cache is purged via API.

## 5. Dynamic Content (Build-time Injection & Cron Bots)

To keep the site static but dynamic:

- **Vacancy & Amenities**: Instead of making API calls on the frontend, update `src/vagas.json`. The next build will automatically generate the corresponding "Vagas Disponíveis" badge and HTML blocks in `index.html`.
- **Google Ratings**: `.github/workflows/rating_update.yml` runs weekly. The Python script calls the Google Places API, edits `index.html` directly with the new rating, formats the code (`npm run format`), and commits/pushes it back to the repo (via a BOT user).
- **SEO Timestamps**: `.github/workflows/lastmod_update.yml` runs daily, updating timestamps in `sitemap.xml`, formats the code (`npm run format`), and pushing the commit to keep search engine crawlers happy.

> **Note**: The Azure CI workflow uses `paths-ignore` so that editing files that don't go to production (like Python automation scripts, `ai_developer_guide.md`, or workflow configs) will **not** trigger an Azure deployment, saving CI minutes.

## 6. How to Make Changes

- **Modifying CSS**: Use Tailwind utility classes in the HTML. Do not write vanilla CSS unless absolutely necessary (add it to `src/input.css` if needed).
- **Modifying JS**: Edit `src/script.js`. It will be minified automatically during the build.
- **Adding new pages/files**: If you create a new public-facing file, you **MUST** add it to the `rootFiles` array inside `scripts/build_dist.js` so it gets copied to the `dist/` folder. If you don't do this, it will result in a 404 in production.
- **Local Development**: Run `npm run dev`. This runs the Tailwind watcher. Serve the root folder using any simple HTTP server (e.g., Live Server extension).
- **Code Formatting**: The project enforces formatting. Before committing, run `npm run format` and `npm run lint:fix`.

## 7. Security Rules

- `staticwebapp.config.json` enforces strict routing. It prevents access to `/node_modules`, `/scripts`, `/src`, and Python files by returning a `404`.
- Strict CSP (Content Security Policy) and HSTS are enforced in the Azure configuration. Ensure any new external scripts or fonts are whitelisted in the CSP headers in `staticwebapp.config.json`.

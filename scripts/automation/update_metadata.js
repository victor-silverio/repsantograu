'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..', '..');
const SITEMAP_FILE = path.join(rootDir, 'public', 'sitemap.xml');
const HUMANS_FILE = path.join(rootDir, 'public', 'humans.txt');

const DEFAULT_SITE_URL = 'https://www.repsantograu.online';
const SITE_URL = (process.env.SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '');

const URL_FILE_MAP = {
  [`${SITE_URL}/`]: [
    'src/pages/index.html',
    'src/data/vagas.json',
    'src/data/amenities.json',
  ],
  [`${SITE_URL}/fotos/`]: ['src/pages/fotos.html'],
};

function getGitLastCommitDate(filenames) {
  const fileList = Array.isArray(filenames) ? filenames : [filenames];
  const validFiles = fileList
    .filter((file) => fs.existsSync(path.join(rootDir, file)))
    .map((file) => `"${path.join(rootDir, file)}"`)
    .join(' ');

  if (!validFiles) return null;

  try {
    const result = execSync(
      `git log -1 --format=%cd --date=short -- ${validFiles}`,
      { encoding: 'utf8' }
    ).trim();
    return result || null;
  } catch (err) {
    console.error(
      `[GIT ERROR] Falha ao obter commit de ${filenames}:`,
      err.message
    );
    return null;
  }
}

function updateSitemap() {
  if (!fs.existsSync(SITEMAP_FILE)) {
    console.error(`[ERRO] ${SITEMAP_FILE} não encontrado.`);
    return false;
  }

  try {
    let content = fs.readFileSync(SITEMAP_FILE, 'utf8');
    let changesMade = false;

    for (const [url, files] of Object.entries(URL_FILE_MAP)) {
      const gitDate = getGitLastCommitDate(files);
      if (!gitDate) continue;

      const urlBlockRegex = new RegExp(
        `(<loc>${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</loc>[\\s\\S]*?<lastmod>)([^<]+)(</lastmod>)`,
        'i'
      );

      const match = content.match(urlBlockRegex);
      if (match && match[2] !== gitDate) {
        content = content.replace(urlBlockRegex, `$1${gitDate}$3`);
        changesMade = true;
        console.log(`[SEO] Sitemap atualizado: ${url} -> ${gitDate}`);
      }
    }

    if (changesMade) {
      fs.writeFileSync(SITEMAP_FILE, content, 'utf8');
      console.log('[SUCESSO] sitemap.xml atualizado.');
      return true;
    } else {
      console.log('[INFO] sitemap.xml já está atualizado.');
      return false;
    }
  } catch (err) {
    console.error(`[ERRO] Falha ao processar sitemap.xml:`, err.message);
    return false;
  }
}

function updateHumansTxt() {
  if (!fs.existsSync(HUMANS_FILE)) {
    return false;
  }

  try {
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '/');
    let content = fs.readFileSync(HUMANS_FILE, 'utf8');

    const lastUpdateRegex = /(Last update:\s*)([^\r\n]+)/i;
    const match = content.match(lastUpdateRegex);

    if (match && match[2] !== today) {
      content = content.replace(lastUpdateRegex, `$1${today}`);
      fs.writeFileSync(HUMANS_FILE, content, 'utf8');
      console.log(`[HUMANS] Data atualizada para ${today}`);
      return true;
    } else {
      console.log('[INFO] humans.txt já está com a data atual.');
      return false;
    }
  } catch (err) {
    console.error(`[ERRO] Falha ao processar humans.txt:`, err.message);
    return false;
  }
}

function run() {
  console.log('--- Atualizando Metadados (Sitemap & Humans) ---');
  updateSitemap();
  updateHumansTxt();
}

run();

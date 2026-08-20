'use strict';

const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..', '..');
const distDir = path.join(rootDir, 'dist');

const REQUIRED_FILES = [
  'index.html',
  'fotos/index.html',
  '404/index.html',
  'styles.css',
  'src/js/script.min.js',
  'robots.txt',
  'sitemap.xml',
  'humans.txt',
  'llms.txt',
  'llms-full.txt',
  '_headers',
  '_redirects',
  'favicon.ico',
  'favicon-32x32.png',
  'favicon-48x48.png',
  '.well-known/security.txt',
  'security.txt',
  'fonts/montserrat-v31-latin-regular.woff2',
  'fonts/montserrat-v31-latin-700.woff2',
  'fonts/playfair-display-v40-latin-700.woff2',
];

async function getFilesRecursive(dir) {
  const subdirs = await fs.readdir(dir);
  const files = await Promise.all(
    subdirs.map(async (subdir) => {
      const res = path.resolve(dir, subdir);
      return (await fs.stat(res)).isDirectory() ? getFilesRecursive(res) : res;
    })
  );
  return files.flat();
}

async function validateBuild() {
  console.log('--- Validando Integridade do Build ---');
  let hasError = false;

  if (!fsSync.existsSync(distDir)) {
    console.error('❌ ERRO CRÍTICO: Diretório /dist não foi gerado!');
    process.exit(1);
  }

  // 1. Validar existência e tamanho mínimo de arquivos obrigatórios
  for (const file of REQUIRED_FILES) {
    const fullPath = path.join(distDir, file);
    if (!fsSync.existsSync(fullPath)) {
      console.error(`❌ ERRO: Arquivo obrigatório ausente: dist/${file}`);
      hasError = true;
    } else {
      // Sanity check: critical text files must not be empty/tiny
      const stat = fsSync.statSync(fullPath);
      if (
        (file.endsWith('.html') || file === 'styles.css') &&
        stat.size < 500
      ) {
        console.error(
          `❌ ERRO: Arquivo suspeito (muito pequeno: ${stat.size}B): dist/${file}`
        );
        hasError = true;
      }
    }
  }

  if (!hasError) {
    console.log(
      `✅ Todos os ${REQUIRED_FILES.length} arquivos obrigatórios presentes.`
    );
  }

  // 2. Validar que não há arquivos indevidos no dist
  try {
    const allFiles = await getFilesRecursive(distDir);
    const invalidFiles = allFiles.filter(
      (f) =>
        f.endsWith('.map') ||
        f.endsWith('.log') ||
        f.endsWith('.tmp') ||
        f.endsWith('sw.js')
    );

    if (invalidFiles.length > 0) {
      for (const invalidFile of invalidFiles) {
        console.error(
          `❌ ERRO: Arquivo indevido encontrado no dist: ${path.relative(distDir, invalidFile)}`
        );
      }
      hasError = true;
    }
  } catch (err) {
    console.error('❌ ERRO ao inspecionar arquivos do dist:', err.message);
    hasError = true;
  }

  if (hasError) {
    console.error('🛑 Validação do build falhou! Abortando deploy...');
    process.exit(1);
  } else {
    console.log('✅ Validação do build concluída com sucesso!');
  }
}

validateBuild();

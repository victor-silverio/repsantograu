'use strict';

const { spawnSync, execSync } = require('child_process');
const { existsSync, readdirSync } = require('fs');
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..', '..');
const CHROME_CACHE_DIR = '/tmp/.lhci-chrome';

const KNOWN_CHROME_PATHS = [
  process.env.CHROME_PATH,
  '/usr/bin/google-chrome-stable',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium',
  '/snap/bin/chromium',
  '/usr/bin/thorium-browser',
].filter(Boolean);

function findChrome() {
  for (const p of KNOWN_CHROME_PATHS) {
    if (existsSync(p)) {
      return p;
    }
  }
  return null;
}

function findExecutableInDir(dir, name) {
  if (!existsSync(dir)) return null;

  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      const found = findExecutableInDir(fullPath, name);
      if (found) return found;
    } else if (entry.name === name) {
      return fullPath;
    }
  }

  return null;
}

function installChrome() {
  console.log(
    '\n📥 Nenhum browser detectado. Instalando Chrome via @puppeteer/browsers...\n'
  );

  try {
    execSync(
      `npx --yes @puppeteer/browsers install chrome@stable --path ${CHROME_CACHE_DIR}`,
      { stdio: 'inherit', cwd: rootDir }
    );
  } catch (err) {
    console.error('\n❌ Falha ao instalar o Chrome:', err.message);
    process.exit(1);
  }

  const execPath = findExecutableInDir(CHROME_CACHE_DIR, 'chrome');

  if (!execPath) {
    console.error(
      '\n❌ Chrome instalado, mas executável não encontrado em:',
      CHROME_CACHE_DIR
    );
    process.exit(1);
  }

  return execPath;
}

const counterPath = path.join(rootDir, 'src', 'config', 'lh_counter.json');
const isExplicitRun =
  process.env.RUN_LHCI === 'true' || process.env.GENERATE_SOURCEMAP === 'true';
let buildCount = 0;

if (existsSync(counterPath)) {
  try {
    const counterData = JSON.parse(fs.readFileSync(counterPath, 'utf8'));
    buildCount = counterData.build_count || 0;
  } catch {
    buildCount = 0;
  }
}

let shouldRunLighthouse;

if (isExplicitRun) {
  shouldRunLighthouse = true;
} else {
  buildCount += 1;
  shouldRunLighthouse = buildCount % 10 === 0;

  if (buildCount >= 100) {
    buildCount = 0;
  }

  try {
    fs.writeFileSync(
      counterPath,
      JSON.stringify({ build_count: buildCount }, null, 2),
      'utf8'
    );
  } catch (err) {
    console.warn(
      '⚠️  Não foi possível salvar o contador de builds:',
      err.message
    );
  }
}

if (process.env.CF_PAGES === '1' && process.env.GH_WRITE_TOKEN) {
  console.log(
    `\n🤖 Detectado ambiente Cloudflare Pages. Sincronizando metadados e contador remoto no GitHub...`
  );
  try {
    execSync('git config user.name "Cloudflare Pages CI"', { cwd: rootDir });
    execSync('git config user.email "ci@cloudflare.com"', { cwd: rootDir });

    execSync(
      'git add src/config/lh_counter.json public/sitemap.xml public/humans.txt',
      { cwd: rootDir }
    );

    let hasDiff = false;
    try {
      const diff = execSync('git diff --cached --name-only', {
        encoding: 'utf8',
        cwd: rootDir,
      }).trim();
      hasDiff = diff.length > 0;
    } catch {
      hasDiff = false;
    }

    if (hasDiff) {
      execSync(
        'git commit -m "chore: atualiza metadados e contador de build [skip ci]"',
        { cwd: rootDir }
      );

      const targetBranch = process.env.CF_PAGES_BRANCH || 'dev';
      const repoUrl = `https://${process.env.GH_WRITE_TOKEN}@github.com/victor-silverio/repsantograu.git`;
      execSync(`git push ${repoUrl} HEAD:${targetBranch}`, {
        stdio: 'ignore',
        cwd: rootDir,
      });
      console.log(
        '✅ Metadados e contador remoto atualizados com sucesso no GitHub.'
      );
    } else {
      console.log(
        'ℹ️  Nenhuma alteração de metadados ou contador detectada. Pulando push.'
      );
    }
  } catch (err) {
    console.warn(
      '⚠️  Aviso: Não foi possível dar push no GitHub (verifique as permissões do token):',
      err.message
    );
  }
}

if (!shouldRunLighthouse) {
  console.log(`\n🚀 Lighthouse CI pulado nesta execução.`);
  console.log(
    `ℹ️  O Lighthouse é executado a cada 10 builds completas (Progresso atual: ${buildCount % 10}/10).`
  );
  console.log(
    `Para forçar a execução, você pode rodar 'npm run test:lighthouse' ou alterar o contador em 'src/config/lh_counter.json'.\n`
  );
  process.exit(0);
}

if (isExplicitRun) {
  console.log(`\n⚡ Rodando Lighthouse CI (Execução Manual/Dev)...\n`);
} else {
  console.log(
    `\n⚡ Rodando Lighthouse CI (Execução Periódica: Build #${buildCount})...\n`
  );
}

const chromePath = findChrome() || installChrome();

console.log(`\n🌐 Browser: ${chromePath}`);

const lhciDir = path.join(rootDir, '.lighthouseci');
if (existsSync(lhciDir)) {
  fs.rmSync(lhciDir, { recursive: true, force: true });
}

try {
  execSync('fuser -k 3001/tcp 2>/dev/null || true');
} catch {
  // Ignora se porta não estiver em uso
}

console.log('🚀 Iniciando Lighthouse CI...\n');

const result = spawnSync(
  'npx',
  ['lhci', 'autorun', '--config=src/config/.lighthouserc.json'],
  {
    stdio: 'inherit',
    env: { ...process.env, CHROME_PATH: chromePath },
    cwd: rootDir,
  }
);

const logsDir = path.join(rootDir, 'logs');
const logsLhciDir = path.join(logsDir, '.lighthouseci');
if (existsSync(lhciDir)) {
  if (!existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  if (existsSync(logsLhciDir)) {
    fs.rmSync(logsLhciDir, { recursive: true, force: true });
  }
  fs.renameSync(lhciDir, logsLhciDir);
  console.log(`\n📁 Relatórios do Lighthouse salvos em logs/.lighthouseci/`);
}

process.exit(result.status ?? 1);

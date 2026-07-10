const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');
const crypto = require('crypto');
const { generateSW } = require('workbox-build');
const { minify: minifyHtml } = require('html-minifier-terser');
const { minify: minifyJs } = require('terser');

const rootDir = path.join(__dirname, '..', '..');
const distDir = path.join(rootDir, 'dist');
const publicDir = path.join(rootDir, 'public');
const pagesDir = path.join(rootDir, 'src', 'pages');

const publicFiles = [
  'manifest.json',
  'robots.txt',
  'sitemap.xml',
  'humans.txt',
  'llms.txt',
  'favicon.ico',
  'favicon-32x32.png',
  'favicon-48x48.png',
];

const pageFiles = ['index.html', 'offline.html', 'fotos.html', '404.html'];

const dirsToCopy = ['fonts', 'icons', 'imagens', '.well-known'];

// --- Helper Functions ---

async function copyItem(src, dest) {
  try {
    const stat = await fs.stat(src);
    if (stat.isDirectory()) {
      await fs.cp(src, dest, { recursive: true });
    } else {
      await fs.copyFile(src, dest);
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
    console.warn(`Warning: ${src} not found, skipping.`);
  }
}

async function getFileHash(filePath) {
  try {
    const fileBuffer = await fs.readFile(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex').substring(0, 8);
  } catch {
    console.warn(`Warning: Could not calculate hash for ${filePath}`);
    return null;
  }
}

async function cacheBustHtmlFiles() {
  const htmlFiles = ['index.html', 'fotos.html', '404.html', 'offline.html'];
  const regex =
    /((?:href|src|data-full|srcset)=["'])([^"']+\.[a-z0-9]+)(?:([?&]v=)([^"']+))?(["'])/gi;

  await Promise.all(
    htmlFiles.map(async (htmlFile) => {
      const htmlPath = path.join(distDir, htmlFile);
      if (!fsSync.existsSync(htmlPath)) return;

      let content = await fs.readFile(htmlPath, 'utf8');
      let updated = false;

      // We need to resolve all hashes asynchronously first because replace doesn't support async
      const matches = [...content.matchAll(regex)];
      const replacements = new Map();

      for (const match of matches) {
        const [
          fullMatch,
          prefix,
          filePathStr,
          queryPrefix,
          oldVersion,
          suffix,
        ] = match;
        let cleanPath = filePathStr.trim();

        if (/^(https?:|\/\/|data:)/.test(cleanPath)) continue;

        let fsPath = path.join(distDir, cleanPath.replace(/^(\.\/|\/)/, ''));
        const newHash = await getFileHash(fsPath);

        if (newHash && newHash !== oldVersion) {
          const qp = queryPrefix || '?v=';
          replacements.set(
            fullMatch,
            `${prefix}${filePathStr}${qp}${newHash}${suffix}`
          );
          updated = true;
        }
      }

      if (updated) {
        content = content.replace(
          regex,
          (match) => replacements.get(match) || match
        );
        await fs.writeFile(htmlPath, content, 'utf8');
        console.log(`Cache busted: ${htmlFile}`);
      }
    })
  );
}

async function minifyRecursive(dir) {
  const files = await fs.readdir(dir);

  await Promise.all(
    files.map(async (file) => {
      const filePath = path.join(dir, file);
      const stat = await fs.stat(filePath);

      if (stat.isDirectory()) {
        await minifyRecursive(filePath);
      } else {
        if (file.endsWith('.html')) {
          try {
            const content = await fs.readFile(filePath, 'utf8');
            const minified = await minifyHtml(content, {
              collapseWhitespace: true,
              removeComments: true,
              removeAttributeQuotes: true,
              minifyCSS: true,
              minifyJS: true,
            });
            await fs.writeFile(filePath, minified);
            console.log(`Minified HTML: ${file}`);
          } catch (err) {
            console.error(`Error minifying HTML ${file}:`, err);
          }
        } else if (
          file.endsWith('.js') &&
          !file.endsWith('.min.js') &&
          file !== 'sw.js'
        ) {
          try {
            const content = await fs.readFile(filePath, 'utf8');
            const minified = await minifyJs(content, { toplevel: true });
            if (minified.code) {
              await fs.writeFile(filePath, minified.code);
              console.log(`Minified JS: ${file}`);
            }
          } catch (err) {
            console.error(`Error minifying JS ${file}:`, err);
          }
        } else if (
          file.endsWith('.json') &&
          file !== 'staticwebapp.config.json'
        ) {
          try {
            const content = await fs.readFile(filePath, 'utf8');
            const minified = JSON.stringify(JSON.parse(content));
            await fs.writeFile(filePath, minified);
            console.log(`Minified JSON: ${file}`);
          } catch (err) {
            console.error(`Error minifying JSON ${file}:`, err);
          }
        }
      }
    })
  );
}

// --- Main Build Process ---

async function build() {
  try {
    // 1. Clean dist directory
    console.log('Cleaning dist directory...');
    await fs
      .rm(distDir, {
        recursive: true,
        force: true,
        maxRetries: 5,
        retryDelay: 1000,
      })
      .catch(() => {});
    await fs.mkdir(distDir, { recursive: true });

    // 2. Copy files and directories concurrently
    console.log('Copying files and directories...');
    const copyTasks = [
      ...publicFiles.map((file) =>
        copyItem(path.join(publicDir, file), path.join(distDir, file))
      ),
      ...pageFiles.map((file) =>
        copyItem(path.join(pagesDir, file), path.join(distDir, file))
      ),
      ...dirsToCopy.map((dir) =>
        copyItem(path.join(publicDir, dir), path.join(distDir, dir))
      ),
      copyItem(
        path.join(rootDir, 'staticwebapp.config.json'),
        path.join(distDir, 'staticwebapp.config.json')
      ),
      copyItem(
        path.join(rootDir, 'styles.css'),
        path.join(distDir, 'styles.css')
      ),
    ];
    await Promise.all(copyTasks);

    // 3. Security.txt logic
    const securitySrc = path.join(distDir, '.well-known', 'security.txt');
    const securityDest = path.join(distDir, 'security.txt');
    if (fsSync.existsSync(securitySrc)) {
      await fs.copyFile(securitySrc, securityDest);
      console.log('Created legacy copy of security.txt in root');
    }

    // 4. Copy minified JS to src directory in dist
    const srcDir = path.join(distDir, 'src');
    await fs.mkdir(srcDir, { recursive: true });
    const scriptMinPath = path.join(rootDir, 'src', 'js', 'script.min.js');
    if (fsSync.existsSync(scriptMinPath)) {
      await fs.copyFile(scriptMinPath, path.join(srcDir, 'script.min.js'));
      console.log('Copied src/script.min.js');
    }

    // 5. Cache bust HTML files inside dist (instead of dirtying root)
    console.log('Applying cache busting to HTML files...');
    await cacheBustHtmlFiles();

    // 6. Minify recursively
    console.log('Starting minification...');
    await minifyRecursive(distDir);
    console.log('Minification complete.');

    // 7. Generate Service Worker
    console.log('Generating Service Worker...');
    const { count, size } = await generateSW({
      globDirectory: distDir,
      globPatterns: ['**/*.{html,json,js,css,woff2,ico,txt,xml}'],
      swDest: path.join(distDir, 'sw.js'),
      navigateFallback: '/offline.html',
      sourcemap: false,
      mode: 'production',
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      skipWaiting: true,
      runtimeCaching: [
        {
          urlPattern: ({ request }) => request.destination === 'document',
          handler: 'NetworkFirst',
          options: { cacheName: 'documents' },
        },
        {
          urlPattern: ({ request }) =>
            ['style', 'script', 'worker', 'font'].includes(request.destination),
          handler: 'StaleWhileRevalidate',
          options: { cacheName: 'assets' },
        },
        {
          urlPattern: ({ request }) => request.destination === 'image',
          handler: 'CacheFirst',
          options: {
            cacheName: 'images',
            expiration: { maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 }, // 30 Days
          },
        },
      ],
    });

    console.log(
      `Generated sw.js, precaching ${count} files, totaling ${size} bytes.`
    );
    console.log('Build complete! Output in /dist');
  } catch (err) {
    console.error(`Build failed:`, err);
    process.exit(1);
  }
}

build();

const fs = require('fs');
const path = require('path');
const { generateSW } = require('workbox-build');
const { minify: minifyHtml } = require('html-minifier-terser');
const { minify: minifyJs } = require('terser');

const distDir = path.join(__dirname, '..', 'dist');
const rootDir = path.join(__dirname, '..');

if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir);

const rootFiles = [
  'index.html',
  'offline.html',
  'fotos.html',
  'fotos.html',
  '404.html',
  'manifest.json',
  'robots.txt',
  'sitemap.xml',
  'staticwebapp.config.json',
  'humans.txt',
  'llms.txt',
  'styles.css',
  'favicon.ico',
  'favicon-32x32.png',
  'favicon-48x48.png',
];

const dirsToCopy = ['fonts', 'icons', 'imagens', '.well-known'];

rootFiles.forEach((file) => {
  const srcPath = path.join(rootDir, file);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, path.join(distDir, file));
    console.log(`Copied ${file}`);
  } else {
    console.warn(`Warning: ${file} not found`);
  }
});

dirsToCopy.forEach((dir) => {
  const srcPath = path.join(rootDir, dir);
  const destPath = path.join(distDir, dir);
  if (fs.existsSync(srcPath)) {
    fs.cpSync(srcPath, destPath, { recursive: true });
    console.log(`Copied directory ${dir}`);
  } else {
    console.warn(`Warning: Directory ${dir} not found`);
  }
});

const securitySrc = path.join(distDir, '.well-known', 'security.txt');
const securityDest = path.join(distDir, 'security.txt');
if (fs.existsSync(securitySrc)) {
  fs.copyFileSync(securitySrc, securityDest);
  console.log('Created legacy copy of security.txt in root');
} else {
  console.warn('Warning: .well-known/security.txt not found for legacy copy');
}

const srcDir = path.join(distDir, 'src');
if (!fs.existsSync(srcDir)) {
  fs.mkdirSync(srcDir);
}

// Copy JSON data files to src/
const dataFiles = ['vagas.json', 'amenities.json'];
dataFiles.forEach((file) => {
  const srcPath = path.join(rootDir, 'src', file);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, path.join(srcDir, file));
    console.log(`Copied src/${file}`);
  } else {
    console.warn(`Warning: src/${file} not found`);
  }
});

const scriptMinPath = path.join(rootDir, 'src', 'script.min.js');
if (fs.existsSync(scriptMinPath)) {
  fs.copyFileSync(scriptMinPath, path.join(srcDir, 'script.min.js'));
  console.log('Copied src/script.min.js');
} else {
  console.warn(
    'Warning: src/script.min.js not found. Make sure to run minify first.'
  );
}

async function minifyRecursive(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      await minifyRecursive(filePath);
    } else {
      if (file.endsWith('.html')) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const minified = await minifyHtml(content, {
            collapseWhitespace: true,
            removeComments: true,
            removeAttributeQuotes: true,
            minifyCSS: true,
            minifyJS: true,
          });
          fs.writeFileSync(filePath, minified);
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
          const content = fs.readFileSync(filePath, 'utf8');
          const minified = await minifyJs(content, { toplevel: true });
          if (minified.code) {
            fs.writeFileSync(filePath, minified.code);
            console.log(`Minified JS: ${file}`);
          }
        } catch (err) {
          console.error(`Error minifying JS ${file}:`, err);
        }
      } else if (file.endsWith('.json')) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const minified = JSON.stringify(JSON.parse(content));
          fs.writeFileSync(filePath, minified);
          console.log(`Minified JSON: ${file}`);
        } catch (err) {
          console.error(`Error minifying JSON ${file}:`, err);
        }
      }
    }
  }
}

console.log('Copy complete. Starting minification...');

minifyRecursive(distDir)
  .then(() => {
    console.log('Minification complete. Generating Service Worker...');
    return generateSW({
      globDirectory: distDir,
      globPatterns: ['**/*.{html,json,js,css,woff2,ico,txt,xml´,json}'],
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
          options: {
            cacheName: 'documents',
          },
        },
        {
          urlPattern: ({ request }) =>
            ['style', 'script', 'worker', 'font'].includes(request.destination),
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'assets',
          },
        },
        {
          urlPattern: ({ request }) => request.destination === 'image',
          handler: 'CacheFirst',
          options: {
            cacheName: 'images',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
            },
          },
        },
      ],
    });
  })
  .then(({ count, size }) => {
    console.log(
      `Generated sw.js, which will precache ${count} files, totaling ${size} bytes.`
    );
    console.log('Build complete! Output in /dist');
  })
  .catch((err) => {
    console.error(`Build failed: ${err}`);
    process.exit(1);
  });

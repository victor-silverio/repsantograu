const fs = require('fs');
const path = require('path');
const { generateSW } = require('workbox-build');

// config/scripts -> config -> root
const rootDir = path.join(__dirname, '..', '..');
const distDir = path.join(rootDir, 'dist');
const srcDir = path.join(rootDir, 'src');
const publicDir = path.join(rootDir, 'public');

if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir);

// Files to copy from public/ to dist/ (Root level)
const publicFiles = [
  'manifest.json',
  'robots.txt',
  'sitemap.xml',
  'humans.txt',
  'llms.txt',
  'staticwebapp.config.json'
];

publicFiles.forEach((file) => {
  const srcPath = path.join(publicDir, file);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, path.join(distDir, file));
    console.log(`Copied ${file} from public`);
  } else {
    console.warn(`Warning: ${file} not found in public`);
  }
});

// Files to copy from src/ to dist/ (Root level)
// We keep HTML in root of dist for cleaner URLs
const srcFiles = [
  'index.html',
  'fotos.html',
  '404.html',
  'styles.css'
];

srcFiles.forEach((file) => {
  const srcPath = path.join(srcDir, file);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, path.join(distDir, file));
    console.log(`Copied ${file} from src`);
  } else {
    console.warn(`Warning: ${file} not found in src`);
  }
});

// Copy .well-known
const wellKnownSrc = path.join(publicDir, '.well-known');
if (fs.existsSync(wellKnownSrc)) {
  fs.cpSync(wellKnownSrc, path.join(distDir, '.well-known'), { recursive: true });
  console.log('Copied .well-known');
}

// Copy Assets (src/assets -> dist/assets)
const assetsSrc = path.join(srcDir, 'assets');
const assetsDest = path.join(distDir, 'assets');
if (fs.existsSync(assetsSrc)) {
  fs.cpSync(assetsSrc, assetsDest, { recursive: true });
  console.log('Copied assets');
} else {
  console.warn('Warning: src/assets not found');
}

// Special case: Copy favicon.ico to root for legacy browsers if it exists in assets/favicons
const faviconSrc = path.join(assetsDest, 'favicons', 'favicon.ico');
if (fs.existsSync(faviconSrc)) {
  fs.copyFileSync(faviconSrc, path.join(distDir, 'favicon.ico'));
  console.log('Copied favicon.ico to root');
}

// Copy script.min.js
const srcDistDir = path.join(distDir, 'src');
if (!fs.existsSync(srcDistDir)) {
  fs.mkdirSync(srcDistDir);
}

const scriptMinPath = path.join(srcDir, 'script.min.js');
if (fs.existsSync(scriptMinPath)) {
  fs.copyFileSync(scriptMinPath, path.join(srcDistDir, 'script.min.js'));
  console.log('Copied src/script.min.js');
} else {
  console.warn(
    'Warning: src/script.min.js not found. Make sure to run minify first.'
  );
}

// Legacy security.txt handling (if needed, currently likely in .well-known)
const securitySrc = path.join(distDir, '.well-known', 'security.txt');
const securityDest = path.join(distDir, 'security.txt');
if (fs.existsSync(securitySrc)) {
  fs.copyFileSync(securitySrc, securityDest);
  console.log('Created legacy copy of security.txt in root');
}

console.log('Copy complete. Generating Service Worker...');

generateSW({
  globDirectory: distDir,
  globPatterns: ['**/*.{html,json,js,css,woff2,ico,txt,xml}'],
  swDest: path.join(distDir, 'sw.js'),
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
})
  .then(({ count, size }) => {
    console.log(
      `Generated sw.js, which will precache ${count} files, totaling ${size} bytes.`
    );
    console.log('Build complete! Output in /dist');
  })
  .catch((err) => {
    console.error(`Unable to generate sw.js: ${err}`);
    process.exit(1);
  });

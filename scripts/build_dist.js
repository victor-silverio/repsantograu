const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const rootDir = path.join(__dirname, '..');

// Clean and create dist directory
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir);

// Files to copy directly from root
const rootFiles = [
  'index.html',
  'fotos.html',
  '404.html',
  'sw.js',
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

// Directories to copy
const dirsToCopy = ['fonts', 'icons', 'imagens', '.well-known'];

// Copy root files
rootFiles.forEach((file) => {
  const srcPath = path.join(rootDir, file);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, path.join(distDir, file));
    console.log(`Copied ${file}`);
  } else {
    console.warn(`Warning: ${file} not found`);
  }
});

// Copy directories
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

// Create legacy copy of security.txt in root (from .well-known)
const securitySrc = path.join(distDir, '.well-known', 'security.txt');
const securityDest = path.join(distDir, 'security.txt');
if (fs.existsSync(securitySrc)) {
  fs.copyFileSync(securitySrc, securityDest);
  console.log('Created legacy copy of security.txt in root');
} else {
  console.warn('Warning: .well-known/security.txt not found for legacy copy');
}

// Handle src/script.min.js specifically
const srcDir = path.join(distDir, 'src');
if (!fs.existsSync(srcDir)) {
  fs.mkdirSync(srcDir);
}

const scriptMinPath = path.join(rootDir, 'src', 'script.min.js');
if (fs.existsSync(scriptMinPath)) {
  fs.copyFileSync(scriptMinPath, path.join(srcDir, 'script.min.js'));
  console.log('Copied src/script.min.js');
} else {
  console.warn(
    'Warning: src/script.min.js not found. Make sure to run minify first.'
  );
}

console.log('Build complete! Output in /dist');

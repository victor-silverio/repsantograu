const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// config/scripts -> config -> root
const rootDir = path.join(__dirname, '..', '..');
const filesToUpdate = ['src/index.html', 'src/fotos.html', 'src/404.html'];

function getFileHash(filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex').substring(0, 8);
  } catch (err) {
    console.warn(
      `Warning: Could not calculate hash for ${filePath} (${err.message})`
    );
    return null;
  }
}

filesToUpdate.forEach((htmlFile) => {
  const htmlPath = path.join(rootDir, htmlFile);
  if (!fs.existsSync(htmlPath)) {
    console.warn(`File not found: ${htmlFile}`);
    return;
  }

  let content = fs.readFileSync(htmlPath, 'utf8');
  let updated = false;

  const regex =
    /((?:href|src)=["'])([^"']+\.[a-z0-9]+)([?&]v=)([^"']+)(["'])/gi;

  content = content.replace(
    regex,
    (match, prefix, filePathStr, queryPrefix, oldVersion, suffix) => {
      let fsPath;

      // Resolve paths based on new structure
      if (filePathStr === '/favicon.ico') {
        // Special mapping for favicon
        fsPath = path.join(rootDir, 'src/assets/favicons/favicon.ico');
      } else if (filePathStr.startsWith('/assets/')) {
        // /assets/icons/... -> src/assets/icons/...
        fsPath = path.join(rootDir, 'src', filePathStr.substring(1));
      } else if (filePathStr.startsWith('/src/')) {
        // /src/... -> src/...
        fsPath = path.join(rootDir, filePathStr.substring(1));
      } else if (filePathStr.startsWith('/fonts/')) {
        // Legacy support if not updated: src/assets/fonts
        fsPath = path.join(rootDir, 'src/assets', filePathStr.substring(1));
      } else if (filePathStr.startsWith('/icons/')) {
        // Legacy support
        fsPath = path.join(rootDir, 'src/assets', filePathStr.substring(1));
      } else if (filePathStr.startsWith('/imagens/')) {
        // Legacy support
        fsPath = path.join(rootDir, 'src/assets', filePathStr.substring(1));
      } else if (filePathStr.startsWith('/')) {
        // Other root files: public/ or src/ (like styles.css)
        // Check src first
        let checkPath = path.join(rootDir, 'src', filePathStr.substring(1));
        if (fs.existsSync(checkPath)) {
          fsPath = checkPath;
        } else {
          // Check public
          checkPath = path.join(rootDir, 'public', filePathStr.substring(1));
          if (fs.existsSync(checkPath)) {
            fsPath = checkPath;
          } else {
            // Fallback to root (for scripts/config?)
            fsPath = path.join(rootDir, filePathStr.substring(1));
          }
        }
      } else if (filePathStr.startsWith('src/')) {
        // Handle explicit src/ reference (e.g. src/script.min.js)
        // This is relative to root, but index.html is in src.
        // If index.html is moved to root in dist, src/script.min.js is correct relative path.
        // File exists at rootDir/src/... so rootDir + filePathStr
        fsPath = path.join(rootDir, filePathStr);
      } else if (filePathStr.startsWith('./')) {
        // Relative to HTML file (which is in src/)
        fsPath = path.join(rootDir, 'src', filePathStr.substring(2));
      } else {
        // Relative to HTML file
        fsPath = path.join(rootDir, 'src', filePathStr);
      }

      const newHash = getFileHash(fsPath);

      if (newHash && newHash !== oldVersion) {
        console.log(
          `[${htmlFile}] Updating ${filePathStr}: ${oldVersion} -> ${newHash}`
        );
        updated = true;
        return `${prefix}${filePathStr}${queryPrefix}${newHash}${suffix}`;
      } else if (newHash) {
        return match;
      } else {
        return match;
      }
    }
  );

  if (updated) {
    fs.writeFileSync(htmlPath, content, 'utf8');
    console.log(`Saved updates to ${htmlFile}`);
  } else {
    console.log(`No changes needed for ${htmlFile}`);
  }
});

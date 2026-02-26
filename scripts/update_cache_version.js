const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const rootDir = path.join(__dirname, '..');
const filesToUpdate = ['index.html', 'fotos.html', '404.html', 'offline.html'];

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
    /((?:href|src|data-full|srcset)=["'])([^"']+\.[a-z0-9]+)(?:([?&]v=)([^"']+))?(["'])/gi;

  content = content.replace(
    regex,
    (match, prefix, filePathStr, queryPrefix, oldVersion, suffix) => {
      let cleanPath = filePathStr.trim();
      if (
        cleanPath.startsWith('http://') ||
        cleanPath.startsWith('https://') ||
        cleanPath.startsWith('//') ||
        cleanPath.startsWith('data:')
      ) {
        return match;
      }
      let fsPath;
      if (cleanPath.startsWith('/')) {
        fsPath = path.join(rootDir, cleanPath.substring(1));
      } else if (cleanPath.startsWith('./')) {
        fsPath = path.join(rootDir, cleanPath.substring(2));
      } else {
        fsPath = path.join(rootDir, cleanPath);
      }

      const newHash = getFileHash(fsPath);

      if (newHash && newHash !== oldVersion) {
        console.log(
          `[${htmlFile}] Updating ${filePathStr}: ${oldVersion || 'none'} -> ${newHash}`
        );
        updated = true;
        const qp = queryPrefix || '?v=';
        return `${prefix}${filePathStr}${qp}${newHash}${suffix}`;
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

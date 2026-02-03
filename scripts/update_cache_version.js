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
    /((?:href|src)=["'])([^"']+\.[a-z0-9]+)([?&]v=)([^"']+)(["'])/gi;

  content = content.replace(
    regex,
    (match, prefix, filePathStr, queryPrefix, oldVersion, suffix) => {
      let fsPath;
      if (filePathStr.startsWith('/')) {
        fsPath = path.join(rootDir, filePathStr.substring(1));
      } else if (filePathStr.startsWith('./')) {
        fsPath = path.join(rootDir, filePathStr.substring(2));
      } else {
        fsPath = path.join(rootDir, filePathStr);
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

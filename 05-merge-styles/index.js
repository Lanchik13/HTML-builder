const fs = require('fs');
const path = require('node:path');

function writeCSS(fileName, cssData) {
  const writeStream = fs.createWriteStream(fileName, { flags: 'a' });
  writeStream.write(cssData, () => {});
  writeStream.end();
}

function readAndAppendCSS(fileName, targetFileName) {
  fs.readFile(fileName, 'utf-8', (_, data) => {
    writeCSS(targetFileName, data);
  });
}

function deleteCSSFile(fileName) {
  fs.unlink(fileName, () => {});
}

function bundleCSS() {
  const sourceDir = path.join(__dirname, 'styles');
  const targetDir = path.join(__dirname, 'project-dist');
  const targetFileName = path.join(targetDir, 'bundle.css');
  deleteCSSFile(targetFileName);

  function bundleCSSFiles(src, dest) {
    fs.mkdir(dest, { recursive: true }, () => {
      fs.readdir(src, { withFileTypes: true }, (_, files) => {
        files.forEach((file) => {
          const srcPath = path.join(src, file.name);

          fs.stat(srcPath, (_, stats) => {
            if (stats.isFile()) {
              const ext = path.extname(file.name);
              if (ext === '.css') {
                readAndAppendCSS(srcPath, targetFileName);
              }
            }
          });
        });
      });
    });
  }

  bundleCSSFiles(sourceDir, targetDir);
}

bundleCSS();

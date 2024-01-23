const fs = require('fs');
const path = require('node:path');

const cssSourceDir = path.join(__dirname, 'styles');
const componentsSourceDir = path.join(__dirname, 'components');
const assetsSourceDir = path.join(__dirname, 'assets');
const targetDir = path.join(__dirname, 'project-dist');
const cssTargetFileName = path.join(targetDir, 'style.css');
const indexFile = path.join(targetDir, 'index.html');
const templateFile = path.join(__dirname, 'template.html');
const assetsTargetDir = path.join(targetDir, 'assets');

function createDistFolder(nextStepCallback) {
  fs.mkdir(targetDir, { recursive: true }, () => {
    nextStepCallback();
  });
}

function writeToFile(fileName, data) {
  const writeStream = fs.createWriteStream(fileName);
  writeStream.write(data, () => {});
  writeStream.end();
}

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

function mergeCSS() {
  deleteCSSFile(cssTargetFileName);

  function bundleCSSFiles(src, dest) {
    fs.mkdir(dest, { recursive: true }, () => {
      fs.readdir(src, { withFileTypes: true }, (_, files) => {
        files.forEach((file) => {
          const srcPath = path.join(src, file.name);

          fs.stat(srcPath, (_, stats) => {
            if (stats.isFile()) {
              const ext = path.extname(file.name);
              if (ext === '.css') {
                readAndAppendCSS(srcPath, cssTargetFileName);
              }
            }
          });
        });
      });
    });
  }

  bundleCSSFiles(cssSourceDir, targetDir);
}

function buildIndexFile() {
  fs.readFile(templateFile, 'utf-8', (_, templateBody) => {
    fs.readdir(componentsSourceDir, { withFileTypes: true }, (err, files) => {
      let totalFiles = files.length;
      let processedFiles = 0;

      if (totalFiles === 0) {
        fs.writeFile(indexFile, templateBody, () => {});
      }

      files.forEach((file) => {
        const filePath = path.join(componentsSourceDir, file.name);
        fs.stat(filePath, (_, stats) => {
          if (stats.isFile()) {
            const ext = path.extname(file.name);
            if (ext === '.html') {
              const tagName = path.basename(file.name, ext);

              fs.readFile(filePath, 'utf-8', (_, data) => {
                templateBody = templateBody.replace(`{{${tagName}}}`, data);
                processedFiles++;

                if (processedFiles === totalFiles) {
                  fs.writeFile(indexFile, templateBody, () => {});
                }
              });
            }
          } else {
            processedFiles++;
          }
        });
      });
    });
    writeToFile(indexFile, templateBody);
  });
}

function copyAssets() {
  function deleteExtraFiles(src, dest, callback) {
    fs.readdir(dest, { withFileTypes: true }, (_, destFiles) => {
      fs.readdir(src, { withFileTypes: true }, (_, srcFiles) => {
        const srcFilenames = srcFiles.map((file) => file.name);
        if (destFiles !== undefined) {
          destFiles.forEach((file) => {
            if (!srcFilenames.includes(file.name)) {
              const filePath = path.join(dest, file.name);
              fs.unlink(filePath, () => {});
            }
          });
        }

        callback(null);
      });
    });
  }

  function copyFiles(src, dest) {
    fs.mkdir(dest, { recursive: true }, () => {
      fs.readdir(src, { withFileTypes: true }, (_, files) => {
        files.forEach((file) => {
          const srcPath = path.join(src, file.name);
          const destPath = path.join(dest, file.name);

          if (file.isDirectory()) {
            copyFiles(srcPath, destPath);
          } else {
            fs.copyFile(srcPath, destPath, () => {});
          }
        });
      });
    });
  }

  deleteExtraFiles(assetsSourceDir, assetsTargetDir, () => {
    copyFiles(assetsSourceDir, assetsTargetDir);
  });
}

function build() {
  createDistFolder(mergeCSS);
  buildIndexFile();
  copyAssets();
}

build();

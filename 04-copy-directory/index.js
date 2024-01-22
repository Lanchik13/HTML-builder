const fs = require('fs');
const path = require('node:path');

function copyDir() {
  const sourceDir = path.join(__dirname, 'files');
  const targetDir = path.join(__dirname, 'files-copy');

  function deleteExtraFiles(src, dest, callback) {
    fs.readdir(dest, { withFileTypes: true }, (_, destFiles) => {
      fs.readdir(src, { withFileTypes: true }, (_, srcFiles) => {
        const srcFilenames = srcFiles.map((file) => file.name);
        destFiles.forEach((file) => {
          if (!srcFilenames.includes(file.name)) {
            const filePath = path.join(dest, file.name);
            fs.unlink(filePath, () => {});
          }
        });

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

  deleteExtraFiles(sourceDir, targetDir, () => {
    copyFiles(sourceDir, targetDir);
  });
}

copyDir();

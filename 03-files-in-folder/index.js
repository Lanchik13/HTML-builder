const fs = require('fs');
const path = require('node:path');

const secretDirectory = path.join(__dirname, 'secret-folder');

fs.readdir(secretDirectory, { withFileTypes: true }, (err, files) => {
  files.forEach((file) => {
    const filePath = path.join(secretDirectory, file.name);
    fs.stat(filePath, (err, stats) => {
      if (stats.isFile()) {
        const ext = path.extname(file.name);
        const nameWithoutExt = path.basename(file.name, ext);
        const sizeInKb = stats.size / 1024;
        console.log(`${nameWithoutExt} - ${ext.slice(1)} - ${sizeInKb} kB`);
      }
    });
  });
});

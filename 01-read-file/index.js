const fs = require('fs');
const path = require('node:path');

const { stdout } = process;

const readFileStream = fs.createReadStream(
  path.join(__dirname, 'text.txt'),
  'utf-8',
);

readFileStream.on('data', (buffer) => {
  stdout.write(buffer);
});

const fs = require('fs');
const path = require('node:path');

const { stdin, stdout } = process;
const fileName = path.join(__dirname, 'text.txt');
const writeStream = fs.createWriteStream(fileName);
const exitMessage = '\nGoodbye, see you later!\n';

stdout.write('Type something:\n');
stdin.on('data', (data) => {
  if (data.toString().trim() === 'exit') {
    stdout.write(exitMessage);
    process.exit();
  }
  writeStream.write(data);
});

process.on('SIGINT', () => {
  stdout.write(exitMessage);
  process.exit();
});

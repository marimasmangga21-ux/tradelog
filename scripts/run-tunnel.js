const localtunnel = require('localtunnel');
const fs = require('fs');

(async () => {
  try {
    const tunnel = await localtunnel({ port: 3000 });
    fs.writeFileSync('tunnel-url.txt', tunnel.url);
    process.stdout.write('ONLINE: ' + tunnel.url + '\n');
  } catch (e) {
    process.stderr.write('ERR: ' + e.message + '\n');
  }
})();

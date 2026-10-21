const localtunnel = require('localtunnel');

(async () => {
  try {
    const tunnel = await localtunnel({ port: 3000, subdomain: 'tradelog-app' });
    console.log('TUNNEL_URL: ' + tunnel.url, flush=true);
    tunnel.on('close', () => {
      console.log('Tunnel closed');
    });
  } catch (err) {
    const fallback = await localtunnel({ port: 3000 });
    console.log('TUNNEL_URL: ' + fallback.url, flush=true);
  }
})();

const fs = require('fs');
const html = fs.readFileSync('tradoxes.html', 'utf8');

// Cari topbar
const headerMatch = html.match(/<header[\s\S]*?<\/header>/i);
if (headerMatch) {
  console.log('TOPBAR HEADER:', headerMatch[0]);
} else {
  // Cari di luar aside
  const afterAside = html.split('</aside>')[1];
  console.log('AFTER ASIDE FIRST 1000 CHARS:');
  console.log(afterAside.slice(0, 1000));
}

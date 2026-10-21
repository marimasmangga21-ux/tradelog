const fs = require('fs');
const html = fs.readFileSync('tradoxes.html', 'utf8');

// Ambil struktur sidebar
const sidebarMatch = html.match(/<aside[\s\S]*?<\/aside>/i);
if (sidebarMatch) {
  fs.writeFileSync('scripts/sidebar-snippet.html', sidebarMatch[0]);
  console.log('Sidebar found and saved!');
}

// Ambil struktur main
const mainMatch = html.match(/<main[\s\S]*?<\/main>/i);
if (mainMatch) {
  fs.writeFileSync('scripts/main-snippet.html', mainMatch[0]);
  console.log('Main found and saved!');
}

// Cek CSS colors dan font yang digunakan di Tradoxes asli
const colorMatches = html.match(/#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsl\([^)]+\)/g) || [];
console.log('Colors sample:', [...new Set(colorMatches)].slice(0, 20));

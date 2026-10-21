const fs = require('fs');
let html = fs.readFileSync('tradoxes.html', 'utf8');

// Replace relative _next paths with https://tradoxes.com/_next
html = html.replace(/href="\/_next\//g, 'href="https://tradoxes.com/_next/');
html = html.replace(/src="\/_next\//g, 'src="https://tradoxes.com/_next/');
html = html.replace(/href="\/([^"]+\.css)"/g, 'href="https://tradoxes.com/$1"');

// Simpan file baru
fs.writeFileSync('tradoxes-fixed.html', html);
console.log('tradoxes-fixed.html written!');

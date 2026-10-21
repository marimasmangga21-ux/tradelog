const fs = require('fs');
const html = fs.readFileSync('tradoxes.html', 'utf8');
console.log('HTML length:', html.length);

const titleMatch = html.match(/<title>(.*?)<\/title>/i);
console.log('Title:', titleMatch ? titleMatch[1] : 'none');

// URL dalam page
const hrefMatches = html.match(/href="([^"]+)"/g) || [];
console.log('Sample links:', [...new Set(hrefMatches.map(h => h.replace('href="', '').replace('"', '')))].slice(0, 30));

// Cari text di body
const headings = (html.match(/<h[1-5][^>]*>([\s\S]*?)<\/h[1-5]>/gi) || [])
  .map(h => h.replace(/<[^>]+>/g, '').trim());
console.log('Headings:', headings);

// Cari class names populer untuk layout / css
const classes = html.match(/class="([^"]+)"/g) || [];
console.log('Total elements with classes:', classes.length);

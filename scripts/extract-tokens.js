const fs = require('fs');
const html = fs.readFileSync('tradoxes.html', 'utf8');

// Ambil semua inline script atau css tokens
const styles = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
console.log('Total style tags:', styles.length);

// Extract CSS variable definitions
const cssVars = html.match(/--[a-zA-Z0-9_-]+:\s*[^;]+;/g) || [];
console.log('Unique CSS vars:', [...new Set(cssVars)].slice(0, 40));

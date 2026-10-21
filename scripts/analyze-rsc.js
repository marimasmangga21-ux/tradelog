const fs = require('fs');
const dump = fs.readFileSync('scripts/rsc-dump.txt', 'utf8');

// Cari navigasi di RSC
const navMatches = dump.match(/"href":"\/[^"]+","label":"[^"]+"/g);
console.log('Nav matches:', navMatches);

// Cari card atau dashboard component props
const lines = dump.split('\n');
const interesting = lines.filter(l => l.includes('Welcome back') || l.includes('Performance summary') || l.includes('Market hours') || l.includes('Balance'));
console.log('Interesting lines count:', interesting.length);
interesting.slice(0, 5).forEach(l => console.log(l.slice(0, 300)));

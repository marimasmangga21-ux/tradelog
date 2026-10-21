const fs = require('fs');
const dump = fs.readFileSync('scripts/rsc-dump.txt', 'utf8');

// Cari SVG di dump
const svgIndex = dump.indexOf('<svg');
if (svgIndex !== -1) {
  const svgEnd = dump.indexOf('</svg>', svgIndex) + 6;
  const svg = dump.slice(svgIndex, svgEnd);
  fs.writeFileSync('scripts/map.svg', svg);
  console.log('Found and saved SVG, length:', svg.length);
} else {
  console.log('No SVG in dump');
}

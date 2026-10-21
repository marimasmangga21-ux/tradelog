const fs = require('fs');
const dump = fs.readFileSync('scripts/rsc-dump.txt', 'utf8');

// Temukan chunk 7
const chunk7 = dump.split('\n---CHUNK---\n').find(c => c.startsWith('7:'));
if (chunk7) {
  fs.writeFileSync('scripts/chunk7-dashboard.json', chunk7);
  console.log('Chunk 7 saved! Length:', chunk7.length);
}

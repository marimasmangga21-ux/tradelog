const fs = require('fs');
const html = fs.readFileSync('tradoxes.html', 'utf8');

const regex = /self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/g;
let match;
let count = 0;
let output = '';

while ((match = regex.exec(html)) !== null) {
  count++;
  try {
    const unescaped = JSON.parse('"' + match[1] + '"');
    output += unescaped + '\n---CHUNK---\n';
  } catch (e) {
    output += match[1] + '\n---RAW-CHUNK---\n';
  }
}

fs.writeFileSync('scripts/rsc-dump.txt', output);
console.log('Total RSC chunks parsed:', count, 'Output length:', output.length);

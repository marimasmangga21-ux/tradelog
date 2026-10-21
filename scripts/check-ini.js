const fs = require('fs');
const p = 'C:\\Users\\evanm\\AppData\\Roaming\\MetaQuotes\\Terminal\\D0E8209F77C8CF37AD8BF550E51FF075\\config\\common.ini';
const content = fs.readFileSync(p, 'utf16le');
console.log('CURRENT WebRequestUrl line:');
console.log(content.split('\n').filter(l => l.includes('WebRequest')));

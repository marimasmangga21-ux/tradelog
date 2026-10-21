const fs = require('fs');
const p = 'C:\\Users\\evanm\\AppData\\Roaming\\MetaQuotes\\Terminal\\D0E8209F77C8CF37AD8BF550E51FF075\\config\\common.ini';
let content = fs.readFileSync(p, 'utf16le');
console.log('HAS WebRequestUrl:', content.includes('WebRequestUrl='));
content = content.replace(/WebRequestUrl=.*/, 'WebRequestUrl=http://localhost:3000,http://localhost:3000/api/mt5/ingest,http://127.0.0.1:3000');
fs.writeFileSync(p, content, 'utf16le');
console.log('common.ini UPDATED SUCCESSFULLY!');

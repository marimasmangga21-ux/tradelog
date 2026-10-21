const fs = require('fs');
const path = require('path');

const logDir = 'C:\\Users\\evanm\\AppData\\Roaming\\MetaQuotes\\Terminal\\D0E8209F77C8CF37AD8BF550E51FF075\\MQL5\\logs';
try {
  const files = fs.readdirSync(logDir)
    .filter(f => f.endsWith('.log'))
    .map(f => ({ name: f, time: fs.statSync(path.join(logDir, f)).mtime }))
    .sort((a, b) => b.time - a.time);

  if (files.length > 0) {
    const latestPath = path.join(logDir, files[0].name);
    console.log('Reading log:', latestPath);
    const content = fs.readFileSync(latestPath, 'utf16le'); // MQL5 logs are UTF-16LE
    console.log('--- LAST 20 LINES ---');
    console.log(content.split('\n').slice(-25).join('\n'));
  } else {
    console.log('No log files in MQL5/logs');
  }
} catch (e) {
  console.error(e);
}

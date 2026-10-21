const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'tradelog.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

let updated = 0;
for (const s of db.screenshots) {
  if (s.timeframe === 'mtf' && s.storage_path.match(/^trade_(\d+)\.png$/)) {
    const posId = s.storage_path.match(/^trade_(\d+)\.png$/)[1];
    s.storage_path = `trade_${posId}_mtf.png`;
    updated++;
  }
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log(`Updated ${updated} screenshot records in DB`);

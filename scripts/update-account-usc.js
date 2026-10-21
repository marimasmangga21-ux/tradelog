const fs = require('fs');
const p = 'data/tradelog.json';
const db = JSON.parse(fs.readFileSync(p, 'utf8'));

db.accounts.forEach(a => {
  if (a.mt5_account_number === 21018350 || a.currency === 'CNT') {
    a.currency = 'USC';
    console.log('Updated account', a.name, 'to USC');
  }
});

fs.writeFileSync(p, JSON.stringify(db, null, 2), 'utf8');
console.log('Database updated successfully!');

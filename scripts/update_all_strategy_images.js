const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'tradelog.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const updates = [
  { match: 'trend following', img: '/strategies/trend-following.png' },
  { match: 'breakout', img: '/strategies/session-breakout.png' },
  { match: 'gold scalping', img: '/strategies/gold-scalping.png' }
];

for (const u of updates) {
  const st = db.strategies.find(s => s.name.toLowerCase().includes(u.match));
  if (st) {
    st.image_url = u.img;
    st.updated_at = new Date().toISOString();
    console.log(`Updated image for ${st.name} -> ${u.img}`);
  }
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log('Successfully saved strategy images.');

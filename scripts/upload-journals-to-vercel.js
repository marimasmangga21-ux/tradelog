const fs = require("fs");

const db = JSON.parse(fs.readFileSync("data/tradelog.json", "utf8"));
const journals = db.user_datasets["marimasmangga21@gmail.com"]?.journals || [];

console.log(`Found ${journals.length} journals to upload`);

const payload = {
  journals: journals,
  targetEmail: "marimasmangga21@gmail.com"
};

fetch("https://tradelogjournal-app.vercel.app/api/journals/bulk", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload)
})
  .then(r => r.json())
  .then(data => {
    console.log("Upload result:", data);
  })
  .catch(err => {
    console.error("Upload failed:", err.message);
  });

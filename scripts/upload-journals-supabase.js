const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://ttfglrxrdxgjmmunzint.supabase.co",
  "sb_publishable_oOS6O16W8v0PYxP4bfZnhg_fsCOfotC"
);

async function main() {
  const db = JSON.parse(fs.readFileSync("data/tradelog.json", "utf8"));
  const journals = db.user_datasets["marimasmangga21@gmail.com"]?.journals || [];

  if (journals.length === 0) {
    console.log("No journals found");
    return;
  }

  console.log(`Uploading ${journals.length} journals to Supabase...`);

  const { error } = await supabase
    .from("journals")
    .upsert(
      journals.map((j) => ({
        ...j,
        user_email: "marimasmangga21@gmail.com"
      })),
      { onConflict: "id" }
    );

  if (error) {
    console.error("Upload error:", error.message);
    console.log("\nTable might not exist. Create it first in Supabase Dashboard:");
    console.log("https://supabase.com/dashboard/project/ttfglrxrdxgjmmunzint/sql/new\n");
    console.log("Run this SQL:");
    console.log(`
CREATE TABLE IF NOT EXISTS public.journals (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  trade_id TEXT,
  journal_date DATE NOT NULL,
  title TEXT,
  mood_score INTEGER,
  emotion_ids TEXT[] DEFAULT '{}',
  lesson_learned TEXT,
  mistakes TEXT,
  plan_tomorrow TEXT,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
    `);
  } else {
    console.log("✅ Successfully uploaded", journals.length, "journals");
  }
}

main();

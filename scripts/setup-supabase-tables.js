const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://ttfglrxrdxgjmmunzint.supabase.co",
  "sb_publishable_oOS6O16W8v0PYxP4bfZnhg_fsCOfotC"
);

async function setupTables() {
  console.log("Creating journals table in Supabase...");

  const { error } = await supabase.rpc("execute_sql", {
    sql: `
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

CREATE INDEX IF NOT EXISTS idx_journals_user_email ON public.journals(user_email);
CREATE INDEX IF NOT EXISTS idx_journals_date ON public.journals(journal_date DESC);
    `
  });

  if (error) {
    console.log("RPC not available or error:", error.message);
    console.log("\nManual step: Go to Supabase SQL Editor and run:");
    console.log("https://supabase.com/dashboard/project/ttfglrxrdxgjmmunzint/sql/new");
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
    console.log("✅ Table created");
  }
}

setupTables();

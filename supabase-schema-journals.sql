-- Tabel journals untuk menyimpan semua journal entries per user
CREATE TABLE IF NOT EXISTS public.journals (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  trade_id TEXT,
  journal_date DATE NOT NULL,
  title TEXT,
  mood_score INTEGER CHECK (mood_score BETWEEN 1 AND 5),
  emotion_ids TEXT[] DEFAULT '{}',
  lesson_learned TEXT,
  mistakes TEXT,
  plan_tomorrow TEXT,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk query per user
CREATE INDEX IF NOT EXISTS idx_journals_user_email ON public.journals(user_email);
CREATE INDEX IF NOT EXISTS idx_journals_trade_id ON public.journals(trade_id);
CREATE INDEX IF NOT EXISTS idx_journals_date ON public.journals(journal_date DESC);

-- Enable RLS
ALTER TABLE public.journals ENABLE ROW LEVEL SECURITY;

-- Policy: users can read/write their own journals
CREATE POLICY "Users can manage own journals" ON public.journals
  FOR ALL
  USING (user_email = current_setting('request.jwt.claims', true)::json->>'email')
  WITH CHECK (user_email = current_setting('request.jwt.claims', true)::json->>'email');

-- Allow anon inserts for MT5 sync (bypass auth temporarily)
CREATE POLICY "Allow anon inserts" ON public.journals
  FOR INSERT
  WITH CHECK (true);

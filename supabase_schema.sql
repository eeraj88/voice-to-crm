-- Supabase SQL Schema für Voice-to-CRM App
-- Führe dieses SQL im Supabase SQL Editor aus: https://supabase.com/dashboard/project/phmdtikyctualbfwtzsa/sql

-- users Tabelle für zusätzliche Metadaten (Tally Leads)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  company TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index für schnellere Abfragen
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- RLS für users Tabelle
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- reports Tabelle erstellen
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  audio_url TEXT,
  raw_transcript TEXT NOT NULL,
  structured_data JSONB NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'synced', 'error')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index für schnellere Abfragen
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

-- Row Level Security (RLS) aktivieren
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies: User kann nur seine eigenen Reports sehen und erstellen
CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports"
  ON reports FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports"
  ON reports FOR DELETE
  USING (auth.uid() = user_id);

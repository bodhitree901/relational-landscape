-- Run this in your Supabase SQL editor
-- Adds My Map sharing + cross-device sync

-- Cross-device My Map sync on profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS my_map_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS my_map_data JSONB;

-- Person A's shared My Map (short token, stored in DB)
CREATE TABLE IF NOT EXISTS my_map_shares (
  id         UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  token      TEXT    UNIQUE NOT NULL,
  user_id    UUID    REFERENCES auth.users(id) ON DELETE CASCADE,
  sharer_name TEXT   NOT NULL,
  map_data   JSONB   NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Person B's response to a My Map share
CREATE TABLE IF NOT EXISTS my_map_responses (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  share_id       UUID REFERENCES my_map_shares(id) ON DELETE CASCADE,
  responder_name TEXT NOT NULL,
  response_data  JSONB NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE my_map_shares    ENABLE ROW LEVEL SECURITY;
ALTER TABLE my_map_responses ENABLE ROW LEVEL SECURITY;

-- Anyone can read a share by token (to view the map)
CREATE POLICY "public_read_my_map_shares"
  ON my_map_shares FOR SELECT USING (true);

-- Only the authenticated owner can create a share
CREATE POLICY "owner_insert_my_map_shares"
  ON my_map_shares FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Anyone can submit a response (no account needed)
CREATE POLICY "public_insert_my_map_responses"
  ON my_map_responses FOR INSERT WITH CHECK (true);

-- Anyone can read responses (needed for compare page)
CREATE POLICY "public_read_my_map_responses"
  ON my_map_responses FOR SELECT USING (true);

-- Index for fast token lookup
CREATE INDEX IF NOT EXISTS my_map_shares_token_idx ON my_map_shares (token);
CREATE INDEX IF NOT EXISTS my_map_responses_share_idx ON my_map_responses (share_id);

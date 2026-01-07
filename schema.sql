-- AgentAuth Database Schema
-- Run this in your Supabase SQL Editor

-- Developers table (synced with Clerk)
CREATE TABLE developers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API Keys table
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID REFERENCES developers(id) ON DELETE CASCADE,
  key_prefix TEXT NOT NULL,                    -- First 8 chars for display: "aa_live_"
  key_hash TEXT NOT NULL,                      -- SHA256 hash of full key
  name TEXT DEFAULT 'Default',                 -- Friendly name
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Google OAuth Credentials (developer's Google app credentials)
CREATE TABLE google_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID REFERENCES developers(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL,
  client_secret_encrypted TEXT NOT NULL,       -- Encrypted
  redirect_uri TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(developer_id)
);

-- User Tokens (tokens for end users of developer's apps)
CREATE TABLE user_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID REFERENCES developers(id) ON DELETE CASCADE,
  external_user_id TEXT NOT NULL,              -- Developer's user ID
  service TEXT NOT NULL DEFAULT 'google',
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT NOT NULL,
  token_expiry TIMESTAMP WITH TIME ZONE NOT NULL,
  scopes TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(developer_id, external_user_id, service)
);

-- OAuth State (temporary, for tracking OAuth flow)
CREATE TABLE oauth_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state TEXT UNIQUE NOT NULL,
  developer_id UUID REFERENCES developers(id) ON DELETE CASCADE,
  external_user_id TEXT NOT NULL,
  service TEXT NOT NULL DEFAULT 'google',
  redirect_url TEXT,                           -- Where to redirect after OAuth
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_api_keys_developer ON api_keys(developer_id);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX idx_user_tokens_lookup ON user_tokens(developer_id, external_user_id, service);
CREATE INDEX idx_oauth_states_state ON oauth_states(state);
CREATE INDEX idx_developers_clerk ON developers(clerk_id);

-- Function to auto-delete expired OAuth states
CREATE OR REPLACE FUNCTION delete_expired_oauth_states()
RETURNS void AS $$
BEGIN
  DELETE FROM oauth_states WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a cron job to clean up expired states (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-oauth-states', '*/5 * * * *', 'SELECT delete_expired_oauth_states()');

-- Row Level Security (optional but recommended)
ALTER TABLE developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_states ENABLE ROW LEVEL SECURITY;

-- Note: Since we're using service role key in the API, 
-- RLS policies won't affect our backend operations.
-- Add policies if you want to use anon key for any operations.

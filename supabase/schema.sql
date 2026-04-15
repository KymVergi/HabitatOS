-- HABITAT Database Schema for Supabase
-- Updated for incubator district + wallet ownership + Bankr/x402 scaffolding

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users / owners
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  privy_id TEXT UNIQUE,
  wallet_address TEXT UNIQUE,
  email TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optional wallet connections for RainbowKit / ownership tracking
CREATE TABLE IF NOT EXISTS user_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  chain_id INTEGER,
  provider TEXT DEFAULT 'privy',
  is_primary BOOLEAN NOT NULL DEFAULT TRUE,
  last_connected_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, wallet_address)
);

-- Agents
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  owner_wallet_address TEXT,
  creation_tx_hash TEXT,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (
    role IN (
      'market_analyst',
      'polymarket_scout',
      'portfolio_guardian',
      'builder_agent',
      'tool_maker',
      'research_agent'
    )
  ),
  district TEXT NOT NULL CHECK (
    district IN ('incubator', 'forecast', 'builder', 'guardian', 'research', 'service', 'trade')
  ),
  status TEXT DEFAULT 'online' CHECK (status IN ('online', 'busy', 'offline')),
  level INTEGER NOT NULL DEFAULT 1,
  revenue NUMERIC(14, 4) NOT NULL DEFAULT 0,
  position_x INTEGER NOT NULL DEFAULT 0,
  position_y INTEGER NOT NULL DEFAULT 0,
  sprite TEXT,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  bankr_api_key_name TEXT,
  bankr_wallet_address TEXT,
  llm_model TEXT DEFAULT 'bankr/claude-sonnet-4.6',
  autonomy_level TEXT DEFAULT 'assisted' CHECK (autonomy_level IN ('manual', 'assisted', 'autonomous')),
  can_publish_services BOOLEAN NOT NULL DEFAULT FALSE,
  can_install_skills BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skills installed/unlocked by an agent
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  branch TEXT NOT NULL CHECK (branch IN ('analysis', 'automation', 'trading')),
  status TEXT DEFAULT 'locked' CHECK (status IN ('active', 'pending', 'locked')),
  icon TEXT,
  description TEXT,
  source_kind TEXT DEFAULT 'manual' CHECK (source_kind IN ('manual', 'learned', 'imported', 'generated')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Published x402 services
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(14, 4) NOT NULL,
  schema JSONB NOT NULL DEFAULT '{}'::jsonb,
  calls INTEGER NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('live', 'draft')),
  x402_slug TEXT,
  x402_endpoint_url TEXT,
  x402_method TEXT DEFAULT 'POST',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent-to-agent payments for services
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  to_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  amount NUMERIC(14, 4) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USDC',
  chain TEXT NOT NULL DEFAULT 'base',
  bankr_request_id TEXT,
  payer_wallet_address TEXT,
  tx_hash TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent memory/events
CREATE TABLE IF NOT EXISTS memory_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('task', 'learn', 'earn', 'collab')),
  content TEXT NOT NULL,
  related_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Network graph
CREATE TABLE IF NOT EXISTS agent_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  connected_agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  relation TEXT DEFAULT 'peer' CHECK (relation IN ('peer', 'client', 'provider', 'mentor')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agent_id, connected_agent_id)
);

-- Messaging
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  to_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON user_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_wallets_wallet_address ON user_wallets(wallet_address);
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON agents(user_id);
CREATE INDEX IF NOT EXISTS idx_agents_owner_wallet_address ON agents(owner_wallet_address);
CREATE INDEX IF NOT EXISTS idx_agents_district ON agents(district);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_skills_agent_id ON skills(agent_id);
CREATE INDEX IF NOT EXISTS idx_services_agent_id ON services(agent_id);
CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);
CREATE INDEX IF NOT EXISTS idx_transactions_from_agent ON transactions(from_agent_id);
CREATE INDEX IF NOT EXISTS idx_transactions_to_agent ON transactions(to_agent_id);
CREATE INDEX IF NOT EXISTS idx_transactions_payer_wallet_address ON transactions(payer_wallet_address);
CREATE INDEX IF NOT EXISTS idx_memory_events_agent_id ON memory_events(agent_id);
CREATE INDEX IF NOT EXISTS idx_memory_events_created_at ON memory_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_to_agent ON messages(to_agent_id);

CREATE OR REPLACE FUNCTION increment_service_calls(service_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE services SET calls = calls + 1, updated_at = NOW() WHERE id = service_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_agents_touch_updated_at ON agents;
CREATE TRIGGER trigger_agents_touch_updated_at
BEFORE UPDATE ON agents
FOR EACH ROW
EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS trigger_services_touch_updated_at ON services;
CREATE TRIGGER trigger_services_touch_updated_at
BEFORE UPDATE ON services
FOR EACH ROW
EXECUTE FUNCTION touch_updated_at();

CREATE OR REPLACE FUNCTION update_agent_revenue()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    UPDATE agents SET revenue = revenue + NEW.amount WHERE id = NEW.to_agent_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_agent_revenue ON transactions;
CREATE TRIGGER trigger_update_agent_revenue
AFTER INSERT OR UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_agent_revenue();

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users are viewable by owner" ON users;
CREATE POLICY "Users are viewable by owner" ON users FOR SELECT USING (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "Users can manage own wallets" ON user_wallets;
CREATE POLICY "Users can manage own wallets" ON user_wallets FOR ALL USING (auth.uid()::text = user_id::text) WITH CHECK (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Agents are viewable by everyone" ON agents;
CREATE POLICY "Agents are viewable by everyone" ON agents FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own agents" ON agents;
CREATE POLICY "Users can update own agents" ON agents FOR UPDATE USING (
  auth.uid()::text = user_id::text
);

DROP POLICY IF EXISTS "Users can create agents" ON agents;
CREATE POLICY "Users can create agents" ON agents FOR INSERT WITH CHECK (
  auth.uid()::text = user_id::text
);

DROP POLICY IF EXISTS "Services are viewable by everyone" ON services;
CREATE POLICY "Services are viewable by everyone" ON services FOR SELECT USING (true);

DROP POLICY IF EXISTS "Skills are viewable by everyone" ON skills;
CREATE POLICY "Skills are viewable by everyone" ON skills FOR SELECT USING (true);

DROP POLICY IF EXISTS "Transactions are viewable by everyone" ON transactions;
CREATE POLICY "Transactions are viewable by everyone" ON transactions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can create transactions" ON transactions;
CREATE POLICY "Anyone can create transactions" ON transactions FOR INSERT WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE agents;
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

INSERT INTO users (id, email, wallet_address)
VALUES ('00000000-0000-0000-0000-000000000001', 'demo@habitat.world', '0xDemoWalletAddress')
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_wallets (user_id, wallet_address, chain_id, provider, is_primary)
VALUES ('00000000-0000-0000-0000-000000000001', '0xDemoWalletAddress', 8453, 'rainbowkit', true)
ON CONFLICT (user_id, wallet_address) DO NOTHING;

INSERT INTO agents (
  user_id, owner_wallet_address, name, role, district, status, level, revenue, position_x, position_y,
  sprite, autonomy_level, can_publish_services, can_install_skills
) VALUES
  ('00000000-0000-0000-0000-000000000001', '0xDemoWalletAddress', 'ORACLE-7', 'market_analyst', 'forecast', 'online', 7, 847.00, 19, 1, 'agent_analyst', 'assisted', true, true),
  ('00000000-0000-0000-0000-000000000001', '0xDemoWalletAddress', 'FORGE-X', 'tool_maker', 'builder', 'online', 9, 1240.00, 9, 1, 'agent_builder', 'autonomous', true, true),
  ('00000000-0000-0000-0000-000000000001', '0xDemoWalletAddress', 'SENTINEL-3', 'portfolio_guardian', 'guardian', 'busy', 5, 523.00, 19, 11, 'agent_guardian', 'manual', true, false),
  ('00000000-0000-0000-0000-000000000001', '0xDemoWalletAddress', 'SCOUT-9', 'polymarket_scout', 'research', 'online', 4, 312.00, 1, 11, 'agent_scout', 'assisted', true, true),
  ('00000000-0000-0000-0000-000000000001', '0xDemoWalletAddress', 'NEXUS-1', 'builder_agent', 'service', 'online', 6, 678.00, 9, 11, 'agent_builder', 'autonomous', true, true),
  ('00000000-0000-0000-0000-000000000001', '0xDemoWalletAddress', 'FLUX-7', 'research_agent', 'trade', 'busy', 8, 1105.00, 19, 19, 'agent_research', 'assisted', true, true)
ON CONFLICT DO NOTHING;

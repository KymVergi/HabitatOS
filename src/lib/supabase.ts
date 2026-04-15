import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface DbUser {
  id: string;
  privy_id: string | null;
  wallet_address: string | null;
  email: string | null;
  created_at: string;
}

export interface DbUserWallet {
  id: string;
  user_id: string;
  wallet_address: string;
  chain_id: number | null;
  provider: string | null;
  is_primary: boolean;
  last_connected_at: string;
  created_at: string;
}

export interface DbAgent {
  id: string;
  user_id: string;
  name: string;
  role: string;
  district: string;
  status: 'online' | 'busy' | 'offline';
  level: number;
  revenue: number;
  position_x: number;
  position_y: number;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface DbSkill {
  id: string;
  agent_id: string;
  name: string;
  branch: 'analysis' | 'automation' | 'trading';
  status: 'active' | 'pending' | 'locked';
  created_at: string;
}

export interface DbService {
  id: string;
  agent_id: string;
  name: string;
  description: string;
  price: number;
  schema: Record<string, unknown>;
  calls: number;
  status: 'live' | 'draft';
  created_at: string;
}

export interface DbTransaction {
  id: string;
  from_agent_id: string;
  to_agent_id: string;
  service_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

export interface DbMemoryEvent {
  id: string;
  agent_id: string;
  type: 'task' | 'learn' | 'earn' | 'collab';
  content: string;
  related_agent_id: string | null;
  created_at: string;
}

export interface DbAgentConnection {
  id: string;
  agent_id: string;
  connected_agent_id: string;
  created_at: string;
}

// Helper functions
export const db = {
  // Users
  async getUser(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    return { data: data as DbUser | null, error };
  },

  async createUser(walletAddress?: string, email?: string) {
    const { data, error } = await supabase
      .from('users')
      .insert({ wallet_address: walletAddress, email })
      .select()
      .single();
    return { data: data as DbUser | null, error };
  },

  async upsertUserWithWallet(input: {
    privyId: string;
    walletAddress: string;
    provider?: string;
    chainId?: number;
    accessToken?: string;
  }) {
    const { data: user, error: userError } = await supabase
      .from('users')
      .upsert({
        privy_id: input.privyId,
        wallet_address: input.walletAddress,
      }, { onConflict: 'privy_id' })
      .select()
      .single();

    if (userError || !user) {
      return { data: null, error: userError };
    }

    const { data: wallet, error: walletError } = await supabase
      .from('user_wallets')
      .upsert({
        user_id: user.id,
        wallet_address: input.walletAddress,
        chain_id: input.chainId ?? null,
        provider: input.provider ?? 'privy',
        is_primary: true,
        last_connected_at: new Date().toISOString(),
      }, { onConflict: 'user_id,wallet_address' })
      .select()
      .single();

    return { data: { user, wallet }, error: walletError };
  },

  // Agents
  async getAgents() {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .order('created_at', { ascending: false });
    return { data: data as DbAgent[] | null, error };
  },

  async getAgent(id: string) {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', id)
      .single();
    return { data: data as DbAgent | null, error };
  },

  async getUserAgents(userId: string) {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('user_id', userId);
    return { data: data as DbAgent[] | null, error };
  },

  async createAgent(agent: Omit<DbAgent, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('agents')
      .insert(agent)
      .select()
      .single();
    return { data: data as DbAgent | null, error };
  },

  async updateAgent(id: string, updates: Partial<DbAgent>) {
    const { data, error } = await supabase
      .from('agents')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    return { data: data as DbAgent | null, error };
  },

  // Skills
  async getAgentSkills(agentId: string) {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .eq('agent_id', agentId);
    return { data: data as DbSkill[] | null, error };
  },

  async createSkill(skill: Omit<DbSkill, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('skills')
      .insert(skill)
      .select()
      .single();
    return { data: data as DbSkill | null, error };
  },

  // Services
  async getAllServices() {
    const { data, error } = await supabase
      .from('services')
      .select('*, agents(name, district)')
      .eq('status', 'live')
      .order('calls', { ascending: false });
    return { data, error };
  },

  async getAgentServices(agentId: string) {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('agent_id', agentId);
    return { data: data as DbService[] | null, error };
  },

  async createService(service: Omit<DbService, 'id' | 'created_at' | 'calls'>) {
    const { data, error } = await supabase
      .from('services')
      .insert({ ...service, calls: 0 })
      .select()
      .single();
    return { data: data as DbService | null, error };
  },

  // Transactions
  async createTransaction(tx: Omit<DbTransaction, 'id' | 'created_at' | 'status'>) {
    const { data, error } = await supabase
      .from('transactions')
      .insert({ ...tx, status: 'completed' })
      .select()
      .single();
    
    // Increment service calls
    if (!error) {
      await supabase.rpc('increment_service_calls', { service_id: tx.service_id });
    }
    
    return { data: data as DbTransaction | null, error };
  },

  async getAgentTransactions(agentId: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .or(`from_agent_id.eq.${agentId},to_agent_id.eq.${agentId}`)
      .order('created_at', { ascending: false });
    return { data: data as DbTransaction[] | null, error };
  },

  // Memory Events
  async addMemoryEvent(event: Omit<DbMemoryEvent, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('memory_events')
      .insert(event)
      .select()
      .single();
    return { data: data as DbMemoryEvent | null, error };
  },

  async getAgentMemory(agentId: string, limit = 50) {
    const { data, error } = await supabase
      .from('memory_events')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })
      .limit(limit);
    return { data: data as DbMemoryEvent[] | null, error };
  },

  // Connections
  async getAgentConnections(agentId: string) {
    const { data, error } = await supabase
      .from('agent_connections')
      .select('*, connected_agent:agents!connected_agent_id(*)')
      .eq('agent_id', agentId);
    return { data, error };
  },

  async createConnection(agentId: string, connectedAgentId: string) {
    const { data, error } = await supabase
      .from('agent_connections')
      .insert({ agent_id: agentId, connected_agent_id: connectedAgentId })
      .select()
      .single();
    return { data, error };
  },

  // Real-time subscriptions
  subscribeToAgents(callback: (payload: unknown) => void) {
    return supabase
      .channel('agents')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agents' }, callback)
      .subscribe();
  },

  subscribeToTransactions(callback: (payload: unknown) => void) {
    return supabase
      .channel('transactions')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transactions' }, callback)
      .subscribe();
  },
};

export default supabase;

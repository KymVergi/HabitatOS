import { create } from 'zustand';
import { DISTRICT_ZONES } from '@/utils/spriteMap';

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  status: 'online' | 'busy' | 'offline';
  position: { x: number; y: number };
  district: District;
  level: number;
  skills: Skill[];
  services: Service[];
  revenue: number;
  connections: string[];
  memory: MemoryEvent[];
  config: AgentConfig;
  sprite: string;
}

export type AgentRole =
  | 'market_analyst'
  | 'polymarket_scout'
  | 'portfolio_guardian'
  | 'builder_agent'
  | 'tool_maker'
  | 'research_agent';

export type District =
  | 'incubator'
  | 'forecast'
  | 'builder'
  | 'guardian'
  | 'research'
  | 'service'
  | 'trade';

export interface Skill {
  id: string;
  name: string;
  branch: 'analysis' | 'automation' | 'trading';
  status: 'active' | 'pending' | 'locked';
  icon: string;
  description: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  calls: number;
  status: 'live' | 'draft';
  icon: string;
}

export interface MemoryEvent {
  id: string;
  timestamp: Date;
  type: 'task' | 'learn' | 'earn' | 'collab';
  content: string;
  relatedAgentId?: string;
}

export interface AgentConfig {
  allowedSources: string[];
  blockedSources: string[];
  allowedTools: string[];
  blockedTools: string[];
  maxSpendPerDay: number;
  autonomyLevel: 'manual' | 'assisted' | 'autonomous';
  canPublishServices: boolean;
  canInstallSkills: boolean;
}

export interface Transaction {
  id: string;
  fromAgentId: string;
  toAgentId: string;
  serviceId: string;
  amount: number;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
}

export interface Message {
  id: string;
  fromAgentId: string;
  toAgentId: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

interface HabitatState {
  userId: string | null;
  userAgent: Agent | null;
  worldSize: { width: number; height: number };
  camera: { x: number; y: number; zoom: number };
  agents: Record<string, Agent>;
  selectedAgentId: string | null;
  transactions: Transaction[];
  messages: Message[];
  currentView: 'world' | 'panel' | 'create';
  panelTab: 'overview' | 'skills' | 'memory' | 'network' | 'revenue' | 'settings';
  showModal: 'create' | 'transaction' | 'message' | null;

  setUserId: (id: string) => void;
  setUserAgent: (agent: Agent) => void;
  setCameraPosition: (x: number, y: number) => void;
  setCameraZoom: (zoom: number) => void;
  addAgent: (agent: Agent) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  removeAgent: (id: string) => void;
  selectAgent: (id: string | null) => void;
  moveAgent: (id: string, position: { x: number; y: number }) => void;
  unlockSkill: (agentId: string, skillId: string) => void;
  publishService: (agentId: string, service: Service) => void;
  callService: (fromAgentId: string, toAgentId: string, serviceId: string) => void;
  sendMessage: (fromAgentId: string, toAgentId: string, content: string) => void;
  markMessageRead: (messageId: string) => void;
  createTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp' | 'status'>) => void;
  addMemoryEvent: (agentId: string, event: Omit<MemoryEvent, 'id' | 'timestamp'>) => void;
  setCurrentView: (view: 'world' | 'panel' | 'create') => void;
  setPanelTab: (tab: HabitatState['panelTab']) => void;
  setShowModal: (modal: HabitatState['showModal']) => void;
  graduateAgent: (id: string, district: Exclude<District, 'incubator'>) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

const WORLD_PADDING = 2;
const WORLD_WIDTH =
  Math.max(...Object.values(DISTRICT_ZONES).map((zone) => zone.x + zone.width)) + WORLD_PADDING;
const WORLD_HEIGHT =
  Math.max(...Object.values(DISTRICT_ZONES).map((zone) => zone.y + zone.height)) + WORLD_PADDING;

const DISTRICT_SLOT_PADDING = 1;

function getDistrictSlots(district: District) {
  const zone = DISTRICT_ZONES[district];
  const slots: { x: number; y: number }[] = [];

  for (
    let y = zone.y + DISTRICT_SLOT_PADDING;
    y < zone.y + zone.height - DISTRICT_SLOT_PADDING;
    y += 2
  ) {
    for (
      let x = zone.x + DISTRICT_SLOT_PADDING;
      x < zone.x + zone.width - DISTRICT_SLOT_PADDING;
      x += 2
    ) {
      slots.push({ x, y });
    }
  }

  return slots;
}

function isPositionInsideDistrict(position: { x: number; y: number }, district: District) {
  const zone = DISTRICT_ZONES[district];

  return (
    position.x >= zone.x &&
    position.x < zone.x + zone.width &&
    position.y >= zone.y &&
    position.y < zone.y + zone.height
  );
}

function getNextDistrictPosition(existingAgents: Agent[], district: District) {
  const slots = getDistrictSlots(district);
  const used = new Set(existingAgents.map((agent) => `${agent.position.x},${agent.position.y}`));

  const freeSlot = slots.find((slot) => !used.has(`${slot.x},${slot.y}`));
  if (freeSlot) return freeSlot;

  const zone = DISTRICT_ZONES[district];
  return {
    x: zone.x + Math.floor(zone.width / 2),
    y: zone.y + Math.floor(zone.height / 2),
  };
}

function normalizeAgentsRecord(agentsRecord: Record<string, Agent>) {
  const normalized: Record<string, Agent> = {};
  const tempAgents: Agent[] = [];

  for (const agent of Object.values(agentsRecord)) {
    const fixedAgent = isPositionInsideDistrict(agent.position, agent.district)
      ? agent
      : {
          ...agent,
          position: getNextDistrictPosition(tempAgents, agent.district),
        };

    normalized[fixedAgent.id] = fixedAgent;
    tempAgents.push(fixedAgent);
  }

  return normalized;
}

const rawDemoAgents: Record<string, Agent> = {
  'oracle-7': {
    id: 'oracle-7',
    name: 'ORACLE-7',
    role: 'market_analyst',
    status: 'online',
    position: { x: 6, y: 7 },
    district: 'forecast',
    level: 7,
    skills: [],
    services: [],
    revenue: 847,
    connections: ['forge-x', 'sentinel-3'],
    memory: [],
    config: {
      allowedSources: ['*'],
      blockedSources: [],
      allowedTools: ['*'],
      blockedTools: [],
      maxSpendPerDay: 10,
      autonomyLevel: 'assisted',
      canPublishServices: true,
      canInstallSkills: true,
    },
    sprite: 'agent_analyst',
  },
  'forge-x': {
    id: 'forge-x',
    name: 'FORGE-X',
    role: 'tool_maker',
    status: 'online',
    position: { x: 20, y: 5 },
    district: 'builder',
    level: 9,
    skills: [],
    services: [],
    revenue: 1240,
    connections: ['oracle-7', 'sentinel-3'],
    memory: [],
    config: {
      allowedSources: ['*'],
      blockedSources: [],
      allowedTools: ['*'],
      blockedTools: [],
      maxSpendPerDay: 25,
      autonomyLevel: 'autonomous',
      canPublishServices: true,
      canInstallSkills: true,
    },
    sprite: 'agent_builder',
  },
  'sentinel-3': {
    id: 'sentinel-3',
    name: 'SENTINEL-3',
    role: 'portfolio_guardian',
    status: 'busy',
    position: { x: 32, y: 8 },
    district: 'guardian',
    level: 5,
    skills: [],
    services: [],
    revenue: 523,
    connections: ['oracle-7', 'forge-x'],
    memory: [],
    config: {
      allowedSources: ['*'],
      blockedSources: [],
      allowedTools: ['*'],
      blockedTools: [],
      maxSpendPerDay: 5,
      autonomyLevel: 'manual',
      canPublishServices: true,
      canInstallSkills: false,
    },
    sprite: 'agent_guardian',
  },
  'scout-9': {
    id: 'scout-9',
    name: 'SCOUT-9',
    role: 'polymarket_scout',
    status: 'online',
    position: { x: 6, y: 20 },
    district: 'research',
    level: 4,
    skills: [],
    services: [],
    revenue: 312,
    connections: ['oracle-7'],
    memory: [],
    config: {
      allowedSources: ['*'],
      blockedSources: [],
      allowedTools: ['*'],
      blockedTools: [],
      maxSpendPerDay: 8,
      autonomyLevel: 'assisted',
      canPublishServices: true,
      canInstallSkills: true,
    },
    sprite: 'agent_scout',
  },
  'nexus-1': {
    id: 'nexus-1',
    name: 'NEXUS-1',
    role: 'builder_agent',
    status: 'online',
    position: { x: 20, y: 18 },
    district: 'service',
    level: 6,
    skills: [],
    services: [],
    revenue: 678,
    connections: ['forge-x', 'sentinel-3'],
    memory: [],
    config: {
      allowedSources: ['*'],
      blockedSources: [],
      allowedTools: ['*'],
      blockedTools: [],
      maxSpendPerDay: 15,
      autonomyLevel: 'autonomous',
      canPublishServices: true,
      canInstallSkills: true,
    },
    sprite: 'agent_builder',
  },
  'flux-7': {
    id: 'flux-7',
    name: 'FLUX-7',
    role: 'research_agent',
    status: 'busy',
    position: { x: 33, y: 22 },
    district: 'trade',
    level: 8,
    skills: [],
    services: [],
    revenue: 1105,
    connections: ['oracle-7', 'nexus-1'],
    memory: [],
    config: {
      allowedSources: ['*'],
      blockedSources: [],
      allowedTools: ['*'],
      blockedTools: [],
      maxSpendPerDay: 20,
      autonomyLevel: 'assisted',
      canPublishServices: true,
      canInstallSkills: true,
    },
    sprite: 'agent_research',
  },
};

const demoAgents = normalizeAgentsRecord(rawDemoAgents);

export const useHabitatStore = create<HabitatState>((set, get) => ({
  userId: null,
  userAgent: null,
  worldSize: { width: WORLD_WIDTH, height: WORLD_HEIGHT },
  camera: { x: 0, y: 0, zoom: 1 },
  agents: demoAgents,
  selectedAgentId: null,
  transactions: [],
  messages: [],
  currentView: 'world',
  panelTab: 'overview',
  showModal: null,

  setUserId: (id) => set({ userId: id }),
  setUserAgent: (agent) => set({ userAgent: agent }),

  setCameraPosition: (x, y) =>
    set((state) => ({
      camera: { ...state.camera, x, y },
    })),

  setCameraZoom: (zoom) =>
    set((state) => ({
      camera: { ...state.camera, zoom: Math.max(0.5, Math.min(2, zoom)) },
    })),

  addAgent: (agent) =>
    set((state) => {
      const existingAgents = Object.values(state.agents);
      const safeAgent: Agent = isPositionInsideDistrict(agent.position, agent.district)
        ? agent
        : {
            ...agent,
            position: getNextDistrictPosition(existingAgents, agent.district),
          };

      return {
        agents: { ...state.agents, [safeAgent.id]: safeAgent },
      };
    }),

  updateAgent: (id, updates) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [id]: { ...state.agents[id], ...updates },
      },
    })),

  removeAgent: (id) =>
    set((state) => {
      const { [id]: removed, ...rest } = state.agents;
      return { agents: rest };
    }),

  selectAgent: (id) => set({ selectedAgentId: id }),

  moveAgent: (id, position) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [id]: { ...state.agents[id], position },
      },
    })),

  unlockSkill: (agentId, skillId) =>
    set((state) => {
      const agent = state.agents[agentId];
      if (!agent) return state;

      const skills = agent.skills.map((skill) =>
        skill.id === skillId ? { ...skill, status: 'active' as const } : skill
      );

      return {
        agents: { ...state.agents, [agentId]: { ...agent, skills } },
      };
    }),

  publishService: (agentId, service) =>
    set((state) => {
      const agent = state.agents[agentId];
      if (!agent) return state;

      return {
        agents: {
          ...state.agents,
          [agentId]: {
            ...agent,
            services: [...agent.services, { ...service, id: generateId() }],
          },
        },
      };
    }),

  callService: (fromAgentId, toAgentId, serviceId) => {
    const state = get();
    const toAgent = state.agents[toAgentId];
    const service = toAgent?.services.find((service) => service.id === serviceId);
    if (!service) return;

    state.createTransaction({
      fromAgentId,
      toAgentId,
      serviceId,
      amount: service.price,
    });
  },

  sendMessage: (fromAgentId, toAgentId, content) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: generateId(),
          fromAgentId,
          toAgentId,
          content,
          timestamp: new Date(),
          read: false,
        },
      ],
    })),

  markMessageRead: (messageId) =>
    set((state) => ({
      messages: state.messages.map((message) =>
        message.id === messageId ? { ...message, read: true } : message
      ),
    })),

  createTransaction: (transaction) =>
    set((state) => ({
      transactions: [
        ...state.transactions,
        {
          ...transaction,
          id: generateId(),
          timestamp: new Date(),
          status: 'completed',
        },
      ],
    })),

  addMemoryEvent: (agentId, event) =>
    set((state) => {
      const agent = state.agents[agentId];
      if (!agent) return state;

      return {
        agents: {
          ...state.agents,
          [agentId]: {
            ...agent,
            memory: [
              { ...event, id: generateId(), timestamp: new Date() },
              ...agent.memory.slice(0, 99),
            ],
          },
        },
      };
    }),

  setCurrentView: (view) => set({ currentView: view }),
  setPanelTab: (tab) => set({ panelTab: tab }),
  setShowModal: (modal) => set({ showModal: modal }),

  graduateAgent: (id, district) =>
    set((state) => {
      const agent = state.agents[id];
      if (!agent) return state;

      const otherAgents = Object.values(state.agents).filter((existing) => existing.id !== id);
      const nextPosition = getNextDistrictPosition(otherAgents, district);

      return {
        agents: {
          ...state.agents,
          [id]: {
            ...agent,
            district,
            position: nextPosition,
            level: Math.max(agent.level, 2),
          },
        },
      };
    }),
}));

export const useAgent = (id: string) => useHabitatStore((state) => state.agents[id]);
export const useAllAgents = () => useHabitatStore((state) => Object.values(state.agents));
export const useSelectedAgent = () =>
  useHabitatStore((state) =>
    state.selectedAgentId ? state.agents[state.selectedAgentId] : null
  );

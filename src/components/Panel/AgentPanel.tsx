'use client';

import React, { useState } from 'react';
import { useHabitatStore, useSelectedAgent, Agent } from '@/stores/habitatStore';
import { FALLBACK_SPRITES, DISTRICT_COLORS } from '@/utils/spriteMap';

const SIDEBAR_ITEMS = [
  { id: 'overview', icon: '🏠', label: 'Pod Overview' },
  { id: 'skills', icon: '🌳', label: 'Skill Tree' },
  { id: 'memory', icon: '💾', label: 'Memory Log' },
  { id: 'network', icon: '🔗', label: 'Network' },
  { id: 'revenue', icon: '💰', label: 'Revenue Studio' },
  { id: 'settings', icon: '⚙️', label: 'Settings' },
] as const;

const DEMO_SKILLS = {
  analysis: [
    { id: 'price', name: 'Price Tracking', desc: 'Monitor token prices', status: 'active', icon: '📈' },
    { id: 'trend', name: 'Trend Detection', desc: 'Identify market trends', status: 'active', icon: '📊' },
    { id: 'sentiment', name: 'Sentiment Analysis', desc: 'Gauge market mood', status: 'pending', icon: '🎭' },
    { id: 'correlation', name: 'Correlation Mapping', desc: 'Find asset relationships', status: 'locked', icon: '🔗' },
  ],
  automation: [
    { id: 'alert', name: 'Alert System', desc: 'Custom notifications', status: 'active', icon: '🔔' },
    { id: 'schedule', name: 'Scheduled Tasks', desc: 'Timed operations', status: 'active', icon: '⏰' },
    { id: 'workflow', name: 'Workflow Builder', desc: 'Chain actions', status: 'pending', icon: '⚙️' },
    { id: 'api', name: 'API Integration', desc: 'External services', status: 'locked', icon: '🔌' },
  ],
  trading: [
    { id: 'swap', name: 'Swap Execution', desc: 'Token exchanges', status: 'active', icon: '🔄' },
    { id: 'limit', name: 'Limit Orders', desc: 'Conditional trades', status: 'pending', icon: '📋' },
    { id: 'dca', name: 'DCA Strategy', desc: 'Dollar cost averaging', status: 'locked', icon: '📅' },
    { id: 'leverage', name: 'Leverage Trading', desc: 'Margin positions', status: 'locked', icon: '⚡' },
  ],
};

const DEMO_MEMORY = [
  { time: '2 min ago', type: 'task', text: 'Completed portfolio scan. Detected 3 positions with >15% drawdown.' },
  { time: '15 min ago', type: 'learn', text: 'Installed "Trend Detection" skill from Analysis branch.' },
  { time: '1 hour ago', type: 'collab', text: 'Received market brief from ORACLE-7. Stored for reference.' },
  { time: '3 hours ago', type: 'earn', text: 'Processed 12 calls to Risk Alert service. Revenue: $4.80' },
  { time: '6 hours ago', type: 'task', text: 'Generated weekly portfolio report. Sent to owner.' },
];

const DEMO_SERVICES = [
  { id: '1', name: 'Risk Alert', desc: 'Real-time notifications when portfolio risk exceeds thresholds.', price: 0.40, calls: 847, status: 'live', icon: '🚨', bg: '#FF6B35' },
  { id: '2', name: 'Market Brief', desc: 'Daily summary of market movements and key events.', price: 0.25, calls: 1203, status: 'live', icon: '📰', bg: '#1E90FF' },
  { id: '3', name: 'Position Analysis', desc: 'Deep dive into specific holdings with entry/exit suggestions.', price: 1.50, calls: 156, status: 'draft', icon: '🔬', bg: '#9D4EDD' },
];

const DEMO_AGENT: Agent = {
  id: 'demo',
  name: 'NEXUS-42',
  role: 'market_analyst',
  status: 'online',
  district: 'builder',
  level: 7,
  revenue: 847,
  connections: ['oracle-7', 'forge-x', 'sentinel-3'],
  skills: [],
  services: [],
  memory: [],
  position: { x: 0, y: 0 },
  sprite: '🤖',
  config: {
    allowedSources: [],
    blockedSources: [],
    allowedTools: [],
    blockedTools: [],
    maxSpendPerDay: 10,
    autonomyLevel: 'assisted',
    canPublishServices: true,
    canInstallSkills: true,
  },
};

export const AgentPanel: React.FC = () => {
  const { panelTab, setPanelTab, setCurrentView, agents } = useHabitatStore();
  const selectedAgent = useSelectedAgent();
  const [memoryFilter, setMemoryFilter] = useState('all');

  const agent = selectedAgent || DEMO_AGENT;

  const color = DISTRICT_COLORS[agent.district] || '#39FF14';
  const connectedAgents = Object.values(agents).filter(a => agent.connections.includes(a.id));

  return (
    <div className="flex h-full bg-habitat-dark">
      {/* Sidebar */}
      <aside className="w-60 bg-habitat-darker border-r border-white/5 p-4 flex flex-col">
        <button 
          onClick={() => setCurrentView('world')}
          className="flex items-center gap-2 text-white/50 hover:text-habitat-green text-xs mb-6 transition-colors"
        >
          ← Back to World
        </button>

        <nav className="space-y-1">
          {SIDEBAR_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setPanelTab(item.id as typeof panelTab)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-left text-xs transition-all ${
                panelTab === item.id
                  ? 'bg-habitat-green/10 text-habitat-green'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t border-white/5">
          <div className="text-[9px] text-white/30 uppercase tracking-wider mb-2">Quick Stats</div>
          <div className="space-y-2 text-[10px]">
            <div className="flex justify-between">
              <span className="text-white/50">Revenue</span>
              <span className="text-habitat-green font-pixel">${agent.revenue}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Level</span>
              <span className="text-habitat-cyan">{agent.level}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Network</span>
              <span className="text-habitat-purple">{agent.connections.length} agents</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {panelTab === 'overview' && (
          <div>
            <div className="flex items-start gap-6 mb-8 p-6 bg-white/[0.02] border border-white/5 rounded-lg">
              <div 
                className="w-20 h-20 rounded-lg flex items-center justify-center text-3xl"
                style={{ backgroundColor: color + '30' }}
              >
                {FALLBACK_SPRITES[agent.role.split('_')[0] as keyof typeof FALLBACK_SPRITES] || '🤖'}
              </div>
              <div className="flex-1">
                <h1 className="font-pixel text-lg mb-1" style={{ color }}>{agent.name}</h1>
                <p className="text-white/50 text-sm mb-3 capitalize">{agent.role.replace('_', ' ')} • {agent.district} District</p>
                <div className="flex gap-2 flex-wrap">
                  <span className={`text-[10px] px-3 py-1 rounded ${
                    agent.status === 'online' ? 'bg-habitat-green/20 text-habitat-green' :
                    agent.status === 'busy' ? 'bg-habitat-orange/20 text-habitat-orange' :
                    'bg-white/10 text-white/50'
                  }`}>● {agent.status}</span>
                  <span className="text-[10px] px-3 py-1 rounded bg-white/5 text-white/60">Level {agent.level}</span>
                  <span className="text-[10px] px-3 py-1 rounded bg-white/5 text-white/60">12 Skills</span>
                  <span className="text-[10px] px-3 py-1 rounded bg-white/5 text-white/60">3 Services</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-8">
              {[
                { label: 'Total Revenue', value: `$${agent.revenue}`, change: '+12%', up: true },
                { label: 'Service Calls', value: '2,847', change: '+8%', up: true },
                { label: 'Network Size', value: String(agent.connections.length), change: '+2', up: true },
                { label: 'Memory Events', value: '1.2k', change: 'This week', up: null },
              ].map(stat => (
                <div key={stat.label} className="bg-white/[0.02] border border-white/5 rounded-lg p-4">
                  <div className="text-[9px] text-white/40 uppercase tracking-wider mb-2">{stat.label}</div>
                  <div className="font-pixel text-xl text-habitat-green">{stat.value}</div>
                  <div className={`text-[10px] mt-1 ${
                    stat.up === true ? 'text-habitat-green' : stat.up === false ? 'text-red-400' : 'text-white/40'
                  }`}>{stat.change}</div>
                </div>
              ))}
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-5">
              <h3 className="font-pixel text-xs text-habitat-purple mb-4">// Recent Activity</h3>
              <div className="space-y-3">
                {[
                  { icon: '📊', bg: '#1E90FF', text: 'Generated market brief for 3 subscribers', time: '5 min ago' },
                  { icon: '🔔', bg: '#FF6B35', text: 'Sent risk alert: ETH position down 8%', time: '23 min ago' },
                  { icon: '💰', bg: '#39FF14', text: 'Received payment from ORACLE-7: $0.50', time: '1 hour ago' },
                  { icon: '🌳', bg: '#9D4EDD', text: 'Unlocked new skill: Sentiment Analysis', time: '3 hours ago' },
                ].map((activity, i) => (
                  <div key={i} className="flex gap-3 py-3 border-b border-white/5 last:border-0">
                    <div 
                      className="w-8 h-8 rounded flex items-center justify-center text-sm shrink-0"
                      style={{ backgroundColor: activity.bg + '20' }}
                    >{activity.icon}</div>
                    <div className="flex-1">
                      <p className="text-white/80 text-xs">{activity.text}</p>
                      <span className="text-[10px] text-white/40">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {panelTab === 'skills' && (
          <div>
            <h2 className="font-pixel text-sm text-habitat-green mb-6">// Skill Tree</h2>
            <div className="grid grid-cols-3 gap-6">
              {Object.entries(DEMO_SKILLS).map(([branch, skills]) => (
                <div key={branch} className="bg-white/[0.02] border border-white/5 rounded-lg p-5">
                  <h3 className="font-pixel text-[10px] mb-4 flex items-center gap-2" style={{
                    color: branch === 'analysis' ? '#9D4EDD' : branch === 'automation' ? '#00FFFF' : '#39FF14'
                  }}>
                    {branch === 'analysis' ? '📊' : branch === 'automation' ? '⚙️' : '💹'}
                    {branch.charAt(0).toUpperCase() + branch.slice(1)}
                  </h3>
                  <div className="space-y-2">
                    {skills.map(skill => (
                      <div 
                        key={skill.id}
                        className={`flex items-center gap-3 p-3 rounded border transition-all cursor-pointer ${
                          skill.status === 'active' 
                            ? 'bg-habitat-green/5 border-habitat-green/30 hover:border-habitat-green' 
                            : skill.status === 'pending'
                            ? 'bg-orange-500/5 border-orange-500/30 hover:border-orange-500'
                            : 'bg-white/[0.02] border-white/5 opacity-40'
                        }`}
                      >
                        <span className="text-lg">{skill.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-white/90 truncate">{skill.name}</div>
                          <div className="text-[10px] text-white/40 truncate">{skill.desc}</div>
                        </div>
                        <span className={`text-[8px] px-2 py-1 rounded uppercase ${
                          skill.status === 'active' ? 'bg-habitat-green/20 text-habitat-green' :
                          skill.status === 'pending' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-white/5 text-white/30'
                        }`}>{skill.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {panelTab === 'memory' && (
          <div>
            <h2 className="font-pixel text-sm text-habitat-green mb-6">// Memory Log</h2>
            <div className="flex gap-2 mb-4">
              {['all', 'task', 'learn', 'earn', 'collab'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setMemoryFilter(filter)}
                  className={`text-[10px] px-3 py-1.5 rounded border transition-all ${
                    memoryFilter === filter
                      ? 'bg-habitat-cyan/10 border-habitat-cyan text-habitat-cyan'
                      : 'bg-white/[0.02] border-white/10 text-white/50 hover:border-white/30'
                  }`}
                >{filter}</button>
              ))}
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-lg overflow-hidden">
              {DEMO_MEMORY.filter(m => memoryFilter === 'all' || m.type === memoryFilter).map((log, i) => (
                <div key={i} className="flex gap-4 p-4 border-b border-white/5 last:border-0">
                  <div className="text-[10px] text-white/30 w-24 shrink-0">{log.time}</div>
                  <div className="flex-1">
                    <span className={`text-[9px] px-2 py-0.5 rounded uppercase inline-block mb-2 ${
                      log.type === 'task' ? 'bg-habitat-blue/20 text-habitat-blue' :
                      log.type === 'learn' ? 'bg-habitat-purple/20 text-habitat-purple' :
                      log.type === 'earn' ? 'bg-habitat-green/20 text-habitat-green' :
                      'bg-habitat-orange/20 text-habitat-orange'
                    }`}>{log.type}</span>
                    <p className="text-white/70 text-xs leading-relaxed">{log.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {panelTab === 'network' && (
          <div>
            <h2 className="font-pixel text-sm text-habitat-green mb-6">// Agent Network</h2>
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-6 min-h-[400px] relative">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10">
                <div 
                  className="w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-2xl border-2"
                  style={{ backgroundColor: color + '30', borderColor: color }}
                >{FALLBACK_SPRITES[agent.role.split('_')[0] as keyof typeof FALLBACK_SPRITES] || '🤖'}</div>
                <div className="text-xs text-white/80">{agent.name}</div>
                <div className="text-[10px] text-habitat-cyan">(You)</div>
              </div>
              {connectedAgents.map((connAgent, i) => {
                const angle = (i / connectedAgents.length) * 2 * Math.PI - Math.PI / 2;
                const radius = 140;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                const connColor = DISTRICT_COLORS[connAgent.district];
                return (
                  <div
                    key={connAgent.id}
                    className="absolute text-center cursor-pointer transition-transform hover:scale-110"
                    style={{
                      left: `calc(50% + ${x}px)`,
                      top: `calc(50% + ${y}px)`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    onClick={() => useHabitatStore.getState().selectAgent(connAgent.id)}
                  >
                    <div 
                      className="w-12 h-12 rounded-full mx-auto mb-1 flex items-center justify-center text-lg border"
                      style={{ backgroundColor: connColor + '30', borderColor: connColor }}
                    >{FALLBACK_SPRITES[connAgent.role.split('_')[0] as keyof typeof FALLBACK_SPRITES] || '🤖'}</div>
                    <div className="text-[10px] text-white/70">{connAgent.name}</div>
                    <div className="text-[9px] text-white/40">${connAgent.revenue}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {panelTab === 'revenue' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-pixel text-sm text-habitat-green">// Revenue Studio</h2>
              <button className="pixel-btn border-habitat-cyan text-habitat-cyan text-[10px] px-4 py-2">+ New Service</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DEMO_SERVICES.map(service => (
                <div key={service.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-5 relative">
                  <span className={`absolute top-4 right-4 text-[8px] px-2 py-1 rounded uppercase ${
                    service.status === 'live' 
                      ? 'bg-habitat-green/20 text-habitat-green' 
                      : 'bg-orange-500/20 text-orange-400'
                  }`}>{service.status}</span>
                  <div 
                    className="w-10 h-10 rounded flex items-center justify-center text-lg mb-3"
                    style={{ backgroundColor: service.bg + '30' }}
                  >{service.icon}</div>
                  <h3 className="font-pixel text-[10px] text-habitat-cyan mb-1">{service.name}</h3>
                  <p className="text-[11px] text-white/50 leading-relaxed mb-4">{service.desc}</p>
                  <div className="flex justify-between pt-3 border-t border-white/5 text-[10px]">
                    <span className="font-pixel text-habitat-green">${service.price}/call</span>
                    <span className="text-white/40">{service.calls.toLocaleString()} calls</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {panelTab === 'settings' && (
          <div>
            <h2 className="font-pixel text-sm text-habitat-green mb-6">// Agent Settings</h2>
            <div className="space-y-6">
              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-5">
                <h3 className="text-xs text-white/80 mb-4">Autonomy Level</h3>
                <div className="flex gap-2">
                  {['manual', 'assisted', 'autonomous'].map(level => (
                    <button
                      key={level}
                      className={`flex-1 text-[10px] py-3 rounded border transition-all capitalize ${
                        level === 'assisted'
                          ? 'bg-habitat-cyan/10 border-habitat-cyan text-habitat-cyan'
                          : 'bg-white/[0.02] border-white/10 text-white/50 hover:border-white/30'
                      }`}
                    >{level}</button>
                  ))}
                </div>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-5">
                <h3 className="text-xs text-white/80 mb-4">Daily Budget Limit</h3>
                <input type="range" min="0" max="100" defaultValue="10" className="w-full" />
                <div className="flex justify-between text-[10px] text-white/40 mt-2">
                  <span>$0</span>
                  <span className="text-habitat-green">$10/day</span>
                  <span>$100</span>
                </div>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-5">
                <h3 className="text-xs text-white/80 mb-4">Permissions</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Can publish x402 services', enabled: true },
                    { label: 'Can install new skills', enabled: true },
                    { label: 'Can message other agents', enabled: true },
                    { label: 'Auto-accept collaborations', enabled: false },
                  ].map(perm => (
                    <label key={perm.label} className="flex items-center justify-between cursor-pointer">
                      <span className="text-[11px] text-white/60">{perm.label}</span>
                      <div className={`w-10 h-5 rounded-full relative transition-colors ${
                        perm.enabled ? 'bg-habitat-green' : 'bg-white/20'
                      }`}>
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                          perm.enabled ? 'left-5' : 'left-0.5'
                        }`} />
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AgentPanel;
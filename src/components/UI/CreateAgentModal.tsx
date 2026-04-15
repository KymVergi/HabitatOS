'use client';

import React, { useState } from 'react';
import { useHabitatStore, AgentRole, District } from '@/stores/habitatStore';
import { DISTRICT_COLORS } from '@/utils/spriteMap';

interface CreateAgentModalProps {
  onClose: () => void;
}

const ROLES: { id: AgentRole; name: string; icon: string; desc: string }[] = [
  { id: 'market_analyst', name: 'Market Analyst', icon: '📊', desc: 'Tracks prices, trends, and market signals' },
  { id: 'polymarket_scout', name: 'Polymarket Scout', icon: '🔍', desc: 'Finds prediction market opportunities' },
  { id: 'portfolio_guardian', name: 'Portfolio Guardian', icon: '🛡️', desc: 'Monitors wallets and risk exposure' },
  { id: 'builder_agent', name: 'Builder Agent', icon: '⚡', desc: 'Creates workflows and automations' },
  { id: 'tool_maker', name: 'Tool Maker', icon: '🔧', desc: 'Builds and sells x402 services' },
  { id: 'research_agent', name: 'Research Agent', icon: '🔬', desc: 'Deep research and analysis' },
];

const DISTRICTS: { id: District; name: string }[] = [
  { id: 'forecast', name: 'Forecast' },
  { id: 'builder', name: 'Builder' },
  { id: 'guardian', name: 'Guardian' },
  { id: 'research', name: 'Research' },
  { id: 'service', name: 'Service' },
  { id: 'trade', name: 'Trade' },
];

export const CreateAgentModal: React.FC<CreateAgentModalProps> = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [role, setRole] = useState<AgentRole | null>(null);
  const [district, setDistrict] = useState<District | null>(null);
  const { addAgent, setCurrentView, selectAgent, setPanelTab } = useHabitatStore();

  const handleCreate = () => {
    if (!name || !role || !district) return;
    
    const id = name.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 5);
    
    addAgent({
      id,
      name: name.toUpperCase(),
      role,
      status: 'online',
      position: { x: Math.floor(Math.random() * 35) + 2, y: Math.floor(Math.random() * 25) + 2 },
      district,
      level: 1,
      skills: [],
      services: [],
      revenue: 0,
      connections: [],
      memory: [],
      config: {
        allowedSources: ['*'],
        blockedSources: [],
        allowedTools: ['*'],
        blockedTools: [],
        maxSpendPerDay: 10,
        autonomyLevel: 'manual',
        canPublishServices: true,
        canInstallSkills: true,
      },
      sprite: `agent_${role.split('_')[0]}`,
    });

    selectAgent(id);
    setCurrentView('panel');
    setPanelTab('overview');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-xl bg-habitat-darker border border-white/10 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div>
            <h2 className="font-pixel text-habitat-cyan text-sm">Create Agent</h2>
            <p className="text-[10px] text-white/40 mt-1">Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl">×</button>
        </div>

        {/* Progress */}
        <div className="flex gap-1 px-5 py-3 bg-white/[0.02]">
          {[1, 2, 3].map(s => (
            <div key={s} className={`flex-1 h-1 rounded ${s <= step ? 'bg-habitat-cyan' : 'bg-white/10'}`} />
          ))}
        </div>

        {/* Content */}
        <div className="p-5 min-h-[300px]">
          {step === 1 && (
            <div>
              <h3 className="text-xs text-white/80 mb-4">Choose a profession for your agent</h3>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    className={`flex items-start gap-3 p-4 rounded-lg border text-left transition-all ${
                      role === r.id
                        ? 'bg-habitat-cyan/10 border-habitat-cyan'
                        : 'bg-white/[0.02] border-white/10 hover:border-white/30'
                    }`}
                  >
                    <span className="text-2xl">{r.icon}</span>
                    <div>
                      <div className="text-xs text-white/90">{r.name}</div>
                      <div className="text-[10px] text-white/40 mt-1">{r.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="text-xs text-white/80 mb-4">Name your agent</h3>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter agent name..."
                className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:border-habitat-cyan focus:outline-none"
                autoFocus
              />
              <p className="text-[10px] text-white/40 mt-2">Name will be displayed in UPPERCASE</p>
              
              <h3 className="text-xs text-white/80 mb-4 mt-6">Select starting district</h3>
              <div className="grid grid-cols-3 gap-2">
                {DISTRICTS.map(d => (
                  <button
                    key={d.id}
                    onClick={() => setDistrict(d.id)}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      district === d.id
                        ? 'border-2'
                        : 'bg-white/[0.02] border-white/10 hover:border-white/30'
                    }`}
                    style={{
                      borderColor: district === d.id ? DISTRICT_COLORS[d.id] : undefined,
                      backgroundColor: district === d.id ? DISTRICT_COLORS[d.id] + '20' : undefined,
                    }}
                  >
                    <span className="text-xs" style={{ color: DISTRICT_COLORS[d.id] }}>{d.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 className="text-xs text-white/80 mb-4">Confirm & Pay</h3>
              
              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-5 mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div 
                    className="w-14 h-14 rounded-lg flex items-center justify-center text-2xl"
                    style={{ backgroundColor: (district ? DISTRICT_COLORS[district] : '#39FF14') + '30' }}
                  >
                    {ROLES.find(r => r.id === role)?.icon || '🤖'}
                  </div>
                  <div>
                    <div className="font-pixel text-sm text-habitat-green">{name.toUpperCase() || 'UNNAMED'}</div>
                    <div className="text-[10px] text-white/50 capitalize">{role?.replace('_', ' ') || 'No role'}</div>
                    <div className="text-[10px] mt-1" style={{ color: district ? DISTRICT_COLORS[district] : '#666' }}>
                      {district ? `${district.charAt(0).toUpperCase() + district.slice(1)} District` : 'No district'}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                  <span className="text-xs text-white/60">Creation Cost</span>
                  <span className="font-pixel text-lg text-habitat-green">$5.00</span>
                </div>
              </div>

              <div className="text-[10px] text-white/40 mb-4">
                By creating an agent, you&apos;re claiming a land in HABITAT and spawning an entity that can learn, work, and earn.
              </div>

              <button
                onClick={handleCreate}
                disabled={!name || !role || !district}
                className="w-full pixel-btn border-habitat-green text-habitat-green hover:bg-habitat-green/10 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Pay $5 & Spawn Agent
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between p-5 border-t border-white/5">
          <button
            onClick={() => setStep(s => Math.max(1, s - 1))}
            className={`text-xs text-white/50 hover:text-white ${step === 1 ? 'invisible' : ''}`}
          >
            ← Back
          </button>
          {step < 3 && (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={step === 1 && !role}
              className="pixel-btn border-habitat-cyan text-habitat-cyan text-[10px] disabled:opacity-30"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateAgentModal;

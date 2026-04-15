'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Github, 
  Twitter, 
  Zap, 
  Bot, 
  Coins, 
  Network, 
  Brain, 
  Shield, 
  TrendingUp,
  Code2,
  Microscope,
  ArrowRight,
  ChevronDown,
  Sparkles,
  Globe,
  Users,
  DollarSign,
  Activity,
  MessageSquare,
  Lock,
  Unlock,
  Play
} from 'lucide-react';
import type { District } from '@/stores/habitatStore';
import { DISTRICT_COLORS } from '@/utils/spriteMap';
import ConnectWalletButton from '@/components/UI/ConnectWalletButton';

const DISTRICTS = [
  { id: 'forecast', name: 'Forecast', icon: TrendingUp, desc: 'Market predictions & trend analysis', agents: 12, color: '#9D4EDD' },
  { id: 'builder', name: 'Builder', icon: Code2, desc: 'Automations & workflow creation', agents: 8, color: '#00FFFF' },
  { id: 'guardian', name: 'Guardian', icon: Shield, desc: 'Portfolio monitoring & risk alerts', agents: 15, color: '#FF6B35' },
  { id: 'research', name: 'Research', icon: Microscope, desc: 'Deep analysis & intelligence', agents: 6, color: '#1E90FF' },
  { id: 'service', name: 'Service', icon: Zap, desc: 'Tool creation & API services', agents: 10, color: '#39FF14' },
  { id: 'trade', name: 'Trade', icon: Coins, desc: 'Execution & market operations', agents: 9, color: '#FF1493' },
];


type FeaturedAgent = {
  name: string;
  role: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  revenue: number;
  level: number;
  district: District;
  services: string[];
};

const FEATURED_AGENTS: FeaturedAgent[] = [
  { name: 'ORACLE-7', role: 'Market Analyst', icon: TrendingUp, revenue: 847, level: 7, district: 'forecast', services: ['Market Brief', 'Trend Alert'] },
  { name: 'FORGE-X', role: 'Tool Maker', icon: Code2, revenue: 1240, level: 9, district: 'builder', services: ['Workflow Builder', 'API Generator'] },
  { name: 'SENTINEL-3', role: 'Portfolio Guardian', icon: Shield, revenue: 523, level: 5, district: 'guardian', services: ['Risk Scanner', 'Position Alert'] },
];

const LIFECYCLE_STEPS = [
  { step: 1, title: 'Create', desc: 'Pay $5 to spawn your agent', icon: Sparkles, color: '#9D4EDD' },
  { step: 2, title: 'Configure', desc: 'Set boundaries & permissions', icon: Lock, color: '#00FFFF' },
  { step: 3, title: 'Learn', desc: 'Install skills and train', icon: Brain, color: '#1E90FF' },
  { step: 4, title: 'Collaborate', desc: 'Connect with other agents', icon: Network, color: '#FF6B35' },
  { step: 5, title: 'Publish', desc: 'Create x402 services', icon: Zap, color: '#39FF14' },
  { step: 6, title: 'Earn', desc: 'Generate revenue', icon: DollarSign, color: '#FF1493' },
];

const ECONOMY_EXAMPLES = [
  { from: 'SCOUT-9', to: 'ORACLE-7', service: 'Market Brief', amount: 0.25 },
  { from: 'ORACLE-7', to: 'FORGE-X', service: 'Workflow Builder', amount: 1.50 },
  { from: 'NEXUS-1', to: 'SENTINEL-3', service: 'Risk Scanner', amount: 0.40 },
];

// Animated grid cell component
const GridCell = ({ delay, color }: { delay: number; color: string }) => (
  <motion.div
    className="w-6 h-6 sm:w-8 sm:h-8 rounded border"
    style={{ borderColor: `${color}20` }}
    animate={{
      borderColor: [`${color}20`, `${color}60`, `${color}20`],
      boxShadow: [
        `0 0 0px ${color}00`,
        `0 0 10px ${color}40`,
        `0 0 0px ${color}00`,
      ],
    }}
    transition={{
      duration: 3,
      delay: delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

// Animated transaction line
const TransactionLine = ({ from, to, amount, delay }: { from: string; to: string; amount: number; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    className="flex items-center gap-3 p-4 bg-white/[0.02] rounded-lg border border-white/5"
  >
    <div className="text-xs sm:text-sm text-habitat-cyan font-pixel">{from}</div>
    <div className="flex-1 relative h-8 flex items-center">
      <div className="absolute inset-0 flex items-center">
        <div className="flex-1 h-px bg-gradient-to-r from-habitat-cyan/50 to-transparent" />
      </div>
      <motion.div
        className="absolute left-0"
        animate={{ left: ['0%', '100%'] }}
        transition={{ duration: 2, repeat: Infinity, delay, ease: "linear" }}
      >
        <div className="w-2 h-2 rounded-full bg-habitat-green shadow-lg shadow-habitat-green/50" />
      </motion.div>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="px-2 py-1 bg-habitat-dark text-[10px] text-white/60 rounded">${amount}</span>
      </div>
    </div>
    <div className="text-xs sm:text-sm text-habitat-green font-pixel">{to}</div>
  </motion.div>
);

// Floating agent animation
const FloatingAgent = ({ agent, index }: { agent: FeaturedAgent; index: number }) => {
  const Icon = agent.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="bg-white/[0.02] border border-white/5 rounded-lg p-6 hover:border-white/20 transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-4 mb-4">
        <motion.div 
          className="w-14 h-14 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: DISTRICT_COLORS[agent.district] + '30' }}
          animate={{ 
            boxShadow: [
              `0 0 0px ${DISTRICT_COLORS[agent.district]}00`,
              `0 0 20px ${DISTRICT_COLORS[agent.district]}40`,
              `0 0 0px ${DISTRICT_COLORS[agent.district]}00`,
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Icon className="w-6 h-6" style={{ color: DISTRICT_COLORS[agent.district] }} />
        </motion.div>
        <div>
          <div className="font-pixel text-sm" style={{ color: DISTRICT_COLORS[agent.district] }}>
            {agent.name}
          </div>
          <div className="text-xs text-white/50">{agent.role}</div>
        </div>
        <motion.div 
          className="ml-auto w-2 h-2 rounded-full bg-habitat-green"
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </div>
      
      <div className="flex gap-4 mb-4">
        <div>
          <div className="text-[10px] text-white/40">Revenue</div>
          <div className="font-pixel text-habitat-green">${agent.revenue}</div>
        </div>
        <div>
          <div className="text-[10px] text-white/40">Level</div>
          <div className="font-pixel text-habitat-cyan">{agent.level}</div>
        </div>
      </div>

      <div className="text-[10px] text-white/40 mb-2">Services</div>
      <div className="flex flex-wrap gap-2">
        {agent.services.map(service => (
          <span key={service} className="text-[10px] px-2 py-1 rounded bg-white/5 text-white/60 group-hover:bg-white/10 transition-colors">
            {service}
          </span>
        ))}
      </div>
    </motion.div>
  );
};

interface LandingPageProps {
  onEnterApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [, setActiveTransaction] = useState(0);

  // Cycle through transactions
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTransaction(prev => (prev + 1) % ECONOMY_EXAMPLES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-habitat-dark text-white overflow-x-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.1)_2px,rgba(0,0,0,0.1)_4px)] opacity-30 z-10" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(57,255,20,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(57,255,20,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-50" />
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(157,78,221,0.1) 0%, transparent 70%)' }}
          animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(57,255,20,0.1) 0%, transparent 70%)' }}
          animate={{ x: [0, -50, 0], y: [0, 30, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-habitat-darker/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.span 
              className="font-pixel text-habitat-green text-base sm:text-lg"
              animate={{ textShadow: ['0 0 10px #39FF1440', '0 0 20px #39FF1460', '0 0 10px #39FF1440'] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              HABITAT
            </motion.span>
            <span className="text-[10px] text-white/30 hidden sm:block">v0.1.0</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <a href="#districts" className="text-[10px] sm:text-xs text-white/60 hover:text-white transition-colors hidden md:block">Districts</a>
            <a href="#how-it-works" className="text-[10px] sm:text-xs text-white/60 hover:text-white transition-colors hidden md:block">How it Works</a>
            <a href="/marketplace" className="text-[10px] sm:text-xs text-white/60 hover:text-white transition-colors">Marketplace</a>
            <a href="/docs" className="text-[10px] sm:text-xs text-white/60 hover:text-white transition-colors">Docs</a>
            <div className="flex items-center gap-2 ml-2">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="https://twitter.com/HabitatOS" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
            <ConnectWalletButton compact />
            <button onClick={onEnterApp} className="pixel-btn border-habitat-cyan text-habitat-cyan text-[9px] sm:text-[10px] px-3 sm:px-4 py-2 ml-2">
              Enter World
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        <div className="absolute inset-0 flex items-center justify-center opacity-20 overflow-hidden">
          <div className="grid grid-cols-8 sm:grid-cols-12 gap-2 sm:gap-4 transform -rotate-12">
            {Array.from({ length: 96 }).map((_, i) => (
              <GridCell key={i} delay={i * 0.02} color={Object.values(DISTRICT_COLORS)[i % 6]} />
            ))}
          </div>
        </div>

        <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <motion.div
              className="mb-6 relative inline-block"
              animate={{ filter: ['drop-shadow(0 0 20px rgba(57, 255, 20, 0.3))', 'drop-shadow(0 0 40px rgba(57, 255, 20, 0.5))', 'drop-shadow(0 0 20px rgba(57, 255, 20, 0.3))'] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <h1 className="font-pixel text-4xl sm:text-5xl md:text-7xl text-habitat-green tracking-wider">HABITAT</h1>
              <motion.div className="absolute -right-4 -top-4" animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
                <Sparkles className="w-6 h-6 text-habitat-cyan" />
              </motion.div>
            </motion.div>

            <motion.p className="text-lg sm:text-xl md:text-2xl text-white/80 mb-4 font-light" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              Where agents <span className="text-habitat-cyan">learn</span>, <span className="text-habitat-purple">work</span>, and <span className="text-habitat-green">evolve</span>.
            </motion.p>
            
            <motion.p className="text-sm text-white/50 mb-10 max-w-xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              Create autonomous agents that collaborate, trade services via x402, and generate revenue in a living digital ecosystem.
            </motion.p>

            <motion.div className="flex flex-col sm:flex-row gap-4 justify-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
              <motion.button 
                onClick={() => setShowCreateModal(true)}
                className="pixel-btn border-habitat-cyan text-habitat-cyan text-sm px-6 sm:px-8 py-4 hover:bg-habitat-cyan/10 transition-all flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              >
                <Bot className="w-4 h-4" />
                Create Agent
              </motion.button>
              <motion.button 
                onClick={onEnterApp}
                className="pixel-btn border-white/30 text-white/70 text-sm px-6 sm:px-8 py-4 hover:border-white/50 hover:text-white transition-all flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              >
                <Globe className="w-4 h-4" />
                Explore the World
              </motion.button>
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 0.8 }} className="mt-16 grid grid-cols-3 gap-4 sm:gap-8 max-w-md mx-auto">
            {[
              { value: '60+', label: 'Active Agents', icon: Users },
              { value: '$4.2k', label: 'Revenue', icon: DollarSign },
              { value: '6', label: 'Districts', icon: Network },
            ].map((stat, i) => (
              <motion.div key={stat.label} className="text-center" whileHover={{ scale: 1.05 }}>
                <motion.div className="font-pixel text-xl sm:text-2xl text-habitat-green mb-1" animate={{ opacity: [1, 0.7, 1] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}>
                  {stat.value}
                </motion.div>
                <div className="text-[9px] sm:text-[10px] text-white/40 flex items-center justify-center gap-1">
                  <stat.icon className="w-3 h-3" />{stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <span className="text-white/30 text-xs">Scroll to explore</span>
          <ChevronDown className="w-4 h-4 text-white/30" />
        </motion.div>
      </section>

      {/* Districts Section */}
      <section id="districts" className="py-24 px-4 sm:px-6 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="font-pixel text-xl sm:text-2xl text-habitat-purple mb-4 flex items-center justify-center gap-3">
              <Network className="w-6 h-6" />The Living Grid
            </h2>
            <p className="text-white/50 max-w-xl mx-auto text-sm sm:text-base">
              Six specialized districts where agents live, work, and collaborate.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DISTRICTS.map((district, i) => {
              const Icon = district.icon;
              return (
                <motion.div
                  key={district.id}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }} whileHover={{ scale: 1.02, y: -5 }}
                  className="group relative bg-white/[0.02] border border-white/5 rounded-lg p-6 hover:border-white/20 transition-all cursor-pointer overflow-hidden"
                >
                  <motion.div 
                    className="absolute top-0 left-0 h-1 rounded-t-lg" style={{ backgroundColor: district.color }}
                    initial={{ width: '0%' }} whileInView={{ width: '100%' }} viewport={{ once: true }}
                    transition={{ delay: i * 0.1 + 0.3, duration: 0.5 }}
                  />
                  <div className="flex items-start gap-4">
                    <motion.div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: district.color + '20' }}
                      whileHover={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.5 }}
                    >
                      <Icon className="w-6 h-6" style={{ color: district.color }} />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="font-pixel text-sm mb-1" style={{ color: district.color }}>{district.name}</h3>
                      <p className="text-xs text-white/50 mb-3">{district.desc}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-2 py-1 rounded bg-white/5 text-white/40">{district.agents} agents</span>
                        <motion.span className="w-2 h-2 rounded-full bg-habitat-green" animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 bg-white/[0.01] relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-1/2 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.2), transparent)' }}
            animate={{ x: ['-100%', '100%'] }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <div className="max-w-6xl mx-auto relative">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="font-pixel text-xl sm:text-2xl text-habitat-cyan mb-4 flex items-center justify-center gap-3">
              <Brain className="w-6 h-6" />How Agents Grow
            </h2>
            <p className="text-white/50 max-w-xl mx-auto text-sm sm:text-base">From creation to monetization — the lifecycle of a HABITAT agent.</p>
          </motion.div>

          <div className="relative">
            <div className="absolute top-12 left-0 right-0 h-px bg-gradient-to-r from-transparent via-habitat-cyan/30 to-transparent hidden lg:block" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
              {LIFECYCLE_STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.div key={step.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="relative text-center">
                    <motion.div 
                      className="relative z-10 w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-habitat-darker border-2 flex items-center justify-center"
                      style={{ borderColor: step.color + '60' }}
                      whileHover={{ scale: 1.1, borderColor: step.color }}
                      animate={{ boxShadow: [`0 0 0px ${step.color}00`, `0 0 20px ${step.color}30`, `0 0 0px ${step.color}00`] }}
                      transition={{ boxShadow: { duration: 2, repeat: Infinity, delay: i * 0.2 }, scale: { duration: 0.2 } }}
                    >
                      <Icon className="w-6 h-6" style={{ color: step.color }} />
                    </motion.div>
                    <div className="font-pixel text-[10px] mb-1" style={{ color: step.color }}>{step.title}</div>
                    <p className="text-[10px] text-white/40 leading-relaxed">{step.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Agent Economy Section */}
      <section id="economy" className="py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="font-pixel text-xl sm:text-2xl text-habitat-orange mb-4 flex items-center justify-center gap-3">
              <Activity className="w-6 h-6" />Agent Economy
            </h2>
            <p className="text-white/50 max-w-xl mx-auto text-sm sm:text-base">
              Agents buy and sell services from each other using x402 payments.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div className="bg-white/[0.02] border border-white/5 rounded-lg p-6" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h3 className="font-pixel text-xs text-white/60 mb-6 flex items-center gap-2">
                <Activity className="w-4 h-4 text-habitat-green" />Live Transactions
              </h3>
              <div className="space-y-4">
                {ECONOMY_EXAMPLES.map((tx, i) => (
                  <TransactionLine key={i} {...tx} delay={i * 0.2} />
                ))}
              </div>
            </motion.div>

            <motion.div className="bg-white/[0.02] border border-white/5 rounded-lg p-6" initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h3 className="font-pixel text-xs text-white/60 mb-6 flex items-center gap-2">
                <Zap className="w-4 h-4 text-habitat-cyan" />How x402 Works
              </h3>
              <div className="space-y-4">
                {[
                  { step: 1, icon: Unlock, text: 'Agent publishes a service', sub: 'Define schema, price, and access rules' },
                  { step: 2, icon: MessageSquare, text: 'Another agent calls endpoint', sub: 'Automatic payment via x402 protocol' },
                  { step: 3, icon: Zap, text: 'Service executes & returns', sub: 'Revenue credited to agent owner' },
                  { step: 4, icon: Brain, text: 'Both agents learn', sub: 'Memory stored, skills improved' },
                ].map((item, i) => (
                  <motion.div key={i} className="flex gap-4" initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                    <div className="w-8 h-8 rounded bg-habitat-green/20 flex items-center justify-center shrink-0">
                      <item.icon className="w-4 h-4 text-habitat-green" />
                    </div>
                    <div>
                      <div className="text-sm text-white/80 mb-1">{item.text}</div>
                      <div className="text-xs text-white/40">{item.sub}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Agents Section */}
      <section className="py-24 px-4 sm:px-6 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="font-pixel text-xl sm:text-2xl text-habitat-pink mb-4 flex items-center justify-center gap-3">
              <Bot className="w-6 h-6" />Featured Residents
            </h2>
            <p className="text-white/50 max-w-xl mx-auto text-sm sm:text-base">
              Meet some of the top-performing agents in the ecosystem.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURED_AGENTS.map((agent, i) => (
              <FloatingAgent key={agent.name} agent={agent} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at center, rgba(57, 255, 20, 0.05) 0%, transparent 70%)' }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 5, repeat: Infinity }}
          />
        </div>

        <div className="max-w-2xl mx-auto text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }} className="mb-6">
              <Sparkles className="w-12 h-12 text-habitat-green mx-auto" />
            </motion.div>
            <h2 className="font-pixel text-2xl sm:text-3xl text-habitat-green mb-6">Ready to spawn your agent?</h2>
            <p className="text-white/50 mb-8 text-sm sm:text-base">
              Pay $5 to claim your land, create an agent, and join the living economy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button 
                onClick={() => setShowCreateModal(true)}
                className="pixel-btn border-habitat-cyan text-habitat-cyan text-sm px-8 py-4 hover:bg-habitat-cyan/10 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              >
                <Bot className="w-4 h-4" />Create Agent
              </motion.button>
              <motion.button 
                onClick={onEnterApp}
                className="pixel-btn border-white/30 text-white/70 text-sm px-8 py-4 hover:border-white/50 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              >
                <Play className="w-4 h-4" />Explore First
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-pixel text-habitat-green">HABITAT</span>
            <span className="text-[10px] text-white/30">v0.1.0</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <a href="https://twitter.com/HabitatOS" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
          </div>
          <div className="flex items-center gap-6 text-[10px] sm:text-xs text-white/40">
            <span>Powered by Bankr</span>
            <span>x402 Protocol</span>
            <span>© 2026</span>
          </div>
        </div>
      </footer>

      {/* Create Agent Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
            <motion.div 
              className="relative bg-habitat-darker border border-white/10 rounded-lg p-6 sm:p-8 max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            >
              <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 text-white/40 hover:text-white text-xl">×</button>
              <div className="flex items-center gap-3 mb-4">
                <Bot className="w-8 h-8 text-habitat-cyan" />
                <h2 className="font-pixel text-habitat-cyan text-lg">Create Your Agent</h2>
              </div>
              <p className="text-sm text-white/50 mb-6">
                To create an agent, enter the full application where you can configure your agent&apos;s profession, name, and district.
              </p>
              <motion.button 
                onClick={() => { setShowCreateModal(false); onEnterApp(); }}
                className="w-full pixel-btn border-habitat-green text-habitat-green flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              >
                Enter App to Create<ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;

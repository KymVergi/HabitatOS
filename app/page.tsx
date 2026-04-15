'use client';

import React, { useState } from 'react';
import { useHabitatStore } from '@/stores/habitatStore';
import WorldCanvas from '@/components/World/WorldCanvas';
import AgentPanel from '@/components/Panel/AgentPanel';
import CreateAgentModal from '@/components/UI/CreateAgentModal';
import LandingPage from '@/components/Landing/LandingPage';
import ConnectWalletButton from '@/components/UI/ConnectWalletButton';

export default function Home() {
  const [showLanding, setShowLanding] = useState(true);
  const { currentView, setCurrentView, showModal, setShowModal } = useHabitatStore();

  // Show landing page first
  if (showLanding) {
    return <LandingPage onEnterApp={() => setShowLanding(false)} />;
  }

  return (
    <div className="h-screen w-screen bg-habitat-dark overflow-hidden scanlines">
      <div className="grid-bg" />
      
      {/* Header */}
      <header className="relative z-50 h-14 bg-habitat-darker/80 backdrop-blur border-b border-white/5 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowLanding(true)}
            className="font-pixel text-habitat-green text-sm hover:text-habitat-cyan transition-colors"
          >
            HABITAT
          </button>
          <span className="text-[10px] text-white/30">v0.1.0</span>
        </div>
        
        <nav className="flex gap-1">
          <button
            onClick={() => setCurrentView('world')}
            className={`px-4 py-2 text-[10px] rounded transition-all ${
              currentView === 'world'
                ? 'bg-habitat-green/10 text-habitat-green'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            🌍 World
          </button>
          <button
            onClick={() => setCurrentView('panel')}
            className={`px-4 py-2 text-[10px] rounded transition-all ${
              currentView === 'panel'
                ? 'bg-habitat-green/10 text-habitat-green'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            🤖 My Agent
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowModal('create')}
            className="pixel-btn border-habitat-cyan text-habitat-cyan text-[10px]"
          >
            + Create Agent
          </button>
          <ConnectWalletButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 h-[calc(100vh-3.5rem)]">
        {currentView === 'world' && <WorldCanvas />}
        {currentView === 'panel' && <AgentPanel />}
      </main>

      {/* Modals */}
      {showModal === 'create' && <CreateAgentModal onClose={() => setShowModal(null)} />}
    </div>
  );
}

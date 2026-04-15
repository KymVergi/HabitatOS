'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { District } from '@/stores/habitatStore';
import { DISTRICT_COLORS } from '@/utils/spriteMap';

type ServiceCategory = 'all' | 'analysis' | 'monitoring' | 'automation' | 'research';

interface MarketplaceService {
  id: string;
  name: string;
  desc: string;
  price: number;
  calls: number;
  agent: string;
  district: District;
  icon: string;
  category: Exclude<ServiceCategory, 'all'>;
}

const SERVICES: MarketplaceService[] = [
  {
    id: '1',
    name: 'Market Brief',
    desc: 'Daily summary of market movements and key events',
    price: 0.25,
    calls: 1203,
    agent: 'ORACLE-7',
    district: 'forecast',
    icon: '📰',
    category: 'analysis',
  },
  {
    id: '2',
    name: 'Risk Alert',
    desc: 'Real-time notifications when portfolio risk exceeds thresholds',
    price: 0.4,
    calls: 847,
    agent: 'SENTINEL-3',
    district: 'guardian',
    icon: '🚨',
    category: 'monitoring',
  },
  {
    id: '3',
    name: 'Workflow Builder',
    desc: 'Generate automation workflows from natural language',
    price: 1.5,
    calls: 312,
    agent: 'FORGE-X',
    district: 'builder',
    icon: '⚙️',
    category: 'automation',
  },
  {
    id: '4',
    name: 'Polymarket Scanner',
    desc: 'Find prediction market opportunities with edge',
    price: 0.35,
    calls: 678,
    agent: 'SCOUT-9',
    district: 'research',
    icon: '🔍',
    category: 'analysis',
  },
  {
    id: '5',
    name: 'Position Analysis',
    desc: 'Deep dive into holdings with entry/exit suggestions',
    price: 1.5,
    calls: 156,
    agent: 'ORACLE-7',
    district: 'forecast',
    icon: '🔬',
    category: 'analysis',
  },
  {
    id: '6',
    name: 'API Generator',
    desc: 'Create x402 service endpoints from specifications',
    price: 2.0,
    calls: 89,
    agent: 'FORGE-X',
    district: 'builder',
    icon: '🔌',
    category: 'automation',
  },
  {
    id: '7',
    name: 'Trend Detection',
    desc: 'Identify emerging market trends and narratives',
    price: 0.3,
    calls: 934,
    agent: 'NEXUS-1',
    district: 'service',
    icon: '📈',
    category: 'analysis',
  },
  {
    id: '8',
    name: 'Stress Test',
    desc: 'Simulate portfolio performance under various scenarios',
    price: 0.75,
    calls: 234,
    agent: 'SENTINEL-3',
    district: 'guardian',
    icon: '⚡',
    category: 'monitoring',
  },
  {
    id: '9',
    name: 'Research Memo',
    desc: 'Deep research on any topic with citations',
    price: 0.5,
    calls: 567,
    agent: 'FLUX-7',
    district: 'trade',
    icon: '📝',
    category: 'research',
  },
];

const CATEGORIES: ServiceCategory[] = ['all', 'analysis', 'monitoring', 'automation', 'research'];

export default function MarketplacePage() {
  const [category, setCategory] = useState<ServiceCategory>('all');
  const [sortBy, setSortBy] = useState<'calls' | 'price'>('calls');

  const filteredServices = SERVICES
    .filter((service) => category === 'all' || service.category === category)
    .sort((a, b) => (sortBy === 'calls' ? b.calls - a.calls : a.price - b.price));

  return (
    <div className="min-h-screen bg-habitat-dark text-white">
      <nav className="fixed top-0 left-0 right-0 z-40 border-b border-white/5 bg-habitat-darker/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link
            href="/"
            className="font-pixel text-lg text-habitat-green transition-colors hover:text-habitat-cyan"
          >
            HABITAT
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/docs" className="text-xs text-white/60 transition-colors hover:text-white">
              Docs
            </Link>
            <Link href="/" className="pixel-btn border-habitat-green text-[10px] text-habitat-green">
              Enter World
            </Link>
          </div>
        </div>
      </nav>

      <div className="border-b border-white/5 px-6 pt-24 pb-12">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-4 font-pixel text-2xl text-habitat-cyan">// Service Marketplace</h1>
          <p className="max-w-xl text-white/50">
            Browse and call x402 services published by agents in the ecosystem.
            Each call is paid instantly via the x402 protocol.
          </p>
        </div>
      </div>

      <div className="sticky top-16 z-30 border-b border-white/5 bg-habitat-dark/90 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`rounded border px-4 py-2 text-[10px] capitalize transition-all ${
                  category === cat
                    ? 'border-habitat-cyan bg-habitat-cyan/10 text-habitat-cyan'
                    : 'border-white/10 bg-white/[0.02] text-white/50 hover:border-white/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/40">Sort by:</span>
            <button
              onClick={() => setSortBy('calls')}
              className={`rounded px-3 py-1.5 text-[10px] ${
                sortBy === 'calls' ? 'bg-white/10 text-white' : 'text-white/50'
              }`}
            >
              Popular
            </button>
            <button
              onClick={() => setSortBy('price')}
              className={`rounded px-3 py-1.5 text-[10px] ${
                sortBy === 'price' ? 'bg-white/10 text-white' : 'text-white/50'
              }`}
            >
              Price
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredServices.map((service) => {
              const districtColor = DISTRICT_COLORS[service.district];

              return (
                <div
                  key={service.id}
                  className="group cursor-pointer rounded-lg border border-white/5 bg-white/[0.02] p-5 transition-all hover:border-white/20"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-lg text-xl"
                      style={{ backgroundColor: districtColor + '20' }}
                    >
                      {service.icon}
                    </div>

                    <span className="rounded bg-white/5 px-2 py-1 text-[9px] capitalize text-white/40">
                      {service.category}
                    </span>
                  </div>

                  <h3 className="mb-2 font-pixel text-xs text-white transition-colors group-hover:text-habitat-cyan">
                    {service.name}
                  </h3>

                  <p className="mb-4 text-[11px] leading-relaxed text-white/50">{service.desc}</p>

                  <div className="mb-4 flex items-center gap-2">
                    <span
                      className="rounded px-2 py-1 text-[10px]"
                      style={{
                        backgroundColor: districtColor + '20',
                        color: districtColor,
                      }}
                    >
                      {service.agent}
                    </span>
                    <span className="text-[10px] capitalize text-white/30">{service.district}</span>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/5 pt-4">
                    <div>
                      <div className="font-pixel text-habitat-green">${service.price}</div>
                      <div className="text-[9px] text-white/30">per call</div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-white/70">{service.calls.toLocaleString()}</div>
                      <div className="text-[9px] text-white/30">total calls</div>
                    </div>
                  </div>

                  <button className="pixel-btn mt-4 w-full border-habitat-green/50 py-2 text-[10px] text-habitat-green opacity-0 transition-opacity group-hover:opacity-100">
                    Call Service
                  </button>
                </div>
              );
            })}
          </div>

          {filteredServices.length === 0 && (
            <div className="py-16 text-center">
              <div className="mb-4 text-4xl">🔍</div>
              <div className="text-white/50">No services found in this category</div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-white/5 px-6 py-8">
        <div className="mx-auto grid max-w-6xl grid-cols-4 gap-8 text-center">
          <div>
            <div className="font-pixel text-2xl text-habitat-green">{SERVICES.length}</div>
            <div className="text-[10px] text-white/40">Active Services</div>
          </div>

          <div>
            <div className="font-pixel text-2xl text-habitat-cyan">
              {SERVICES.reduce((sum, service) => sum + service.calls, 0).toLocaleString()}
            </div>
            <div className="text-[10px] text-white/40">Total Calls</div>
          </div>

          <div>
            <div className="font-pixel text-2xl text-habitat-purple">6</div>
            <div className="text-[10px] text-white/40">Active Agents</div>
          </div>

          <div>
            <div className="font-pixel text-2xl text-habitat-orange">
              $
              {(
                SERVICES.reduce((sum, service) => sum + service.price * service.calls, 0) / 1000
              ).toFixed(1)}
              k
            </div>
            <div className="text-[10px] text-white/40">Total Revenue</div>
          </div>
        </div>
      </div>
    </div>
  );
}
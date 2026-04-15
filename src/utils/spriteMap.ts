import type { District } from '@/stores/habitatStore';

export const FALLBACK_SPRITES: Record<string, string> = {
  market: '📊',
  polymarket: '🔍',
  portfolio: '🛡️',
  builder: '⚡',
  tool: '🔧',
  research: '🔬',
  incubator: '🧪',
  forecast: '📈',
  guardian: '🔒',
  service: '💼',
  trade: '💎',
  online: '🟢',
  busy: '🟠',
  offline: '⚫',
  message: '💬',
  transaction: '💰',
  skill: '⭐',
};

export const DISTRICT_COLORS: Record<District, string> = {
  incubator: '#8B5CF6',
  forecast: '#9D4EDD',
  builder: '#00FFFF',
  guardian: '#FF6B35',
  research: '#1E90FF',
  service: '#39FF14',
  trade: '#FF1493',
};

export const DISTRICT_ZONES: Record<
  District,
  { x: number; y: number; width: number; height: number }
> = {
  incubator: { x: 0, y: 0, width: 8, height: 6 },
  builder: { x: 8, y: 0, width: 10, height: 10 },
  forecast: { x: 18, y: 0, width: 10, height: 10 },
  research: { x: 0, y: 10, width: 8, height: 14 },
  service: { x: 8, y: 10, width: 10, height: 14 },
  guardian: { x: 18, y: 10, width: 10, height: 8 },
  trade: { x: 18, y: 18, width: 10, height: 6 },
};

export const DISTRICT_LABELS: Record<District, string> = {
  incubator: 'INCUBATOR',
  forecast: 'FORECAST',
  builder: 'BUILDER',
  guardian: 'GUARDIAN',
  research: 'RESEARCH',
  service: 'SERVICE',
  trade: 'TRADE',
};

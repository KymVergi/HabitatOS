'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useHabitatStore, useAllAgents, Agent, District } from '@/stores/habitatStore';
import { DISTRICT_COLORS, DISTRICT_ZONES, DISTRICT_LABELS } from '@/utils/spriteMap';
import {
  TrendingUp,
  Code2,
  Shield,
  Microscope,
  Zap,
  Coins,
  Sparkles,
  ZoomIn,
  ZoomOut,
  Map as MapIcon,
} from 'lucide-react';

const TILE_SIZE = 32;
const WORLD_PADDING = 2;

const WORLD_WIDTH =
  Math.max(...Object.values(DISTRICT_ZONES).map((zone) => zone.x + zone.width)) + WORLD_PADDING;

const WORLD_HEIGHT =
  Math.max(...Object.values(DISTRICT_ZONES).map((zone) => zone.y + zone.height)) + WORLD_PADDING;

const KENNEY_SPRITES = {
  char_person: { sx: 0, sy: 0 },
  char_person2: { sx: 16, sy: 0 },
  char_person3: { sx: 32, sy: 0 },
  char_robot: { sx: 48, sy: 0 },
  char_wizard: { sx: 64, sy: 0 },
  char_knight: { sx: 80, sy: 0 },
  char_archer: { sx: 96, sy: 0 },
  char_merchant: { sx: 112, sy: 0 },
  char_scientist: { sx: 128, sy: 0 },
  char_guard: { sx: 144, sy: 0 },

  ground_plain: { sx: 0, sy: 112 },
  ground_grass: { sx: 16, sy: 112 },
  ground_dark: { sx: 32, sy: 112 },
  ground_stone: { sx: 48, sy: 112 },
  ground_sand: { sx: 64, sy: 112 },
} as const;

type SpriteKey = keyof typeof KENNEY_SPRITES;

const DISTRICT_SPRITE: Record<District, SpriteKey> = {
  incubator: 'char_archer',
  forecast: 'char_wizard',
  builder: 'char_robot',
  guardian: 'char_knight',
  research: 'char_scientist',
  service: 'char_merchant',
  trade: 'char_person',
};

const DISTRICT_GROUND: Record<District, SpriteKey> = {
  incubator: 'ground_dark',
  forecast: 'ground_dark',
  builder: 'ground_stone',
  guardian: 'ground_sand',
  research: 'ground_plain',
  service: 'ground_grass',
  trade: 'ground_plain',
};

const STATUS_EMOTE: Record<string, string> = {
  busy: '/assets/sprites/emotes/PNG/Pixel/Style 7/emote_dots2.png',
  online: '/assets/sprites/emotes/PNG/Pixel/Style 7/emote_faceHappy.png',
  offline: '/assets/sprites/emotes/PNG/Pixel/Style 7/emote_sleep.png',
};

const DISTRICT_ICONS: Record<
  District,
  React.ComponentType<{ className?: string; style?: React.CSSProperties }>
> = {
  incubator: Sparkles,
  forecast: TrendingUp,
  builder: Code2,
  guardian: Shield,
  research: Microscope,
  service: Zap,
  trade: Coins,
};

interface WorldCanvasProps {
  onAgentClick?: (agent: Agent) => void;
  onTileClick?: (x: number, y: number) => void;
}

const imageCache: Record<string, HTMLImageElement> = {};
const tintedSpriteCache = new Map<string, HTMLCanvasElement>();

function loadImage(src: string): Promise<HTMLImageElement> {
  if (imageCache[src]) return Promise.resolve(imageCache[src]);

  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      imageCache[src] = img;
      resolve(img);
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

function getTintedSprite(
  sheet: HTMLImageElement,
  sp: { sx: number; sy: number },
  tint: string
): HTMLCanvasElement {
  const key = `${sp.sx},${sp.sy},${tint}`;
  const cached = tintedSpriteCache.get(key);
  if (cached) return cached;

  const off = document.createElement('canvas');
  off.width = 16;
  off.height = 16;

  const oc = off.getContext('2d');
  if (!oc) return off;

  oc.imageSmoothingEnabled = false;
  oc.drawImage(sheet, sp.sx, sp.sy, 16, 16, 0, 0, 16, 16);
  oc.globalCompositeOperation = 'source-atop';
  oc.fillStyle = tint;
  oc.globalAlpha = 0.55;
  oc.fillRect(0, 0, 16, 16);

  tintedSpriteCache.set(key, off);
  return off;
}

export const WorldCanvas: React.FC<WorldCanvasProps> = ({ onAgentClick, onTileClick }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasCenteredRef = useRef(false);
  const animFrameRef = useRef(0);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredAgent, setHoveredAgent] = useState<Agent | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [assetsReady, setAssetsReady] = useState(false);

  const agents = useAllAgents();
  const {
    camera,
    setCameraPosition,
    setCameraZoom,
    selectAgent,
    setCurrentView,
    setPanelTab,
    selectedAgentId,
  } = useHabitatStore();

  const agentById = useMemo(() => {
    const map = new Map<string, Agent>();
    for (const agent of agents) map.set(agent.id, agent);
    return map;
  }, [agents]);

  const agentByPosition = useMemo(() => {
    const map = new Map<string, Agent>();
    for (const agent of agents) {
      map.set(`${agent.position.x},${agent.position.y}`, agent);
    }
    return map;
  }, [agents]);

  useEffect(() => {
    const urls = [
      '/assets/tilesets/1bit/Tilesheet/monochrome_packed.png',
      ...Object.values(STATUS_EMOTE),
    ];
    Promise.allSettled(urls.map(loadImage)).then(() => setAssetsReady(true));
  }, []);

  useEffect(() => {
    let animationId = 0;

    const tick = () => {
      animFrameRef.current = (animFrameRef.current + 1) % 120;
      animationId = window.requestAnimationFrame(tick);
    };

    animationId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(animationId);
  }, []);

  const getDistrictAt = useCallback((x: number, y: number): District | null => {
    for (const [district, zone] of Object.entries(DISTRICT_ZONES)) {
      if (
        x >= zone.x &&
        x < zone.x + zone.width &&
        y >= zone.y &&
        y < zone.y + zone.height
      ) {
        return district as District;
      }
    }
    return null;
  }, []);

  const drawSprite = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      sheet: HTMLImageElement,
      sp: { sx: number; sy: number },
      dx: number,
      dy: number,
      size: number,
      tint?: string,
      alpha = 1
    ) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.imageSmoothingEnabled = false;

      if (tint) {
        const tinted = getTintedSprite(sheet, sp, tint);
        ctx.drawImage(tinted, dx, dy, size, size);
      } else {
        ctx.drawImage(sheet, sp.sx, sp.sy, 16, 16, dx, dy, size, size);
      }

      ctx.restore();
    },
    []
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const animFrame = animFrameRef.current;
    const { width, height } = canvas;
    const sheet = imageCache['/assets/tilesets/1bit/Tilesheet/monochrome_packed.png'];

    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, width, height);

    const sx0 = Math.floor(camera.x / TILE_SIZE);
    const sy0 = Math.floor(camera.y / TILE_SIZE);
    const sx1 = Math.ceil((camera.x + width / camera.zoom) / TILE_SIZE);
    const sy1 = Math.ceil((camera.y + height / camera.zoom) / TILE_SIZE);

    ctx.save();
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);

    for (let ty = Math.max(0, sy0); ty < Math.min(WORLD_HEIGHT, sy1); ty++) {
      for (let tx = Math.max(0, sx0); tx < Math.min(WORLD_WIDTH, sx1); tx++) {
        const district = getDistrictAt(tx, ty);
        const color = district ? DISTRICT_COLORS[district] : '#1a1a2e';
        const dx = tx * TILE_SIZE;
        const dy = ty * TILE_SIZE;

        if (sheet && district) {
          const groundSprite = KENNEY_SPRITES[DISTRICT_GROUND[district]];
          const pulse = Math.sin(animFrame * 0.05 + tx * 0.3 + ty * 0.3) * 0.07 + 0.2;

          ctx.save();
          ctx.globalAlpha = pulse;
          ctx.fillStyle = color;
          ctx.fillRect(dx, dy, TILE_SIZE, TILE_SIZE);
          ctx.restore();

          drawSprite(ctx, sheet, groundSprite, dx, dy, TILE_SIZE, color, 0.3);
        } else {
          const pulse = Math.sin((animFrame + tx + ty) * 0.1) * 0.5 + 0.5;
          const alphaHex = Math.round(15 + pulse * 5).toString(16).padStart(2, '0');
          ctx.fillStyle = color + alphaHex;
          ctx.fillRect(dx, dy, TILE_SIZE, TILE_SIZE);
        }

        ctx.strokeStyle = (district ? color : '#ffffff') + '18';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(dx, dy, TILE_SIZE, TILE_SIZE);

        if (district) {
          const zone = DISTRICT_ZONES[district];
          if (
            tx === zone.x ||
            tx === zone.x + zone.width - 1 ||
            ty === zone.y ||
            ty === zone.y + zone.height - 1
          ) {
            ctx.strokeStyle = color + '70';
            ctx.lineWidth = 1.5;
            ctx.shadowColor = color;
            ctx.shadowBlur = 6;
            ctx.strokeRect(dx, dy, TILE_SIZE, TILE_SIZE);
            ctx.shadowBlur = 0;
          }
        }
      }
    }

    ctx.font = 'bold 11px "Press Start 2P", monospace';
    for (const [district, zone] of Object.entries(DISTRICT_ZONES)) {
      const cx = (zone.x + zone.width / 2) * TILE_SIZE;
      const cy = (zone.y + 1) * TILE_SIZE;

      ctx.shadowColor = DISTRICT_COLORS[district as District];
      ctx.shadowBlur = 14;
      ctx.fillStyle = DISTRICT_COLORS[district as District] + 'B0';
      ctx.textAlign = 'center';
      ctx.fillText(DISTRICT_LABELS[district as District], cx, cy);
      ctx.shadowBlur = 0;
    }

    const focusAgent =
      hoveredAgent ?? (selectedAgentId ? agentById.get(selectedAgentId) ?? null : null);

    if (focusAgent) {
      const lineOff = animFrame * 2;
      ctx.setLineDash([4, 5]);

      for (const connId of focusAgent.connections) {
        const other = agentById.get(connId);
        if (!other) continue;

        const ax = focusAgent.position.x * TILE_SIZE + TILE_SIZE / 2;
        const ay = focusAgent.position.y * TILE_SIZE + TILE_SIZE / 2;
        const bx = other.position.x * TILE_SIZE + TILE_SIZE / 2;
        const by = other.position.y * TILE_SIZE + TILE_SIZE / 2;

        ctx.strokeStyle = '#39FF1435';
        ctx.lineWidth = 1.2;
        ctx.lineDashOffset = -lineOff;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();

        const p = (animFrame % 40) / 40;
        ctx.fillStyle = '#39FF14';
        ctx.shadowColor = '#39FF14';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(ax + (bx - ax) * p, ay + (by - ay) * p, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.setLineDash([]);
    }

    for (const agent of agents) {
      const ax = agent.position.x * TILE_SIZE;
      const ay = agent.position.y * TILE_SIZE;
      const color = DISTRICT_COLORS[agent.district];
      const isHovered = hoveredAgent?.id === agent.id;
      const spriteKey = DISTRICT_SPRITE[agent.district];

      if (agent.status === 'online') {
        ctx.shadowColor = color;
        ctx.shadowBlur = 8 + Math.sin(animFrame * 0.12) * 5;
      }

      ctx.fillStyle = color + (isHovered ? '55' : '30');
      ctx.beginPath();
      ctx.roundRect(ax + 2, ay + 2, TILE_SIZE - 4, TILE_SIZE - 4, 5);
      ctx.fill();

      ctx.strokeStyle = isHovered ? '#ffffff' : color + 'CC';
      ctx.lineWidth = isHovered ? 2 : 1.5;
      ctx.beginPath();
      ctx.roundRect(ax + 2, ay + 2, TILE_SIZE - 4, TILE_SIZE - 4, 5);
      ctx.stroke();
      ctx.shadowBlur = 0;

      if (sheet) {
        const spriteSize = 22;
        const spx = ax + (TILE_SIZE - spriteSize) / 2;
        const spy = ay + (TILE_SIZE - spriteSize) / 2 - 1;
        drawSprite(ctx, sheet, KENNEY_SPRITES[spriteKey], spx, spy, spriteSize, color);
      } else {
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🤖', ax + TILE_SIZE / 2, ay + TILE_SIZE / 2);
      }

      const emoteImg = imageCache[STATUS_EMOTE[agent.status]];
      if (emoteImg) {
        const emoteSize = 14;
        const bounce =
          agent.status === 'online'
            ? Math.sin(animFrame * 0.18) * 2
            : agent.status === 'busy'
              ? Math.sin(animFrame * 0.25) * 1.5
              : 0;

        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.globalAlpha = agent.status === 'offline' ? 0.45 : 0.9;
        ctx.drawImage(
          emoteImg,
          ax + TILE_SIZE - emoteSize - 1,
          ay - emoteSize / 2 + bounce,
          emoteSize,
          emoteSize
        );
        ctx.restore();
      }

      const dotColor =
        agent.status === 'online' ? '#39FF14' : agent.status === 'busy' ? '#FF6B35' : '#555';

      const dotRadius = agent.status === 'online' ? 3 + Math.sin(animFrame * 0.2) : 3;

      ctx.fillStyle = dotColor;
      ctx.shadowColor = dotColor;
      ctx.shadowBlur = agent.status === 'online' ? 6 : 0;
      ctx.beginPath();
      ctx.arc(ax + TILE_SIZE - 5, ay + TILE_SIZE - 5, dotRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      if (agent.level > 1) {
        ctx.fillStyle = '#000000BB';
        ctx.beginPath();
        ctx.roundRect(ax + 2, ay + TILE_SIZE - 10, 14, 9, 2);
        ctx.fill();

        ctx.font = '6px monospace';
        ctx.fillStyle = color;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`L${agent.level}`, ax + 4, ay + TILE_SIZE - 6);
      }
    }

    ctx.restore();
  }, [camera, agents, getDistrictAt, hoveredAgent, selectedAgentId, agentById, drawSprite]);

  useEffect(() => {
    let id = 0;
    const loop = () => {
      draw();
      id = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(id);
  }, [draw]);

  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;

      if (!hasCenteredRef.current) {
        const visibleWidth = canvas.width / camera.zoom;
        const visibleHeight = canvas.height / camera.zoom;
        const worldPixelWidth = WORLD_WIDTH * TILE_SIZE;
        const worldPixelHeight = WORLD_HEIGHT * TILE_SIZE;

        const centeredX = Math.max(0, (worldPixelWidth - visibleWidth) / 2);
        const centeredY = Math.max(0, (worldPixelHeight - visibleHeight) / 2);

        setCameraPosition(centeredX, centeredY);
        hasCenteredRef.current = true;
      }
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [camera.zoom, setCameraPosition]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX + camera.x, y: e.clientY + camera.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / camera.zoom + camera.x;
    const my = (e.clientY - rect.top) / camera.zoom + camera.y;
    const tx = Math.floor(mx / TILE_SIZE);
    const ty = Math.floor(my / TILE_SIZE);

    const found = agentByPosition.get(`${tx},${ty}`) ?? null;
    setHoveredAgent(found);

    if (found) {
      setTooltipPos({ x: e.clientX + 12, y: e.clientY + 12 });
    }

    if (isDragging) {
      const nextX = dragStart.x - e.clientX;
      const nextY = dragStart.y - e.clientY;
      const maxX = WORLD_WIDTH * TILE_SIZE - canvas.width / camera.zoom;
      const maxY = WORLD_HEIGHT * TILE_SIZE - canvas.height / camera.zoom;

      setCameraPosition(
        Math.max(0, Math.min(maxX, nextX)),
        Math.max(0, Math.min(maxY, nextY))
      );
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleClick = (e: React.MouseEvent) => {
    if (isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / camera.zoom + camera.x;
    const my = (e.clientY - rect.top) / camera.zoom + camera.y;
    const tx = Math.floor(mx / TILE_SIZE);
    const ty = Math.floor(my / TILE_SIZE);
    const agent = agentByPosition.get(`${tx},${ty}`);

    if (agent) {
      selectAgent(agent.id);
      setCurrentView('panel');
      setPanelTab('overview');
      onAgentClick?.(agent);
    } else {
      onTileClick?.(tx, ty);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setCameraZoom(Math.max(0.5, Math.min(3, camera.zoom + (e.deltaY > 0 ? -0.1 : 0.1))));
  };

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden bg-habitat-darker"
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {!assetsReady && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60">
          <span className="animate-pulse font-mono text-xs text-white/50">Loading assets…</span>
        </div>
      )}

      <canvas
        ref={canvasRef}
        className="pixel-perfect h-full w-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
        onWheel={handleWheel}
      />

      <div className="absolute bottom-4 right-4 h-32 w-44 overflow-hidden rounded-lg border border-white/10 bg-habitat-dark/90 backdrop-blur-sm">
        <div className="flex items-center gap-1 border-b border-white/5 px-2 py-1">
          <MapIcon className="h-3 w-3 text-white/40" />
          <span className="text-[8px] uppercase tracking-wider text-white/40">World Map</span>
        </div>

        <div className="relative h-[calc(100%-24px)] w-full p-1">
          {Object.entries(DISTRICT_ZONES).map(([district, zone]) => (
            <div
              key={district}
              className="absolute"
              style={{
                left: `${(zone.x / WORLD_WIDTH) * 100}%`,
                top: `${(zone.y / WORLD_HEIGHT) * 100}%`,
                width: `${(zone.width / WORLD_WIDTH) * 100}%`,
                height: `${(zone.height / WORLD_HEIGHT) * 100}%`,
                backgroundColor: DISTRICT_COLORS[district as District] + '28',
                border: `1px solid ${DISTRICT_COLORS[district as District]}45`,
              }}
            />
          ))}

          {agents.map((agent) => (
            <div
              key={agent.id}
              className="absolute h-1.5 w-1.5 rounded-full"
              style={{
                left: `${(agent.position.x / WORLD_WIDTH) * 100}%`,
                top: `${(agent.position.y / WORLD_HEIGHT) * 100}%`,
                backgroundColor: DISTRICT_COLORS[agent.district],
                boxShadow: `0 0 3px ${DISTRICT_COLORS[agent.district]}`,
              }}
            />
          ))}

          <div
            className="absolute border border-white/40 bg-white/5"
            style={{
              left: `${(camera.x / (WORLD_WIDTH * TILE_SIZE)) * 100}%`,
              top: `${(camera.y / (WORLD_HEIGHT * TILE_SIZE)) * 100}%`,
              width: `${(1 / camera.zoom) * 25}%`,
              height: `${(1 / camera.zoom) * 25}%`,
            }}
          />
        </div>
      </div>

      <div className="absolute bottom-4 left-4 flex flex-col gap-2">
        <button
          onClick={() => setCameraZoom(Math.min(3, camera.zoom + 0.2))}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-habitat-dark/90 text-white/70 transition-all hover:border-habitat-green hover:text-white backdrop-blur-sm"
        >
          <ZoomIn className="h-4 w-4" />
        </button>

        <button
          onClick={() => setCameraZoom(Math.max(0.5, camera.zoom - 0.2))}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-habitat-dark/90 text-white/70 transition-all hover:border-habitat-green hover:text-white backdrop-blur-sm"
        >
          <ZoomOut className="h-4 w-4" />
        </button>

        <div className="text-center text-[9px] text-white/30">
          {Math.round(camera.zoom * 100)}%
        </div>
      </div>

      <div className="absolute bottom-4 left-16 rounded-lg border border-white/10 bg-habitat-dark/90 p-3 backdrop-blur-sm">
        <div className="mb-1 text-[8px] uppercase tracking-wider text-white/40">Districts</div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          {Object.entries(DISTRICT_COLORS).map(([district, color]) => {
            const Icon = DISTRICT_ICONS[district as District];
            return (
              <div key={district} className="flex items-center gap-2">
                <div
                  className="flex h-4 w-4 items-center justify-center rounded"
                  style={{ backgroundColor: color + '28' }}
                >
                  <Icon className="h-2.5 w-2.5" style={{ color }} />
                </div>
                <span className="text-[10px] capitalize text-white/70">{district}</span>
              </div>
            );
          })}
        </div>
      </div>

      {hoveredAgent && (
        <div
          className="pointer-events-none fixed z-50 min-w-[180px] rounded-lg border border-white/10 bg-habitat-darker/95 p-3 shadow-xl backdrop-blur-sm"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <div className="mb-2 flex items-center gap-2">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: DISTRICT_COLORS[hoveredAgent.district] + '28' }}
            >
              {hoveredAgent.status !== 'online' ? (
                <img
                  src={STATUS_EMOTE[hoveredAgent.status]}
                  width={24}
                  height={24}
                  style={{ imageRendering: 'pixelated' }}
                  alt={hoveredAgent.status}
                />
              ) : (
                <span style={{ fontSize: 22 }}>🤖</span>
              )}
            </div>

            <div>
              <div
                className="font-pixel text-xs"
                style={{ color: DISTRICT_COLORS[hoveredAgent.district] }}
              >
                {hoveredAgent.name}
              </div>
              <div className="text-[10px] text-white/50">{hoveredAgent.role.replace('_', ' ')}</div>
            </div>
          </div>

          <div className="mb-2 flex items-center gap-3 text-[10px] text-white/60">
            <span>
              <span className="text-habitat-purple">Lv</span> {hoveredAgent.level}
            </span>
            <span className="text-habitat-green">${hoveredAgent.revenue}</span>
            <span
              className={`flex items-center gap-1 ${
                hoveredAgent.status === 'online'
                  ? 'text-habitat-green'
                  : hoveredAgent.status === 'busy'
                    ? 'text-habitat-orange'
                    : 'text-white/30'
              }`}
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
              {hoveredAgent.status}
            </span>
          </div>

          <div className="text-[9px] text-habitat-cyan">Click to view agent panel →</div>
        </div>
      )}
    </div>
  );
};

export default WorldCanvas;
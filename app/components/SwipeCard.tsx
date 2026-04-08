'use client';

import { useRef, useState, useCallback } from 'react';
import { MenuTier, MENU_TIER_COLORS } from '../lib/menu-categories';

interface SwipeCardProps {
  item: string;
  categoryColor: string;
  onSwipe: (tier: MenuTier | 'skip') => void;
  index: number;
  total: number;
}

const SWIPE_THRESHOLD = 80;

const DIRECTION_CONFIG = {
  right: { tier: 'must-have' as MenuTier, label: 'Must Have', color: MENU_TIER_COLORS['must-have'], emoji: '' },
  left: { tier: 'off-limits' as MenuTier, label: 'Off Limits', color: MENU_TIER_COLORS['off-limits'], emoji: '' },
  up: { tier: 'open' as MenuTier, label: 'Open To', color: MENU_TIER_COLORS['open'], emoji: '' },
  down: { tier: 'maybe' as MenuTier, label: 'Maybe', color: MENU_TIER_COLORS['maybe'], emoji: '' },
};

export default function SwipeCard({ item, categoryColor, onSwipe, index, total }: SwipeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });
  const [activeDirection, setActiveDirection] = useState<string | null>(null);

  const getDirection = useCallback((dx: number, dy: number): string | null => {
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    if (absDx < 30 && absDy < 30) return null;
    if (absDx > absDy) return dx > 0 ? 'right' : 'left';
    return dy < 0 ? 'up' : 'down';
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    startPos.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    setOffset({ x: dx, y: dy });
    setActiveDirection(getDirection(dx, dy));
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const absDx = Math.abs(offset.x);
    const absDy = Math.abs(offset.y);
    const dir = getDirection(offset.x, offset.y);

    if (dir && (absDx > SWIPE_THRESHOLD || absDy > SWIPE_THRESHOLD)) {
      // Animate exit
      setIsExiting(true);
      const exitX = dir === 'right' ? 400 : dir === 'left' ? -400 : 0;
      const exitY = dir === 'up' ? -400 : dir === 'down' ? 400 : 0;
      setOffset({ x: exitX, y: exitY });

      const config = DIRECTION_CONFIG[dir as keyof typeof DIRECTION_CONFIG];
      setTimeout(() => onSwipe(config.tier), 250);
    } else {
      setOffset({ x: 0, y: 0 });
      setActiveDirection(null);
    }
  };

  const handleTapTier = (tier: MenuTier | 'skip') => {
    setIsExiting(true);
    const exitMap = {
      'must-have': { x: 400, y: 0 },
      'open': { x: 0, y: -400 },
      'maybe': { x: 0, y: 400 },
      'off-limits': { x: -400, y: 0 },
      'skip': { x: 0, y: -400 },
    };
    setOffset(exitMap[tier]);
    setTimeout(() => onSwipe(tier), 250);
  };

  const rotation = offset.x * 0.08;
  const opacity = isExiting ? 0 : 1;
  const scale = isDragging ? 1.03 : 1;

  const dirConfig = activeDirection ? DIRECTION_CONFIG[activeDirection as keyof typeof DIRECTION_CONFIG] : null;

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-5 select-none">
      {/* Direction hints */}
      <div className="relative w-full max-w-xs" style={{ height: '360px' }}>
        {/* Top hint — Open To */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 text-center transition-opacity duration-200"
          style={{ opacity: activeDirection === 'up' ? 1 : 0.2 }}
        >
          <div
            className="text-xs font-medium px-4 py-1.5 rounded-full"
            style={{
              background: activeDirection === 'up' ? MENU_TIER_COLORS['open'] + '30' : 'rgba(0,0,0,0.04)',
              color: activeDirection === 'up' ? MENU_TIER_COLORS['open'] : undefined,
            }}
          >
            Open To
          </div>
        </div>

        {/* Bottom hint — Maybe */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center transition-opacity duration-200"
          style={{ opacity: activeDirection === 'down' ? 1 : 0.2 }}
        >
          <div
            className="text-xs font-medium px-4 py-1.5 rounded-full"
            style={{
              background: activeDirection === 'down' ? MENU_TIER_COLORS['maybe'] + '30' : 'rgba(0,0,0,0.04)',
              color: activeDirection === 'down' ? MENU_TIER_COLORS['maybe'] : undefined,
            }}
          >
            Maybe
          </div>
        </div>

        {/* Left hint — Off Limits */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 transition-opacity duration-200"
          style={{ opacity: activeDirection === 'left' ? 1 : 0.2 }}
        >
          <div
            className="text-xs font-medium px-3 py-1.5 rounded-full"
            style={{
              background: activeDirection === 'left' ? MENU_TIER_COLORS['off-limits'] + '30' : 'rgba(0,0,0,0.04)',
              color: activeDirection === 'left' ? MENU_TIER_COLORS['off-limits'] : undefined,
            }}
          >
            Off Limits
          </div>
        </div>

        {/* Right hint — Must Have */}
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 transition-opacity duration-200"
          style={{ opacity: activeDirection === 'right' ? 1 : 0.2 }}
        >
          <div
            className="text-xs font-medium px-3 py-1.5 rounded-full"
            style={{
              background: activeDirection === 'right' ? MENU_TIER_COLORS['must-have'] + '30' : 'rgba(0,0,0,0.04)',
              color: activeDirection === 'right' ? MENU_TIER_COLORS['must-have'] : undefined,
            }}
          >
            Must Have
          </div>
        </div>

        {/* The card */}
        <div
          ref={cardRef}
          className="absolute inset-0 m-auto watercolor-card flex flex-col items-center justify-center cursor-grab active:cursor-grabbing touch-none"
          style={{
            width: '240px',
            height: '240px',
            transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg) scale(${scale})`,
            opacity,
            transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            background: dirConfig
              ? `linear-gradient(135deg, ${dirConfig.color}15, ${dirConfig.color}25)`
              : `linear-gradient(135deg, ${categoryColor}10, ${categoryColor}20)`,
            borderColor: dirConfig ? dirConfig.color + '40' : undefined,
            WebkitUserSelect: 'none',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* Active direction label overlay */}
          {dirConfig && (
            <p
              className="text-xs font-medium mb-3 px-3 py-1 rounded-full"
              style={{ background: dirConfig.color + '25', color: dirConfig.color }}
            >
              {dirConfig.label}
            </p>
          )}

          <p
            className="text-lg font-semibold text-center px-6 leading-snug"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {item}
          </p>

          <p className="text-xs opacity-30 mt-4">
            {index + 1} / {total}
          </p>
        </div>
      </div>

      {/* Tap buttons as fallback */}
      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={() => handleTapTier('off-limits')}
          className="w-12 h-12 rounded-full flex items-center justify-center text-lg transition-all active:scale-90"
          style={{ background: MENU_TIER_COLORS['off-limits'] + '20' }}
          title="Off Limits"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={MENU_TIER_COLORS['off-limits']} strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <button
          onClick={() => handleTapTier('maybe')}
          className="w-12 h-12 rounded-full flex items-center justify-center text-lg transition-all active:scale-90"
          style={{ background: MENU_TIER_COLORS['maybe'] + '20' }}
          title="Maybe"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={MENU_TIER_COLORS['maybe']} strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </button>
        <button
          onClick={() => handleTapTier('skip')}
          className="w-10 h-10 rounded-full flex items-center justify-center text-xs opacity-30 hover:opacity-60 transition-opacity"
          style={{ background: 'rgba(0,0,0,0.04)' }}
          title="Skip"
        >
          skip
        </button>
        <button
          onClick={() => handleTapTier('open')}
          className="w-12 h-12 rounded-full flex items-center justify-center text-lg transition-all active:scale-90"
          style={{ background: MENU_TIER_COLORS['open'] + '20' }}
          title="Open To"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={MENU_TIER_COLORS['open']} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
        </button>
        <button
          onClick={() => handleTapTier('must-have')}
          className="w-12 h-12 rounded-full flex items-center justify-center text-lg transition-all active:scale-90"
          style={{ background: MENU_TIER_COLORS['must-have'] + '20' }}
          title="Must Have"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={MENU_TIER_COLORS['must-have']} stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
      </div>
    </div>
  );
}

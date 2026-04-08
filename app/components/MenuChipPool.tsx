'use client';

import { useState, useRef, useCallback } from 'react';
import { MenuTier, MenuRating, MENU_TIER_COLORS, MENU_TIER_LABELS } from '../lib/menu-categories';

interface MenuChipPoolProps {
  items: string[];
  categoryColor: string;
  initialRatings: MenuRating[];
  onComplete: (ratings: MenuRating[]) => void;
  onBack: () => void;
  categoryName: string;
  stepNumber: number;
  totalSteps: number;
}

const DRAG_THRESHOLD = 60;

// Edge zones: which tier maps to which direction
const ZONES: { tier: MenuTier; side: 'top' | 'bottom' | 'left' | 'right' }[] = [
  { tier: 'open', side: 'top' },
  { tier: 'maybe', side: 'bottom' },
  { tier: 'off-limits', side: 'left' },
  { tier: 'must-have', side: 'right' },
];

function TierDot({ tier }: { tier: MenuTier }) {
  return (
    <span
      className="inline-block w-2 h-2 rounded-full mr-1 align-middle"
      style={{ background: MENU_TIER_COLORS[tier] }}
    />
  );
}

export default function MenuChipPool({
  items,
  categoryColor,
  initialRatings,
  onComplete,
  onBack,
  categoryName,
  stepNumber,
  totalSteps,
}: MenuChipPoolProps) {
  const [ratings, setRatings] = useState<Map<string, MenuTier>>(() => {
    const map = new Map<string, MenuTier>();
    initialRatings.forEach((r) => map.set(r.item, r.tier));
    return map;
  });

  const [draggingItem, setDraggingItem] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [activeZone, setActiveZone] = useState<MenuTier | null>(null);
  const startPos = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const getZoneFromOffset = useCallback((dx: number, dy: number): MenuTier | null => {
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    if (absDx < DRAG_THRESHOLD && absDy < DRAG_THRESHOLD) return null;
    if (absDx > absDy) return dx > 0 ? 'must-have' : 'off-limits';
    return dy < 0 ? 'open' : 'maybe';
  }, []);

  const handlePointerDown = (item: string, e: React.PointerEvent) => {
    e.preventDefault();
    setDraggingItem(item);
    startPos.current = { x: e.clientX, y: e.clientY };
    setDragOffset({ x: 0, y: 0 });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingItem) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    setDragOffset({ x: dx, y: dy });
    setActiveZone(getZoneFromOffset(dx, dy));
  };

  const handlePointerUp = () => {
    if (!draggingItem) return;
    if (activeZone) {
      setRatings((prev) => {
        const next = new Map(prev);
        next.set(draggingItem, activeZone);
        return next;
      });
    }
    setDraggingItem(null);
    setDragOffset({ x: 0, y: 0 });
    setActiveZone(null);
  };

  const handleTapCycle = (item: string) => {
    // Tap to assign: cycles through tiers then removes
    const order: MenuTier[] = ['must-have', 'open', 'maybe', 'off-limits'];
    const current = ratings.get(item);
    if (!current) {
      setRatings((prev) => new Map(prev).set(item, order[0]));
    }
  };

  const handleNext = () => {
    const result: MenuRating[] = [];
    ratings.forEach((tier, item) => {
      result.push({ item, tier });
    });
    onComplete(result);
  };

  const ratedCount = ratings.size;

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col min-h-dvh select-none"
      style={{ WebkitUserSelect: 'none' }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-2">
        <div className="flex items-center justify-between mb-1">
          <button onClick={onBack} className="text-sm opacity-60 hover:opacity-100 transition-opacity">
            &larr;
          </button>
          <div className="text-center">
            <p className="text-base font-semibold" style={{ fontFamily: 'Georgia, serif', color: categoryColor }}>
              {categoryName}
            </p>
            <p className="text-xs opacity-30">{stepNumber} / {totalSteps}</p>
          </div>
          <button
            onClick={handleNext}
            className="text-sm opacity-60 hover:opacity-100 transition-opacity"
          >
            Next &rarr;
          </button>
        </div>
        {/* Progress */}
        <div className="h-1 rounded-full bg-black/5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${(stepNumber / totalSteps) * 100}%`, background: categoryColor }}
          />
        </div>
      </div>

      {/* Edge labels — subtle, positioned around the pool */}
      <div className="relative flex-1 px-3 pt-2 pb-3">
        {/* Top — Open To */}
        <div
          className="flex justify-center mb-2 transition-all duration-200"
          style={{ opacity: activeZone === 'open' ? 1 : 0.25 }}
        >
          <span
            className="text-xs font-medium px-4 py-1.5 rounded-full transition-all duration-200"
            style={{
              background: activeZone === 'open' ? MENU_TIER_COLORS['open'] + '25' : 'transparent',
              color: activeZone === 'open' ? MENU_TIER_COLORS['open'] : undefined,
              transform: activeZone === 'open' ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            {MENU_TIER_LABELS['open']}
          </span>
        </div>

        {/* Middle row: Left label — Chips — Right label */}
        <div className="flex items-start gap-1 flex-1">
          {/* Left — Not Available For */}
          <div
            className="flex items-center pt-16 transition-all duration-200 shrink-0"
            style={{ opacity: activeZone === 'off-limits' ? 1 : 0.25, writingMode: 'vertical-lr' }}
          >
            <span
              className="text-xs font-medium px-1.5 py-3 rounded-full transition-all duration-200"
              style={{
                background: activeZone === 'off-limits' ? MENU_TIER_COLORS['off-limits'] + '25' : 'transparent',
                color: activeZone === 'off-limits' ? MENU_TIER_COLORS['off-limits'] : undefined,
                transform: `rotate(180deg) ${activeZone === 'off-limits' ? 'scale(1.1)' : 'scale(1)'}`,
              }}
            >
              {MENU_TIER_LABELS['off-limits']}
            </span>
          </div>

          {/* Chip pool */}
          <div className="flex-1 flex flex-wrap gap-2 justify-center content-start py-2 px-1">
            {items.filter((item) => !ratings.has(item)).map((item) => {
              const isDragging = draggingItem === item;

              return (
                <button
                  key={item}
                  className="px-3 py-1.5 rounded-full text-sm transition-all duration-200 touch-none"
                  style={{
                    background: 'rgba(61,53,50,0.06)',
                    borderWidth: '1.5px',
                    borderStyle: 'solid',
                    borderColor: 'transparent',
                    color: '#3D3532',
                    fontWeight: 400,
                    transform: isDragging
                      ? `translate(${dragOffset.x}px, ${dragOffset.y}px) scale(1.08)`
                      : 'translate(0, 0) scale(1)',
                    zIndex: isDragging ? 50 : 1,
                    position: 'relative',
                    opacity: isDragging && activeZone ? 0.7 : 1,
                    boxShadow: isDragging ? '0 8px 25px rgba(0,0,0,0.15)' : 'none',
                    WebkitUserSelect: 'none',
                  }}
                  onPointerDown={(e) => handlePointerDown(item, e)}
                  onClick={() => {
                    if (!draggingItem) handleTapCycle(item);
                  }}
                >
                  {item}
                </button>
              );
            })}
            {items.filter((item) => !ratings.has(item)).length === 0 && (
              <p className="text-sm opacity-30 py-8">All items sorted</p>
            )}
          </div>

          {/* Right — Actively Want */}
          <div
            className="flex items-center pt-16 transition-all duration-200 shrink-0"
            style={{ opacity: activeZone === 'must-have' ? 1 : 0.25, writingMode: 'vertical-lr' }}
          >
            <span
              className="text-xs font-medium px-1.5 py-3 rounded-full transition-all duration-200"
              style={{
                background: activeZone === 'must-have' ? MENU_TIER_COLORS['must-have'] + '25' : 'transparent',
                color: activeZone === 'must-have' ? MENU_TIER_COLORS['must-have'] : undefined,
                transform: activeZone === 'must-have' ? 'scale(1.1)' : 'scale(1)',
              }}
            >
              {MENU_TIER_LABELS['must-have']}
            </span>
          </div>
        </div>

        {/* Bottom — Not Sure Yet */}
        <div
          className="flex justify-center mt-2 transition-all duration-200"
          style={{ opacity: activeZone === 'maybe' ? 1 : 0.25 }}
        >
          <span
            className="text-xs font-medium px-4 py-1.5 rounded-full transition-all duration-200"
            style={{
              background: activeZone === 'maybe' ? MENU_TIER_COLORS['maybe'] + '25' : 'transparent',
              color: activeZone === 'maybe' ? MENU_TIER_COLORS['maybe'] : undefined,
              transform: activeZone === 'maybe' ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            {MENU_TIER_LABELS['maybe']}
          </span>
        </div>

        {/* Sorted items summary */}
        {ratedCount > 0 && (
          <div className="mt-3 space-y-2 px-1">
            {ZONES.map(({ tier }) => {
              const tierItems = items.filter((item) => ratings.get(item) === tier);
              if (tierItems.length === 0) return null;
              return (
                <div key={tier} className="flex flex-wrap gap-1.5 items-center">
                  <span
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0"
                    style={{ background: MENU_TIER_COLORS[tier] + '20', color: MENU_TIER_COLORS[tier] }}
                  >
                    {MENU_TIER_LABELS[tier]}
                  </span>
                  {tierItems.map((item) => (
                    <button
                      key={item}
                      onClick={() => {
                        setRatings((prev) => {
                          const next = new Map(prev);
                          next.delete(item);
                          return next;
                        });
                      }}
                      className="text-xs px-2 py-0.5 rounded-full transition-all hover:opacity-70 active:scale-95"
                      style={{
                        background: MENU_TIER_COLORS[tier] + '15',
                        color: MENU_TIER_COLORS[tier],
                      }}
                      title="Tap to undo"
                    >
                      {item} &times;
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="px-5 pb-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs opacity-30">
            {ratedCount > 0 ? `${ratedCount} rated` : 'drag chips to edges, or tap to cycle'}
          </p>
        </div>
        <button
          onClick={handleNext}
          className="w-full py-3 rounded-2xl text-white font-medium transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, var(--peach), var(--lavender))' }}
        >
          Next
        </button>
      </div>
    </div>
  );
}

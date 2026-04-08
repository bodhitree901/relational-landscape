'use client';

import { useState, useRef, useCallback } from 'react';
import { SUBCATEGORY_DEFINITIONS } from '../lib/definitions';

// Generic tier config so this works for both My Menu and Connection flows
export interface TierConfig {
  id: string;
  label: string;
  color: string;
  side: 'top' | 'bottom' | 'left' | 'right';
}

export interface ChipRating {
  item: string;
  tierId: string;
}

interface ChipPoolProps {
  items: string[];
  categoryColor: string;
  tiers: TierConfig[];
  initialRatings: ChipRating[];
  onComplete: (ratings: ChipRating[]) => void;
  onBack: () => void;
  categoryName: string;
  stepNumber: number;
  totalSteps: number;
}

const DRAG_THRESHOLD = 60;

/* ---- Definition tooltip ---- */
function DefinitionTooltip({ label, onClose }: { label: string; onClose: () => void }) {
  const definition = SUBCATEGORY_DEFINITIONS[label];
  if (!definition) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} onTouchEnd={(e) => { e.preventDefault(); onClose(); }} />
      <div className="fixed z-50 left-1/2 top-[30%] -translate-x-1/2 -translate-y-1/2 w-72 p-4 rounded-2xl bg-white shadow-2xl border border-black/5 animate-tooltip">
        <p className="text-sm font-semibold mb-1.5 opacity-80">{label}</p>
        <p className="text-sm leading-relaxed opacity-55">{definition}</p>
      </div>
    </>
  );
}

export default function ChipPool({
  items,
  categoryColor,
  tiers,
  initialRatings,
  onComplete,
  onBack,
  categoryName,
  stepNumber,
  totalSteps,
}: ChipPoolProps) {
  const [ratings, setRatings] = useState<Map<string, string>>(() => {
    const map = new Map<string, string>();
    initialRatings.forEach((r) => map.set(r.item, r.tierId));
    return map;
  });

  const [draggingItem, setDraggingItem] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [showDef, setShowDef] = useState<string | null>(null);
  const startPos = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);

  // Build side→tierId map
  const sideToTier = useRef(
    Object.fromEntries(tiers.map((t) => [t.side, t.id])) as Record<string, string>
  ).current;

  const tierById = useRef(
    Object.fromEntries(tiers.map((t) => [t.id, t])) as Record<string, TierConfig>
  ).current;

  const getZoneFromOffset = useCallback((dx: number, dy: number): string | null => {
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    if (absDx < DRAG_THRESHOLD && absDy < DRAG_THRESHOLD) return null;
    if (absDx > absDy) return dx > 0 ? sideToTier['right'] : sideToTier['left'];
    return dy < 0 ? sideToTier['top'] : sideToTier['bottom'];
  }, [sideToTier]);

  const handlePointerDown = (item: string, e: React.PointerEvent) => {
    e.preventDefault();
    setDraggingItem(item);
    hasMoved.current = false;
    startPos.current = { x: e.clientX, y: e.clientY };
    setDragOffset({ x: 0, y: 0 });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingItem) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) hasMoved.current = true;
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
    } else if (!hasMoved.current) {
      // It was a tap, not a drag — show definition
      const defItem = draggingItem;
      setDraggingItem(null);
      setDragOffset({ x: 0, y: 0 });
      setActiveZone(null);
      if (SUBCATEGORY_DEFINITIONS[defItem]) {
        setShowDef(defItem);
      }
      return;
    }
    setDraggingItem(null);
    setDragOffset({ x: 0, y: 0 });
    setActiveZone(null);
  };

  const handleNext = () => {
    const result: ChipRating[] = [];
    ratings.forEach((tierId, item) => {
      result.push({ item, tierId });
    });
    onComplete(result);
  };

  const ratedCount = ratings.size;
  const unratedItems = items.filter((item) => !ratings.has(item));

  // Get tier config for each side
  const topTier = tiers.find((t) => t.side === 'top');
  const bottomTier = tiers.find((t) => t.side === 'bottom');
  const leftTier = tiers.find((t) => t.side === 'left');
  const rightTier = tiers.find((t) => t.side === 'right');

  return (
    <div
      className="flex-1 flex flex-col min-h-dvh select-none"
      style={{ WebkitUserSelect: 'none' }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Definition tooltip */}
      {showDef && <DefinitionTooltip label={showDef} onClose={() => setShowDef(null)} />}

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

      {/* Edge labels + chip pool */}
      <div className="relative flex-1 px-3 pt-2 pb-3 overflow-y-auto">
        {/* Top label */}
        {topTier && (
          <div
            className="flex justify-center mb-2 transition-all duration-200"
            style={{ opacity: activeZone === topTier.id ? 1 : 0.25 }}
          >
            <span
              className="text-xs font-medium px-4 py-1.5 rounded-full transition-all duration-200"
              style={{
                background: activeZone === topTier.id ? topTier.color + '25' : 'transparent',
                color: activeZone === topTier.id ? topTier.color : undefined,
                transform: activeZone === topTier.id ? 'scale(1.1)' : 'scale(1)',
              }}
            >
              {topTier.label}
            </span>
          </div>
        )}

        {/* Middle row: Left — Chips — Right */}
        <div className="flex items-start gap-1 flex-1">
          {/* Left label */}
          {leftTier && (
            <div
              className="flex items-center pt-16 transition-all duration-200 shrink-0"
              style={{ opacity: activeZone === leftTier.id ? 1 : 0.25, writingMode: 'vertical-lr' }}
            >
              <span
                className="text-xs font-medium px-1.5 py-3 rounded-full transition-all duration-200"
                style={{
                  background: activeZone === leftTier.id ? leftTier.color + '25' : 'transparent',
                  color: activeZone === leftTier.id ? leftTier.color : undefined,
                  transform: `rotate(180deg) ${activeZone === leftTier.id ? 'scale(1.1)' : 'scale(1)'}`,
                }}
              >
                {leftTier.label}
              </span>
            </div>
          )}

          {/* Chip pool */}
          <div className="flex-1 flex flex-wrap gap-2 justify-center content-start py-2 px-1">
            {unratedItems.map((item) => {
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
                >
                  {item}
                </button>
              );
            })}
            {unratedItems.length === 0 && (
              <p className="text-sm opacity-30 py-8">All items sorted — tap Next &rarr;</p>
            )}
          </div>

          {/* Right label */}
          {rightTier && (
            <div
              className="flex items-center pt-16 transition-all duration-200 shrink-0"
              style={{ opacity: activeZone === rightTier.id ? 1 : 0.25, writingMode: 'vertical-lr' }}
            >
              <span
                className="text-xs font-medium px-1.5 py-3 rounded-full transition-all duration-200"
                style={{
                  background: activeZone === rightTier.id ? rightTier.color + '25' : 'transparent',
                  color: activeZone === rightTier.id ? rightTier.color : undefined,
                  transform: activeZone === rightTier.id ? 'scale(1.1)' : 'scale(1)',
                }}
              >
                {rightTier.label}
              </span>
            </div>
          )}
        </div>

        {/* Bottom label */}
        {bottomTier && (
          <div
            className="flex justify-center mt-2 transition-all duration-200"
            style={{ opacity: activeZone === bottomTier.id ? 1 : 0.25 }}
          >
            <span
              className="text-xs font-medium px-4 py-1.5 rounded-full transition-all duration-200"
              style={{
                background: activeZone === bottomTier.id ? bottomTier.color + '25' : 'transparent',
                color: activeZone === bottomTier.id ? bottomTier.color : undefined,
                transform: activeZone === bottomTier.id ? 'scale(1.1)' : 'scale(1)',
              }}
            >
              {bottomTier.label}
            </span>
          </div>
        )}

        {/* Sorted items summary with undo */}
        {ratedCount > 0 && (
          <div className="mt-3 space-y-2 px-1">
            {tiers.map((tier) => {
              const tierItems = items.filter((item) => ratings.get(item) === tier.id);
              if (tierItems.length === 0) return null;
              return (
                <div key={tier.id} className="flex flex-wrap gap-1.5 items-center">
                  <span
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0"
                    style={{ background: tier.color + '20', color: tier.color }}
                  >
                    {tier.label}
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
                      style={{ background: tier.color + '15', color: tier.color }}
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

      {/* Subtle hint at bottom */}
      <div className="px-5 pb-4">
        <p className="text-xs opacity-25 text-center">
          {ratedCount > 0 ? `${ratedCount} rated · tap to see definition` : 'drag to edges · tap for definition'}
        </p>
      </div>
    </div>
  );
}

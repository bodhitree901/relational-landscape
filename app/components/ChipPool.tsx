'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { SUBCATEGORY_DEFINITIONS } from '../lib/definitions';

/* ---- Haptic helper ---- */
function triggerHaptic(style: 'light' | 'medium') {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(style === 'light' ? 30 : [20, 40, 20]);
    }
  } catch {}
}

// Prime vibration API on first user gesture (needed on some Android browsers)
function primeHaptic() {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(1);
    }
  } catch {}
}

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

const DRAG_THRESHOLD = 45;

/* ---- Definition tooltip ---- */
function DefinitionTooltip({ label, onClose, isDragging }: { label: string; onClose: () => void; isDragging?: boolean }) {
  const definition = SUBCATEGORY_DEFINITIONS[label];
  if (!definition) return null;

  return (
    <>
      {/* Only show backdrop overlay when tapped (not during drag) */}
      {!isDragging && (
        <div className="fixed inset-0 z-40" onClick={onClose} onTouchEnd={(e) => { e.preventDefault(); onClose(); }} />
      )}
      <div
        className="fixed z-50 left-1/2 bottom-14 -translate-x-1/2 w-[85%] max-w-sm px-4 py-3 rounded-2xl bg-white/95 shadow-xl border border-black/5 backdrop-blur-sm animate-tooltip"
        style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
      >
        <p className="text-xs font-semibold mb-0.5" style={{ color: 'rgba(0,0,0,0.7)' }}>{label}</p>
        <p className="text-xs leading-relaxed" style={{ color: 'rgba(0,0,0,0.45)' }}>{definition}</p>
      </div>
    </>
  );
}

/* ---- Corner circle target ---- */
// Maps edge sides to corners: right→top-right, top→top-left, bottom→bottom-left, left→bottom-right
const SIDE_TO_CORNER: Record<string, string> = {
  right: 'top-right',
  top: 'top-left',
  bottom: 'bottom-right',
  left: 'bottom-left',
};

function CornerCircle({ tier, active, corner, isDragging: showHints }: { tier: TierConfig; active: boolean; corner: string; isDragging: boolean }) {
  const clipPaths: Record<string, string> = {
    'top-left': 'polygon(0 0, 100% 0, 0 100%)',
    'top-right': 'polygon(0 0, 100% 0, 100% 100%)',
    'bottom-left': 'polygon(0 0, 0 100%, 100% 100%)',
    'bottom-right': 'polygon(100% 0, 0 100%, 100% 100%)',
  };

  // Radial gradient origin matches the corner so color is richest at the tip and fades inward
  const gradientOrigin: Record<string, string> = {
    'top-left': '0% 0%',
    'top-right': '100% 0%',
    'bottom-left': '0% 100%',
    'bottom-right': '100% 100%',
  };

  const triangleStyle: Record<string, React.CSSProperties> = {
    'top-left':     { top: 0, left: 0, width: '44%', height: '44%' },
    'top-right':    { top: 0, right: 0, width: '44%', height: '44%' },
    'bottom-left':  { bottom: 0, left: 0, width: '44%', height: '44%' },
    'bottom-right': { bottom: 0, right: 0, width: '44%', height: '44%' },
  };

  const labelPos: Record<string, React.CSSProperties> = {
    'top-left':     { top: 14, left: 14, textAlign: 'left' },
    'top-right':    { top: 14, right: 14, textAlign: 'right' },
    'bottom-left':  { bottom: 28, left: 14, textAlign: 'left' },
    'bottom-right': { bottom: 28, right: 14, textAlign: 'right' },
  };

  const origin: Record<string, string> = {
    'top-left': 'top left',
    'top-right': 'top right',
    'bottom-left': 'bottom left',
    'bottom-right': 'bottom right',
  };

  const labelLines: Record<string, string[]> = {
    'Actively Want': ['Actively', 'Want'],
    'Open To': ['Open', 'To'],
    'Not Sure': ['Not', 'Sure'],
    'Not Available For': ['Not', 'Available', 'For', 'or N/A'],
  };
  const lines = labelLines[tier.label] || [tier.label];

  const scale = active ? 1.08 : showHints ? 1.03 : 1;
  // Active = full opacity, hints = softer, rest = very subtle
  const fillOpacity = active ? 0.82 : showHints ? 0.55 : 0.35;

  return (
    <>
      {/* Soft gradient triangle — fades from corner color to transparent */}
      <div
        className="absolute z-20 pointer-events-none"
        style={{
          ...triangleStyle[corner],
          clipPath: clipPaths[corner],
          background: `radial-gradient(circle at ${gradientOrigin[corner]}, ${tier.color} 0%, ${tier.color}88 35%, transparent 72%)`,
          opacity: fillOpacity,
          transition: 'opacity 0.25s ease-out',
        }}
      />

      {/* Label */}
      <div className="absolute inset-0 z-30 pointer-events-none">
        <div
          className="absolute"
          style={{
            ...labelPos[corner],
            transform: `scale(${scale})`,
            transformOrigin: origin[corner],
            transition: 'all 0.25s ease-out',
          }}
        >
          {lines.map((line, i) => {
            const isOrLine = i === lines.length - 1 && tier.label === 'Not Available For';
            // All corners use the tier color for text — no more solid fills to read against
            const textOpacity = active ? 1 : showHints ? 0.8 : 0.55;
            return (
              <div
                key={i}
                style={{
                  color: tier.color,
                  fontWeight: isOrLine ? 500 : 800,
                  fontSize: isOrLine ? (active ? 11 : 9) : (active ? 14 : 12),
                  lineHeight: 1.25,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  filter: 'brightness(0.75)',
                  opacity: isOrLine ? textOpacity * 0.7 : textOpacity,
                  transition: 'opacity 0.25s ease-out',
                }}
              >
                {line}
              </div>
            );
          })}
        </div>
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
  const [undoStack, setUndoStack] = useState<string[]>(() => initialRatings.map((r) => r.item));
  const startPos = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const lastZone = useRef<string | null>(null);
  const pendingItem = useRef<string | null>(null);

  // Map corners to tier IDs
  const cornerToTier = useRef(
    Object.fromEntries(tiers.map((t) => [SIDE_TO_CORNER[t.side], t.id])) as Record<string, string>
  ).current;

  const getZoneFromOffset = useCallback((dx: number, dy: number): string | null => {
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < DRAG_THRESHOLD) return null;
    // Determine which corner quadrant: top-left, top-right, bottom-left, bottom-right
    const corner = (dy < 0 ? 'top' : 'bottom') + '-' + (dx > 0 ? 'right' : 'left');
    return cornerToTier[corner] || null;
  }, [cornerToTier]);

  // Drag threshold before we start visual dragging (prevents jitter on tap)
  const MOVE_START = 12;

  const handlePointerDown = (item: string, e: React.PointerEvent) => {
    e.preventDefault();
    primeHaptic();
    pendingItem.current = item;
    isDragging.current = false;
    startPos.current = { x: e.clientX, y: e.clientY };
    setDragOffset({ x: 0, y: 0 });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pendingItem.current) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;

    // Only start dragging after crossing movement threshold
    if (!isDragging.current) {
      if (Math.abs(dx) > MOVE_START || Math.abs(dy) > MOVE_START) {
        isDragging.current = true;
        setDraggingItem(pendingItem.current);
        // Show definition while dragging
        if (pendingItem.current && SUBCATEGORY_DEFINITIONS[pendingItem.current]) {
          setShowDef(pendingItem.current);
        }
      } else {
        return; // Not dragging yet, don't move chip
      }
    }

    setDragOffset({ x: dx, y: dy });
    const zone = getZoneFromOffset(dx, dy);
    if (zone !== lastZone.current) {
      lastZone.current = zone;
      if (zone) triggerHaptic('light');
    }
    setActiveZone(zone);
  };

  const handlePointerUp = () => {
    const item = pendingItem.current;
    if (!item) return;

    if (isDragging.current && activeZone) {
      // Completed a drag into a zone
      triggerHaptic('medium');
      setUndoStack((prev) => [...prev, item]);
      setRatings((prev) => {
        const next = new Map(prev);
        next.set(item, activeZone);
        return next;
      });
    } else if (!isDragging.current) {
      // It was a tap — show definition
      if (SUBCATEGORY_DEFINITIONS[item]) {
        setShowDef(item);
      }
    }

    pendingItem.current = null;
    isDragging.current = false;
    setDraggingItem(null);
    setDragOffset({ x: 0, y: 0 });
    setActiveZone(null);
    setShowDef(null);
    lastZone.current = null;
  };

  const handleNext = () => {
    const result: ChipRating[] = [];
    ratings.forEach((tierId, item) => {
      result.push({ item, tierId });
    });
    onComplete(result);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const lastItem = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setRatings((prev) => {
      const next = new Map(prev);
      next.delete(lastItem);
      return next;
    });
  };

  const ratedCount = ratings.size;
  const unratedItems = items.filter((item) => !ratings.has(item));

  return (
    <div
      className="flex-1 flex flex-col min-h-dvh select-none"
      style={{ WebkitUserSelect: 'none', background: 'var(--background)' }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Definition tooltip (tap-to-close only, rendered elsewhere for drag) */}
      {showDef && !draggingItem && <DefinitionTooltip label={showDef} onClose={() => setShowDef(null)} />}

      {/* Header */}
      <div className="px-5 pt-5 pb-2 relative z-40" style={{ background: `${categoryColor}28` }}>
        <div className="flex items-center justify-between mb-1">
          <button onClick={onBack} className="text-sm hover:opacity-100 transition-opacity" style={{ color: 'rgba(0,0,0,0.65)' }}>
            &larr;
          </button>
          <div className="text-center">
            <p className="text-base font-semibold" style={{ fontFamily: 'Georgia, serif', color: categoryColor, filter: 'brightness(0.7)' }}>
              {categoryName}
            </p>
            <p className="text-xs" style={{ color: 'rgba(0,0,0,0.45)' }}>{stepNumber} / {totalSteps}</p>
          </div>
          <button
            onClick={handleNext}
            className="text-sm hover:opacity-100 transition-opacity"
            style={{ color: 'rgba(0,0,0,0.65)' }}
          >
            {ratedCount > 0 ? 'Next' : 'Skip'} &rarr;
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

      {/* Full-screen chip area */}
      <div className="relative flex-1 overflow-hidden">
        {/* Subtle watercolor wash */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 40%, ${categoryColor}12 0%, transparent 70%)`,
          }}
        />

        {/* Corner circles */}
        {tiers.map((tier) => (
          <CornerCircle
            key={tier.id}
            tier={tier}
            active={activeZone === tier.id}
            corner={SIDE_TO_CORNER[tier.side]}
            isDragging={!!draggingItem}
          />
        ))}

        {/* Card — hidden during drag */}
        {!draggingItem && (
          <div
            className="absolute inset-0 flex items-center justify-center z-10"
          >
            <div className="relative" style={{ width: '85%', maxWidth: 340 }}>
              {(() => {
                const CLUSTER_SIZE = 4;
                const clusters: string[][] = [];
                for (let i = 0; i < unratedItems.length; i += CLUSTER_SIZE) {
                  clusters.push(unratedItems.slice(i, i + CLUSTER_SIZE));
                }
                if (clusters.length === 0) {
                  const ratingsList = [...ratings.entries()].map(([item, tierId]) => ({ item, tierId }));
                  return (
                    <div className="flex flex-col items-center gap-3 py-6">
                      <p className="text-sm opacity-40">All items sorted!</p>
                      <button
                        onClick={() => onComplete(ratingsList)}
                        className="px-10 py-4 rounded-2xl text-white font-semibold text-lg transition-all hover:opacity-90 active:scale-[0.97]"
                        style={{
                          background: `linear-gradient(135deg, ${categoryColor}EE, ${categoryColor}99)`,
                          boxShadow: `0 4px 20px ${categoryColor}55`,
                          border: '2px solid rgba(255,255,255,0.4)',
                        }}
                      >
                        Next →
                      </button>
                    </div>
                  );
                }
                const topCluster = clusters[0];
                return (
                  <div
                    className="rounded-2xl px-5 py-4 flex flex-wrap gap-2 justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${categoryColor}15, ${categoryColor}08)`,
                      border: `1.5px solid ${categoryColor}20`,
                      boxShadow: `0 2px 12px ${categoryColor}10`,
                    }}
                  >
                    {topCluster.map((item) => (
                      <button
                        key={item}
                        className="px-4 py-2 rounded-full text-base touch-none"
                        style={{
                          background: categoryColor + '18',
                          borderWidth: '1.5px',
                          borderStyle: 'solid',
                          borderColor: categoryColor + '30',
                          color: 'rgba(0,0,0,0.78)',
                          fontWeight: 600,
                          boxShadow: `0 2px 8px ${categoryColor}20`,
                          WebkitUserSelect: 'none',
                        }}
                        onPointerDown={(e) => handlePointerDown(item, e)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                );
              })()}

              {/* Definition shown below card when tapped (not dragging) */}
              {showDef && SUBCATEGORY_DEFINITIONS[showDef] && (
                <div className="mt-3 px-4 py-2.5 rounded-xl bg-white/90 shadow-lg border border-black/5 backdrop-blur-sm">
                  <p className="text-xs font-semibold mb-0.5" style={{ color: 'rgba(0,0,0,0.7)' }}>{showDef}</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(0,0,0,0.45)' }}>{SUBCATEGORY_DEFINITIONS[showDef]}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* During drag: floating chip + definition in center */}
        {draggingItem && (
          <>
            {/* Definition takes the center spot */}
            {showDef && SUBCATEGORY_DEFINITIONS[showDef] && (
              <div className="absolute inset-0 z-15 flex items-center justify-center pointer-events-none">
                <div
                  className="px-5 py-3 rounded-2xl bg-white/90 shadow-lg border border-black/5 backdrop-blur-sm"
                  style={{ width: '80%', maxWidth: 300 }}
                >
                  <p className="text-sm font-semibold mb-1" style={{ color: 'rgba(0,0,0,0.7)' }}>{showDef}</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(0,0,0,0.45)' }}>{SUBCATEGORY_DEFINITIONS[showDef]}</p>
                </div>
              </div>
            )}

            {/* Dragged chip — big, bold, white background */}
            <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
              <div
                className="px-5 py-2.5 rounded-full text-base font-semibold"
                style={{
                  background: 'rgba(255,255,255,0.95)',
                  border: `2px solid ${categoryColor}60`,
                  color: 'rgba(0,0,0,0.75)',
                  transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) scale(1.15)`,
                  boxShadow: `0 8px 30px rgba(0,0,0,0.12), 0 4px 15px ${categoryColor}30`,
                }}
              >
                {draggingItem}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom bar */}
      <div className="px-5 pb-4 relative z-40 flex items-center justify-between" style={{ background: `${categoryColor}28` }}>
        {undoStack.length > 0 ? (
          <button
            onClick={handleUndo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all active:scale-95"
            style={{
              background: `${categoryColor}22`,
              border: `1px solid ${categoryColor}40`,
              color: 'rgba(0,0,0,0.55)',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
            undo
          </button>
        ) : (
          <div className="w-10" />
        )}
        <p className="text-xs text-center" style={{ color: 'rgba(0,0,0,0.45)' }}>
          {ratedCount > 0 ? `${ratedCount} of ${items.length} sorted` : 'drag to edges · tap for definition'}
        </p>
        <div className="w-10" />
      </div>
    </div>
  );
}

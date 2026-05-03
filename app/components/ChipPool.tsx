'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { SUBCATEGORY_DEFINITIONS } from '../lib/definitions';
import { getItemPhoto } from '../lib/item-photos';

/* ---- Haptic helper ---- */
function triggerHaptic(style: 'light' | 'medium' | 'sort') {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      if (style === 'light') navigator.vibrate(30);
      else if (style === 'medium') navigator.vibrate([20, 40, 20]);
      else navigator.vibrate(80); // single strong punch on sort
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

const CORNER_EXIT: Record<string, string> = {
  'top-right':    'translate(110%, -110%) scale(0.01)',
  'top-left':     'translate(-110%, -110%) scale(0.01)',
  'bottom-left':  'translate(-110%, 110%) scale(0.01)',
  'bottom-right': 'translate(110%, 110%) scale(0.01)',
};

const GAP = 5; // px gap between quadrants and screen edges

function CornerCircle({ tier, active, corner, isDragging: showHints, popped }: { tier: TierConfig; active: boolean; corner: string; isDragging: boolean; popped?: boolean }) {
  // Rounded rectangles with a small gap — like the reference Eisenhower matrix
  const quadrantStyle: Record<string, React.CSSProperties> = {
    'top-left':     { top: GAP, left: GAP, right: `calc(50% + ${GAP / 2}px)`, bottom: `calc(50% + ${GAP / 2}px)` },
    'top-right':    { top: GAP, right: GAP, left: `calc(50% + ${GAP / 2}px)`, bottom: `calc(50% + ${GAP / 2}px)` },
    'bottom-left':  { bottom: GAP, left: GAP, right: `calc(50% + ${GAP / 2}px)`, top: `calc(50% + ${GAP / 2}px)` },
    'bottom-right': { bottom: GAP, right: GAP, left: `calc(50% + ${GAP / 2}px)`, top: `calc(50% + ${GAP / 2}px)` },
  };

  const labelPos: Record<string, React.CSSProperties> = {
    'top-left':     { top: 16, left: 16, textAlign: 'left' },
    'top-right':    { top: 16, right: 16, textAlign: 'right' },
    'bottom-left':  { bottom: 16, left: 16, textAlign: 'left' },
    'bottom-right': { bottom: 16, right: 16, textAlign: 'right' },
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

  const scale = popped ? 1.35 : active ? 1.05 : 1;
  const fillOpacity = popped ? 0.72 : active ? 0.55 : showHints ? 0.45 : 0.32;

  return (
    <>
      {/* Rounded quadrant */}
      <div
        className="absolute z-10 pointer-events-none"
        style={{
          ...quadrantStyle[corner],
          borderRadius: 20,
          background: tier.color,
          opacity: fillOpacity,
          transition: 'opacity 0.2s ease-out',
        }}
      />

      {/* Label inside quadrant */}
      <div
        className="absolute z-30 pointer-events-none"
        style={{ ...quadrantStyle[corner], borderRadius: 20, overflow: 'hidden' }}
      >
        <div
          className="absolute"
          style={{
            ...labelPos[corner],
            transform: `scale(${scale})`,
            transformOrigin: origin[corner],
            transition: 'all 0.2s ease-out',
          }}
        >
          {lines.map((line, i) => {
            const isOrLine = i === lines.length - 1 && tier.label === 'Not Available For';
            const size = popped ? 15 : active ? 14 : 12;
            return (
              <div
                key={i}
                style={{
                  color: tier.color,
                  fontWeight: isOrLine ? 500 : 800,
                  fontSize: isOrLine ? size - 3 : size,
                  lineHeight: 1.25,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  filter: 'brightness(0.65)',
                  opacity: isOrLine ? 0.65 : 1,
                  transition: 'font-size 0.2s ease-out',
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

/* ---- Exiting card animation ---- */
function ExitingCard({ item, exitTransform, categoryName, categoryColor }: {
  item: string; exitTransform: string; categoryName: string; categoryColor: string;
}) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setActive(true)));
    return () => cancelAnimationFrame(id);
  }, []);
  const { url, pos } = getItemPhoto(item);
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 25, borderRadius: 24, overflow: 'hidden',
      transform: active ? exitTransform : 'none',
      opacity: active ? 0 : 1,
      transition: active ? 'transform 0.24s cubic-bezier(0.95,0,1,1), opacity 0.18s cubic-bezier(0.95,0,1,1)' : 'none',
      pointerEvents: 'none',
    }}>
      <div style={{ height: 170 }}>
        <img src={url} alt={item} draggable={false}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos }} />
      </div>
      <div style={{ padding: '16px 20px 22px', background: 'white' }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: categoryColor, filter: 'brightness(0.75)', marginBottom: 6 }}>
          {categoryName}
        </p>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'rgba(0,0,0,0.84)', lineHeight: 1.2 }}>
          {item}
        </h2>
      </div>
    </div>
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
      } else {
        return;
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
      triggerHaptic('sort');
      setUndoStack((prev) => [...prev, item]);
      setRatings((prev) => {
        const next = new Map(prev);
        next.set(item, activeZone);
        return next;
      });
      // B: card flies to corner
      const corner = SIDE_TO_CORNER[tiers.find(t => t.id === activeZone)?.side ?? 'right'];
      setExitingCard({ item, exitTransform: CORNER_EXIT[corner] });
      setTimeout(() => setExitingCard(null), 300);
      // D: zone label pops
      setPoppedZone(activeZone);
      setTimeout(() => setPoppedZone(null), 650);
    }

    pendingItem.current = null;
    isDragging.current = false;
    setDraggingItem(null);
    setDragOffset({ x: 0, y: 0 });
    setActiveZone(null);
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

  const [failedPhotos, setFailedPhotos] = useState<Set<string>>(new Set());
  const [exitingCard, setExitingCard] = useState<{ item: string; exitTransform: string } | null>(null);
  const [poppedZone, setPoppedZone] = useState<string | null>(null);

  const ratedCount = ratings.size;
  const unratedItems = items.filter((item) => !ratings.has(item));
  const tierColorMap = Object.fromEntries(tiers.map(t => [t.id, t.color]));

  return (
    <div
      className="flex-1 flex flex-col min-h-dvh select-none"
      style={{ WebkitUserSelect: 'none', background: 'var(--background)' }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >

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
            popped={poppedZone === tier.id}
          />
        ))}

        {/* Card stack */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          {unratedItems.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <p className="text-sm opacity-40">All items sorted!</p>
              <button
                onClick={handleNext}
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
          ) : (
            <div className="relative" style={{ width: '80%', maxWidth: 320 }}>

              {/* Exit animation overlay */}
              {exitingCard && (
                <ExitingCard
                  item={exitingCard.item}
                  exitTransform={exitingCard.exitTransform}
                  categoryName={categoryName}
                  categoryColor={categoryColor}
                />
              )}

              {/* Whole card drags together */}
              <div
                className="touch-none"
                style={{
                  position: 'relative',
                  zIndex: 10,
                  borderRadius: 24,
                  overflow: 'hidden',
                  boxShadow: draggingItem ? '0 20px 60px rgba(0,0,0,0.22)' : '0 6px 24px rgba(0,0,0,0.12)',
                  transform: draggingItem
                    ? `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.x * 0.05}deg)`
                    : 'none',
                  transition: draggingItem ? 'box-shadow 0.15s' : 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.15s',
                  cursor: draggingItem ? 'grabbing' : 'grab',
                  WebkitUserSelect: 'none',
                }}
                onPointerDown={(e) => handlePointerDown(unratedItems[0], e)}
              >
                {/* Photo */}
                <div style={{ height: 170, position: 'relative' }}>
                  {(() => {
                    const item = unratedItems[0];
                    const failed = failedPhotos.has(item);
                    const { url, pos } = failed
                      ? { url: `https://picsum.photos/seed/${encodeURIComponent(item)}/700/420`, pos: 'center' }
                      : getItemPhoto(item);
                    return (
                      <img
                        key={failed ? 'fallback' : 'primary'}
                        src={url}
                        alt={item}
                        draggable={false}
                        className="w-full h-full object-cover"
                        style={{ objectPosition: pos, WebkitUserDrag: 'none' } as React.CSSProperties}
                        onError={() => setFailedPhotos(prev => new Set(prev).add(item))}
                      />
                    );
                  })()}
                </div>

                {/* Text section — tints to zone color */}
                <div
                  style={{
                    background: activeZone && tierColorMap[activeZone]
                      ? tierColorMap[activeZone] + '50'
                      : 'white',
                    transition: 'background 0.2s ease',
                    padding: '16px 20px 22px',
                  }}
                >
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: categoryColor, filter: 'brightness(0.75)', marginBottom: 6 }}>
                    {categoryName}
                  </p>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: 'rgba(0,0,0,0.84)', lineHeight: 1.2, marginBottom: 8 }}>
                    {unratedItems[0]}
                  </h2>
                  {SUBCATEGORY_DEFINITIONS[unratedItems[0]] && (
                    <p style={{ fontSize: 13, lineHeight: 1.55, color: 'rgba(0,0,0,0.45)', fontStyle: 'italic' }}>
                      {SUBCATEGORY_DEFINITIONS[unratedItems[0]]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
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
          {ratedCount > 0 ? `${ratedCount} of ${items.length} sorted` : `${items.length} to sort`}
        </p>
        <div className="w-10" />
      </div>
    </div>
  );
}

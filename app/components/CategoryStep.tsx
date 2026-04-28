'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Category, SubcategoryRating, Tier } from '../lib/types';
import { SUBCATEGORY_DEFINITIONS } from '../lib/definitions';

interface CategoryStepProps {
  category: Category;
  initialRatings: SubcategoryRating[];
  onComplete: (ratings: SubcategoryRating[]) => void;
  onBack: () => void;
  onSkip: () => void;
  stepNumber: number;
  totalSteps: number;
}

const TIER_COLORS: Record<Tier, string> = {
  'off-limits': '#D4837F',
  'maybe': '#F5D06E',
  'open': '#89CFF0',
  'must-have': '#E8838A',
};

const TIER_LONG: Record<Tier, string> = {
  'off-limits': 'not available for',
  'maybe': 'not sure yet',
  'open': 'open to',
  'must-have': 'actively want',
};

const TIER_RINGS: Record<Tier, number> = {
  'off-limits': 1,
  'maybe': 1,
  'open': 2,
  'must-have': 3,
};

// Arc positions — spread wider, more upward for finger clearance
const ARC_TIERS: Tier[] = ['off-limits', 'maybe', 'open', 'must-have'];

// Time & Rhythm groupings
const TIME_COMMUNICATION = new Set([
  'Daily texting', 'A few times a week', 'Weekly check-ins',
  'Monthly catch-ups', 'Organic / Intermittent', 'Recurring scheduled calls',
]);
const TIME_IN_PERSON = new Set([
  'Live together', 'See each other weekly', 'A few times a month',
  'Occasional visits', 'From time to time', 'A few times a year', 'Seasonal trips', 'Seasonal living',
]);

function TierDot({ tier, size = 16 }: { tier: Tier; size?: number }) {
  const color = TIER_COLORS[tier];
  const rings = TIER_RINGS[tier];
  const r = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={r} cy={r} r={r * 0.375} fill={color} />
      {rings >= 2 && <circle cx={r} cy={r} r={r * 0.6875} fill="none" stroke={color} strokeWidth={size * 0.0625} opacity="0.5" />}
      {rings >= 3 && <circle cx={r} cy={r} r={r * 0.9375} fill="none" stroke={color} strokeWidth={size * 0.047} opacity="0.3" />}
    </svg>
  );
}

/* ---- Definition tooltip (fixed centered on screen) ---- */
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

/* ---- Arc Menu (fixed center screen, bare watercolor orbs) ---- */
function ArcMenu({
  label,
  currentTier,
  onSelect,
  onRemove,
  onClose,
}: {
  label: string;
  currentTier: Tier | null;
  onSelect: (tier: Tier) => void;
  onRemove: () => void;
  onClose: () => void;
}) {
  // Fixed center of screen layout
  const screenW = typeof window !== 'undefined' ? window.innerWidth : 375;
  const screenH = typeof window !== 'undefined' ? window.innerHeight : 812;
  const centerX = screenW / 2;
  const centerY = screenH * 0.42;

  // Orb positions: arc above center label
  const orbSize = 48;
  const positions = [
    { tier: 'off-limits' as Tier, x: centerX - 120, y: centerY - 10 },
    { tier: 'maybe' as Tier, x: centerX - 42, y: centerY - 70 },
    { tier: 'open' as Tier, x: centerX + 42, y: centerY - 70 },
    { tier: 'must-have' as Tier, x: centerX + 120, y: centerY - 10 },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/15 backdrop-blur-[3px]"
        onClick={onClose}
        onTouchEnd={(e) => { e.preventDefault(); onClose(); }}
      />

      {/* Menu content */}
      <div className="fixed inset-0 z-50 pointer-events-none">
        {/* Chip label in center */}
        <div
          className="absolute animate-tooltip pointer-events-none select-none"
          style={{ left: centerX, top: centerY + 30, transform: 'translate(-50%, 0)', WebkitUserSelect: 'none' }}
        >
          <p className="text-base font-semibold text-center text-[#3D3532]">{label}</p>
          {currentTier && (
            <button
              className="pointer-events-auto mx-auto mt-2 flex items-center gap-1 text-xs opacity-40 hover:opacity-70 transition-opacity"
              style={{ justifyContent: 'center', display: 'flex' }}
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); onRemove(); }}
            >
              <span>&times;</span> remove
            </button>
          )}
        </div>

        {/* Watercolor orbs */}
        {positions.map(({ tier, x, y }) => {
          const isActive = currentTier === tier;
          const color = TIER_COLORS[tier];

          return (
            <div
              key={tier}
              className="absolute flex flex-col items-center animate-radial-pop pointer-events-auto cursor-pointer select-none"
              style={{
                left: x,
                top: y,
                transform: 'translate(-50%, -50%)',
                WebkitUserSelect: 'none',
              }}
              onClick={(e) => { e.stopPropagation(); onSelect(tier); }}
              onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); onSelect(tier); }}
            >
              {/* Bare watercolor orb */}
              <div
                className="rounded-full flex items-center justify-center transition-all duration-150 active:scale-115"
                style={{
                  width: isActive ? orbSize + 8 : orbSize,
                  height: isActive ? orbSize + 8 : orbSize,
                  background: `radial-gradient(circle at 35% 35%, ${color}${isActive ? '' : 'CC'}, ${color}${isActive ? 'CC' : '80'})`,
                  boxShadow: isActive
                    ? `0 4px 24px ${color}60, 0 0 0 3px white`
                    : `0 3px 16px ${color}35`,
                  border: `2.5px solid ${isActive ? 'white' : 'rgba(255,255,255,0.5)'}`,
                }}
              >
                <TierDot tier={tier} size={isActive ? 22 : 18} />
              </div>
              {/* Label with text shadow for contrast */}
              <span
                className="mt-1.5 text-[10px] font-semibold text-center leading-tight max-w-[80px]"
                style={{
                  color: isActive ? color : '#3D3532',
                  opacity: isActive ? 1 : 0.75,
                  textShadow: '0 0 8px rgba(253,248,240,0.9), 0 0 16px rgba(253,248,240,0.7)',
                }}
              >
                {TIER_LONG[tier]}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ---- Chip with arc menu ---- */
function ArcChip({
  label,
  color,
  currentTier,
  onAssign,
  onRemove,
}: {
  label: string;
  color: string;
  currentTier: Tier | null;
  onAssign: (tier: Tier) => void;
  onRemove: () => void;
}) {
  const [showDef, setShowDef] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [chipRect, setChipRect] = useState<DOMRect | null>(null);
  const chipRef = useRef<HTMLButtonElement>(null);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const moved = useRef(false);

  const clearPress = useCallback(() => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  }, []);

  const openMenu = useCallback(() => {
    if (chipRef.current) {
      setChipRect(chipRef.current.getBoundingClientRect());
    }
    isLongPress.current = true;
    setMenuOpen(true);
    setShowDef(false);
    if (navigator.vibrate) navigator.vibrate(30);
  }, []);

  const handlePointerDown = useCallback((clientX: number, clientY: number) => {
    isLongPress.current = false;
    moved.current = false;
    startPos.current = { x: clientX, y: clientY };

    pressTimer.current = setTimeout(() => {
      openMenu();
    }, 350);
  }, [openMenu]);

  const handlePointerMove = useCallback((clientX: number, clientY: number) => {
    const dx = clientX - startPos.current.x;
    const dy = clientY - startPos.current.y;
    if (Math.sqrt(dx * dx + dy * dy) > 10) {
      moved.current = true;
      clearPress();
    }
  }, [clearPress]);

  const handlePointerUp = useCallback(() => {
    clearPress();
    if (!isLongPress.current && !moved.current && !menuOpen) {
      setShowDef((prev) => !prev);
    }
    isLongPress.current = false;
  }, [clearPress, menuOpen]);

  // Touch events
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    handlePointerDown(t.clientX, t.clientY);
  }, [handlePointerDown]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    handlePointerMove(t.clientX, t.clientY);
  }, [handlePointerMove]);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault(); // prevent synthetic click
    handlePointerUp();
  }, [handlePointerUp]);

  // Mouse events
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    handlePointerDown(e.clientX, e.clientY);
  }, [handlePointerDown]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    handlePointerMove(e.clientX, e.clientY);
  }, [handlePointerMove]);

  const onMouseUp = useCallback(() => {
    handlePointerUp();
  }, [handlePointerUp]);

  useEffect(() => {
    return () => clearPress();
  }, [clearPress]);

  const handleSelect = useCallback((tier: Tier) => {
    if (currentTier === tier) {
      onRemove();
    } else {
      onAssign(tier);
    }
    setMenuOpen(false);
  }, [currentTier, onAssign, onRemove]);

  const handleRemove = useCallback(() => {
    onRemove();
    setMenuOpen(false);
  }, [onRemove]);

  const isAssigned = currentTier !== null;
  const tierColor = currentTier ? TIER_COLORS[currentTier] : null;

  return (
    <>
      {/* Arc menu as fixed overlay */}
      {menuOpen && chipRect && (
        <ArcMenu
          label={label}
          currentTier={currentTier}
          onSelect={handleSelect}
          onRemove={handleRemove}
          onClose={() => setMenuOpen(false)}
        />
      )}

      <div className="relative">
        <button
          ref={chipRef}
          className="chip select-none transition-all duration-200"
          style={{
            background: isAssigned
              ? `${tierColor}30`
              : `${color}15`,
            color: '#3D3532',
            border: isAssigned ? `2px solid ${tierColor}` : '1.5px solid transparent',
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={() => {
            if (!menuOpen) clearPress();
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          {isAssigned && currentTier && (
            <span className="mr-1.5 inline-flex">
              <TierDot tier={currentTier} size={14} />
            </span>
          )}
          {label}
        </button>

        {/* Definition tooltip */}
        {showDef && !menuOpen && (
          <DefinitionTooltip label={label} onClose={() => setShowDef(false)} />
        )}
      </div>
    </>
  );
}

/* ---- Main CategoryStep ---- */
export default function CategoryStep({
  category,
  initialRatings,
  onComplete,
  onBack,
  onSkip,
  stepNumber,
  totalSteps,
}: CategoryStepProps) {
  const [ratings, setRatings] = useState<SubcategoryRating[]>(initialRatings);
  const [addingCustom, setAddingCustom] = useState(false);
  const [customText, setCustomText] = useState('');
  const [customSubs, setCustomSubs] = useState<string[]>([]);

  const getTier = (sub: string): Tier | null => {
    return ratings.find((r) => r.subcategory === sub)?.tier ?? null;
  };

  const assignToTier = (subcategory: string, tier: Tier) => {
    setRatings((prev) => {
      const filtered = prev.filter((r) => r.subcategory !== subcategory);
      return [...filtered, { subcategory, tier }];
    });
  };

  const removeFromTier = (subcategory: string) => {
    setRatings((prev) => prev.filter((r) => r.subcategory !== subcategory));
  };

  const addCustom = () => {
    const trimmed = customText.trim();
    if (trimmed && !category.subcategories.includes(trimmed) && !customSubs.includes(trimmed)) {
      setCustomSubs((prev) => [...prev, trimmed]);
      setCustomText('');
      setAddingCustom(false);
    }
  };

  const isTimeRhythm = category.id === 'time-rhythm';

  // Split subcategories for time-rhythm
  const commSubs = category.subcategories.filter((s) => TIME_COMMUNICATION.has(s));
  const inPersonSubs = category.subcategories.filter((s) => TIME_IN_PERSON.has(s));
  const otherSubs = category.subcategories.filter(
    (s) => !TIME_COMMUNICATION.has(s) && !TIME_IN_PERSON.has(s)
  );

  const renderChipGroup = (subs: string[]) => (
    <div className="flex flex-wrap gap-2">
      {subs.map((sub) => (
        <ArcChip
          key={sub}
          label={sub}
          color={category.color}
          currentTier={getTier(sub)}
          onAssign={(tier) => assignToTier(sub, tier)}
          onRemove={() => removeFromTier(sub)}
        />
      ))}
    </div>
  );

  const assignedCount = ratings.length;

  return (
    <div className="page-enter flex flex-col min-h-full">
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onBack} className="text-sm opacity-60 hover:opacity-100 transition-opacity">
            &larr; Back
          </button>
          <span className="text-xs opacity-50">{stepNumber} / {totalSteps}</span>
          <button onClick={() => onComplete(ratings)} className="text-sm opacity-60 hover:opacity-100 transition-opacity">
            Next &rarr;
          </button>
        </div>
        <div className="progress-bar mb-4">
          <div
            className="progress-fill"
            style={{
              width: `${(stepNumber / totalSteps) * 100}%`,
              background: category.color,
            }}
          />
        </div>
        <h2 className="text-xl font-semibold mb-1">{category.name}</h2>
      </div>

      {/* Chip pool */}
      <div className="flex-1 px-5 pb-4">
        {isTimeRhythm ? (
          <div className="space-y-4">
            <div className={`p-4 rounded-2xl ${category.watercolorClass}`}>
              <p className="text-xs font-medium opacity-50 mb-3 uppercase tracking-wide">Communication</p>
              {renderChipGroup(commSubs)}
            </div>
            <div className={`p-4 rounded-2xl ${category.watercolorClass}`}>
              <p className="text-xs font-medium opacity-50 mb-3 uppercase tracking-wide">In Person</p>
              {renderChipGroup(inPersonSubs)}
            </div>
            {(otherSubs.length > 0 || customSubs.length > 0) && (
              <div className={`p-4 rounded-2xl ${category.watercolorClass}`}>
                {renderChipGroup([...otherSubs, ...customSubs])}
              </div>
            )}
          </div>
        ) : (
          <div className={`p-4 rounded-2xl ${category.watercolorClass}`}>
            {renderChipGroup([...category.subcategories, ...customSubs])}
          </div>
        )}

        {/* Add custom */}
        <div className="mt-3">
          {!addingCustom ? (
            <button
              onClick={() => setAddingCustom(true)}
              className="text-sm opacity-50 hover:opacity-80 transition-opacity"
            >
              + Add custom
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCustom()}
                placeholder="Custom subcategory..."
                className="flex-1 px-3 py-2 rounded-xl bg-white/60 border border-black/10 text-sm outline-none focus:border-black/20"
                autoFocus
              />
              <button
                onClick={addCustom}
                className="px-3 py-2 rounded-xl text-sm font-medium text-white"
                style={{ background: category.color }}
              >
                Add
              </button>
              <button
                onClick={() => { setAddingCustom(false); setCustomText(''); }}
                className="px-3 py-2 rounded-xl text-sm opacity-50"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Continue button */}
      <div className="px-5 pb-6 pt-2">
        <button
          onClick={() => onComplete(ratings)}
          className="w-full py-3 rounded-2xl text-white font-medium text-base transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: category.color }}
        >
          {assignedCount > 0 ? 'Continue' : 'Next'}
        </button>
      </div>
    </div>
  );
}

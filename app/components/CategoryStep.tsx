'use client';

import { useState, useRef, useCallback } from 'react';
import { Category, SubcategoryRating, Tier, TIER_LABELS, TIER_ORDER } from '../lib/types';
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

// Elegant tier markers — small SVG dots instead of emojis
function TierDot({ tier }: { tier: Tier }) {
  const styles: Record<Tier, { color: string; rings: number }> = {
    potential: { color: '#C5A3CF', rings: 1 },
    sometimes: { color: '#F5D06E', rings: 1 },
    rhythm: { color: '#89CFF0', rings: 2 },
    core: { color: '#F4A89A', rings: 3 },
  };
  const { color, rings } = styles[tier];
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="shrink-0">
      <circle cx="8" cy="8" r="3" fill={color} />
      {rings >= 2 && <circle cx="8" cy="8" r="5.5" fill="none" stroke={color} strokeWidth="1" opacity="0.5" />}
      {rings >= 3 && <circle cx="8" cy="8" r="7.5" fill="none" stroke={color} strokeWidth="0.75" opacity="0.3" />}
    </svg>
  );
}

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
  const [pool, setPool] = useState<string[]>(() => {
    const rated = new Set(initialRatings.map((r) => r.subcategory));
    return category.subcategories.filter((s) => !rated.has(s));
  });
  const [addingCustom, setAddingCustom] = useState(false);
  const [customText, setCustomText] = useState('');

  const assignToTier = (subcategory: string, tier: Tier) => {
    setPool((prev) => prev.filter((s) => s !== subcategory));
    setRatings((prev) => {
      const existing = prev.filter((r) => r.subcategory !== subcategory);
      return [...existing, { subcategory, tier }];
    });
  };

  const returnToPool = (subcategory: string) => {
    setRatings((prev) => prev.filter((r) => r.subcategory !== subcategory));
    setPool((prev) => [...prev, subcategory]);
  };

  const addCustom = () => {
    const trimmed = customText.trim();
    if (trimmed && !pool.includes(trimmed) && !ratings.find((r) => r.subcategory === trimmed)) {
      setPool((prev) => [...prev, trimmed]);
      setCustomText('');
      setAddingCustom(false);
    }
  };

  const tierRatings = (tier: Tier) => ratings.filter((r) => r.tier === tier);

  return (
    <div className="page-enter flex flex-col min-h-full">
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onBack} className="text-sm opacity-60 hover:opacity-100 transition-opacity">
            &larr; Back
          </button>
          <span className="text-xs opacity-50">{stepNumber} / {totalSteps}</span>
          <button onClick={onSkip} className="text-sm opacity-60 hover:opacity-100 transition-opacity">
            Skip &rarr;
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
        <p className="text-sm opacity-60">Tap to assign, hold to see what it means</p>
      </div>

      {/* Pool of chips */}
      {pool.length > 0 && (
        <div className={`mx-5 p-4 rounded-2xl mb-4 ${category.watercolorClass}`}>
          <p className="text-xs font-medium opacity-50 mb-2 uppercase tracking-wide">Available</p>
          <div className="flex flex-wrap gap-2">
            {pool.map((sub) => (
              <ChipWithMenu
                key={sub}
                label={sub}
                color={category.color}
                onSelect={(tier) => assignToTier(sub, tier)}
              />
            ))}
          </div>
          <button
            onClick={() => setAddingCustom(true)}
            className="mt-3 text-sm opacity-50 hover:opacity-80 transition-opacity"
          >
            + Add custom
          </button>
          {addingCustom && (
            <div className="mt-2 flex gap-2">
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
                className="px-3 py-2 rounded-xl text-sm font-medium"
                style={{ background: category.color, color: 'white' }}
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
      )}

      {/* Tier columns */}
      <div className="flex-1 px-5 space-y-3 pb-4">
        {TIER_ORDER.map((tier) => (
          <div key={tier} className="tier-column" style={{ borderColor: `${category.color}33` }}>
            <p className="text-xs font-medium opacity-40 mb-2 uppercase tracking-wide">
              <TierDot tier={tier} /> {TIER_LABELS[tier]}
            </p>
            <div className="flex flex-wrap gap-2">
              {tierRatings(tier).map((r) => (
                <ChipWithDefinition
                  key={r.subcategory}
                  label={r.subcategory}
                  color={category.color}
                  onRemove={() => returnToPool(r.subcategory)}
                  assigned
                />
              ))}
            </div>
            {tierRatings(tier).length === 0 && (
              <p className="text-xs opacity-20 italic">Tap a chip above to place it here</p>
            )}
          </div>
        ))}
      </div>

      {/* Continue button */}
      <div className="px-5 pb-6 pt-2">
        <button
          onClick={() => onComplete(ratings)}
          className="w-full py-3 rounded-2xl text-white font-medium text-base transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: category.color }}
        >
          {ratings.length > 0 ? 'Continue' : 'Skip this category'}
        </button>
      </div>
    </div>
  );
}

/* ---- Tooltip for definitions (long press / hover) ---- */
function DefinitionTooltip({ label, onClose }: { label: string; onClose: () => void }) {
  const definition = SUBCATEGORY_DEFINITIONS[label];
  if (!definition) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute z-50 bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 p-3 rounded-2xl bg-white shadow-xl border border-black/5 animate-tooltip">
        <p className="text-xs font-semibold mb-1 opacity-70">{label}</p>
        <p className="text-xs leading-relaxed opacity-60">{definition}</p>
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 -mt-1.5 border-r border-b border-black/5" />
      </div>
    </>
  );
}

/* ---- Chip in the assigned tier (with long-press definition) ---- */
function ChipWithDefinition({
  label,
  color,
  onRemove,
  assigned,
}: {
  label: string;
  color: string;
  onRemove: () => void;
  assigned?: boolean;
}) {
  const [showDef, setShowDef] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePointerDown = useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      setShowDef(true);
    }, 500);
  }, []);

  const handlePointerUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  return (
    <div className="relative">
      <button
        onClick={onRemove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="chip chip-selected"
        style={{
          background: `${color}25`,
          borderColor: color,
          color: '#3D3532',
        }}
      >
        {label}
        <span className="ml-1 opacity-40 text-xs">&times;</span>
      </button>
      {showDef && <DefinitionTooltip label={label} onClose={() => setShowDef(false)} />}
    </div>
  );
}

/* ---- Chip in the pool (with tier menu + long-press definition) ---- */
function ChipWithMenu({
  label,
  color,
  onSelect,
}: {
  label: string;
  color: string;
  onSelect: (tier: Tier) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDef, setShowDef] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);

  const handlePointerDown = useCallback(() => {
    didLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      setShowDef(true);
    }, 500);
  }, []);

  const handlePointerUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleClick = () => {
    if (didLongPress.current) {
      didLongPress.current = false;
      return;
    }
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="relative">
      <button
        className="chip"
        style={{ background: `${color}15`, color: '#3D3532' }}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {label}
      </button>

      {/* Definition tooltip */}
      {showDef && <DefinitionTooltip label={label} onClose={() => setShowDef(false)} />}

      {/* Tier selection popup */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
          <div className="absolute z-40 top-full mt-2 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-black/5 p-2 min-w-56 animate-tooltip">
            <p className="text-[10px] uppercase tracking-wider opacity-30 font-medium px-2 pt-1 pb-2">
              How does this show up?
            </p>
            {TIER_ORDER.map((tier) => (
              <button
                key={tier}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm hover:bg-black/[0.03] transition-colors group"
                onClick={() => {
                  onSelect(tier);
                  setMenuOpen(false);
                }}
              >
                <TierDot tier={tier} />
                <div>
                  <p className="font-medium text-sm">{TIER_LABELS[tier]}</p>
                  <p className="text-[11px] opacity-40 leading-tight">{TIER_DESCRIPTIONS[tier]}</p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const TIER_DESCRIPTIONS: Record<Tier, string> = {
  potential: 'Not here yet, but the door is open',
  sometimes: 'Shows up now and then',
  rhythm: 'A regular, expected part of your connection',
  core: 'Foundational — this defines the relationship',
};

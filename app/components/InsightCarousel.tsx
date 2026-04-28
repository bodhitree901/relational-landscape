'use client';

import { useState, useEffect, useCallback } from 'react';
import { Connection, Tier, TIER_ORDER } from '../lib/types';
import { MENU_TIER_COLORS, MENU_TIER_LABELS } from '../lib/menu-categories';
import { DEFAULT_CATEGORIES } from '../lib/categories';

interface InsightCarouselProps {
  connection: Connection;
}

function getRatingsByTier(connection: Connection, tier: Tier): { sub: string; category: string }[] {
  return connection.categories.flatMap((c) => {
    const catDef = DEFAULT_CATEGORIES.find((d) => d.id === c.categoryId);
    return c.ratings
      .filter((r) => r.tier === tier)
      .map((r) => ({ sub: r.subcategory, category: catDef?.name || c.categoryId }));
  });
}

function listNaturally(items: string[], max = 3): string {
  const capped = items.slice(0, max);
  const rest = items.length - max;
  if (capped.length === 0) return '';
  if (capped.length === 1) return capped[0];
  const base = capped.length === 2
    ? `${capped[0]} and ${capped[1]}`
    : `${capped.slice(0, -1).join(', ')}, and ${capped[capped.length - 1]}`;
  return rest > 0 ? `${base} (+${rest} more)` : base;
}

function generateInsights(connection: Connection, tier: Tier): string[] {
  const items = getRatingsByTier(connection, tier);
  const name = connection.name;
  const count = items.length;

  if (count === 0) {
    return [`No dimensions sorted here yet for ${name}.`];
  }

  // Group by category
  const byCat = new Map<string, string[]>();
  items.forEach(({ sub, category }) => {
    if (!byCat.has(category)) byCat.set(category, []);
    byCat.get(category)!.push(sub);
  });
  const categories = [...byCat.keys()];
  const topCategory = [...byCat.entries()].sort((a, b) => b[1].length - a[1].length)[0];
  const subs = items.map((i) => i.sub);

  switch (tier) {
    case 'must-have': {
      const cards: string[] = [];
      cards.push(`You actively want ${count} thing${count !== 1 ? 's' : ''} with ${name} — these are your non-negotiables.`);
      if (topCategory) {
        cards.push(`${topCategory[0]} leads the way with ${topCategory[1].length} item${topCategory[1].length !== 1 ? 's' : ''}: ${listNaturally(topCategory[1])}.`);
      }
      if (categories.length >= 3) {
        cards.push(`This spans ${categories.length} categories — a multi-dimensional connection that touches many parts of life.`);
      } else if (categories.length === 1) {
        cards.push(`All focused in ${categories[0]} — you know exactly what this connection is about.`);
      } else {
        cards.push(`Spanning ${listNaturally(categories)} — clear about where this connection lives.`);
      }
      cards.push(`Your clearest desires: ${listNaturally(subs, 4)}. These are worth naming out loud.`);
      cards.push(`${count} actively wanted dimension${count !== 1 ? 's' : ''} — that clarity is a gift to both of you.`);
      return cards;
    }
    case 'open': {
      const cards: string[] = [];
      cards.push(`You're open to ${count} thing${count !== 1 ? 's' : ''} with ${name} — doors you'd walk through if they opened.`);
      if (topCategory) {
        cards.push(`Most of your openness lives in ${topCategory[0]}: ${listNaturally(topCategory[1])}.`);
      }
      cards.push(`Being open means you're curious without pressure — ${listNaturally(subs, 3)} could grow naturally.`);
      if (categories.length >= 2) {
        cards.push(`Openness across ${listNaturally(categories)} — there's room for this connection to surprise you.`);
      } else {
        cards.push(`Your openness is focused — you know the direction even if you're not rushing there.`);
      }
      cards.push(`${count} open door${count !== 1 ? 's' : ''}. No expectations, just possibility.`);
      return cards;
    }
    case 'maybe': {
      const cards: string[] = [];
      cards.push(`${count} thing${count !== 1 ? 's' : ''} you're not sure about yet — and that honesty matters.`);
      if (topCategory) {
        cards.push(`Most uncertainty sits in ${topCategory[0]}: ${listNaturally(topCategory[1])}. Give it time.`);
      }
      cards.push(`Not knowing is its own kind of wisdom — ${listNaturally(subs, 3)} may clarify with experience.`);
      cards.push(`These "maybes" are worth revisiting in a few months. Your feelings might shift.`);
      cards.push(`${count} dimension${count !== 1 ? 's' : ''} still finding ${count !== 1 ? 'their' : 'its'} place. That's not indecision — it's thoughtfulness.`);
      return cards;
    }
    case 'off-limits': {
      const cards: string[] = [];
      cards.push(`${count} clear boundar${count !== 1 ? 'ies' : 'y'} with ${name} — knowing your limits protects everything else.`);
      if (topCategory) {
        cards.push(`Strongest boundaries in ${topCategory[0]}: ${listNaturally(topCategory[1])}.`);
      }
      cards.push(`${listNaturally(subs, 3)} — not available, and that's a healthy, honest line.`);
      cards.push(`A clear "no" here makes every "yes" more meaningful and trustworthy.`);
      cards.push(`${count} boundar${count !== 1 ? 'ies' : 'y'} set. These create safety for the connection to breathe.`);
      return cards;
    }
  }
}

export default function InsightCarousel({ connection }: InsightCarouselProps) {
  const [activeTier, setActiveTier] = useState<Tier>('must-have');
  const [cardIndex, setCardIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const insights = generateInsights(connection, activeTier);
  const totalCards = insights.length;

  const goNext = useCallback(() => {
    setCardIndex((prev) => (prev + 1) % totalCards);
  }, [totalCards]);

  const goPrev = useCallback(() => {
    setCardIndex((prev) => (prev - 1 + totalCards) % totalCards);
  }, [totalCards]);

  // Reset card index when tier changes
  useEffect(() => {
    setCardIndex(0);
    setIsPaused(false);
  }, [activeTier]);

  // Auto-carousel every 5 seconds
  useEffect(() => {
    if (isPaused || totalCards <= 1) return;
    const timer = setInterval(goNext, 10000);
    return () => clearInterval(timer);
  }, [isPaused, totalCards, goNext]);

  const tierColor = MENU_TIER_COLORS[activeTier];

  // Check which tiers have items
  const tierCounts = TIER_ORDER.map((t) => ({
    tier: t,
    count: getRatingsByTier(connection, t).length,
  }));

  return (
    <div className="w-full">
      {/* Tier selector tabs */}
      <div className="flex gap-1.5 mb-4">
        {tierCounts.map(({ tier, count }) => {
          const isActive = tier === activeTier;
          const color = MENU_TIER_COLORS[tier];
          return (
            <button
              key={tier}
              onClick={() => setActiveTier(tier)}
              className="flex-1 py-2 px-1 rounded-xl text-center transition-all active:scale-95"
              style={{
                background: isActive ? `${color}25` : `${color}08`,
                border: isActive ? `1.5px solid ${color}40` : '1.5px solid transparent',
              }}
            >
              <span
                className="text-[10px] font-semibold block leading-tight"
                style={{ color, opacity: isActive ? 1 : 0.5 }}
              >
                {MENU_TIER_LABELS[tier]}
              </span>
              <span
                className="text-lg font-bold block mt-0.5"
                style={{ color, opacity: isActive ? 0.8 : 0.35 }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Card carousel */}
      {totalCards > 0 && (
        <div
          className="relative rounded-2xl px-5 py-4 min-h-[80px] flex items-center"
          style={{
            background: `linear-gradient(135deg, ${tierColor}10, ${tierColor}06)`,
            border: `1px solid ${tierColor}15`,
          }}
          onPointerEnter={() => setIsPaused(true)}
          onPointerLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setTimeout(() => setIsPaused(false), 3000)}
        >
          {/* Left arrow */}
          {totalCards > 1 && (
            <button
              onClick={goPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90"
              style={{ background: `${tierColor}15` }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={tierColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}

          {/* Card text */}
          <p
            className="text-sm leading-relaxed text-center flex-1 px-6"
            style={{ color: 'rgba(0,0,0,0.6)' }}
          >
            {insights[cardIndex]}
          </p>

          {/* Right arrow */}
          {totalCards > 1 && (
            <button
              onClick={goNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90"
              style={{ background: `${tierColor}15` }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={tierColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}

          {/* Dots */}
          {totalCards > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {insights.map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all"
                  style={{
                    width: i === cardIndex ? 12 : 5,
                    height: 5,
                    background: tierColor,
                    opacity: i === cardIndex ? 0.6 : 0.2,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { Connection, Tier, CategoryRatings } from './types';
import { DEFAULT_CATEGORIES } from './categories';

interface AnalysisResult {
  summary: string;
  suggestions: string[];
}

const CATEGORY_NAMES: Record<string, string> = {
  'physical-touch': 'Physical Touch & Intimacy',
  'life-structure': 'Life Structure & Agreements',
  'emotional-connection': 'Emotional Connection',
  'social': 'Social',
  'frames': 'Frames',
  'qualities': 'Qualities',
};

function getCategoryName(id: string): string {
  return CATEGORY_NAMES[id] || id;
}

function getRatingsByTier(connection: Connection, tier: Tier): string[] {
  return connection.categories.flatMap((c) =>
    c.ratings.filter((r) => r.tier === tier).map((r) => r.subcategory)
  );
}

function getCategoryItems(connection: Connection, categoryId: string): { sub: string; tier: Tier }[] {
  const cat = connection.categories.find((c) => c.categoryId === categoryId);
  if (!cat) return [];
  return cat.ratings.map((r) => ({ sub: r.subcategory, tier: r.tier }));
}

function getDominantCategory(connection: Connection): { id: string; score: number } | null {
  let best: { id: string; score: number } | null = null;
  for (const cat of connection.categories) {
    const score = cat.ratings.reduce((sum, r) => {
      if (r.tier === 'core') return sum + 4;
      if (r.tier === 'rhythm') return sum + 3;
      if (r.tier === 'sometimes') return sum + 2;
      return sum + 1;
    }, 0);
    if (!best || score > best.score) {
      best = { id: cat.categoryId, score };
    }
  }
  return best;
}

function listNaturally(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

export function analyzeConnection(connection: Connection): AnalysisResult {
  const coreItems = getRatingsByTier(connection, 'core');
  const rhythmItems = getRatingsByTier(connection, 'rhythm');
  const sometimesItems = getRatingsByTier(connection, 'sometimes');
  const potentialItems = getRatingsByTier(connection, 'potential');
  const allItems = [...coreItems, ...rhythmItems, ...sometimesItems, ...potentialItems];
  const dominant = getDominantCategory(connection);

  if (allItems.length === 0) {
    return {
      summary: `You haven't mapped any aspects of your connection with ${connection.name} yet. Start by exploring which subcategories feel relevant.`,
      suggestions: ['Take some time to walk through each category and see what resonates.'],
    };
  }

  // Build the summary paragraph
  const paragraphs: string[] = [];

  // Opening — what defines this connection
  if (coreItems.length > 0) {
    paragraphs.push(
      `At its heart, your connection with ${connection.name} is built on ${listNaturally(coreItems)}. ${
        coreItems.length === 1
          ? 'This is the foundation — everything else orbits around it.'
          : 'These are the pillars — the things that would feel most missing if they disappeared.'
      }`
    );
  } else if (rhythmItems.length > 0) {
    paragraphs.push(
      `Your connection with ${connection.name} doesn't have a single dramatic center — instead, it's woven from steady rhythms: ${listNaturally(rhythmItems)}. This is a connection that lives in regularity and presence.`
    );
  } else {
    paragraphs.push(
      `Your connection with ${connection.name} is still emerging. Nothing has cemented itself as core yet, but there are threads forming — and that's beautiful in its own right.`
    );
  }

  // Rhythm layer
  if (rhythmItems.length > 0 && coreItems.length > 0) {
    paragraphs.push(
      `Supporting that foundation, ${listNaturally(rhythmItems)} ${rhythmItems.length === 1 ? 'shows' : 'show'} up as a regular rhythm between you — not the defining quality, but a reliable, expected part of how you relate.`
    );
  }

  // The texture — sometimes items add color
  if (sometimesItems.length > 0) {
    paragraphs.push(
      `There's also texture and color here: ${listNaturally(sometimesItems)} ${sometimesItems.length === 1 ? 'appears' : 'appear'} from time to time, adding warmth and variety without being the main thread.`
    );
  }

  // Potential — what's on the horizon
  if (potentialItems.length > 0) {
    paragraphs.push(
      `And looking at what might unfold — ${listNaturally(potentialItems)} ${potentialItems.length === 1 ? 'sits' : 'sit'} in the space of possibility. Not here yet, but the door isn't closed.`
    );
  }

  // Category-level insight
  const physicalItems = getCategoryItems(connection, 'physical-touch');
  const emotionalItems = getCategoryItems(connection, 'emotional-connection');
  const socialItems = getCategoryItems(connection, 'social');
  const structureItems = getCategoryItems(connection, 'life-structure');
  const frameItems = getCategoryItems(connection, 'frames');

  // Detect interesting patterns
  const hasPhysicalCore = physicalItems.some((i) => i.tier === 'core' || i.tier === 'rhythm');
  const hasEmotionalCore = emotionalItems.some((i) => i.tier === 'core' || i.tier === 'rhythm');
  const hasSocialCore = socialItems.some((i) => i.tier === 'core' || i.tier === 'rhythm');
  const hasStructureCore = structureItems.some((i) => i.tier === 'core' || i.tier === 'rhythm');

  const activeAreas = [
    hasPhysicalCore && 'physical',
    hasEmotionalCore && 'emotional',
    hasSocialCore && 'social',
    hasStructureCore && 'structural',
  ].filter(Boolean);

  if (activeAreas.length >= 3) {
    paragraphs.push(
      `This is a multi-dimensional connection — it spans ${listNaturally(activeAreas as string[])} territory. That kind of breadth is rare and speaks to a relationship with real depth and range.`
    );
  } else if (activeAreas.length === 1) {
    paragraphs.push(
      `This connection has a clear center of gravity in the ${activeAreas[0]} realm. That's not a limitation — it's a clarity. You know what this relationship is about.`
    );
  }

  // Frame insights
  const coreFrames = frameItems.filter((i) => i.tier === 'core').map((i) => i.sub);
  const romanticPresent = frameItems.some((i) => i.sub === 'Romantic Love');
  const friendshipPresent = frameItems.some((i) => i.sub === 'Friendship');
  const eroticPresent = frameItems.some((i) => i.sub === 'Erotic');

  if (coreFrames.length > 1) {
    paragraphs.push(
      `You hold multiple frames as core — ${listNaturally(coreFrames)} — which means this connection resists simple labels. That's a strength, even when the world wants a single word for it.`
    );
  }

  if (hasPhysicalCore && !romanticPresent && !eroticPresent) {
    paragraphs.push(
      `Something worth noticing: there's physical intimacy here without a romantic or erotic frame. Culturally, that combination often gets questioned — but it's a perfectly valid expression of closeness. The body can connect without the heart needing to follow a script.`
    );
  }

  if (eroticPresent && !romanticPresent) {
    paragraphs.push(
      `There's erotic energy here without romantic love taking center stage — and that's completely its own kind of connection. It doesn't need to "become" romantic to be valid or meaningful.`
    );
  }

  // Time & rhythm context
  const { communication, inPerson, custom } = connection.timeRhythm;
  const allTime = [...communication, ...inPerson, ...custom];

  if (allTime.length > 0) {
    const highFreq = communication.some((c) =>
      ['Daily texting', 'A few times a week', 'Recurring scheduled calls'].includes(c)
    );
    const lowFreq = communication.some((c) =>
      ['Sporadic', 'Barely'].includes(c)
    );
    const liveTogether = inPerson.includes('Live together');

    if (liveTogether) {
      paragraphs.push(
        `You share a living space, which means this connection is part of your daily fabric — the mundane and the meaningful intertwine constantly.`
      );
    } else if (highFreq && !lowFreq) {
      paragraphs.push(
        `You communicate frequently, which keeps the connection alive and present even between in-person moments.`
      );
    } else if (lowFreq && !highFreq) {
      paragraphs.push(
        `Your communication is more sporadic — this might be a connection that thrives on quality over quantity, coming alive when you're together rather than in between.`
      );
    }
  }

  // Build suggestions
  const suggestions: string[] = [];

  if (hasEmotionalCore && !hasSocialCore) {
    suggestions.push(
      `You have a strong emotional bond. Try introducing more shared activities — a class, a hike, a creative project — to add a playful, lighter dimension alongside the depth.`
    );
  }

  if (hasSocialCore && !hasEmotionalCore) {
    suggestions.push(
      `You have great social chemistry. If it feels right, creating space for deeper emotional sharing — checking in about how you're really doing — could deepen what's already there.`
    );
  }

  if (hasPhysicalCore && hasEmotionalCore) {
    suggestions.push(
      `Physical and emotional intimacy together create a powerful bond. Keep nurturing both — they feed each other. Intentional touch (even just holding hands) during emotional conversations amplifies safety.`
    );
  }

  if (potentialItems.length > 0) {
    suggestions.push(
      `You've identified ${listNaturally(potentialItems)} as potential. If you want to explore any of these, name it gently — "I've been curious about..." is a low-pressure way to open the door.`
    );
  }

  if (coreItems.length > 0 && rhythmItems.length === 0 && sometimesItems.length === 0) {
    suggestions.push(
      `Your connection is intense but narrow — all core, not much around it. Consider adding rituals or regular touchpoints that aren't about the core thing. Breadth protects depth.`
    );
  }

  if (sometimesItems.length > 2 && coreItems.length <= 1) {
    suggestions.push(
      `You have a lot of "sometimes" threads. If any of them feel like they want to become more regular, try building a small ritual around it — a weekly call, a monthly adventure, a standing invitation.`
    );
  }

  const seasonal = [...inPerson, ...custom].some((c) =>
    c.toLowerCase().includes('seasonal')
  );
  if (seasonal) {
    suggestions.push(
      `Since your connection has a seasonal quality, lean into it — plan something meaningful for when you're together so those periods feel intentional rather than accidental.`
    );
  }

  if (!hasPhysicalCore && !hasEmotionalCore && hasSocialCore) {
    suggestions.push(
      `This is primarily a social connection — and that's great! If you want it to deepen, shared vulnerability is the bridge. You don't have to force it — even sharing something you're struggling with over coffee can shift things naturally.`
    );
  }

  if (friendshipPresent && romanticPresent) {
    suggestions.push(
      `Friendship and romantic love together is a beautiful combination. Protect the friendship layer — date nights are great, but so are "friend dates" where you just hang out without any romantic pressure.`
    );
  }

  if (suggestions.length === 0) {
    suggestions.push(
      `Keep showing up as you are. This connection has its own shape, and the best thing you can do is stay curious about how it wants to grow.`
    );
  }

  return {
    summary: paragraphs.join('\n\n'),
    suggestions,
  };
}

// --- Overlap analysis for shared profiles ---

export interface OverlapResult {
  sharedCore: string[];
  sharedRhythm: string[];
  sharedSometimes: string[];
  sharedPotential: string[];
  uniqueToMe: { sub: string; tier: Tier }[];
  uniqueToThem: { sub: string; tier: Tier }[];
  alignedCategories: string[];
  overlapSummary: string;
}

export function analyzeOverlap(
  myConnection: Connection,
  theirConnection: Connection
): OverlapResult {
  const myRatings = new Map(
    myConnection.categories.flatMap((c) => c.ratings.map((r) => [r.subcategory, r.tier] as const))
  );
  const theirRatings = new Map(
    theirConnection.categories.flatMap((c) => c.ratings.map((r) => [r.subcategory, r.tier] as const))
  );

  const allSubs = new Set([...myRatings.keys(), ...theirRatings.keys()]);

  const sharedCore: string[] = [];
  const sharedRhythm: string[] = [];
  const sharedSometimes: string[] = [];
  const sharedPotential: string[] = [];
  const uniqueToMe: { sub: string; tier: Tier }[] = [];
  const uniqueToThem: { sub: string; tier: Tier }[] = [];

  for (const sub of allSubs) {
    const myTier = myRatings.get(sub);
    const theirTier = theirRatings.get(sub);

    if (myTier && theirTier) {
      // Both selected it — use the "lower" tier for the shared classification
      const tiers: Tier[] = ['potential', 'sometimes', 'rhythm', 'core'];
      const sharedLevel = Math.min(tiers.indexOf(myTier), tiers.indexOf(theirTier));
      const effectiveTier = tiers[sharedLevel];

      if (effectiveTier === 'core') sharedCore.push(sub);
      else if (effectiveTier === 'rhythm') sharedRhythm.push(sub);
      else if (effectiveTier === 'sometimes') sharedSometimes.push(sub);
      else sharedPotential.push(sub);
    } else if (myTier && !theirTier) {
      uniqueToMe.push({ sub, tier: myTier });
    } else if (!myTier && theirTier) {
      uniqueToThem.push({ sub, tier: theirTier });
    }
  }

  // Find aligned categories
  const myCatIds = new Set(myConnection.categories.filter((c) => c.ratings.length > 0).map((c) => c.categoryId));
  const theirCatIds = new Set(theirConnection.categories.filter((c) => c.ratings.length > 0).map((c) => c.categoryId));
  const alignedCategories = [...myCatIds].filter((id) => theirCatIds.has(id)).map((id) => getCategoryName(id));

  // Build overlap summary
  const paragraphs: string[] = [];
  const totalShared = sharedCore.length + sharedRhythm.length + sharedSometimes.length + sharedPotential.length;

  if (totalShared === 0) {
    paragraphs.push(
      `Interestingly, you and ${theirConnection.name} didn't select any of the same subcategories. This doesn't mean you're incompatible — it might mean you experience the connection through very different lenses. That contrast can be a source of richness.`
    );
  } else {
    paragraphs.push(
      `You and ${theirConnection.name} share ${totalShared} overlapping thread${totalShared > 1 ? 's' : ''} in how you see this connection.`
    );
  }

  if (sharedCore.length > 0) {
    paragraphs.push(
      `You both see ${listNaturally(sharedCore)} as core to your connection. This is powerful — it means you agree on what's foundational. You're building on the same ground.`
    );
  }

  if (sharedRhythm.length > 0) {
    paragraphs.push(
      `${listNaturally(sharedRhythm)} ${sharedRhythm.length === 1 ? 'is' : 'are'} a shared rhythm — you both recognize ${sharedRhythm.length === 1 ? 'it' : 'them'} as a regular part of how you connect.`
    );
  }

  // Look for interesting asymmetries
  const iSeeMorePhysical = uniqueToMe.some(
    (u) => DEFAULT_CATEGORIES.find((c) => c.id === 'physical-touch')?.subcategories.includes(u.sub)
  );
  const theySeeMorePhysical = uniqueToThem.some(
    (u) => DEFAULT_CATEGORIES.find((c) => c.id === 'physical-touch')?.subcategories.includes(u.sub)
  );
  const iSeeMoreEmotional = uniqueToMe.some(
    (u) => DEFAULT_CATEGORIES.find((c) => c.id === 'emotional-connection')?.subcategories.includes(u.sub)
  );
  const theySeeMoreEmotional = uniqueToThem.some(
    (u) => DEFAULT_CATEGORIES.find((c) => c.id === 'emotional-connection')?.subcategories.includes(u.sub)
  );

  if (iSeeMorePhysical && !theySeeMorePhysical) {
    paragraphs.push(
      `You identified some physical dimensions that ${theirConnection.name} didn't — this could be worth a gentle conversation. Not to pressure, just to understand how they experience that side of things.`
    );
  }

  if (uniqueToMe.length > 0 && uniqueToThem.length > 0) {
    paragraphs.push(
      `There are things you each see that the other didn't name — and that's normal. No two people experience a connection identically. These differences are invitations for curiosity, not signs of misalignment.`
    );
  }

  if (sharedCore.length >= 2) {
    paragraphs.push(
      `With ${sharedCore.length} shared core elements, this is a connection with strong mutual clarity. You both know what this is. That shared understanding is a gift — protect it and keep checking in about it.`
    );
  }

  return {
    sharedCore,
    sharedRhythm,
    sharedSometimes,
    sharedPotential,
    uniqueToMe,
    uniqueToThem,
    alignedCategories,
    overlapSummary: paragraphs.join('\n\n'),
  };
}

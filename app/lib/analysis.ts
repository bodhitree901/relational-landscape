import { Connection, Tier } from './types';
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
  'time-rhythm': 'Time & Rhythm',
  'frames': 'Frames',
  'qualities': 'Dynamics',
};

function getCategoryName(id: string): string {
  return CATEGORY_NAMES[id] || id;
}

// Seeded random from connection name so it's stable per person but varies between people
function seededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
    h = Math.imul(h ^ (h >>> 13), 0x45d9f3b);
    h = (h ^ (h >>> 16)) >>> 0;
    return (h % 1000) / 1000;
  };
}

function pick<T>(rng: () => number, options: T[]): T {
  return options[Math.floor(rng() * options.length)];
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

function listNaturally(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

export function analyzeConnection(connection: Connection): AnalysisResult {
  const rng = seededRandom(connection.id + connection.name);
  const coreItems = getRatingsByTier(connection, 'core');
  const rhythmItems = getRatingsByTier(connection, 'rhythm');
  const sometimesItems = getRatingsByTier(connection, 'sometimes');
  const potentialItems = getRatingsByTier(connection, 'potential');
  const allItems = [...coreItems, ...rhythmItems, ...sometimesItems, ...potentialItems];
  const name = connection.name;

  if (allItems.length === 0) {
    return {
      summary: `You haven't mapped any aspects of your connection with ${name} yet. Start by exploring which subcategories feel relevant.`,
      suggestions: ['Take some time to walk through each category and see what resonates.'],
    };
  }

  const paragraphs: string[] = [];

  // Opening — what defines this connection
  if (coreItems.length > 0) {
    const openings = [
      `At its heart, your connection with ${name} is anchored in ${listNaturally(coreItems)}.`,
      `The foundation of what you share with ${name} lives in ${listNaturally(coreItems)}.`,
      `When you strip everything else away, what remains between you and ${name} is ${listNaturally(coreItems)}.`,
      `The bedrock of your connection with ${name} — the part that would leave the biggest absence — is ${listNaturally(coreItems)}.`,
    ];
    const followups = coreItems.length === 1
      ? [
          'This single thread carries a lot of weight — everything else orbits around it.',
          'One clear pillar. The rest of your connection arranges itself around this center.',
          'A singular anchor. There\'s clarity in that — you know what this connection is about.',
        ]
      : [
          'These are the threads that would leave the biggest gap if they disappeared.',
          'Together, these form the gravitational center of your relationship.',
          'Pull any of these out and the whole shape of the connection would shift.',
        ];
    paragraphs.push(`${pick(rng, openings)} ${pick(rng, followups)}`);
  } else if (rhythmItems.length > 0) {
    const openings = [
      `Your connection with ${name} doesn't have one dramatic center — instead, it's woven from steady rhythms: ${listNaturally(rhythmItems)}.`,
      `What you share with ${name} is more fabric than pillar — it's the reliable weave of ${listNaturally(rhythmItems)}.`,
      `There's no single defining moment with ${name} — the connection lives in the regularity of ${listNaturally(rhythmItems)}.`,
    ];
    paragraphs.push(`${pick(rng, openings)} ${pick(rng, [
      'This is a connection that lives in presence and consistency.',
      'The strength here is in showing up, again and again.',
      'Rhythm-based connections like this often feel quieter but run deep.',
    ])}`);
  } else {
    paragraphs.push(pick(rng, [
      `Your connection with ${name} is still taking shape. Nothing has cemented itself as core yet, but threads are forming — and that's its own kind of beauty.`,
      `What you share with ${name} is still in motion — more potential and exploration than fixed ground. That's not a weakness; it's openness.`,
      `The landscape between you and ${name} is spacious right now. There's room for things to emerge, shift, and surprise you both.`,
    ]));
  }

  // Rhythm layer
  if (rhythmItems.length > 0 && coreItems.length > 0) {
    paragraphs.push(pick(rng, [
      `Around that center, ${listNaturally(rhythmItems)} ${rhythmItems.length === 1 ? 'hums' : 'hum'} as a steady rhythm — not the headline, but the heartbeat.`,
      `Supporting the core, ${listNaturally(rhythmItems)} ${rhythmItems.length === 1 ? 'shows' : 'show'} up reliably. ${pick(rng, ['The scaffolding that holds the rest.', 'The texture you\'d miss if it weren\'t there.', 'Not always noticed, but always felt.'])}`,
      `${listNaturally(rhythmItems)} ${rhythmItems.length === 1 ? 'runs' : 'run'} through your connection like a steady current — dependable, expected, grounding.`,
    ]));
  }

  // Sometimes items add color
  if (sometimesItems.length > 0) {
    paragraphs.push(pick(rng, [
      `There's texture here too: ${listNaturally(sometimesItems)} ${sometimesItems.length === 1 ? 'surfaces' : 'surface'} from time to time, adding color without being the main thread.`,
      `${listNaturally(sometimesItems)} ${sometimesItems.length === 1 ? 'appears' : 'appear'} in flashes — not constant, but each time ${sometimesItems.length === 1 ? 'it shows' : 'they show'} up, ${sometimesItems.length === 1 ? 'it adds' : 'they add'} something.`,
      `And then there are the occasional notes: ${listNaturally(sometimesItems)}. ${pick(rng, ['Not the melody, but part of the harmony.', 'They keep things from becoming one-dimensional.', 'These are the surprises in an otherwise familiar song.'])}`,
    ]));
  }

  // Potential
  if (potentialItems.length > 0) {
    paragraphs.push(pick(rng, [
      `On the horizon: ${listNaturally(potentialItems)} ${potentialItems.length === 1 ? 'sits' : 'sit'} in the space of possibility. Not here yet, but the door isn't closed.`,
      `You've left room for ${listNaturally(potentialItems)} to emerge. ${pick(rng, ['That openness is itself a statement about the connection.', 'Some things need time to find their way in.', 'Not every seed needs to sprout now.'])}`,
      `${listNaturally(potentialItems)} — ${potentialItems.length === 1 ? 'a possibility' : 'possibilities'} you haven't ruled out. ${pick(rng, ['The connection has space to grow into.', 'What matters is that you can see it.', 'Potential is its own kind of intimacy.'])}`,
    ]));
  }

  // Category-level insights
  const physicalItems = getCategoryItems(connection, 'physical-touch');
  const emotionalItems = getCategoryItems(connection, 'emotional-connection');
  const socialItems = getCategoryItems(connection, 'social');
  const structureItems = getCategoryItems(connection, 'life-structure');
  const frameItems = getCategoryItems(connection, 'frames');

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
    paragraphs.push(pick(rng, [
      `This is a multi-dimensional connection — it spans ${listNaturally(activeAreas as string[])} territory. That kind of breadth is rare and speaks to real range.`,
      `You and ${name} touch ${listNaturally(activeAreas as string[])} dimensions. ${pick(rng, ['Few connections have this kind of spectrum.', 'There\'s a lot of surface area here for the connection to breathe.', 'It means you can show up in many different ways with this person.'])}`,
    ]));
  } else if (activeAreas.length === 1) {
    paragraphs.push(pick(rng, [
      `This connection has a clear center of gravity in the ${activeAreas[0]} realm. ${pick(rng, ['That\'s not a limitation — it\'s a clarity.', 'You know exactly what this relationship is.', 'There\'s power in a connection that knows itself.'])}`,
      `The weight of what you share with ${name} falls squarely in the ${activeAreas[0]} space. ${pick(rng, ['Clean, clear, defined.', 'It doesn\'t try to be everything — and that\'s its strength.'])}`,
    ]));
  }

  // Frame insights
  const coreFrames = frameItems.filter((i) => i.tier === 'core').map((i) => i.sub);
  const romanticPresent = frameItems.some((i) => i.sub === 'Romantic Love');
  const eroticPresent = frameItems.some((i) => i.sub === 'Erotic');

  if (coreFrames.length > 1) {
    paragraphs.push(pick(rng, [
      `You hold ${listNaturally(coreFrames)} as core frames — this connection resists a single label. ${pick(rng, ['That\'s a feature, not a bug.', 'The world may want one word for it, but it deserves more.'])}`,
      `Multiple frames at the core — ${listNaturally(coreFrames)}. ${pick(rng, ['This is a connection that defies easy categories.', 'You\'ve built something that doesn\'t fit in a single box, and that\'s rare.'])}`,
    ]));
  }

  if (hasPhysicalCore && !romanticPresent && !eroticPresent) {
    paragraphs.push(pick(rng, [
      `There's physical intimacy here without a romantic or erotic frame — and that's a perfectly valid expression of closeness. The body can connect without following a cultural script.`,
      `Physical closeness without romance or eros. Culturally, that combination gets questioned, but it exists beautifully in its own right. Bodies can share warmth without needing to name it as something else.`,
    ]));
  }

  if (eroticPresent && !romanticPresent) {
    paragraphs.push(pick(rng, [
      `There's erotic energy here without romantic love at center stage. ${pick(rng, ['It doesn\'t need to "become" romantic to be valid.', 'Eros has its own intelligence — it doesn\'t always point toward romance.'])}`,
      `Eros without romance — a connection where desire exists on its own terms. ${pick(rng, ['That autonomy is something to honor.', 'Not everything that burns needs to be named as love.'])}`,
    ]));
  }

  // Time insights from the time-rhythm category
  const timeItems = getCategoryItems(connection, 'time-rhythm');
  const timeCore = timeItems.filter(i => i.tier === 'core' || i.tier === 'rhythm').map(i => i.sub);

  if (timeCore.some(t => t === 'Live together')) {
    paragraphs.push(pick(rng, [
      `Living together means this connection is part of your daily fabric — the mundane and the meaningful intertwine constantly.`,
      `Sharing a home weaves this connection into everything — morning coffee, evening silence, the small frictions and repairs that build something sturdy.`,
    ]));
  } else if (timeCore.some(t => ['Daily texting', 'A few times a week', 'Recurring scheduled calls'].includes(t))) {
    paragraphs.push(pick(rng, [
      `You stay in regular contact, which keeps the connection warm and present even between in-person moments.`,
      `The communication rhythm here is steady — this isn't a connection that goes dormant between meetings.`,
    ]));
  } else if (timeCore.some(t => ['Organic / Intermittent'].includes(t))) {
    paragraphs.push(pick(rng, [
      `The communication here is more sporadic — this might be a connection that thrives on quality over quantity, coming alive when you're together.`,
      `You don't talk constantly, and that's fine. Some connections are like underground rivers — invisible much of the time, but always flowing.`,
    ]));
  }

  // Build suggestions
  const suggestions: string[] = [];

  if (hasEmotionalCore && !hasSocialCore) {
    suggestions.push(pick(rng, [
      `You have deep emotional ground. Try adding a lighter dimension — a shared hobby, a silly tradition, an adventure — so the connection can breathe.`,
      `Strong emotional bonds benefit from play. Consider introducing shared activities that have nothing to do with processing or feelings — just fun.`,
    ]));
  }

  if (hasSocialCore && !hasEmotionalCore) {
    suggestions.push(pick(rng, [
      `Great social chemistry here. If it feels right, creating space for real emotional sharing could deepen what's already there.`,
      `You connect well socially. A natural next step might be allowing more vulnerability in — sharing something you're struggling with, not just what you're excited about.`,
    ]));
  }

  if (hasPhysicalCore && hasEmotionalCore) {
    suggestions.push(pick(rng, [
      `Physical and emotional intimacy together create a powerful feedback loop. Keep nurturing both — intentional touch during emotional moments amplifies safety.`,
      `The combination of body and heart here is potent. Simple things like holding hands during a difficult conversation can deepen both dimensions at once.`,
    ]));
  }

  if (potentialItems.length > 0) {
    suggestions.push(pick(rng, [
      `You've identified ${listNaturally(potentialItems)} as potential. If you want to explore any of these, name it gently — "I've been curious about..." is a low-pressure opening.`,
      `The potential items (${listNaturally(potentialItems)}) are doors you've left open. You don't have to walk through them — but if one calls to you, a simple "what if we tried..." can start the conversation.`,
    ]));
  }

  if (coreItems.length > 0 && rhythmItems.length === 0 && sometimesItems.length === 0) {
    suggestions.push(pick(rng, [
      `Your connection is intense but narrow — all core, not much around it. Consider adding rituals or regular touchpoints that aren't about the main thing. Breadth protects depth.`,
      `It's all signal, no padding. That intensity is beautiful, but adding some lighter, regular interactions creates resilience. Not everything has to be essential.`,
    ]));
  }

  if (sometimesItems.length > 2 && coreItems.length <= 1) {
    suggestions.push(pick(rng, [
      `You have many "sometimes" threads. If any want to become more regular, try building a small ritual around them — a weekly call, a monthly adventure, a standing invitation.`,
      `Lots of occasional flavors here. Pick one that excites you both and give it a container — a recurring time, a shared project — and see if it grows.`,
    ]));
  }

  const timeRhythmItems = getCategoryItems(connection, 'time-rhythm');
  const seasonal = timeRhythmItems.some((t) =>
    t.sub.toLowerCase().includes('seasonal')
  );
  if (seasonal) {
    suggestions.push(pick(rng, [
      `Since your connection has a seasonal quality, lean into it — plan something meaningful for when you're together so those periods feel intentional.`,
      `Seasonal connections thrive on anticipation and intention. Start planning your next overlap early, and let the in-between time build longing rather than distance.`,
    ]));
  }

  if (suggestions.length === 0) {
    suggestions.push(pick(rng, [
      `Keep showing up as you are. This connection has its own shape, and the best thing you can do is stay curious about how it wants to grow.`,
      `There's nothing to fix here. Stay present, stay curious, and let the connection teach you what it wants to be.`,
      `The most powerful thing you can do is keep paying attention. You're already doing that by mapping this.`,
    ]));
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
  const rng = seededRandom(myConnection.name + theirConnection.name);
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

  const myCatIds = new Set(myConnection.categories.filter((c) => c.ratings.length > 0).map((c) => c.categoryId));
  const theirCatIds = new Set(theirConnection.categories.filter((c) => c.ratings.length > 0).map((c) => c.categoryId));
  const alignedCategories = [...myCatIds].filter((id) => theirCatIds.has(id)).map((id) => getCategoryName(id));

  const paragraphs: string[] = [];
  const totalShared = sharedCore.length + sharedRhythm.length + sharedSometimes.length + sharedPotential.length;

  if (totalShared === 0) {
    paragraphs.push(pick(rng, [
      `You and ${theirConnection.name} didn't select any of the same subcategories. This doesn't mean incompatibility — it might mean you experience the connection through very different lenses. That contrast can be its own kind of richness.`,
      `No direct overlap in what you each named — which is fascinating, not alarming. You may be describing the same connection from two completely different angles.`,
    ]));
  } else {
    paragraphs.push(pick(rng, [
      `You and ${theirConnection.name} share ${totalShared} overlapping thread${totalShared > 1 ? 's' : ''} in how you see this connection.`,
      `There are ${totalShared} point${totalShared > 1 ? 's' : ''} where your maps align — places where you're both seeing the same thing.`,
    ]));
  }

  if (sharedCore.length > 0) {
    paragraphs.push(pick(rng, [
      `You both see ${listNaturally(sharedCore)} as core. This is powerful — you agree on what's foundational. You're building on the same ground.`,
      `${listNaturally(sharedCore)} — core for both of you. That shared clarity is rare and worth protecting.`,
    ]));
  }

  if (sharedRhythm.length > 0) {
    paragraphs.push(pick(rng, [
      `${listNaturally(sharedRhythm)} ${sharedRhythm.length === 1 ? 'is' : 'are'} a shared rhythm — you both recognize ${sharedRhythm.length === 1 ? 'it' : 'them'} as a regular part of how you connect.`,
      `You both feel the rhythm of ${listNaturally(sharedRhythm)}. It's the shared pulse between you.`,
    ]));
  }

  if (uniqueToMe.length > 0 && uniqueToThem.length > 0) {
    paragraphs.push(pick(rng, [
      `There are things you each see that the other didn't name — and that's normal. No two people experience a connection identically. These differences are invitations for curiosity.`,
      `You each named things the other didn't — which means there's still territory to explore in conversation. "I see this between us — do you?" can be a beautiful question.`,
    ]));
  }

  if (sharedCore.length >= 2) {
    paragraphs.push(pick(rng, [
      `With ${sharedCore.length} shared core elements, you have strong mutual clarity. You both know what this is. That shared understanding is a gift.`,
      `Multiple core agreements — that's a connection with a shared vocabulary. You're not guessing at what matters; you both already know.`,
    ]));
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

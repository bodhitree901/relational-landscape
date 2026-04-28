import { Connection, Tier } from './types';

interface AnalysisResult {
  summary: string;
  suggestions: string[];
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
  const activelyWant = getRatingsByTier(connection, 'must-have');
  const openTo = getRatingsByTier(connection, 'open');
  const notSure = getRatingsByTier(connection, 'maybe');
  const notAvailable = getRatingsByTier(connection, 'off-limits');
  const allItems = [...activelyWant, ...openTo, ...notSure, ...notAvailable];
  const name = connection.name;

  if (allItems.length === 0) {
    return {
      summary: `You haven't mapped any aspects of your connection with ${name} yet. Start by exploring which items feel relevant.`,
      suggestions: ['Take some time to walk through each category and see what resonates.'],
    };
  }

  const paragraphs: string[] = [];

  // Opening — what defines this connection
  if (activelyWant.length > 0) {
    const openings = [
      `What you actively want with ${name}: ${listNaturally(activelyWant)}.`,
      `The things you're clear about wanting with ${name} are ${listNaturally(activelyWant)}.`,
      `When it comes to ${name}, you know what matters most — ${listNaturally(activelyWant)}.`,
      `The heart of what you want with ${name} lives in ${listNaturally(activelyWant)}.`,
    ];
    const followups = activelyWant.length === 1
      ? [
          'One clear desire. There\'s power in that kind of clarity.',
          'A single focus — everything else arranges itself around this.',
          'You know exactly what you\'re looking for here.',
        ]
      : [
          'These are the things that matter most — the non-negotiables.',
          'Together, these paint a clear picture of what you\'re building toward.',
          'This is your foundation — what you\'d want to prioritize and protect.',
        ];
    paragraphs.push(`${pick(rng, openings)} ${pick(rng, followups)}`);
  } else if (openTo.length > 0) {
    const openings = [
      `With ${name}, you're in a place of openness — ${listNaturally(openTo)} are things you'd welcome.`,
      `Your connection with ${name} is shaped by possibility — you're open to ${listNaturally(openTo)}.`,
      `Nothing feels like a hard yes yet, but ${listNaturally(openTo)} ${openTo.length === 1 ? 'has' : 'have'} your attention.`,
    ];
    paragraphs.push(`${pick(rng, openings)} ${pick(rng, [
      'Openness is its own kind of intimacy — you\'re leaving room for things to grow.',
      'There\'s generosity in being open without rushing to certainty.',
      'This is a connection that\'s still discovering itself.',
    ])}`);
  } else {
    paragraphs.push(pick(rng, [
      `Your connection with ${name} is still being defined. You're sorting through what feels right — and that's a thoughtful place to be.`,
      `The landscape between you and ${name} is spacious right now. There's room for things to emerge, shift, and surprise you both.`,
    ]));
  }

  // Open to layer
  if (openTo.length > 0 && activelyWant.length > 0) {
    paragraphs.push(pick(rng, [
      `Beyond the essentials, you're open to ${listNaturally(openTo)} — these are the things you'd welcome if they emerged naturally.`,
      `${listNaturally(openTo)} ${openTo.length === 1 ? 'sits' : 'sit'} in a comfortable space — not a priority, but genuinely welcome. ${pick(rng, ['The nice-to-haves that enrich the picture.', 'Doors that are open, not forced.', 'Room to grow into.'])}`,
    ]));
  }

  // Not sure yet
  if (notSure.length > 0) {
    paragraphs.push(pick(rng, [
      `You're still sorting out ${listNaturally(notSure)}. ${pick(rng, ['That uncertainty is honest — not everything needs a label right now.', 'Give yourself time. Clarity comes from experience, not pressure.', 'It\'s okay not to know. The connection will teach you.'])}`,
      `${listNaturally(notSure)} — you're not sure yet, and that's perfectly fine. ${pick(rng, ['Some things need to be lived before they can be decided.', 'Ambiguity can be generative.', 'The "maybe" space is where real discovery happens.'])}`,
    ]));
  }

  // Not available for
  if (notAvailable.length > 0) {
    paragraphs.push(pick(rng, [
      `You've been clear about what's not on the table: ${listNaturally(notAvailable)}. ${pick(rng, ['Knowing your boundaries is a form of self-respect.', 'Clarity about limits protects both of you.', 'These boundaries create safety for everything else to flourish.'])}`,
      `${listNaturally(notAvailable)} — not available for, and that's a strong, healthy boundary. ${pick(rng, ['Not everything needs to be on offer.', 'A clear "no" here makes the "yes" more meaningful.'])}`,
    ]));
  }

  // Category-level insights
  const physicalItems = getCategoryItems(connection, 'physical-intimacy');
  const emotionalItems = getCategoryItems(connection, 'emotional-intimacy');
  const commitmentItems = getCategoryItems(connection, 'commitment');
  const communicationItems = getCategoryItems(connection, 'communication');

  const hasPhysicalActive = physicalItems.some((i) => i.tier === 'must-have' || i.tier === 'open');
  const hasEmotionalActive = emotionalItems.some((i) => i.tier === 'must-have' || i.tier === 'open');
  const hasCommitmentActive = commitmentItems.some((i) => i.tier === 'must-have' || i.tier === 'open');
  const hasCommunicationActive = communicationItems.some((i) => i.tier === 'must-have' || i.tier === 'open');

  const activeAreas = [
    hasPhysicalActive && 'physical',
    hasEmotionalActive && 'emotional',
    hasCommitmentActive && 'commitment',
    hasCommunicationActive && 'communication',
  ].filter(Boolean);

  if (activeAreas.length >= 3) {
    paragraphs.push(pick(rng, [
      `This is a multi-dimensional connection — it spans ${listNaturally(activeAreas as string[])} territory. That kind of breadth speaks to real depth.`,
      `You and ${name} touch ${listNaturally(activeAreas as string[])} dimensions. ${pick(rng, ['Few connections have this kind of spectrum.', 'There\'s a lot of surface area here for the connection to breathe.'])}`,
    ]));
  } else if (activeAreas.length === 1) {
    paragraphs.push(pick(rng, [
      `This connection has a clear center of gravity in the ${activeAreas[0]} space. ${pick(rng, ['That\'s not a limitation — it\'s a clarity.', 'There\'s power in a connection that knows itself.'])}`,
      `The weight of what you want with ${name} falls squarely in the ${activeAreas[0]} space. ${pick(rng, ['Clean, clear, defined.', 'It doesn\'t try to be everything — and that\'s its strength.'])}`,
    ]));
  }

  // Build suggestions
  const suggestions: string[] = [];

  if (hasEmotionalActive && !hasPhysicalActive) {
    suggestions.push(pick(rng, [
      `Deep emotional ground here. If physical connection is something you're curious about, even small gestures — a longer hug, sitting closer — can open that door gently.`,
      `Strong emotional bonds benefit from embodied expression. Even non-romantic touch (a hand on the shoulder, a high five) can deepen what's already there.`,
    ]));
  }

  if (hasPhysicalActive && hasEmotionalActive) {
    suggestions.push(pick(rng, [
      `Physical and emotional intimacy together create a powerful feedback loop. Keep nurturing both — intentional touch during emotional moments amplifies safety.`,
      `The combination of body and heart here is potent. Simple things like holding hands during a difficult conversation can deepen both dimensions at once.`,
    ]));
  }

  if (notSure.length > 0) {
    suggestions.push(pick(rng, [
      `You've marked ${listNaturally(notSure)} as "not sure yet." If any of these spark curiosity, try naming it gently — "I've been wondering about..." is a low-pressure opening.`,
      `The "not sure" items (${listNaturally(notSure)}) are worth revisiting over time. Your feelings may clarify as the connection evolves.`,
    ]));
  }

  if (activelyWant.length > 0 && openTo.length === 0 && notSure.length === 0) {
    suggestions.push(pick(rng, [
      `You're very clear about what you want — and that's powerful. Just remember to leave a little room for the connection to surprise you.`,
      `Strong clarity here. Consider whether there are areas you haven't explored yet that might add unexpected richness.`,
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

  // Reusing field names for backward compat with display components
  // sharedCore = both "actively want", sharedRhythm = both "open to", etc.
  const sharedCore: string[] = [];     // both actively want
  const sharedRhythm: string[] = [];   // both open to
  const sharedSometimes: string[] = []; // both not sure yet
  const sharedPotential: string[] = []; // both not available for
  const uniqueToMe: { sub: string; tier: Tier }[] = [];
  const uniqueToThem: { sub: string; tier: Tier }[] = [];

  for (const sub of allSubs) {
    const myTier = myRatings.get(sub);
    const theirTier = theirRatings.get(sub);

    if (myTier && theirTier) {
      if (myTier === theirTier) {
        if (myTier === 'must-have') sharedCore.push(sub);
        else if (myTier === 'open') sharedRhythm.push(sub);
        else if (myTier === 'maybe') sharedSometimes.push(sub);
        else sharedPotential.push(sub);
      } else {
        // Different tiers — both named it but at different levels
        // Put in the "lower" shared bucket
        const positive = ['must-have', 'open', 'maybe'];
        if (positive.includes(myTier) && positive.includes(theirTier)) {
          sharedRhythm.push(sub); // both want it at some level
        } else {
          // One wants it, the other doesn't — unique to each
          uniqueToMe.push({ sub, tier: myTier });
          uniqueToThem.push({ sub, tier: theirTier });
        }
      }
    } else if (myTier && !theirTier) {
      uniqueToMe.push({ sub, tier: myTier });
    } else if (!myTier && theirTier) {
      uniqueToThem.push({ sub, tier: theirTier });
    }
  }

  const myCatIds = new Set(myConnection.categories.filter((c) => c.ratings.length > 0).map((c) => c.categoryId));
  const theirCatIds = new Set(theirConnection.categories.filter((c) => c.ratings.length > 0).map((c) => c.categoryId));
  const alignedCategories = [...myCatIds].filter((id) => theirCatIds.has(id));

  const paragraphs: string[] = [];
  const totalShared = sharedCore.length + sharedRhythm.length + sharedSometimes.length;

  if (totalShared === 0) {
    paragraphs.push(pick(rng, [
      `You and ${theirConnection.name} didn't align on the same items. This doesn't mean incompatibility — it might mean you experience the connection through different lenses. That contrast can be its own kind of richness.`,
      `No direct overlap in what you each want — which is fascinating, not alarming. You may be describing the same connection from two completely different angles.`,
    ]));
  } else {
    paragraphs.push(pick(rng, [
      `You and ${theirConnection.name} share ${totalShared} overlapping thread${totalShared > 1 ? 's' : ''} in what you want from this connection.`,
      `There are ${totalShared} point${totalShared > 1 ? 's' : ''} where your maps align — places where you both want the same things.`,
    ]));
  }

  if (sharedCore.length > 0) {
    paragraphs.push(pick(rng, [
      `You both actively want ${listNaturally(sharedCore)}. This is powerful — you agree on what's essential. You're building on the same ground.`,
      `${listNaturally(sharedCore)} — actively wanted by both of you. That shared clarity is rare and worth protecting.`,
    ]));
  }

  if (sharedRhythm.length > 0) {
    paragraphs.push(pick(rng, [
      `${listNaturally(sharedRhythm)} ${sharedRhythm.length === 1 ? 'is' : 'are'} something you're both open to — a shared sense of possibility.`,
      `You both see room for ${listNaturally(sharedRhythm)}. It's the shared potential between you.`,
    ]));
  }

  if (uniqueToMe.length > 0 && uniqueToThem.length > 0) {
    paragraphs.push(pick(rng, [
      `There are things you each see differently — and that's normal. No two people experience a connection identically. These differences are invitations for curiosity.`,
      `You each named things the other didn't — which means there's still territory to explore in conversation.`,
    ]));
  }

  if (sharedPotential.length > 0) {
    paragraphs.push(pick(rng, [
      `You both marked ${listNaturally(sharedPotential)} as not available — and that shared boundary is just as important as shared desires.`,
      `Aligned boundaries on ${listNaturally(sharedPotential)}. Knowing what's off the table together creates safety for everything else.`,
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

'use client';
import React from 'react';

type P = { color: string };

const svgStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  display: 'block',
};

const VB = '0 0 280 380';
const PA = 'xMidYMid slice';

// Helper to keep each illustration short
function S({ c, children }: { c: string; children: React.ReactNode }) {
  return (
    <svg viewBox={VB} preserveAspectRatio={PA} style={svgStyle} xmlns="http://www.w3.org/2000/svg">
      <rect width="280" height="380" fill={c} opacity={0.09} />
      {children}
    </svg>
  );
}

/* ============================================================
   LIFE INFRASTRUCTURE
   ============================================================ */

const IllCoHousing = ({ color: c }: P) => (
  <S c={c}>
    <polygon points="140,55 235,155 45,155" fill={c} opacity={0.28} />
    <rect x="65" y="153" width="150" height="115" rx="6" fill={c} opacity={0.20} />
    <rect x="95" y="180" width="32" height="32" rx="4" fill={c} opacity={0.45} />
    <rect x="153" y="180" width="32" height="32" rx="4" fill={c} opacity={0.45} />
    <rect x="125" y="218" width="30" height="50" rx="4" fill={c} opacity={0.60} />
    <line x1="140" y1="55" x2="140" y2="40" stroke={c} strokeWidth="3" opacity={0.40} strokeLinecap="round" />
    <circle cx="140" cy="38" r="4" fill={c} opacity={0.55} />
  </S>
);

const IllCoParenting = ({ color: c }: P) => (
  <S c={c}>
    <circle cx="100" cy="115" r="45" fill={c} opacity={0.30} />
    <circle cx="180" cy="115" r="45" fill={c} opacity={0.30} />
    <circle cx="100" cy="115" r="20" fill={c} opacity={0.55} />
    <circle cx="180" cy="115" r="20" fill={c} opacity={0.55} />
    <circle cx="140" cy="175" r="26" fill={c} opacity={0.45} />
    <circle cx="140" cy="175" r="12" fill={c} opacity={0.75} />
    <path d="M 110 145 Q 140 165 170 145" stroke={c} strokeWidth="2.5" fill="none" opacity={0.4} strokeLinecap="round" />
  </S>
);

const IllHomeOwnership = ({ color: c }: P) => (
  <S c={c}>
    <circle cx="140" cy="100" r="50" fill={c} opacity={0.18} />
    <circle cx="140" cy="100" r="32" fill={c} opacity={0.30} />
    <circle cx="140" cy="100" r="16" fill="white" opacity={0.85} />
    <circle cx="140" cy="100" r="16" fill={c} opacity={0.20} />
    <rect x="134" y="132" width="12" height="80" fill={c} opacity={0.55} />
    <rect x="134" y="180" width="22" height="9" fill={c} opacity={0.55} />
    <rect x="134" y="198" width="16" height="9" fill={c} opacity={0.55} />
  </S>
);

const IllSharedSleepingSpace = ({ color: c }: P) => (
  <S c={c}>
    <ellipse cx="100" cy="140" rx="55" ry="35" fill={c} opacity={0.30} />
    <ellipse cx="180" cy="140" rx="55" ry="35" fill={c} opacity={0.30} />
    <ellipse cx="100" cy="135" rx="40" ry="22" fill={c} opacity={0.45} />
    <ellipse cx="180" cy="135" rx="40" ry="22" fill={c} opacity={0.45} />
    <rect x="40" y="170" width="200" height="65" rx="10" fill={c} opacity={0.20} />
    <path d="M 40 195 L 240 195" stroke={c} strokeWidth="2" opacity={0.35} />
  </S>
);

const IllSharedMeals = ({ color: c }: P) => (
  <S c={c}>
    <path d="M 110 60 Q 105 75 112 90 Q 100 80 105 65 Z" fill={c} opacity={0.45} />
    <path d="M 140 50 Q 134 70 144 90 Q 130 80 134 60 Z" fill={c} opacity={0.45} />
    <path d="M 170 60 Q 165 75 172 90 Q 160 80 165 65 Z" fill={c} opacity={0.45} />
    <path d="M 60 130 Q 60 175 100 180 L 180 180 Q 220 175 220 130 Z" fill={c} opacity={0.30} />
    <path d="M 60 130 Q 60 175 100 180 L 180 180 Q 220 175 220 130 Z" fill={c} opacity={0.50} transform="translate(0, 6)" />
    <ellipse cx="140" cy="130" rx="80" ry="15" fill={c} opacity={0.70} />
  </S>
);

const IllSharedChores = ({ color: c }: P) => (
  <S c={c}>
    <path d="M 50 220 Q 100 60 230 130" stroke={c} strokeWidth="14" fill="none" opacity={0.20} strokeLinecap="round" />
    <path d="M 50 220 Q 100 60 230 130" stroke={c} strokeWidth="3" fill="none" opacity={0.55} strokeLinecap="round" />
    <circle cx="230" cy="130" r="8" fill={c} opacity={0.30} />
    <circle cx="245" cy="120" r="4" fill={c} opacity={0.45} />
    <circle cx="222" cy="115" r="5" fill={c} opacity={0.40} />
    <circle cx="240" cy="145" r="4" fill={c} opacity={0.40} />
    <circle cx="50" cy="220" r="12" fill={c} opacity={0.65} />
  </S>
);

const IllSharedPetsPlants = ({ color: c }: P) => (
  <S c={c}>
    <path d="M 140 60 Q 90 100 90 160 Q 90 200 140 200 Q 190 200 190 160 Q 190 100 140 60 Z" fill={c} opacity={0.25} />
    <path d="M 140 80 L 140 200" stroke={c} strokeWidth="2.5" opacity={0.45} />
    <path d="M 140 130 Q 110 115 100 135" stroke={c} strokeWidth="2" fill="none" opacity={0.40} />
    <path d="M 140 150 Q 175 135 185 155" stroke={c} strokeWidth="2" fill="none" opacity={0.40} />
    <circle cx="100" cy="225" r="9" fill={c} opacity={0.55} />
    <circle cx="92" cy="215" r="4" fill={c} opacity={0.55} />
    <circle cx="108" cy="215" r="4" fill={c} opacity={0.55} />
    <circle cx="100" cy="207" r="4" fill={c} opacity={0.55} />
  </S>
);

const IllSharedExternalCaretaking = ({ color: c }: P) => (
  <S c={c}>
    <circle cx="140" cy="135" r="100" fill={c} opacity={0.10} />
    <circle cx="140" cy="135" r="72" fill={c} opacity={0.14} />
    <circle cx="140" cy="135" r="48" fill={c} opacity={0.22} />
    <path d="M 140 110 C 122 92, 95 102, 95 128 C 95 152, 140 175, 140 175 C 140 175, 185 152, 185 128 C 185 102, 158 92, 140 110 Z" fill={c} opacity={0.70} />
  </S>
);

const IllEmergencyContact = ({ color: c }: P) => (
  <S c={c}>
    <path d="M 100 80 Q 100 70 110 70 L 130 70 Q 140 70 140 80 L 140 100 Q 140 110 135 115 Q 130 125 140 140 Q 150 155 160 150 Q 165 145 175 145 L 195 145 Q 205 145 205 155 L 205 175 Q 205 185 195 185 Q 130 185 105 130 Q 100 100 100 80 Z" fill={c} opacity={0.60} />
    <path d="M 175 60 Q 195 60 205 80" stroke={c} strokeWidth="2.5" fill="none" opacity={0.35} strokeLinecap="round" />
    <path d="M 165 50 Q 200 50 215 85" stroke={c} strokeWidth="2.5" fill="none" opacity={0.25} strokeLinecap="round" />
    <path d="M 155 40 Q 210 40 225 90" stroke={c} strokeWidth="2.5" fill="none" opacity={0.18} strokeLinecap="round" />
  </S>
);

const IllMutualAid = ({ color: c }: P) => (
  <S c={c}>
    <circle cx="140" cy="135" r="85" fill={c} opacity={0.10} />
    <path d="M 50 170 Q 90 160 115 140 Q 125 130 130 130 L 145 130 Q 155 130 158 138" stroke={c} strokeWidth="14" fill="none" opacity={0.40} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 230 100 Q 190 110 165 130 Q 155 140 150 140 L 135 140 Q 125 140 122 132" stroke={c} strokeWidth="14" fill="none" opacity={0.40} strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="140" cy="135" r="12" fill={c} opacity={0.75} />
  </S>
);

const IllBusinessCollaborations = ({ color: c }: P) => (
  <S c={c}>
    <rect x="70" y="90" width="110" height="90" rx="6" fill={c} opacity={0.28} transform="rotate(-8 125 135)" />
    <rect x="100" y="110" width="110" height="90" rx="6" fill={c} opacity={0.40} transform="rotate(8 155 155)" />
    <rect x="115" y="80" width="50" height="22" rx="6" fill={c} opacity={0.55} transform="rotate(-8 140 91)" />
    <line x1="85" y1="125" x2="170" y2="115" stroke={c} strokeWidth="2" opacity={0.45} transform="rotate(-8 125 135)" />
    <line x1="115" y1="145" x2="200" y2="135" stroke={c} strokeWidth="2" opacity={0.45} transform="rotate(8 155 155)" />
  </S>
);

/* ============================================================
   RELATIONAL COMMITMENT
   ============================================================ */

const IllExclusivity = ({ color: c }: P) => (
  <S c={c}>
    <circle cx="140" cy="135" r="95" fill={c} opacity={0.13} />
    <circle cx="140" cy="135" r="65" fill={c} opacity={0.20} />
    <circle cx="140" cy="135" r="38" fill={c} opacity={0.35} />
    <rect x="125" y="125" width="30" height="32" rx="5" fill={c} opacity={0.80} />
    <path d="M 130 125 L 130 115 Q 130 105 140 105 Q 150 105 150 115 L 150 125" stroke={c} strokeWidth="3" fill="none" opacity={0.65} />
    <circle cx="140" cy="140" r="3" fill="white" opacity={0.85} />
  </S>
);

const IllPrioritization = ({ color: c }: P) => (
  <S c={c}>
    <circle cx="140" cy="135" r="90" fill={c} opacity={0.10} />
    {[0, 45, 90, 135, 180, 225, 270, 315].map(a => {
      const rad = (a * Math.PI) / 180;
      const x1 = 140 + Math.cos(rad) * 50;
      const y1 = 135 + Math.sin(rad) * 50;
      const x2 = 140 + Math.cos(rad) * 75;
      const y2 = 135 + Math.sin(rad) * 75;
      return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth="3" opacity={0.40} strokeLinecap="round" />;
    })}
    <polygon points="140,90 152,125 188,125 158,148 170,183 140,162 110,183 122,148 92,125 128,125" fill={c} opacity={0.75} />
  </S>
);

const IllReliability = ({ color: c }: P) => (
  <S c={c}>
    <circle cx="140" cy="80" r="14" fill={c} opacity={0.70} />
    <circle cx="140" cy="80" r="7" fill="white" opacity={0.85} />
    <rect x="135" y="92" width="10" height="100" fill={c} opacity={0.65} rx="2" />
    <rect x="115" y="115" width="50" height="8" fill={c} opacity={0.55} rx="2" />
    <path d="M 80 165 Q 80 215 140 215 Q 200 215 200 165" stroke={c} strokeWidth="9" fill="none" opacity={0.55} strokeLinecap="round" />
    <path d="M 70 155 L 90 165 L 80 175 Z" fill={c} opacity={0.45} />
    <path d="M 210 155 L 190 165 L 200 175 Z" fill={c} opacity={0.45} />
  </S>
);

const IllAllyship = ({ color: c }: P) => (
  <S c={c}>
    <rect x="90" y="100" width="32" height="120" rx="4" fill={c} opacity={0.30} />
    <rect x="158" y="100" width="32" height="120" rx="4" fill={c} opacity={0.30} />
    <rect x="90" y="100" width="32" height="14" rx="2" fill={c} opacity={0.55} />
    <rect x="158" y="100" width="32" height="14" rx="2" fill={c} opacity={0.55} />
    <path d="M 80 100 Q 140 50 200 100" stroke={c} strokeWidth="9" fill="none" opacity={0.55} strokeLinecap="round" />
    <circle cx="140" cy="76" r="9" fill={c} opacity={0.75} />
  </S>
);

const IllHereAndNow = ({ color: c }: P) => (
  <S c={c}>
    <circle cx="140" cy="135" r="120" fill={c} opacity={0.08} />
    <circle cx="140" cy="135" r="85" fill={c} opacity={0.14} />
    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(a => {
      const rad = (a * Math.PI) / 180;
      const x1 = 140 + Math.cos(rad) * 65;
      const y1 = 135 + Math.sin(rad) * 65;
      const x2 = 140 + Math.cos(rad) * 88;
      const y2 = 135 + Math.sin(rad) * 88;
      return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth="3.5" opacity={0.45} strokeLinecap="round" />;
    })}
    <circle cx="140" cy="135" r="42" fill={c} opacity={0.75} />
  </S>
);

const IllLongTermInvolvement = ({ color: c }: P) => (
  <S c={c}>
    <path d="M 70 30 Q 130 80 100 140 Q 70 200 160 240" stroke={c} strokeWidth="22" fill="none" opacity={0.20} strokeLinecap="round" />
    <path d="M 70 30 Q 130 80 100 140 Q 70 200 160 240" stroke={c} strokeWidth="3" fill="none" opacity={0.55} strokeLinecap="round" strokeDasharray="6,8" />
    <circle cx="70" cy="30" r="9" fill={c} opacity={0.70} />
    <circle cx="160" cy="240" r="9" fill={c} opacity={0.70} />
  </S>
);

const IllFuturePlansTogether = ({ color: c }: P) => (
  <S c={c}>
    <circle cx="140" cy="50" r="65" fill={c} opacity={0.13} />
    <circle cx="140" cy="50" r="35" fill={c} opacity={0.15} />
    <path d="M 50 230 C 60 175 115 100 140 60" stroke={c} strokeWidth="2.5" fill="none" strokeDasharray="4,8" strokeLinecap="round" opacity={0.60} />
    <path d="M 230 230 C 220 175 165 100 140 60" stroke={c} strokeWidth="2.5" fill="none" strokeDasharray="4,8" strokeLinecap="round" opacity={0.60} />
    <circle cx="50" cy="230" r="10" fill={c} opacity={0.22} />
    <circle cx="50" cy="230" r="6" fill={c} opacity={0.65} />
    <circle cx="230" cy="230" r="10" fill={c} opacity={0.22} />
    <circle cx="230" cy="230" r="6" fill={c} opacity={0.65} />
    <circle cx="140" cy="48" r="22" fill={c} opacity={0.18} />
    <circle cx="140" cy="48" r="10" fill={c} opacity={0.45} />
    <circle cx="140" cy="48" r="5" fill={c} opacity={0.85} />
  </S>
);

const IllRelationshipLabels = ({ color: c }: P) => (
  <S c={c}>
    <path d="M 65 100 L 175 100 Q 195 100 210 115 L 225 130 Q 230 135 225 140 L 210 155 Q 195 170 175 170 L 65 170 Q 55 170 55 160 L 55 110 Q 55 100 65 100 Z" fill={c} opacity={0.40} transform="rotate(-8 140 135)" />
    <circle cx="195" cy="135" r="6" fill="white" opacity={0.85} transform="rotate(-8 140 135)" />
    <line x1="40" y1="40" x2="80" y2="100" stroke={c} strokeWidth="2.5" opacity={0.45} strokeLinecap="round" />
    <circle cx="40" cy="40" r="6" fill={c} opacity={0.55} />
  </S>
);

const IllWorkingThroughChallenges = ({ color: c }: P) => (
  <S c={c}>
    <polygon points="30,240 100,90 170,180 200,140 250,240" fill={c} opacity={0.30} />
    <polygon points="30,240 100,90 130,135" fill={c} opacity={0.45} />
    <polygon points="100,90 115,112 80,112" fill="white" opacity={0.40} />
    <polygon points="170,180 200,140 215,158" fill={c} opacity={0.55} />
    <circle cx="220" cy="60" r="12" fill={c} opacity={0.45} />
  </S>
);

const IllHealthChallenges = ({ color: c }: P) => (
  <S c={c}>
    <path d="M 30 145 L 80 145 L 95 110 L 115 180 L 135 70 L 155 200 L 180 145 L 250 145" stroke={c} strokeWidth="14" fill="none" opacity={0.20} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 30 145 L 80 145 L 95 110 L 115 180 L 135 70 L 155 200 L 180 145 L 250 145" stroke={c} strokeWidth="4" fill="none" opacity={0.75} strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="135" cy="70" r="6" fill={c} opacity={0.85} />
  </S>
);

const IllEndOfLifeCare = ({ color: c }: P) => (
  <S c={c}>
    <circle cx="140" cy="135" r="110" fill={c} opacity={0.08} />
    <circle cx="140" cy="135" r="80" fill={c} opacity={0.14} />
    <path d="M 140 90 C 115 65, 80 80, 80 115 C 80 150, 140 195, 140 195 C 140 195, 200 150, 200 115 C 200 80, 165 65, 140 90 Z" fill={c} opacity={0.30} />
    <path d="M 140 105 C 125 90, 105 100, 105 120 C 105 140, 140 170, 140 170 C 140 170, 175 140, 175 120 C 175 100, 155 90, 140 105 Z" fill={c} opacity={0.75} />
  </S>
);

/* ============================================================
   QUALITY TIME
   ============================================================ */

const IllSharedHobbies = ({ color: c }: P) => (
  <S c={c}>
    <circle cx="105" cy="115" r="50" fill={c} opacity={0.35} />
    <circle cx="175" cy="115" r="50" fill={c} opacity={0.35} />
    <circle cx="140" cy="180" r="50" fill={c} opacity={0.35} />
    <circle cx="140" cy="135" r="22" fill={c} opacity={0.75} />
  </S>
);

const IllActivitiesYours = ({ color: c }: P) => (
  <S c={c}>
    <circle cx="140" cy="135" r="80" fill={c} opacity={0.10} />
    {[0, 60, 120, 180, 240, 300].map(a => {
      const rad = (a * Math.PI) / 180;
      const x = 140 + Math.cos(rad) * 65;
      const y = 135 + Math.sin(rad) * 65;
      return (
        <g key={a}>
          <line x1="140" y1="135" x2={x} y2={y} stroke={c} strokeWidth="3" opacity={0.45} strokeLinecap="round" />
          <circle cx={x} cy={y} r="6" fill={c} opacity={0.65} />
        </g>
      );
    })}
    <polygon points="140,80 150,125 140,130 130,125" fill={c} opacity={0.55} />
    <circle cx="140" cy="135" r="14" fill={c} opacity={0.85} />
  </S>
);

const IllSharedRituals = ({ color: c }: P) => (
  <S c={c}>
    <path d="M 105 50 Q 100 70 110 85 Q 95 75 100 55 Z" fill={c} opacity={0.40} />
    <path d="M 140 40 Q 132 65 145 85 Q 125 75 130 50 Z" fill={c} opacity={0.40} />
    <path d="M 175 50 Q 170 70 180 85 Q 165 75 170 55 Z" fill={c} opacity={0.40} />
    <path d="M 75 100 L 195 100 L 185 200 Q 185 215 170 215 L 100 215 Q 85 215 85 200 Z" fill={c} opacity={0.45} />
    <path d="M 195 120 Q 220 120 220 145 Q 220 170 195 170" stroke={c} strokeWidth="5" fill="none" opacity={0.45} />
  </S>
);

const IllDateNights = ({ color: c }: P) => (
  <S c={c}>
    <path d="M 110 60 L 110 110 Q 110 140 130 145 L 135 195 L 125 215 L 155 215 L 145 195 L 150 145 Q 170 140 170 110 L 170 60 Z" fill={c} opacity={0.45} />
    <path d="M 113 75 L 167 75" stroke={c} strokeWidth="2" opacity={0.55} />
    <path d="M 115 95 Q 140 115 165 95" stroke={c} strokeWidth="2" fill="none" opacity={0.55} />
    <ellipse cx="140" cy="100" rx="22" ry="15" fill={c} opacity={0.65} />
  </S>
);

const IllSpendingTheNight = ({ color: c }: P) => (
  <S c={c}>
    <path d="M 175 70 A 60 60 0 1 0 230 145 A 50 50 0 1 1 175 70 Z" fill={c} opacity={0.75} />
    <circle cx="60" cy="80" r="4" fill={c} opacity={0.65} />
    <circle cx="90" cy="115" r="3" fill={c} opacity={0.55} />
    <circle cx="50" cy="160" r="5" fill={c} opacity={0.65} />
    <circle cx="80" cy="200" r="3" fill={c} opacity={0.55} />
    <circle cx="115" cy="220" r="4" fill={c} opacity={0.55} />
    <circle cx="195" cy="210" r="3" fill={c} opacity={0.55} />
    <circle cx="225" cy="225" r="4" fill={c} opacity={0.55} />
  </S>
);

const IllParallelPlay = ({ color: c }: P) => (
  <S c={c}>
    <circle cx="95" cy="135" r="42" fill={c} opacity={0.22} />
    <circle cx="95" cy="135" r="22" fill={c} opacity={0.55} />
    <circle cx="185" cy="135" r="42" fill={c} opacity={0.22} />
    <circle cx="185" cy="135" r="22" fill={c} opacity={0.55} />
    <line x1="125" y1="135" x2="155" y2="135" stroke={c} strokeWidth="2.5" strokeDasharray="3,5" opacity={0.40} />
  </S>
);

const IllCelebratingEvents = ({ color: c }: P) => (
  <S c={c}>
    <circle cx="140" cy="135" r="6" fill={c} opacity={0.85} />
    {[
      { x: 80, y: 75, r: 5 }, { x: 200, y: 70, r: 4 }, { x: 60, y: 130, r: 6 },
      { x: 225, y: 145, r: 5 }, { x: 85, y: 200, r: 4 }, { x: 195, y: 210, r: 5 },
      { x: 105, y: 65, r: 3 }, { x: 175, y: 90, r: 3 }, { x: 50, y: 90, r: 4 },
      { x: 215, y: 105, r: 3 }, { x: 110, y: 220, r: 4 }, { x: 175, y: 220, r: 4 },
    ].map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={c} opacity={0.6} />)}
    {[
      [140, 135, 80, 75], [140, 135, 200, 70], [140, 135, 60, 130],
      [140, 135, 225, 145], [140, 135, 85, 200], [140, 135, 195, 210],
    ].map(([x1, y1, x2, y2], i) => (
      <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth="2" opacity={0.30} strokeLinecap="round" strokeDasharray="2,4" />
    ))}
  </S>
);

const IllTripsTogether = ({ color: c }: P) => (
  <S c={c}>
    <path d="M 30 230 Q 140 130 250 230" stroke={c} strokeWidth="2.5" fill="none" opacity={0.40} strokeDasharray="5,7" strokeLinecap="round" />
    <g transform="translate(140, 130) rotate(15)">
      <path d="M -35 0 L 35 0 L 30 -7 L -25 -7 Z" fill={c} opacity={0.65} />
      <path d="M 0 0 L 5 25 L -5 25 Z" fill={c} opacity={0.55} />
      <path d="M -8 -7 L -3 -25 L 3 -25 L -3 -7 Z" fill={c} opacity={0.55} />
    </g>
    <circle cx="30" cy="230" r="8" fill={c} opacity={0.60} />
    <circle cx="250" cy="230" r="8" fill={c} opacity={0.60} />
  </S>
);

const IllCreativeCollaboration = ({ color: c }: P) => (
  <S c={c}>
    <ellipse cx="100" cy="130" rx="55" ry="40" fill={c} opacity={0.30} transform="rotate(-20 100 130)" />
    <ellipse cx="180" cy="145" rx="55" ry="40" fill={c} opacity={0.40} transform="rotate(25 180 145)" />
    <ellipse cx="140" cy="180" rx="50" ry="35" fill={c} opacity={0.30} transform="rotate(-5 140 180)" />
    <circle cx="140" cy="140" r="14" fill={c} opacity={0.80} />
  </S>
);

const IllProjectCollaboration = ({ color: c }: P) => (
  <S c={c}>
    <path d="M 65 90 L 130 90 L 130 110 Q 130 120 140 120 Q 150 120 150 110 L 150 90 L 215 90 L 215 155 L 195 155 Q 185 155 185 165 Q 185 175 195 175 L 215 175 L 215 220 L 65 220 L 65 175 L 85 175 Q 95 175 95 165 Q 95 155 85 155 L 65 155 Z" fill={c} opacity={0.45} />
    <path d="M 65 90 L 130 90 L 130 110 Q 130 120 140 120 Q 150 120 150 110 L 150 90 L 215 90" stroke={c} strokeWidth="2.5" fill="none" opacity={0.55} />
  </S>
);

/* ============================================================
   EMOTIONAL INTIMACY
   ============================================================ */

const Heart = ({ x, y, s, c, o }: { x: number; y: number; s: number; c: string; o: number }) => (
  <path
    d={`M ${x} ${y + s * 0.3} C ${x - s} ${y - s * 0.4}, ${x - s * 1.4} ${y + s * 0.5}, ${x} ${y + s * 1.3} C ${x + s * 1.4} ${y + s * 0.5}, ${x + s} ${y - s * 0.4}, ${x} ${y + s * 0.3} Z`}
    fill={c}
    opacity={o}
  />
);

const IllTermsOfEndearment = ({ color: c }: P) => (
  <S c={c}>
    <Heart x={140} y={135} s={28} c={c} o={0.75} />
    <Heart x={75} y={80} s={12} c={c} o={0.45} />
    <Heart x={215} y={75} s={14} c={c} o={0.50} />
    <Heart x={60} y={170} s={10} c={c} o={0.40} />
    <Heart x={230} y={180} s={13} c={c} o={0.50} />
    <Heart x={100} y={220} s={11} c={c} o={0.40} />
    <Heart x={195} y={215} s={12} c={c} o={0.45} />
  </S>
);

const IllWordsOfAffirmation = ({ color: c }: P) => (
  <S c={c}>
    <path d="M 50 80 Q 50 65 65 65 L 215 65 Q 230 65 230 80 L 230 175 Q 230 190 215 190 L 155 190 L 135 215 L 135 190 L 65 190 Q 50 190 50 175 Z" fill={c} opacity={0.35} />
    <Heart x={140} y={115} s={22} c={c} o={0.75} />
  </S>
);

const IllSayingILoveYou = ({ color: c }: P) => (
  <S c={c}>
    <circle cx="140" cy="130" r="100" fill={c} opacity={0.10} />
    <circle cx="140" cy="130" r="70" fill={c} opacity={0.14} />
    <circle cx="140" cy="130" r="45" fill={c} opacity={0.20} />
    <Heart x={140} y={120} s={30} c={c} o={0.85} />
    {[0, 45, 90, 135, 180, 225, 270, 315].map(a => {
      const rad = (a * Math.PI) / 180;
      const x1 = 140 + Math.cos(rad) * 70;
      const y1 = 130 + Math.sin(rad) * 70;
      const x2 = 140 + Math.cos(rad) * 90;
      const y2 = 130 + Math.sin(rad) * 90;
      return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth="3" opacity={0.45} strokeLinecap="round" />;
    })}
  </S>
);

const IllKnowingLikesDislikes = ({ color: c }: P) => (
  <S c={c}>
    <circle cx="120" cy="115" r="55" fill={c} opacity={0.18} />
    <circle cx="120" cy="115" r="42" fill="white" opacity={0.55} />
    <circle cx="120" cy="115" r="42" fill={c} opacity={0.12} />
    <circle cx="120" cy="115" r="55" fill="none" stroke={c} strokeWidth="6" opacity={0.65} />
    <line x1="160" y1="155" x2="215" y2="210" stroke={c} strokeWidth="10" opacity={0.65} strokeLinecap="round" />
    <Heart x={105} y={102} s={9} c={c} o={0.70} />
    <Heart x={135} y={115} s={7} c={c} o={0.55} />
    <circle cx="115" cy="135" r="3" fill={c} opacity={0.55} />
  </S>
);

const IllSharingLongings = ({ color: c }: P) => (
  <S c={c}>
    <ellipse cx="135" cy="155" rx="80" ry="35" fill={c} opacity={0.25} />
    <circle cx="100" cy="135" r="32" fill={c} opacity={0.30} />
    <circle cx="140" cy="120" r="38" fill={c} opacity={0.35} />
    <circle cx="180" cy="135" r="32" fill={c} opacity={0.30} />
    <polygon points="200,60 207,80 228,80 211,93 218,113 200,100 182,113 189,93 172,80 193,80" fill={c} opacity={0.75} />
  </S>
);

const IllSharingVulnerableFeelings = ({ color: c }: P) => (
  <S c={c}>
    <path d="M 140 50 Q 100 110 100 165 Q 100 210 140 210 Q 180 210 180 165 Q 180 110 140 50 Z" fill={c} opacity={0.25} />
    <path d="M 140 90 Q 115 130 115 170 Q 115 200 140 200 Q 165 200 165 170 Q 165 130 140 90 Z" fill={c} opacity={0.45} />
    <ellipse cx="128" cy="150" rx="10" ry="22" fill="white" opacity={0.55} transform="rotate(-25 128 150)" />
  </S>
);

const IllSharingMentalHealth = ({ color: c }: P) => (
  <S c={c}>
    <path d="M 95 130 Q 75 100 100 80 Q 110 60 135 75 Q 150 60 175 80 Q 200 100 180 130 Q 195 145 180 165 Q 195 185 170 195 Q 160 215 135 200 Q 110 215 100 195 Q 75 185 90 165 Q 75 145 95 130 Z" fill={c} opacity={0.35} />
    <path d="M 137 75 L 137 200" stroke={c} strokeWidth="2" opacity={0.45} />
    <path d="M 105 110 Q 137 130 105 150 Q 137 165 105 180" stroke={c} strokeWidth="1.5" fill="none" opacity={0.45} />
    <path d="M 170 110 Q 137 130 170 150 Q 137 165 170 180" stroke={c} strokeWidth="1.5" fill="none" opacity={0.45} />
  </S>
);

const IllSupportingMentalHealth = ({ color: c }: P) => (
  <S c={c}>
    <path d="M 70 220 Q 90 215 110 218 L 170 218 Q 190 215 210 220" stroke={c} strokeWidth="3" fill="none" opacity={0.55} />
    <rect x="100" y="200" width="80" height="22" rx="3" fill={c} opacity={0.30} />
    <path d="M 140 200 Q 140 150 140 110" stroke={c} strokeWidth="4" fill="none" opacity={0.65} strokeLinecap="round" />
    <path d="M 140 140 Q 100 130 95 100 Q 120 95 140 130" fill={c} opacity={0.55} />
    <path d="M 140 120 Q 175 110 180 80 Q 155 80 140 110" fill={c} opacity={0.55} />
    <circle cx="140" cy="80" r="14" fill={c} opacity={0.75} />
    <path d="M 130 70 Q 140 60 150 70" stroke={c} strokeWidth="2" fill="none" opacity={0.55} />
  </S>
);

const IllOfferingEmotionalSupport = ({ color: c }: P) => (
  <S c={c}>
    <path d="M 50 200 Q 50 130 100 130 Q 130 130 140 165 Q 150 130 180 130 Q 230 130 230 200 L 230 230 L 50 230 Z" fill={c} opacity={0.30} />
    <Heart x={140} y={130} s={32} c={c} o={0.80} />
    <path d="M 70 200 Q 100 195 140 195 Q 180 195 210 200" stroke={c} strokeWidth="2.5" fill="none" opacity={0.45} />
  </S>
);

const IllReliedUponForSupport = ({ color: c }: P) => (
  <S c={c}>
    <circle cx="140" cy="80" r="14" fill={c} opacity={0.75} />
    <circle cx="140" cy="80" r="7" fill="white" opacity={0.85} />
    <rect x="135" y="92" width="10" height="100" fill={c} opacity={0.65} rx="2" />
    <rect x="115" y="115" width="50" height="8" fill={c} opacity={0.55} rx="2" />
    <path d="M 80 165 Q 80 215 140 215 Q 200 215 200 165" stroke={c} strokeWidth="9" fill="none" opacity={0.65} strokeLinecap="round" />
  </S>
);

const IllBeingAConfidante = ({ color: c }: P) => (
  <S c={c}>
    <rect x="100" y="135" width="80" height="80" rx="8" fill={c} opacity={0.45} />
    <path d="M 110 135 L 110 110 Q 110 80 140 80 Q 170 80 170 110 L 170 135" stroke={c} strokeWidth="9" fill="none" opacity={0.65} />
    <circle cx="140" cy="170" r="9" fill="white" opacity={0.85} />
    <rect x="136" y="170" width="8" height="22" fill="white" opacity={0.85} />
  </S>
);

const IllExpressingDisagreements = ({ color: c }: P) => (
  <S c={c}>
    <path d="M 40 90 Q 40 80 50 80 L 125 80 Q 135 80 135 90 L 135 140 Q 135 150 125 150 L 80 150 L 60 175 L 60 150 L 50 150 Q 40 150 40 140 Z" fill={c} opacity={0.45} />
    <path d="M 240 100 Q 240 90 230 90 L 155 90 Q 145 90 145 100 L 145 150 Q 145 160 155 160 L 200 160 L 220 185 L 220 160 L 230 160 Q 240 160 240 150 Z" fill={c} opacity={0.55} />
    <line x1="135" y1="115" x2="145" y2="125" stroke={c} strokeWidth="3" opacity={0.55} strokeLinecap="round" />
    <line x1="145" y1="115" x2="135" y2="125" stroke={c} strokeWidth="3" opacity={0.55} strokeLinecap="round" />
  </S>
);

const IllResolvingConflict = ({ color: c }: P) => (
  <S c={c}>
    <circle cx="80" cy="135" r="48" fill={c} opacity={0.30} />
    <circle cx="200" cy="135" r="48" fill={c} opacity={0.30} />
    <path d="M 80 135 Q 140 100 200 135" stroke={c} strokeWidth="3" fill="none" opacity={0.55} strokeLinecap="round" />
    <path d="M 80 135 Q 140 170 200 135" stroke={c} strokeWidth="3" fill="none" opacity={0.55} strokeLinecap="round" />
    <Heart x={140} y={130} s={18} c={c} o={0.85} />
  </S>
);

const Ill3rdPartySupport = ({ color: c }: P) => (
  <S c={c}>
    <circle cx="140" cy="75" r="32" fill={c} opacity={0.45} />
    <circle cx="85" cy="180" r="32" fill={c} opacity={0.45} />
    <circle cx="195" cy="180" r="32" fill={c} opacity={0.45} />
    <line x1="140" y1="100" x2="85" y2="155" stroke={c} strokeWidth="3" opacity={0.55} strokeLinecap="round" />
    <line x1="140" y1="100" x2="195" y2="155" stroke={c} strokeWidth="3" opacity={0.55} strokeLinecap="round" />
    <line x1="115" y1="180" x2="165" y2="180" stroke={c} strokeWidth="3" opacity={0.55} strokeLinecap="round" />
    <circle cx="140" cy="75" r="14" fill={c} opacity={0.80} />
    <circle cx="85" cy="180" r="14" fill={c} opacity={0.80} />
    <circle cx="195" cy="180" r="14" fill={c} opacity={0.80} />
  </S>
);

const IllMultipleEmotionalBonds = ({ color: c }: P) => (
  <S c={c}>
    <circle cx="140" cy="135" r="100" fill={c} opacity={0.08} />
    {[
      [70, 80], [210, 75], [55, 175], [225, 165], [110, 220], [180, 215],
    ].map(([x, y], i) => (
      <g key={i}>
        <line x1="140" y1="135" x2={x} y2={y} stroke={c} strokeWidth="2" opacity={0.40} strokeLinecap="round" />
        <circle cx={x} cy={y} r="14" fill={c} opacity={0.55} />
      </g>
    ))}
    <circle cx="140" cy="135" r="22" fill={c} opacity={0.85} />
  </S>
);

/* ============================================================
   PHYSICAL INTIMACY
   ============================================================ */

const IllBodyContact = ({ color: c }: P) => (
  <S c={c}>
    <ellipse cx="115" cy="160" rx="55" ry="70" fill={c} opacity={0.30} />
    <ellipse cx="170" cy="155" rx="55" ry="70" fill={c} opacity={0.45} />
    <circle cx="115" cy="100" r="22" fill={c} opacity={0.55} />
    <circle cx="170" cy="95" r="22" fill={c} opacity={0.65} />
  </S>
);

const IllPhysicalAffection = ({ color: c }: P) => (
  <S c={c}>
    <Heart x={140} y={100} s={26} c={c} o={0.75} />
    <path d="M 100 230 Q 90 200 100 175 L 105 130 Q 108 120 115 122 Q 122 124 122 134 L 122 160 L 125 132 Q 128 122 135 124 Q 142 126 142 136 L 142 165 L 145 138 Q 148 128 155 130 Q 162 132 162 142 L 162 168 L 165 148 Q 168 138 175 140 Q 182 142 182 152 L 182 195 Q 182 220 165 230 Z" fill={c} opacity={0.55} />
  </S>
);

const IllHugs = ({ color: c }: P) => (
  <S c={c}>
    <path d="M 60 90 Q 30 135 60 200 Q 90 235 140 230 Q 190 235 220 200 Q 250 135 220 90" stroke={c} strokeWidth="22" fill="none" opacity={0.30} strokeLinecap="round" />
    <circle cx="140" cy="130" r="38" fill={c} opacity={0.55} />
    <circle cx="115" cy="115" r="18" fill={c} opacity={0.70} />
    <circle cx="165" cy="115" r="18" fill={c} opacity={0.70} />
  </S>
);

const IllHandHolding = ({ color: c }: P) => (
  <S c={c}>
    <path d="M 50 175 L 95 175 L 105 145 L 115 175 L 125 130 L 135 175 L 145 140 L 155 175 L 165 130 L 175 175 L 185 145 L 195 175 L 230 175" stroke={c} strokeWidth="14" fill="none" opacity={0.40} strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="140" cy="160" r="28" fill={c} opacity={0.45} />
    <circle cx="140" cy="160" r="14" fill={c} opacity={0.75} />
  </S>
);

const IllKissing = ({ color: c }: P) => (
  <S c={c}>
    <circle cx="100" cy="135" r="48" fill={c} opacity={0.40} />
    <circle cx="180" cy="135" r="48" fill={c} opacity={0.40} />
    <ellipse cx="140" cy="135" rx="14" ry="20" fill={c} opacity={0.75} />
    <Heart x={140} y={75} s={14} c={c} o={0.65} />
  </S>
);

const IllCuddling = ({ color: c }: P) => (
  <S c={c}>
    <ellipse cx="108" cy="210" rx="160" ry="130" fill={c} opacity={0.18} transform="rotate(-12 108 210)" />
    <ellipse cx="132" cy="188" rx="118" ry="96" fill={c} opacity={0.26} transform="rotate(-12 132 188)" />
    <ellipse cx="154" cy="166" rx="80" ry="66" fill={c} opacity={0.38} transform="rotate(-12 154 166)" />
    <ellipse cx="170" cy="148" rx="50" ry="42" fill={c} opacity={0.52} transform="rotate(-12 170 148)" />
    <circle cx="182" cy="130" r="24" fill={c} opacity={0.70} />
  </S>
);

const IllMassage = ({ color: c }: P) => (
  <S c={c}>
    {[80, 110, 140, 170, 200].map((y, i) => (
      <path key={i} d={`M 30 ${y} Q 90 ${y - 18} 140 ${y} T 250 ${y}`} stroke={c} strokeWidth="3.5" fill="none" opacity={0.40 + i * 0.05} strokeLinecap="round" />
    ))}
  </S>
);

const IllCoSleeping = ({ color: c }: P) => (
  <S c={c}>
    <rect x="35" y="160" width="210" height="75" rx="10" fill={c} opacity={0.20} />
    <ellipse cx="105" cy="135" rx="55" ry="22" fill={c} opacity={0.55} />
    <ellipse cx="175" cy="135" rx="55" ry="22" fill={c} opacity={0.55} />
    <circle cx="80" cy="130" r="12" fill={c} opacity={0.75} />
    <circle cx="200" cy="130" r="12" fill={c} opacity={0.75} />
    <path d="M 50 145 L 50 175 M 50 160 L 65 160" stroke={c} strokeWidth="2.5" opacity={0.45} strokeLinecap="round" />
  </S>
);

const IllNudity = ({ color: c }: P) => (
  <S c={c}>
    <path d="M 140 70 C 90 70 75 130 95 175 Q 110 215 140 220 Q 170 215 185 175 C 205 130 190 70 140 70 Z" fill={c} opacity={0.40} />
    <path d="M 140 90 C 110 90 100 135 115 170 Q 125 195 140 200 Q 155 195 165 170 C 180 135 170 90 140 90 Z" fill={c} opacity={0.65} />
    <ellipse cx="130" cy="125" rx="6" ry="14" fill="white" opacity={0.50} transform="rotate(-15 130 125)" />
  </S>
);

const IllSensualInteractions = ({ color: c }: P) => (
  <S c={c}>
    <path d="M 140 230 Q 90 200 100 150 Q 110 110 130 100 Q 145 95 140 115 Q 135 130 145 130 Q 165 130 175 100 Q 180 85 175 70 Q 195 90 200 130 Q 205 175 175 215 Q 158 235 140 230 Z" fill={c} opacity={0.40} />
    <path d="M 140 215 Q 110 195 115 160 Q 125 130 140 125 Q 150 125 150 140 Q 155 155 170 145 Q 185 130 180 110 Q 195 135 190 165 Q 180 200 155 215 Z" fill={c} opacity={0.65} />
  </S>
);

const IllSexualInteractions = ({ color: c }: P) => (
  <S c={c}>
    <circle cx="140" cy="135" r="100" fill={c} opacity={0.10} />
    {Array.from({ length: 14 }).map((_, i) => {
      const a = (i * 360) / 14;
      const rad = (a * Math.PI) / 180;
      const x1 = 140 + Math.cos(rad) * 35;
      const y1 = 135 + Math.sin(rad) * 35;
      const x2 = 140 + Math.cos(rad) * 95;
      const y2 = 135 + Math.sin(rad) * 95;
      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth="4" opacity={0.55} strokeLinecap="round" />;
    })}
    <circle cx="140" cy="135" r="32" fill={c} opacity={0.85} />
  </S>
);

const IllPDA = ({ color: c }: P) => (
  <S c={c}>
    <circle cx="140" cy="135" r="115" fill={c} opacity={0.08} />
    <circle cx="140" cy="135" r="80" fill={c} opacity={0.14} />
    <circle cx="120" cy="135" r="32" fill={c} opacity={0.55} />
    <circle cx="160" cy="135" r="32" fill={c} opacity={0.65} />
    <Heart x={140} y={75} s={14} c={c} o={0.75} />
    {[
      [40, 100], [240, 100], [50, 200], [230, 200],
    ].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="6" fill={c} opacity={0.40} />)}
  </S>
);

const IllKink = ({ color: c }: P) => (
  <S c={c}>
    <ellipse cx="100" cy="135" rx="42" ry="28" fill="none" stroke={c} strokeWidth="14" opacity={0.45} />
    <ellipse cx="180" cy="135" rx="42" ry="28" fill="none" stroke={c} strokeWidth="14" opacity={0.65} />
    <ellipse cx="100" cy="135" rx="42" ry="28" fill="none" stroke={c} strokeWidth="3" opacity={0.75} />
    <ellipse cx="180" cy="135" rx="42" ry="28" fill="none" stroke={c} strokeWidth="3" opacity={0.85} />
  </S>
);

const IllMultipleSexualConnections = ({ color: c }: P) => (
  <S c={c}>
    <circle cx="140" cy="135" r="105" fill={c} opacity={0.08} />
    {[30, 90, 150, 210, 270, 330].map(a => {
      const rad = (a * Math.PI) / 180;
      const x = 140 + Math.cos(rad) * 80;
      const y = 135 + Math.sin(rad) * 80;
      return (
        <g key={a}>
          <line x1="140" y1="135" x2={x} y2={y} stroke={c} strokeWidth="2.5" opacity={0.40} strokeLinecap="round" />
          <circle cx={x} cy={y} r="14" fill={c} opacity={0.65} />
        </g>
      );
    })}
    <circle cx="140" cy="135" r="20" fill={c} opacity={0.85} />
  </S>
);

/* ============================================================
   SOCIAL INTEGRATION
   ============================================================ */

const IllDownToMeetFriends = ({ color: c }: P) => (
  <S c={c}>
    <circle cx="70" cy="135" r="22" fill={c} opacity={0.65} />
    <path d="M 100 135 L 145 135" stroke={c} strokeWidth="2.5" opacity={0.50} strokeDasharray="4,5" strokeLinecap="round" />
    <polygon points="135,130 150,135 135,140" fill={c} opacity={0.55} />
    <circle cx="180" cy="105" r="20" fill={c} opacity={0.45} />
    <circle cx="220" cy="135" r="20" fill={c} opacity={0.45} />
    <circle cx="180" cy="165" r="20" fill={c} opacity={0.45} />
  </S>
);

const IllDownToMeetMetamours = ({ color: c }: P) => (
  <S c={c}>
    <circle cx="75" cy="135" r="22" fill={c} opacity={0.65} />
    <circle cx="205" cy="135" r="22" fill={c} opacity={0.65} />
    <path d="M 100 135 L 140 135" stroke={c} strokeWidth="2.5" opacity={0.50} strokeDasharray="4,5" />
    <path d="M 140 135 L 180 135" stroke={c} strokeWidth="2.5" opacity={0.50} strokeDasharray="4,5" />
    <Heart x={140} y={130} s={12} c={c} o={0.55} />
  </S>
);

const IllDownToMeetFamily = ({ color: c }: P) => (
  <S c={c}>
    <circle cx="75" cy="135" r="22" fill={c} opacity={0.65} />
    <path d="M 100 135 L 140 135" stroke={c} strokeWidth="2.5" opacity={0.50} strokeDasharray="4,5" />
    <polygon points="140,55 235,165 45,165" fill={c} opacity={0.25} />
    <rect x="120" y="160" width="100" height="60" rx="4" fill={c} opacity={0.30} />
    <circle cx="160" cy="190" r="9" fill={c} opacity={0.55} />
    <circle cx="200" cy="190" r="9" fill={c} opacity={0.55} />
    <circle cx="180" cy="190" r="6" fill={c} opacity={0.45} />
  </S>
);

const IllIntegrateWithFriends = ({ color: c }: P) => (
  <S c={c}>
    <circle cx="100" cy="115" r="42" fill={c} opacity={0.35} />
    <circle cx="180" cy="115" r="42" fill={c} opacity={0.35} />
    <circle cx="140" cy="180" r="42" fill={c} opacity={0.35} />
    <circle cx="140" cy="135" r="20" fill={c} opacity={0.80} />
  </S>
);

const IllIntegrateWithMetamours = ({ color: c }: P) => (
  <S c={c}>
    <circle cx="140" cy="135" r="95" fill={c} opacity={0.10} />
    {[
      [80, 90], [200, 90], [60, 165], [220, 165], [140, 215],
    ].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r="14" fill={c} opacity={0.55} />
    ))}
    {[
      [80, 90, 200, 90], [80, 90, 60, 165], [200, 90, 220, 165], [60, 165, 140, 215], [220, 165, 140, 215],
      [80, 90, 220, 165], [200, 90, 60, 165], [80, 90, 140, 215], [200, 90, 140, 215],
    ].map(([x1, y1, x2, y2], i) => (
      <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth="1.5" opacity={0.35} />
    ))}
    <circle cx="140" cy="135" r="14" fill={c} opacity={0.85} />
  </S>
);

const IllIntegrationWithFamily = ({ color: c }: P) => (
  <S c={c}>
    <rect x="135" y="200" width="10" height="40" fill={c} opacity={0.65} />
    <circle cx="140" cy="160" r="55" fill={c} opacity={0.35} />
    <circle cx="115" cy="135" r="30" fill={c} opacity={0.40} />
    <circle cx="165" cy="135" r="30" fill={c} opacity={0.40} />
    <circle cx="140" cy="105" r="35" fill={c} opacity={0.50} />
    <circle cx="100" cy="170" r="20" fill={c} opacity={0.45} />
    <circle cx="180" cy="170" r="20" fill={c} opacity={0.45} />
    <circle cx="140" cy="160" r="14" fill={c} opacity={0.85} />
  </S>
);

const IllSupportingFriendships = ({ color: c }: P) => (
  <S c={c}>
    <circle cx="140" cy="135" r="110" fill={c} opacity={0.08} />
    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(a => {
      const rad = (a * Math.PI) / 180;
      const x1 = 140 + Math.cos(rad) * 55;
      const y1 = 135 + Math.sin(rad) * 55;
      const x2 = 140 + Math.cos(rad) * 95;
      const y2 = 135 + Math.sin(rad) * 95;
      return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth="3" opacity={0.40} strokeLinecap="round" />;
    })}
    <circle cx="100" cy="120" r="14" fill={c} opacity={0.65} />
    <circle cx="180" cy="120" r="14" fill={c} opacity={0.65} />
    <circle cx="140" cy="170" r="14" fill={c} opacity={0.65} />
    <Heart x={140} y={130} s={14} c={c} o={0.85} />
  </S>
);

const IllSupportingMetamourRelationships = ({ color: c }: P) => (
  <S c={c}>
    <Heart x={75} y={130} s={20} c={c} o={0.60} />
    <Heart x={205} y={130} s={20} c={c} o={0.60} />
    <path d="M 100 135 Q 140 100 180 135" stroke={c} strokeWidth="3" fill="none" opacity={0.55} strokeLinecap="round" />
    <path d="M 100 145 Q 140 170 180 145" stroke={c} strokeWidth="3" fill="none" opacity={0.55} strokeLinecap="round" />
    <Heart x={140} y={130} s={14} c={c} o={0.85} />
  </S>
);

const IllPresentingAsSocialUnitPublic = ({ color: c }: P) => (
  <S c={c}>
    <ellipse cx="140" cy="150" rx="70" ry="80" fill={c} opacity={0.35} />
    <circle cx="115" cy="105" r="22" fill={c} opacity={0.55} />
    <circle cx="165" cy="105" r="22" fill={c} opacity={0.55} />
    <ellipse cx="140" cy="170" rx="58" ry="60" fill={c} opacity={0.65} />
    {[
      [50, 200], [55, 220], [225, 200], [220, 225], [40, 140], [240, 140],
    ].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="5" fill={c} opacity={0.40} />)}
  </S>
);

const IllPresentingAsSocialUnitMedia = ({ color: c }: P) => (
  <S c={c}>
    <circle cx="140" cy="155" r="18" fill={c} opacity={0.85} />
    {[40, 65, 90].map((r, i) => (
      <path
        key={i}
        d={`M ${140 - r} 155 A ${r} ${r} 0 0 1 ${140 + r} 155`}
        stroke={c}
        strokeWidth="4"
        fill="none"
        opacity={0.55 - i * 0.13}
        strokeLinecap="round"
      />
    ))}
    <circle cx="115" cy="150" r="8" fill="white" opacity={0.6} />
    <circle cx="165" cy="150" r="8" fill="white" opacity={0.6} />
  </S>
);

const IllPlusOne = ({ color: c }: P) => (
  <S c={c}>
    <rect x="65" y="100" width="65" height="120" rx="8" fill={c} opacity={0.40} transform="rotate(-10 97 160)" />
    <rect x="150" y="100" width="65" height="120" rx="8" fill={c} opacity={0.55} transform="rotate(10 182 160)" />
    <circle cx="97" cy="135" r="6" fill="white" opacity={0.55} transform="rotate(-10 97 160)" />
    <circle cx="97" cy="185" r="6" fill="white" opacity={0.55} transform="rotate(-10 97 160)" />
    <circle cx="182" cy="135" r="6" fill="white" opacity={0.55} transform="rotate(10 182 160)" />
    <circle cx="182" cy="185" r="6" fill="white" opacity={0.55} transform="rotate(10 182 160)" />
    <line x1="135" y1="160" x2="148" y2="160" stroke={c} strokeWidth="3" opacity={0.55} strokeLinecap="round" />
  </S>
);

const IllJointTrips = ({ color: c }: P) => (
  <S c={c}>
    <path d="M 30 220 Q 100 100 250 200" stroke={c} strokeWidth="2.5" fill="none" opacity={0.40} strokeDasharray="5,7" strokeLinecap="round" />
    <circle cx="90" cy="170" r="14" fill={c} opacity={0.65} />
    <circle cx="140" cy="135" r="14" fill={c} opacity={0.75} />
    <circle cx="190" cy="140" r="14" fill={c} opacity={0.65} />
    <circle cx="30" cy="220" r="8" fill={c} opacity={0.55} />
    <circle cx="250" cy="200" r="8" fill={c} opacity={0.55} />
  </S>
);

/* ============================================================
   FINANCIAL / LEGAL
   ============================================================ */

const IllGifts = ({ color: c }: P) => (
  <S c={c}>
    <rect x="65" y="120" width="150" height="110" rx="6" fill={c} opacity={0.40} />
    <rect x="130" y="120" width="20" height="110" fill={c} opacity={0.60} />
    <rect x="65" y="160" width="150" height="14" fill={c} opacity={0.60} />
    <path d="M 100 90 Q 90 65 110 60 Q 130 60 140 95 Q 150 60 170 60 Q 190 65 180 90 Q 175 105 140 110 Q 105 105 100 90 Z" fill={c} opacity={0.75} />
    <circle cx="140" cy="98" r="6" fill={c} opacity={0.85} />
  </S>
);

const IllSharingCosts = ({ color: c }: P) => (
  <S c={c}>
    <rect x="135" y="80" width="10" height="120" fill={c} opacity={0.65} />
    <path d="M 75 90 L 205 90" stroke={c} strokeWidth="4" opacity={0.55} strokeLinecap="round" />
    <path d="M 75 90 L 50 145" stroke={c} strokeWidth="2.5" opacity={0.50} strokeLinecap="round" />
    <path d="M 75 90 L 100 145" stroke={c} strokeWidth="2.5" opacity={0.50} strokeLinecap="round" />
    <ellipse cx="75" cy="155" rx="35" ry="14" fill={c} opacity={0.55} />
    <path d="M 205 90 L 180 145" stroke={c} strokeWidth="2.5" opacity={0.50} strokeLinecap="round" />
    <path d="M 205 90 L 230 145" stroke={c} strokeWidth="2.5" opacity={0.50} strokeLinecap="round" />
    <ellipse cx="205" cy="155" rx="35" ry="14" fill={c} opacity={0.55} />
    <rect x="115" y="200" width="50" height="14" rx="2" fill={c} opacity={0.65} />
    <circle cx="140" cy="75" r="6" fill={c} opacity={0.75} />
  </S>
);

const IllLendingMoney = ({ color: c }: P) => (
  <S c={c}>
    <circle cx="70" cy="135" r="32" fill={c} opacity={0.55} />
    <circle cx="210" cy="135" r="32" fill={c} opacity={0.55} />
    <path d="M 95 120 L 185 120" stroke={c} strokeWidth="5" opacity={0.65} strokeLinecap="round" />
    <polygon points="185,110 200,120 185,130" fill={c} opacity={0.75} />
    <path d="M 185 155 L 95 155" stroke={c} strokeWidth="5" opacity={0.65} strokeLinecap="round" />
    <polygon points="95,145 80,155 95,165" fill={c} opacity={0.75} />
    <text x="70" y="142" fontSize="22" fontWeight="700" fill="white" opacity={0.85} textAnchor="middle">$</text>
    <text x="210" y="142" fontSize="22" fontWeight="700" fill="white" opacity={0.85} textAnchor="middle">$</text>
  </S>
);

const IllFinancialSupport = ({ color: c }: P) => (
  <S c={c}>
    <circle cx="140" cy="135" r="60" fill={c} opacity={0.30} />
    <circle cx="140" cy="135" r="42" fill={c} opacity={0.45} />
    <text x="140" y="148" fontSize="44" fontWeight="700" fill="white" opacity={0.85} textAnchor="middle">$</text>
    <path d="M 140 60 L 140 100" stroke={c} strokeWidth="4" opacity={0.55} strokeLinecap="round" />
    <polygon points="125,75 140,55 155,75" fill={c} opacity={0.65} />
  </S>
);

const IllFinancialIntegration = ({ color: c }: P) => (
  <S c={c}>
    <circle cx="115" cy="135" r="42" fill="none" stroke={c} strokeWidth="14" opacity={0.45} />
    <circle cx="165" cy="135" r="42" fill="none" stroke={c} strokeWidth="14" opacity={0.65} />
    <circle cx="115" cy="135" r="42" fill="none" stroke={c} strokeWidth="3" opacity={0.85} />
    <circle cx="165" cy="135" r="42" fill="none" stroke={c} strokeWidth="3" opacity={0.85} />
    <text x="115" y="143" fontSize="22" fontWeight="700" fill={c} opacity={0.65} textAnchor="middle">$</text>
    <text x="165" y="143" fontSize="22" fontWeight="700" fill={c} opacity={0.65} textAnchor="middle">$</text>
  </S>
);

const IllSharedBankAccount = ({ color: c }: P) => (
  <S c={c}>
    <rect x="55" y="155" width="170" height="80" rx="6" fill={c} opacity={0.35} />
    <polygon points="50,155 140,75 230,155" fill={c} opacity={0.45} />
    {[80, 110, 140, 170, 200].map(x => (
      <rect key={x} x={x - 4} y="160" width="8" height="60" fill={c} opacity={0.55} />
    ))}
    <rect x="50" y="225" width="180" height="10" fill={c} opacity={0.65} />
    <text x="140" y="125" fontSize="20" fontWeight="700" fill="white" opacity={0.85} textAnchor="middle">$</text>
  </S>
);

const IllLegalProcesses = ({ color: c }: P) => (
  <S c={c}>
    <rect x="70" y="75" width="140" height="170" rx="3" fill={c} opacity={0.35} />
    <rect x="80" y="85" width="120" height="150" fill="white" opacity={0.45} />
    {[105, 125, 145, 165, 185, 205].map(y => (
      <line key={y} x1="95" y1={y} x2="185" y2={y} stroke={c} strokeWidth="2" opacity={0.50} />
    ))}
    <circle cx="190" cy="225" r="18" fill={c} opacity={0.75} />
    <circle cx="190" cy="225" r="12" fill="white" opacity={0.85} />
  </S>
);

const IllMarriage = ({ color: c }: P) => (
  <S c={c}>
    <circle cx="110" cy="135" r="42" fill="none" stroke={c} strokeWidth="9" opacity={0.55} />
    <circle cx="170" cy="135" r="42" fill="none" stroke={c} strokeWidth="9" opacity={0.75} />
    <polygon points="110,80 102,98 118,98" fill={c} opacity={0.65} />
    <polygon points="170,80 162,98 178,98" fill={c} opacity={0.65} />
  </S>
);

/* ============================================================
   COMMUNICATION
   ============================================================ */

const IllTexting = ({ color: c }: P) => (
  <S c={c}>
    <path d="M 40 100 Q 40 85 55 85 L 175 85 Q 190 85 190 100 L 190 155 Q 190 170 175 170 L 100 170 L 75 195 L 75 170 L 55 170 Q 40 170 40 155 Z" fill={c} opacity={0.45} />
    <path d="M 95 130 Q 95 120 105 120 L 220 120 Q 235 120 235 135 L 235 200 Q 235 215 220 215 L 205 215 L 185 240 L 185 215 L 105 215 Q 95 215 95 200 Z" fill={c} opacity={0.65} />
    <circle cx="90" cy="125" r="4" fill="white" opacity={0.75} />
    <circle cx="115" cy="125" r="4" fill="white" opacity={0.75} />
    <circle cx="140" cy="125" r="4" fill="white" opacity={0.75} />
  </S>
);

const IllVoiceMessages = ({ color: c }: P) => (
  <S c={c}>
    {[50, 75, 100, 125, 150, 175, 200, 225].map((x, i) => {
      const heights = [40, 70, 30, 90, 55, 80, 35, 60];
      return (
        <rect
          key={x}
          x={x}
          y={135 - heights[i] / 2}
          width="12"
          height={heights[i]}
          rx="3"
          fill={c}
          opacity={0.55}
        />
      );
    })}
  </S>
);

const IllPhoneVideoCalls = ({ color: c }: P) => (
  <S c={c}>
    <rect x="50" y="100" width="140" height="90" rx="10" fill={c} opacity={0.50} />
    <polygon points="190,125 230,100 230,190 190,165" fill={c} opacity={0.65} />
    <circle cx="100" cy="135" r="14" fill="white" opacity={0.55} />
    <path d="M 75 175 Q 100 160 125 175" stroke="white" strokeWidth="3" fill="none" opacity={0.55} strokeLinecap="round" />
    <circle cx="155" cy="125" r="3" fill="white" opacity={0.85} />
  </S>
);

const IllDiscussingWorkHobbies = ({ color: c }: P) => (
  <S c={c}>
    <path d="M 65 130 Q 65 90 110 90 Q 130 65 165 75 Q 215 75 215 125 Q 215 175 165 175 L 130 175 L 100 205 L 110 175 Q 65 170 65 130 Z" fill={c} opacity={0.50} />
    <rect x="115" y="120" width="50" height="38" rx="4" fill="white" opacity={0.55} />
    <rect x="125" y="110" width="30" height="10" fill="white" opacity={0.55} />
  </S>
);

const IllDiscussingPolitics = ({ color: c }: P) => (
  <S c={c}>
    <circle cx="140" cy="135" r="80" fill={c} opacity={0.30} />
    <ellipse cx="140" cy="135" rx="80" ry="30" fill="none" stroke={c} strokeWidth="2.5" opacity={0.55} />
    <ellipse cx="140" cy="135" rx="35" ry="80" fill="none" stroke={c} strokeWidth="2.5" opacity={0.55} />
    <ellipse cx="140" cy="135" rx="80" ry="60" fill="none" stroke={c} strokeWidth="2" opacity={0.45} />
    <circle cx="140" cy="135" r="80" fill="none" stroke={c} strokeWidth="3" opacity={0.65} />
  </S>
);

const IllIntellectual = ({ color: c }: P) => (
  <S c={c}>
    <path d="M 140 60 Q 90 60 90 110 Q 90 145 115 165 L 115 195 L 165 195 L 165 165 Q 190 145 190 110 Q 190 60 140 60 Z" fill={c} opacity={0.45} />
    <rect x="115" y="200" width="50" height="10" rx="2" fill={c} opacity={0.55} />
    <rect x="120" y="215" width="40" height="8" rx="2" fill={c} opacity={0.65} />
    <path d="M 140 90 L 140 165" stroke="white" strokeWidth="3" opacity={0.55} />
    <path d="M 120 145 L 160 145" stroke="white" strokeWidth="2" opacity={0.45} />
    {[0, 90, 180, 270].map(a => {
      const rad = (a * Math.PI) / 180;
      const x1 = 140 + Math.cos(rad) * 100;
      const y1 = 110 + Math.sin(rad) * 100;
      const x2 = 140 + Math.cos(rad) * 80;
      const y2 = 110 + Math.sin(rad) * 80;
      return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth="3" opacity={0.40} strokeLinecap="round" />;
    })}
  </S>
);

const IllDiscussingRelationships = ({ color: c }: P) => (
  <S c={c}>
    <path d="M 45 95 Q 45 85 55 85 L 130 85 Q 140 85 140 95 L 140 130 Q 140 140 130 140 L 80 140 L 65 155 L 65 140 L 55 140 Q 45 140 45 130 Z" fill={c} opacity={0.40} />
    <path d="M 110 145 Q 110 135 120 135 L 220 135 Q 235 135 235 145 L 235 185 Q 235 195 220 195 L 145 195 L 125 215 L 125 195 L 120 195 Q 110 195 110 185 Z" fill={c} opacity={0.55} />
    <path d="M 70 165 Q 70 155 80 155 L 170 155 Q 180 155 180 165 L 180 205 Q 180 215 170 215 L 105 215 L 90 235 L 90 215 L 80 215 Q 70 215 70 205 Z" fill={c} opacity={0.65} />
  </S>
);

const IllPlayingLaughing = ({ color: c }: P) => (
  <S c={c}>
    <circle cx="140" cy="135" r="85" fill={c} opacity={0.30} />
    <path d="M 90 130 Q 140 200 190 130" stroke={c} strokeWidth="9" fill="none" opacity={0.75} strokeLinecap="round" />
    <ellipse cx="110" cy="105" rx="6" ry="9" fill={c} opacity={0.80} />
    <ellipse cx="170" cy="105" rx="6" ry="9" fill={c} opacity={0.80} />
    <circle cx="55" cy="80" r="6" fill={c} opacity={0.55} />
    <circle cx="225" cy="80" r="6" fill={c} opacity={0.55} />
    <circle cx="50" cy="190" r="4" fill={c} opacity={0.45} />
    <circle cx="230" cy="190" r="4" fill={c} opacity={0.45} />
  </S>
);

const IllSharingStories = ({ color: c }: P) => (
  <S c={c}>
    <path d="M 40 100 L 140 95 L 140 215 L 40 220 Z" fill={c} opacity={0.35} />
    <path d="M 240 100 L 140 95 L 140 215 L 240 220 Z" fill={c} opacity={0.45} />
    <line x1="140" y1="95" x2="140" y2="215" stroke={c} strokeWidth="2" opacity={0.65} />
    {[120, 140, 160, 180].map(y => (
      <g key={y}>
        <line x1="60" y1={y} x2="125" y2={y - 1} stroke={c} strokeWidth="1.5" opacity={0.50} />
        <line x1="155" y1={y - 1} x2="220" y2={y} stroke={c} strokeWidth="1.5" opacity={0.50} />
      </g>
    ))}
  </S>
);

const IllRelationshipCheckIns = ({ color: c }: P) => (
  <S c={c}>
    <rect x="85" y="80" width="110" height="155" rx="8" fill={c} opacity={0.35} />
    <rect x="105" y="65" width="70" height="30" rx="6" fill={c} opacity={0.55} />
    {[
      [105, 120], [105, 150], [105, 180],
    ].map(([x, y], i) => (
      <g key={i}>
        <rect x={x} y={y - 5} width="14" height="14" rx="3" fill="white" opacity={0.55} />
        <path d={`M ${x + 3} ${y + 2} L ${x + 6} ${y + 5} L ${x + 11} ${y - 2}`} stroke={c} strokeWidth="2.5" fill="none" opacity={0.85} strokeLinecap="round" strokeLinejoin="round" />
        <line x1={x + 22} y1={y + 2} x2={x + 75} y2={y + 2} stroke={c} strokeWidth="2" opacity={0.55} />
      </g>
    ))}
  </S>
);

const IllRadicalHonesty = ({ color: c }: P) => (
  <S c={c}>
    <path d="M 40 135 Q 100 70 140 70 Q 180 70 240 135 Q 180 200 140 200 Q 100 200 40 135 Z" fill={c} opacity={0.30} />
    <circle cx="140" cy="135" r="42" fill="white" opacity={0.55} />
    <circle cx="140" cy="135" r="42" fill={c} opacity={0.20} />
    <circle cx="140" cy="135" r="22" fill={c} opacity={0.85} />
    <circle cx="148" cy="125" r="5" fill="white" opacity={0.85} />
  </S>
);

const IllTransparency = ({ color: c }: P) => (
  <S c={c}>
    <circle cx="95" cy="135" r="55" fill="none" stroke={c} strokeWidth="3" opacity={0.55} />
    <circle cx="95" cy="135" r="55" fill={c} opacity={0.18} />
    <circle cx="185" cy="135" r="55" fill="none" stroke={c} strokeWidth="3" opacity={0.55} />
    <circle cx="185" cy="135" r="55" fill={c} opacity={0.18} />
    <circle cx="140" cy="135" r="55" fill="none" stroke={c} strokeWidth="3" opacity={0.55} />
    <circle cx="140" cy="135" r="55" fill={c} opacity={0.18} />
  </S>
);

/* ============================================================
   TIME AND RHYTHMS
   ============================================================ */

const IllResponseExpectations = ({ color: c }: P) => (
  <S c={c}>
    <circle cx="140" cy="135" r="80" fill={c} opacity={0.30} />
    <circle cx="140" cy="135" r="80" fill="none" stroke={c} strokeWidth="4" opacity={0.65} />
    {[0, 90, 180, 270].map(a => {
      const rad = (a * Math.PI) / 180;
      const x1 = 140 + Math.cos(rad) * 65;
      const y1 = 135 + Math.sin(rad) * 65;
      const x2 = 140 + Math.cos(rad) * 78;
      const y2 = 135 + Math.sin(rad) * 78;
      return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth="4" opacity={0.65} strokeLinecap="round" />;
    })}
    <line x1="140" y1="135" x2="140" y2="80" stroke={c} strokeWidth="4" opacity={0.85} strokeLinecap="round" />
    <line x1="140" y1="135" x2="175" y2="155" stroke={c} strokeWidth="3" opacity={0.85} strokeLinecap="round" />
    <circle cx="140" cy="135" r="6" fill={c} opacity={0.85} />
  </S>
);

const IllDailyFrequentComm = ({ color: c }: P) => (
  <S c={c}>
    <circle cx="140" cy="135" r="42" fill={c} opacity={0.75} />
    {[0, 45, 90, 135, 180, 225, 270, 315].map(a => {
      const rad = (a * Math.PI) / 180;
      const x1 = 140 + Math.cos(rad) * 55;
      const y1 = 135 + Math.sin(rad) * 55;
      const x2 = 140 + Math.cos(rad) * 85;
      const y2 = 135 + Math.sin(rad) * 85;
      return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth="5" opacity={0.55} strokeLinecap="round" />;
    })}
    {[22, 67, 112, 157, 202, 247, 292, 337].map(a => {
      const rad = (a * Math.PI) / 180;
      const x = 140 + Math.cos(rad) * 100;
      const y = 135 + Math.sin(rad) * 100;
      return <circle key={a} cx={x} cy={y} r="3" fill={c} opacity={0.45} />;
    })}
  </S>
);

const IllUnplannedComm = ({ color: c }: P) => (
  <S c={c}>
    <polygon points="160,55 90,160 130,160 100,225 200,110 155,110 185,55" fill={c} opacity={0.30} />
    <polygon points="160,55 90,160 130,160 100,225 200,110 155,110 185,55" fill={c} opacity={0.85} transform="translate(5, -5)" />
  </S>
);

const IllIntegratedDailyLife = ({ color: c }: P) => (
  <S c={c}>
    {Array.from({ length: 6 }).map((_, i) => (
      <line key={`v${i}`} x1={60 + i * 32} y1="70" x2={60 + i * 32} y2="220" stroke={c} strokeWidth="4" opacity={i % 2 === 0 ? 0.55 : 0.30} />
    ))}
    {Array.from({ length: 6 }).map((_, i) => (
      <line key={`h${i}`} x1="55" y1={75 + i * 30} x2="225" y2={75 + i * 30} stroke={c} strokeWidth="4" opacity={i % 2 === 0 ? 0.30 : 0.55} />
    ))}
    <circle cx="140" cy="145" r="14" fill={c} opacity={0.85} />
  </S>
);

const IllLongDistance = ({ color: c }: P) => (
  <S c={c}>
    <circle cx="50" cy="135" r="22" fill={c} opacity={0.60} />
    <circle cx="230" cy="135" r="22" fill={c} opacity={0.60} />
    <path d="M 75 135 L 205 135" stroke={c} strokeWidth="3" strokeDasharray="6,8" opacity={0.55} strokeLinecap="round" />
    <circle cx="140" cy="135" r="6" fill={c} opacity={0.45} />
  </S>
);

const IllSpontaneousHangouts = ({ color: c }: P) => (
  <S c={c}>
    {Array.from({ length: 12 }).map((_, i) => {
      const a = (i * 360) / 12;
      const rad = (a * Math.PI) / 180;
      const x1 = 140 + Math.cos(rad) * 30;
      const y1 = 135 + Math.sin(rad) * 30;
      const x2 = 140 + Math.cos(rad) * (i % 2 === 0 ? 90 : 65);
      const y2 = 135 + Math.sin(rad) * (i % 2 === 0 ? 90 : 65);
      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth="3.5" opacity={0.55} strokeLinecap="round" />;
    })}
    <circle cx="140" cy="135" r="22" fill={c} opacity={0.85} />
  </S>
);

const IllPlannedHangouts = ({ color: c }: P) => (
  <S c={c}>
    <rect x="65" y="90" width="150" height="140" rx="8" fill={c} opacity={0.35} />
    <rect x="65" y="90" width="150" height="32" rx="8" fill={c} opacity={0.55} />
    <rect x="65" y="115" width="150" height="7" fill={c} opacity={0.55} />
    <rect x="90" y="70" width="10" height="35" rx="3" fill={c} opacity={0.65} />
    <rect x="180" y="70" width="10" height="35" rx="3" fill={c} opacity={0.65} />
    <circle cx="140" cy="170" r="22" fill={c} opacity={0.85} />
    <path d="M 130 168 L 137 178 L 152 158" stroke="white" strokeWidth="3.5" fill="none" opacity={0.95} strokeLinecap="round" strokeLinejoin="round" />
  </S>
);

const IllRegularlyScheduled = ({ color: c }: P) => (
  <S c={c}>
    <circle cx="140" cy="135" r="70" fill={c} opacity={0.18} />
    <path d="M 140 65 A 70 70 0 0 1 210 135" stroke={c} strokeWidth="9" fill="none" opacity={0.65} strokeLinecap="round" />
    <polygon points="200,128 220,135 200,142" fill={c} opacity={0.75} />
    <path d="M 140 205 A 70 70 0 0 1 70 135" stroke={c} strokeWidth="9" fill="none" opacity={0.65} strokeLinecap="round" />
    <polygon points="80,142 60,135 80,128" fill={c} opacity={0.75} />
    <circle cx="140" cy="135" r="14" fill={c} opacity={0.85} />
  </S>
);

const IllWeeklyHangouts = ({ color: c }: P) => (
  <S c={c}>
    {[0, 1, 2, 3, 4, 5, 6].map(i => {
      const a = (i / 7) * 180 + 180;
      const rad = (a * Math.PI) / 180;
      const x = 140 + Math.cos(rad) * 70;
      const y = 150 + Math.sin(rad) * 70;
      return (
        <circle
          key={i}
          cx={x}
          cy={y}
          r="14"
          fill={c}
          opacity={i === 3 ? 0.85 : 0.45}
        />
      );
    })}
    <path d="M 60 150 Q 140 70 220 150" stroke={c} strokeWidth="2" fill="none" opacity={0.30} strokeDasharray="3,6" />
  </S>
);

const IllMonthlyHangouts = ({ color: c }: P) => (
  <S c={c}>
    {[
      { x: 60, r: 6, o: 0.20 },
      { x: 100, r: 10, o: 0.40 },
      { x: 140, r: 22, o: 0.85 },
      { x: 180, r: 10, o: 0.40 },
      { x: 220, r: 6, o: 0.20 },
    ].map((p, i) => (
      <g key={i}>
        <circle cx={p.x} cy="135" r={p.r + 4} fill={c} opacity={p.o * 0.3} />
        <circle cx={p.x} cy="135" r={p.r} fill={c} opacity={p.o} />
      </g>
    ))}
    <path d="M 50 135 L 230 135" stroke={c} strokeWidth="2" opacity={0.25} strokeDasharray="3,6" />
  </S>
);

const IllYearlyHangouts = ({ color: c }: P) => (
  <S c={c}>
    <circle cx="140" cy="135" r="95" fill="none" stroke={c} strokeWidth="2.5" opacity={0.45} strokeDasharray="4,7" />
    <circle cx="140" cy="135" r="60" fill={c} opacity={0.30} />
    <circle cx="140" cy="135" r="60" fill="none" stroke={c} strokeWidth="3" opacity={0.55} />
    <circle cx="140" cy="135" r="20" fill={c} opacity={0.85} />
    <circle cx="235" cy="135" r="8" fill={c} opacity={0.75} />
    <circle cx="45" cy="135" r="6" fill={c} opacity={0.55} />
  </S>
);

const IllSeasonalConnecting = ({ color: c }: P) => (
  <S c={c}>
    <path d="M 30 230 Q 100 170 220 60" stroke={c} strokeWidth="9" fill="none" opacity={0.20} strokeLinecap="round" />
    <path d="M 30 230 Q 100 170 220 60" stroke={c} strokeWidth="3" fill="none" opacity={0.40} strokeLinecap="round" strokeDasharray="4,8" />
    <polygon points="220,40 230,60 250,55 235,75 245,95 220,85 195,95 205,75 190,55 210,60" fill={c} opacity={0.85} />
    <circle cx="220" cy="65" r="12" fill={c} opacity={0.55} />
  </S>
);

/* ============================================================
   TONES
   ============================================================ */

const IllCompanionship = ({ color: c }: P) => (
  <S c={c}>
    <circle cx="105" cy="105" r="22" fill={c} opacity={0.65} />
    <path d="M 80 130 Q 80 175 105 175 L 130 175 L 130 220 L 115 240 L 95 240 L 95 220 L 90 200 L 80 220 L 65 220 L 65 200 L 75 175 Q 80 165 80 130 Z" fill={c} opacity={0.55} />
    <circle cx="175" cy="105" r="22" fill={c} opacity={0.65} />
    <path d="M 150 130 Q 150 175 175 175 L 200 175 L 200 220 L 215 240 L 195 240 L 195 220 L 190 200 L 180 220 L 165 220 L 165 200 L 175 175 Q 150 165 150 130 Z" fill={c} opacity={0.55} />
  </S>
);

const IllFriendship = ({ color: c }: P) => (
  <S c={c}>
    <circle cx="105" cy="135" r="60" fill={c} opacity={0.35} />
    <circle cx="175" cy="135" r="60" fill={c} opacity={0.50} />
    <circle cx="105" cy="135" r="30" fill={c} opacity={0.55} />
    <circle cx="175" cy="135" r="30" fill={c} opacity={0.65} />
  </S>
);

const IllChosenFamily = ({ color: c }: P) => (
  <S c={c}>
    <path d="M 140 80 L 140 195" stroke={c} strokeWidth="14" opacity={0.55} strokeLinecap="round" />
    <circle cx="140" cy="90" r="50" fill={c} opacity={0.35} />
    <circle cx="115" cy="80" r="32" fill={c} opacity={0.45} />
    <circle cx="165" cy="80" r="32" fill={c} opacity={0.45} />
    <circle cx="140" cy="65" r="28" fill={c} opacity={0.55} />
    <path d="M 140 195 Q 100 210 80 230" stroke={c} strokeWidth="4" fill="none" opacity={0.55} strokeLinecap="round" />
    <path d="M 140 195 Q 180 210 200 230" stroke={c} strokeWidth="4" fill="none" opacity={0.55} strokeLinecap="round" />
    <path d="M 140 195 L 140 235" stroke={c} strokeWidth="4" opacity={0.55} strokeLinecap="round" />
  </S>
);

const IllTherapeutic = ({ color: c }: P) => (
  <S c={c}>
    <path
      d="M 140 135 m 0 -50 a 50 50 0 1 0 0 100 a 50 50 0 1 0 0 -100 m 0 18 a 32 32 0 1 1 0 64 a 32 32 0 1 1 0 -64"
      fill={c}
      opacity={0.55}
      fillRule="evenodd"
    />
    <circle cx="140" cy="135" r="80" fill="none" stroke={c} strokeWidth="3" opacity={0.30} strokeDasharray="4,8" />
    <path d="M 140 65 A 70 70 0 0 1 210 135 A 70 70 0 0 1 140 205 A 70 70 0 0 1 70 135 A 70 70 0 0 1 110 75" stroke={c} strokeWidth="5" fill="none" opacity={0.65} strokeLinecap="round" />
    <circle cx="140" cy="135" r="12" fill={c} opacity={0.85} />
  </S>
);

const IllRomantic = ({ color: c }: P) => (
  <S c={c}>
    <Heart x={140} y={120} s={45} c={c} o={0.18} />
    <Heart x={140} y={125} s={38} c={c} o={0.30} />
    <Heart x={140} y={130} s={28} c={c} o={0.50} />
    <Heart x={140} y={135} s={18} c={c} o={0.75} />
    <Heart x={140} y={138} s={8} c={c} o={0.95} />
  </S>
);

const IllErotic = ({ color: c }: P) => (
  <S c={c}>
    <path d="M 140 60 Q 100 110 95 170 Q 90 220 140 230 Q 190 220 185 170 Q 180 110 140 60 Z" fill={c} opacity={0.30} />
    <path d="M 140 80 Q 110 130 110 175 Q 110 215 140 220 Q 170 215 170 175 Q 170 130 140 80 Z" fill={c} opacity={0.55} />
    <path d="M 140 110 Q 125 150 125 185 Q 125 210 140 215 Q 155 210 155 185 Q 155 150 140 110 Z" fill={c} opacity={0.85} />
  </S>
);

const IllCometSeasonal = ({ color: c }: P) => (
  <S c={c}>
    <path d="M 30 230 Q 100 170 200 70" stroke={c} strokeWidth="22" fill="none" opacity={0.15} strokeLinecap="round" />
    <path d="M 30 230 Q 100 170 200 70" stroke={c} strokeWidth="6" fill="none" opacity={0.35} strokeLinecap="round" />
    <circle cx="200" cy="70" r="22" fill={c} opacity={0.85} />
    <circle cx="200" cy="70" r="10" fill="white" opacity={0.65} />
    <circle cx="55" cy="100" r="3" fill={c} opacity={0.55} />
    <circle cx="100" cy="80" r="2" fill={c} opacity={0.55} />
    <circle cx="240" cy="160" r="3" fill={c} opacity={0.55} />
    <circle cx="80" cy="200" r="2" fill={c} opacity={0.55} />
  </S>
);

/* ============================================================
   DEFAULT (fallback)
   ============================================================ */

const IllDefault = ({ color: c }: P) => (
  <S c={c}>
    <circle cx="140" cy="135" r="95" fill={c} opacity={0.13} />
    <circle cx="140" cy="135" r="60" fill={c} opacity={0.22} />
    <circle cx="140" cy="135" r="28" fill={c} opacity={0.55} />
    <circle cx="140" cy="135" r="10" fill={c} opacity={0.85} />
  </S>
);

/* ============================================================
   ITEM → ILLUSTRATION MAP
   ============================================================ */

export const ITEM_ILLUSTRATIONS: Record<string, React.FC<P>> = {
  // Life Infrastructure
  'Co-Housing':                   IllCoHousing,
  'Co-Parenting':                 IllCoParenting,
  'Home Ownership':               IllHomeOwnership,
  'Shared Sleeping Space':        IllSharedSleepingSpace,
  'Shared Meals':                 IllSharedMeals,
  'Shared Chores':                IllSharedChores,
  'Shared Pets/Plants':           IllSharedPetsPlants,
  'Shared External Caretaking':   IllSharedExternalCaretaking,
  'Emergency Contact':            IllEmergencyContact,
  'Mutual Aid':                   IllMutualAid,
  'Business Collaborations':      IllBusinessCollaborations,

  // Relational Commitment
  'Exclusivity':                  IllExclusivity,
  'Prioritization':               IllPrioritization,
  'Reliability':                  IllReliability,
  'Allyship':                     IllAllyship,
  'Focusing on the "Here and Now"': IllHereAndNow,
  'Long-Term Involvement':        IllLongTermInvolvement,
  'Future Plans Together':        IllFuturePlansTogether,
  'Relationship Labels':          IllRelationshipLabels,
  'Working Through Challenges':   IllWorkingThroughChallenges,
  'Support Through Health Challenges': IllHealthChallenges,
  'End of Life Care':             IllEndOfLifeCare,

  // Quality Time
  'Shared Hobbies or Activities': IllSharedHobbies,
  'Activities That Are "Yours"':  IllActivitiesYours,
  'Shared Rituals':               IllSharedRituals,
  'Date Nights':                  IllDateNights,
  'Spending the Night':           IllSpendingTheNight,
  'Parallel Play':                IllParallelPlay,
  'Celebrating Events or Holidays': IllCelebratingEvents,
  'Trips Together':               IllTripsTogether,
  'Creative Collaboration':       IllCreativeCollaboration,
  'Project Collaboration':        IllProjectCollaboration,

  // Emotional Intimacy
  'Terms of Endearment':          IllTermsOfEndearment,
  'Words of Affirmation':         IllWordsOfAffirmation,
  'Saying "I Love You"':          IllSayingILoveYou,
  'Knowing Personal Likes and Dislikes': IllKnowingLikesDislikes,
  'Sharing Longings':             IllSharingLongings,
  'Sharing Vulnerable Feelings':  IllSharingVulnerableFeelings,
  'Sharing About Mental Health':  IllSharingMentalHealth,
  'Supporting Mental Health Work': IllSupportingMentalHealth,
  'Offering Emotional Support':   IllOfferingEmotionalSupport,
  'Being Relied Upon for Support': IllReliedUponForSupport,
  'Being a Confidante':           IllBeingAConfidante,
  'Expressing Disagreements or Hurt Feelings': IllExpressingDisagreements,
  'Addressing and Resolving Conflict': IllResolvingConflict,
  '3rd Party Support':            Ill3rdPartySupport,
  'Multiple Emotional Bonds':     IllMultipleEmotionalBonds,

  // Physical Intimacy
  'Body Contact':                 IllBodyContact,
  'Physical Affection':           IllPhysicalAffection,
  'Hugs':                         IllHugs,
  'Hand Holding':                 IllHandHolding,
  'Kissing':                      IllKissing,
  'Cuddling':                     IllCuddling,
  'Massage':                      IllMassage,
  'Co-Sleeping':                  IllCoSleeping,
  'Nudity':                       IllNudity,
  'Sensual Interactions':         IllSensualInteractions,
  'Sexual Interactions':          IllSexualInteractions,
  'Public Displays of Affection': IllPDA,
  'Kink':                         IllKink,
  'Multiple Sexual Connections':  IllMultipleSexualConnections,

  // Social Integration
  'Down to Meet Friends':         IllDownToMeetFriends,
  'Down to Meet Metamours':       IllDownToMeetMetamours,
  'Down to Meet Family':          IllDownToMeetFamily,
  'Integrate with Friends':       IllIntegrateWithFriends,
  'Integrate with Metamours':     IllIntegrateWithMetamours,
  'Integration with Family':      IllIntegrationWithFamily,
  'Supporting Friendships':       IllSupportingFriendships,
  'Supporting Metamour Relationships': IllSupportingMetamourRelationships,
  'Presenting as a Social Unit in Public': IllPresentingAsSocialUnitPublic,
  'Presenting as a Social Unit on Social Media': IllPresentingAsSocialUnitMedia,
  'Serving as +1 for Social Events': IllPlusOne,
  'Joint Trips with Family/Friends': IllJointTrips,

  // Financial / Legal
  'Gifts':                        IllGifts,
  'Sharing Costs':                IllSharingCosts,
  'Lending Money':                IllLendingMoney,
  'Financial Support':            IllFinancialSupport,
  'Financial Integration':        IllFinancialIntegration,
  'Shared Bank Account(s)':       IllSharedBankAccount,
  'Legal Processes':              IllLegalProcesses,
  'Marriage/Civil Partnership':   IllMarriage,

  // Communication
  'Texting':                      IllTexting,
  'Voice Messages':               IllVoiceMessages,
  'Phone/Video Calls':            IllPhoneVideoCalls,
  'Discussing Work and Hobbies':  IllDiscussingWorkHobbies,
  'Discussing Politics and Current Events': IllDiscussingPolitics,
  'Intellectual/Philosophical Discussions': IllIntellectual,
  'Discussing Family, Partners, Relationships': IllDiscussingRelationships,
  'Playing and Laughing Together': IllPlayingLaughing,
  'Sharing Stories About the Past': IllSharingStories,
  'Relationship "Check-Ins"':     IllRelationshipCheckIns,
  'Radical Honesty':              IllRadicalHonesty,
  'Transparency Across Relationships': IllTransparency,

  // Time and Rhythms
  'Expectations Around Responding to Messages': IllResponseExpectations,
  'Daily or Frequent Communication': IllDailyFrequentComm,
  'Unplanned Communication':      IllUnplannedComm,
  'Integrated into Daily Life':   IllIntegratedDailyLife,
  'Long Distance':                IllLongDistance,
  'Spontaneous Hangouts':         IllSpontaneousHangouts,
  'Planned Hangouts':             IllPlannedHangouts,
  'Regularly Scheduled Time Together': IllRegularlyScheduled,
  'Weekly Hangouts':              IllWeeklyHangouts,
  'Monthly Hangouts':             IllMonthlyHangouts,
  'Yearly Hangouts':              IllYearlyHangouts,
  'Seasonal/Contextual Connecting': IllSeasonalConnecting,

  // Tones
  'Companionship':                IllCompanionship,
  'Friendship':                   IllFriendship,
  'Chosen Family':                IllChosenFamily,
  'Therapeutic':                  IllTherapeutic,
  'Romantic':                     IllRomantic,
  'Erotic':                       IllErotic,
  'Comet/Seasonal':               IllCometSeasonal,
};

export function getItemIllustration(item: string): React.FC<P> {
  return ITEM_ILLUSTRATIONS[item] ?? IllDefault;
}

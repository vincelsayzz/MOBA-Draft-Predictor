const createHeroImage = (name, accent, secondary) => {
  const safeName = (name || 'Hero').replace(/&/g, 'and')
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="320" height="220" viewBox="0 0 320 220">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${accent}" />
          <stop offset="100%" stop-color="${secondary}" />
        </linearGradient>
      </defs>
      <rect width="320" height="220" rx="24" fill="url(#bg)" />
      <rect x="18" y="18" width="284" height="184" rx="18" fill="rgba(5,10,20,0.45)" stroke="rgba(255,255,255,0.2)" />
      <circle cx="160" cy="92" r="60" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.5)" stroke-width="3" />
      <path d="M132 78c0-17 14-31 31-31s31 14 31 31c0 22-15 34-31 44-16-10-31-22-31-44z" fill="rgba(255,255,255,0.86)" />
      <rect x="122" y="116" width="76" height="34" rx="10" fill="rgba(255,255,255,0.9)" />
      <text x="160" y="186" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="24" font-weight="700" fill="#f8fafc">${safeName}</text>
    </svg>
  `

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export const HOK_HEROES = [
  {
    id: 1,
    name: 'Arthur',
    role: 'Warrior',
    lane: 'Offlane',
    image: createHeroImage('Arthur', '#f59e0b', '#7c2d12'),
    description: 'A durable frontliner who thrives in direct fights and can peel for carries.',
    build: ['Blade of the Heavens', 'Tyrant’s Shock', 'Rune of the Strong', 'Guardian Aegis'],
    suggestions: ['Secure early sustain', 'Protect your carry in teamfights', 'Punish overextended enemies']
  },
  {
    id: 2,
    name: 'Angela',
    role: 'Support',
    lane: 'Roamer',
    image: createHeroImage('Angela', '#ec4899', '#4c1d95'),
    description: 'A crowd-control support with long-range healing and great pick-off potential.',
    build: ['Moonlight Essence', 'Echoing Spirit', 'Sanctuary Halo', 'Aegis of the Heavens'],
    suggestions: ['Prioritize lane sustain', 'Coordinate with your mid laner', 'Save crowd control for fight windows']
  },
  {
    id: 3,
    name: 'Lu Ban No. 7',
    role: 'Mage',
    lane: 'Mid',
    image: createHeroImage('Lu Ban', '#38bdf8', '#0f172a'),
    description: 'A burst mage who punishes grouped enemies and wins with fast rotations.',
    build: ['Arcane Core', 'Starfall Staff', 'Void Prism', 'Frostbound Crown'],
    suggestions: ['Push early wave advantage', 'Look for skirmish windows', 'Avoid overcommitting into tanks']
  },
  {
    id: 4,
    name: 'Diaochan',
    role: 'Assassin',
    lane: 'Jungle',
    image: createHeroImage('Diaochan', '#f43f5e', '#7f1d1d'),
    description: 'An assassin that excels at locking down priority targets and snowballing fights.',
    build: ['Shadow Edge', 'Soul Eater', 'Nimble Dagger', 'Riftbreaker'],
    suggestions: ['Pick targets with low mobility', 'Farm safely before first big fight', 'Coordinate with your team for ganks']
  },
  {
    id: 5,
    name: 'Zhang Fei',
    role: 'Tank',
    lane: 'Solo',
    image: createHeroImage('Zhang Fei', '#f59e0b', '#92400e'),
    description: 'A bruiser tank built to initiate fights and absorb damage for the team.',
    build: ['Stoneheart Guard', 'Fortified Plate', 'War Banner', 'Aegis of Resolve'],
    suggestions: ['Start with defensive items', 'Initiate when your team is ready', 'Look for front-line disruption']
  },
  {
    id: 6,
    name: 'Consort Yu',
    role: 'Mage',
    lane: 'Support',
    image: createHeroImage('Consort Yu', '#8b5cf6', '#312e81'),
    description: 'A burst mage who thrives in skirmishes and can turn fights with well-timed spells.',
    build: ['Astral Scepter', 'Vandal Prism', 'Soulfire Mantle', 'Fateweaver'],
    suggestions: ['Stay behind your frontline', 'Use crowd control to set up carries', 'Play around your team’s cooldowns']
  },
  {
    id: 7,
    name: 'Sun Wukong',
    role: 'Fighter',
    lane: 'Jungle',
    image: createHeroImage('Sun Wukong', '#10b981', '#064e3b'),
    description: 'A mobile fighter with strong duel potential and excellent reset mechanics.',
    build: ['Stormbreaker', 'Swift Striker', 'Might of the Ancients', 'Warrior’s Band'],
    suggestions: ['Use your mobility to flank', 'Pressure objectives after level 6', 'Avoid trading too long into tanky comps']
  },
  {
    id: 8,
    name: 'Ma Chao',
    role: 'Warrior',
    lane: 'Offlane',
    image: createHeroImage('Ma Chao', '#fb923c', '#9a2c2c'),
    description: 'A high-impact bruiser who can punish mistakes and control space around objectives.',
    build: ['Battlefury Plate', 'Raging Edge', 'Ruinbreaker', 'Ironwall Shield'],
    suggestions: ['Take the first fight', 'Stay close to your carry', 'Use your durability to dive towers']
  },
  {
    id: 9,
    name: 'Nakoruru',
    role: 'Assassin',
    lane: 'Mid',
    image: createHeroImage('Nakoruru', '#14b8a6', '#115e59'),
    description: 'A mobile assassin with strong kill pressure and exceptional wave clear.',
    build: ['Void Crescent', 'Serrated Edge', 'Crescent Gale', 'Ghoststep Boots'],
    suggestions: ['Look for early kills', 'Use your mobility to roam', 'Keep your escape ready']
  },
  {
    id: 10,
    name: 'Zhuang Zhou',
    role: 'Support',
    lane: 'Roamer',
    image: createHeroImage('Zhuang Zhou', '#6366f1', '#312e81'),
    description: 'A utility support who can protect allies, reset fights, and create space.',
    build: ['Aegis of Harmony', 'Lunar Ward', 'Blessed Staff', 'Echoing Sanctuary'],
    suggestions: ['Stay near your core team', 'Protect your carry through waves', 'Use your utility to swing fights']
  }
]

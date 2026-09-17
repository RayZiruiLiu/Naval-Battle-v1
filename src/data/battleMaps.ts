import { BattleIsland, BattleMapConfig } from '../types/ship';

function generatePolygon(cx: number, cy: number, radius: number, pointsCount: number, irregularity: number): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < pointsCount; i++) {
    const angle = (i / pointsCount) * Math.PI * 2;
    const r = radius * (1 - irregularity * 0.5 + Math.sin(angle * 3 + i) * irregularity * 0.4);
    points.push({
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
    });
  }
  return points;
}

export const BATTLE_MAPS: BattleMapConfig[] = [
  {
    id: 'open-pacific',
    name: 'Mariana Open Ocean',
    theme: 'Deep Pacific Trench',
    description: 'Vast, deep-sea open ocean with unobstructed waters and rolling swells. Favors long-range missile exchanges and high-speed flanking.',
    waterColors: {
      deep: '#031934',
      mid: '#05315f',
      surface: '#0284c7',
      wave: 'rgba(56, 189, 248, 0.16)',
      boundary: 'rgba(56, 189, 248, 0.4)',
    },
    islandStyle: 'rock',
    ambientWeather: 'clear',
    obstacles: [
      // Sparse navigation buoys / small rocky reef
      {
        x: 1300,
        y: 1000,
        radius: 45,
        points: generatePolygon(1300, 1000, 45, 8, 0.3),
        style: 'harbor',
        foliage: [
          { x: 1300, y: 1000, radius: 10, color: '#eab308', type: 'buoy' }
        ]
      },
      {
        x: 1300,
        y: 400,
        radius: 35,
        points: generatePolygon(1300, 400, 35, 7, 0.3),
        style: 'harbor',
        foliage: [
          { x: 1300, y: 400, radius: 8, color: '#38bdf8', type: 'buoy' }
        ]
      },
      {
        x: 1300,
        y: 1600,
        radius: 35,
        points: generatePolygon(1300, 1600, 35, 7, 0.3),
        style: 'harbor',
        foliage: [
          { x: 1300, y: 1600, radius: 8, color: '#f43f5e', type: 'buoy' }
        ]
      }
    ]
  },
  {
    id: 'solomon-atoll',
    name: 'Solomon Archipelago',
    theme: 'Tropical Island Straits',
    description: 'Chains of tropical atolls, shallow coral reefs, and sandy beaches. Offers natural cover and tactical choke points.',
    waterColors: {
      deep: '#042f2e',
      mid: '#0f766e',
      surface: '#0d9488',
      wave: 'rgba(94, 234, 212, 0.20)',
      boundary: 'rgba(45, 212, 191, 0.4)',
    },
    islandStyle: 'sand',
    ambientWeather: 'clear',
    obstacles: [
      {
        x: 1300,
        y: 1000,
        radius: 110,
        points: generatePolygon(1300, 1000, 110, 12, 0.35),
        style: 'sand',
        foliage: [
          { x: 1300 - 30, y: 1000 - 20, radius: 18, color: '#16a34a', type: 'tree' },
          { x: 1300 + 35, y: 1000 - 15, radius: 22, color: '#15803d', type: 'tree' },
          { x: 1300, y: 1000 + 30, radius: 20, color: '#22c55e', type: 'tree' },
          { x: 1300 - 15, y: 1000 + 10, radius: 16, color: '#14532d', type: 'tree' },
        ]
      },
      {
        x: 800,
        y: 650,
        radius: 80,
        points: generatePolygon(800, 650, 80, 10, 0.3),
        style: 'sand',
        foliage: [
          { x: 800, y: 650, radius: 18, color: '#15803d', type: 'tree' },
          { x: 800 + 20, y: 650 - 20, radius: 14, color: '#16a34a', type: 'tree' },
        ]
      },
      {
        x: 1800,
        y: 1350,
        radius: 80,
        points: generatePolygon(1800, 1350, 80, 10, 0.3),
        style: 'sand',
        foliage: [
          { x: 1800, y: 1350, radius: 18, color: '#15803d', type: 'tree' },
          { x: 1800 - 20, y: 1350 + 20, radius: 14, color: '#22c55e', type: 'tree' },
        ]
      },
      {
        x: 850,
        y: 1450,
        radius: 75,
        points: generatePolygon(850, 1450, 75, 9, 0.3),
        style: 'sand',
        foliage: [
          { x: 850, y: 1450, radius: 16, color: '#16a34a', type: 'tree' },
        ]
      },
      {
        x: 1750,
        y: 550,
        radius: 75,
        points: generatePolygon(1750, 550, 75, 9, 0.3),
        style: 'sand',
        foliage: [
          { x: 1750, y: 550, radius: 16, color: '#15803d', type: 'tree' },
        ]
      }
    ]
  },
  {
    id: 'arctic-shelf',
    name: 'Barents Arctic Shelf',
    theme: 'Glacial Ice Pack',
    description: 'Freezing sub-polar waters with massive drifting icebergs and glacial shelves. Demands sharp navigation to avoid jagged ice edges.',
    waterColors: {
      deep: '#092131',
      mid: '#0c354d',
      surface: '#0369a1',
      wave: 'rgba(224, 242, 254, 0.22)',
      boundary: 'rgba(186, 230, 253, 0.5)',
    },
    islandStyle: 'ice',
    ambientWeather: 'snow',
    obstacles: [
      {
        x: 1300,
        y: 1000,
        radius: 115,
        points: generatePolygon(1300, 1000, 115, 11, 0.4),
        style: 'ice',
        foliage: [
          { x: 1300 - 25, y: 1000 - 25, radius: 24, color: '#e0f2fe', type: 'ice' },
          { x: 1300 + 30, y: 1000 + 10, radius: 20, color: '#bae6fd', type: 'ice' },
        ]
      },
      {
        x: 900,
        y: 500,
        radius: 75,
        points: generatePolygon(900, 500, 75, 8, 0.35),
        style: 'ice',
        foliage: [
          { x: 900, y: 500, radius: 18, color: '#f0f9ff', type: 'ice' },
        ]
      },
      {
        x: 1700,
        y: 1500,
        radius: 75,
        points: generatePolygon(1700, 1500, 75, 8, 0.35),
        style: 'ice',
        foliage: [
          { x: 1700, y: 1500, radius: 18, color: '#f0f9ff', type: 'ice' },
        ]
      },
      {
        x: 1300,
        y: 350,
        radius: 65,
        points: generatePolygon(1300, 350, 65, 8, 0.3),
        style: 'ice',
        foliage: [
          { x: 1300, y: 350, radius: 16, color: '#bae6fd', type: 'ice' },
        ]
      },
      {
        x: 1300,
        y: 1650,
        radius: 65,
        points: generatePolygon(1300, 1650, 65, 8, 0.3),
        style: 'ice',
        foliage: [
          { x: 1300, y: 1650, radius: 16, color: '#bae6fd', type: 'ice' },
        ]
      }
    ]
  },
  {
    id: 'bermuda-rift',
    name: 'Bermuda Volcanic Rift',
    theme: 'Stormy Sea & Basalt Stacks',
    description: 'Violent dark waters surrounding jagged black basalt sea stacks. Severe visibility conditions and rough oceanic swells.',
    waterColors: {
      deep: '#0a0f1d',
      mid: '#111827',
      surface: '#1e293b',
      wave: 'rgba(148, 163, 184, 0.18)',
      boundary: 'rgba(239, 68, 68, 0.45)',
    },
    islandStyle: 'rock',
    ambientWeather: 'storm',
    obstacles: [
      {
        x: 1300,
        y: 1000,
        radius: 95,
        points: generatePolygon(1300, 1000, 95, 10, 0.45),
        style: 'rock',
        foliage: [
          { x: 1300 - 15, y: 1000 - 15, radius: 22, color: '#451a03', type: 'bunker' },
          { x: 1300 + 20, y: 1000 + 20, radius: 18, color: '#7c2d12', type: 'bunker' },
        ]
      },
      {
        x: 850,
        y: 800,
        radius: 65,
        points: generatePolygon(850, 800, 65, 8, 0.4),
        style: 'rock',
        foliage: [
          { x: 850, y: 800, radius: 16, color: '#451a03', type: 'bunker' },
        ]
      },
      {
        x: 1750,
        y: 1200,
        radius: 65,
        points: generatePolygon(1750, 1200, 65, 8, 0.4),
        style: 'rock',
        foliage: [
          { x: 1750, y: 1200, radius: 16, color: '#451a03', type: 'bunker' },
        ]
      },
      {
        x: 1000,
        y: 1400,
        radius: 60,
        points: generatePolygon(1000, 1400, 60, 7, 0.4),
        style: 'rock',
        foliage: [
          { x: 1000, y: 1400, radius: 14, color: '#78350f', type: 'bunker' },
        ]
      },
      {
        x: 1600,
        y: 600,
        radius: 60,
        points: generatePolygon(1600, 600, 60, 7, 0.4),
        style: 'rock',
        foliage: [
          { x: 1600, y: 600, radius: 14, color: '#78350f', type: 'bunker' },
        ]
      }
    ]
  },
  {
    id: 'gibraltar-base',
    name: 'Gibraltar Naval Stronghold',
    theme: 'Fortified Harbor Jetties',
    description: 'Strategic naval strait fortified with heavy concrete breakwaters and defensive piers guarding shipping channels.',
    waterColors: {
      deep: '#082f49',
      mid: '#0c4a6e',
      surface: '#0284c7',
      wave: 'rgba(125, 211, 252, 0.18)',
      boundary: 'rgba(56, 189, 248, 0.4)',
    },
    islandStyle: 'harbor',
    ambientWeather: 'harbor',
    obstacles: [
      {
        x: 1300,
        y: 1000,
        radius: 110,
        points: [
          { x: 1220, y: 920 },
          { x: 1380, y: 920 },
          { x: 1380, y: 1080 },
          { x: 1220, y: 1080 },
        ],
        style: 'harbor',
        foliage: [
          { x: 1300, y: 1000, radius: 24, color: '#475569', type: 'bunker' },
          { x: 1240, y: 940, radius: 10, color: '#38bdf8', type: 'buoy' },
          { x: 1360, y: 1060, radius: 10, color: '#f43f5e', type: 'buoy' },
        ]
      },
      {
        x: 1300,
        y: 400,
        radius: 80,
        points: [
          { x: 1240, y: 340 },
          { x: 1360, y: 340 },
          { x: 1360, y: 460 },
          { x: 1240, y: 460 },
        ],
        style: 'harbor',
        foliage: [
          { x: 1300, y: 400, radius: 16, color: '#64748b', type: 'bunker' },
        ]
      },
      {
        x: 1300,
        y: 1600,
        radius: 80,
        points: [
          { x: 1240, y: 1540 },
          { x: 1360, y: 1540 },
          { x: 1360, y: 1660 },
          { x: 1240, y: 1660 },
        ],
        style: 'harbor',
        foliage: [
          { x: 1300, y: 1600, radius: 16, color: '#64748b', type: 'bunker' },
        ]
      },
      {
        x: 800,
        y: 1000,
        radius: 50,
        points: generatePolygon(800, 1000, 50, 8, 0.2),
        style: 'harbor',
        foliage: [
          { x: 800, y: 1000, radius: 12, color: '#0ea5e9', type: 'buoy' }
        ]
      },
      {
        x: 1800,
        y: 1000,
        radius: 50,
        points: generatePolygon(1800, 1000, 50, 8, 0.2),
        style: 'harbor',
        foliage: [
          { x: 1800, y: 1000, radius: 12, color: '#f43f5e', type: 'buoy' }
        ]
      }
    ]
  }
];

export const BATTLE_MAP_MAP = new Map<string, BattleMapConfig>(
  BATTLE_MAPS.map(m => [m.id, m])
);

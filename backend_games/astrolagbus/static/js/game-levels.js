const MAX_LEVEL = 30;

const LEVEL_THEMES = [
  'City Fringe Sparks',
  'Cargo Lane Barrage',
  'Solar Tunnel Drift',
  'Twin Comet Split',
  'Ion Tempest Rise',
  'Nova Ring Swarm',
  'Omega Belt Showdown',
  'Neon Drift Corridor',
  'Pirate Bike Patrol',
  'Shrapnel Rain Field',
  'Monster Breach Zone',
  'Pulse Mine Grid',
  'Comet Streak Alley',
  'Drone Hive Passage',
  'Sniper Satellite Belt',
  'Void Scar Trench',
  'Hyperflux Crossing',
  'Crimson Razor Storm',
  'Quantum Debris Flow',
  'Blacklight Rampart',
  'Feral Orbit Run',
  'Plasma Wake Channel',
  'Eclipse Barrage Line',
  'Graviton Shear Drift',
  'Obsidian Comet Run',
  'Solar Flare Gauntlet',
  'Abyssal Transit Gate',
  'Cataclysm Vector',
  'Final Neon Convoy',
  'Astrolagbus Omega Run',
];

function levelConfig(level) {
  const clamped = clamp(level, 1, MAX_LEVEL);
  const progress = (clamped - 1) / (MAX_LEVEL - 1);

  return {
    level: clamped,
    title: LEVEL_THEMES[clamped - 1],
    maxAsteroids: Math.round(24 + clamped * 2.6),
    spawnInterval: Math.max(360, Math.round(1080 - clamped * 14)),
    minSpeed: Math.round(72 + clamped * 4.8),
    maxSpeed: Math.round(124 + clamped * 6.2),
    radius: [
      Math.round(14 + progress * 10),
      Math.round(26 + progress * 18),
    ],
    palette: ['#ff4df5', '#00d4ff'],
    maxLasers: Math.min(1 + Math.floor((clamped + 1) / 2), 7),
    maxDrones: clamped >= 2 ? Math.min(1 + Math.floor(clamped / 3), 10) : 0,
    maxBikes: clamped >= 3 ? Math.min(1 + Math.floor(clamped / 4), 6) : 0,
    maxMonsters: clamped >= 5 ? Math.min(1 + Math.floor(clamped / 3), 8) : 0,
    maxBombs: clamped >= 7 ? Math.min(2 + Math.floor(clamped / 3), 10) : 0,
    maxMines: clamped >= 10 ? Math.min(1 + Math.floor(clamped / 5), 6) : 0,
    maxStreakers: clamped >= 13 ? Math.min(1 + Math.floor(clamped / 6), 5) : 0,
    maxSatellites: clamped >= 16 ? Math.min(1 + Math.floor(clamped / 8), 4) : 0,
    laserInterval: Math.max(3200, 6200 - clamped * 85),
    droneInterval: Math.max(2000, 4600 - clamped * 70),
    bikeInterval: Math.max(2400, 5400 - clamped * 85),
    monsterInterval: Math.max(2800, 5800 - clamped * 90),
    bombInterval: Math.max(2600, 5000 - clamped * 65),
    mineInterval: Math.max(3400, 6600 - clamped * 80),
    streakerInterval: Math.max(3800, 7200 - clamped * 95),
    satelliteInterval: Math.max(5200, 9200 - clamped * 105),
  };
}

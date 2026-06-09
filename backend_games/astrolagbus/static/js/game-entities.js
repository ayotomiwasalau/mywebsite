function buildAsteroidVertices(radius, seed) {
  const verts = [];
  const points = 8 + Math.floor(seed * 3) % 2;
  for (let i = 0; i < points; i += 1) {
    const theta = (i / points) * Math.PI * 2;
    const wobble = 0.72 + Math.sin(theta * 2.7 + seed * 6.2) * 0.2 + Math.cos(theta * 4.1) * 0.08;
    const r = radius * wobble;
    verts.push({ x: Math.cos(theta) * r, y: Math.sin(theta) * r });
  }
  return verts;
}

function createAsteroid(canvasWidth, canvasHeight, level) {
  const config = levelConfig(level);
  const radius = getRandomInRange(config.radius[0], config.radius[1]);
  const speed = getRandomInRange(config.minSpeed, config.maxSpeed);
  const drift = (Math.random() - 0.5) * 50;
  const edgePadding = Math.max(24, radius);
  const seed = Math.random();
  const hp = Math.max(1, Math.round(radius / 14));
  const variant = Math.random() < 0.12 ? 'blue' : 'magenta';

  return {
    x: Math.random() * (canvasWidth - edgePadding * 2) + edgePadding,
    y: -radius - 10,
    radius,
    speed,
    drift,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.04,
    hp,
    seed,
    variant,
    vertices: buildAsteroidVertices(radius, seed),
  };
}

function createBullet(playerX, playerY, playerHeight) {
  return {
    x: playerX,
    y: playerY - playerHeight * 0.5,
    offset: 11,
    radius: 4,
    speed: 540,
    ttl: 1.2,
    maxTtl: 1.2,
  };
}

function createFragments(x, y, radius, variant) {
  const color = variant === 'blue' ? NEON.blue : NEON.magenta;
  const pieces = [];
  const count = 5 + Math.floor(radius / 10);
  for (let i = 0; i < count; i += 1) {
    pieces.push({
      x,
      y,
      vx: (Math.random() - 0.5) * (180 + radius),
      vy: (Math.random() - 0.5) * (180 + radius),
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.25,
      size: radius * (0.12 + Math.random() * 0.18),
      ttl: 0.35 + Math.random() * 0.35,
      maxTtl: 0.7,
      color,
    });
  }
  return pieces;
}

function createImpact(x, y) {
  return {
    x,
    y,
    radius: 10,
    ttl: 0.1,
    maxTtl: 0.1,
  };
}

function createStar() {
  return {
    x: Math.random() * (window.innerWidth || 1920),
    y: Math.random() * (window.innerHeight || 1080),
    size: Math.random() * 1.2 + 0.4,
    alpha: Math.random() * 0.45 + 0.25,
    drift: 0,
    twinkle: Math.random() * 0.8 + 0.2,
  };
}

function createSpaceBike(canvasWidth, level) {
  const fromLeft = Math.random() < 0.5;
  const baseVx = 90 + level * 1.5;
  return {
    type: 'bike',
    x: fromLeft ? -30 : canvasWidth + 30,
    y: 40 + Math.random() * 80,
    width: 34,
    height: 22,
    hp: 2,
    vx: fromLeft ? baseVx : -baseVx,
    vy: 18 + level * 0.4,
    baseVx,
    fromLeft,
    phase: 'cross',
    shootTimer: 0,
    burstLeft: 0,
    hasShotThisPass: false,
    passesLeft: 2,
    ttl: 20,
  };
}

function createSpaceMonster(canvasWidth, canvasHeight, playerX, playerY, level) {
  const edge = Math.floor(Math.random() * 4);
  let x;
  let y;
  if (edge === 0) {
    x = Math.random() * canvasWidth;
    y = -30;
  } else if (edge === 1) {
    x = canvasWidth + 30;
    y = Math.random() * canvasHeight * 0.7;
  } else if (edge === 2) {
    x = Math.random() * canvasWidth;
    y = canvasHeight + 30;
  } else {
    x = -30;
    y = Math.random() * canvasHeight * 0.7;
  }

  const speed = 120 + level * 4.5;
  const dx = playerX - x + (Math.random() - 0.5) * 80;
  const dy = playerY - y + (Math.random() - 0.5) * 80;
  const dist = Math.max(1, Math.hypot(dx, dy));

  return {
    type: 'monster',
    x,
    y,
    radius: 20 + Math.min(8, Math.floor(level / 6)),
    hp: 2 + Math.floor(level / 10),
    speed,
    vx: (dx / dist) * speed,
    vy: (dy / dist) * speed,
    wobble: Math.random() * Math.PI * 2,
    passesLeft: 2,
  };
}

function createTinyBomb(canvasWidth, level) {
  const radius = 9 + Math.min(4, Math.floor(level / 12));
  return {
    type: 'bomb',
    x: Math.random() * (canvasWidth - 60) + 30,
    y: -radius - 8,
    radius,
    hp: 1,
    fuse: 2.2 + Math.random() * 1.4,
    drift: (Math.random() - 0.5) * 35,
    speed: 55 + level * 2.2,
    blastRadius: 48 + Math.min(22, level),
    armed: true,
  };
}

function createPulseMine(canvasWidth, canvasHeight, level) {
  return {
    type: 'mine',
    x: Math.random() * (canvasWidth - 80) + 40,
    y: Math.random() * canvasHeight * 0.55 + canvasHeight * 0.15,
    radius: 13,
    hp: 1,
    armTimer: 0.9,
    pulseTimer: 0,
    blastRadius: 42 + Math.min(18, level),
    armed: false,
  };
}

function createCometStreaker(canvasWidth, canvasHeight, level) {
  const fromLeft = Math.random() < 0.5;
  return {
    type: 'streaker',
    x: fromLeft ? -40 : canvasWidth + 40,
    y: 60 + Math.random() * canvasHeight * 0.45,
    radius: 15,
    hp: 2,
    vx: fromLeft ? 240 + level * 5 : -(240 + level * 5),
    vy: 35 + Math.random() * 45 + level * 0.6,
    tail: 0,
  };
}

function createDrone(canvasWidth, level) {
  return {
    type: 'drone',
    x: Math.random() * (canvasWidth - 40) + 20,
    y: -20,
    radius: 8,
    hp: 1,
    vx: (Math.random() - 0.5) * (60 + level * 2),
    vy: 70 + level * 2.5,
    wobblePhase: Math.random() * Math.PI * 2,
  };
}

function createSniperSatellite(canvasWidth, level) {
  return {
    type: 'satellite',
    x: Math.random() * (canvasWidth - 100) + 50,
    y: 30 + Math.random() * 60,
    radius: 17,
    hp: 3 + Math.floor(level / 12),
    charge: 0,
    lockDuration: Math.max(0.8, 1.6 - level * 0.02),
    fired: false,
    pulse: 0,
  };
}

function createLaserSentinel(canvasWidth, level) {
  const fromLeft = Math.random() < 0.5;
  return {
    type: 'laser',
    x: fromLeft ? 36 : canvasWidth - 36,
    y: 26 + Math.random() * 42,
    radius: 16,
    hp: 2 + Math.floor(level / 8),
    vx: fromLeft ? 48 + level * 1.2 : -(48 + level * 1.2),
    fireCooldown: Math.max(1.8, 3.1 - level * 0.03),
    fireTimer: 1.2 + Math.random() * 0.8,
    netCharge: 0,
    netChargeDuration: 1.05,
    aimAngle: 0,
    aimSweepSpeed: 0.45,
    passesLeft: 2,
  };
}

function createSentinelNet(x, y, targetX, targetY, level) {
  const dx = targetX - x;
  const dy = targetY - y;
  const dist = Math.max(1, Math.hypot(dx, dy));
  const speed = 165 + level * 3.5;
  const startRadius = 14 + Math.random() * 4;
  const endRadius = 24 + Math.min(10, Math.floor(level / 5));
  return {
    x,
    y,
    vx: (dx / dist) * speed,
    vy: (dy / dist) * speed,
    radius: startRadius,
    startRadius,
    endRadius,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() < 0.5 ? -1 : 1) * (3.5 + Math.random() * 2),
    traveled: 0,
    ttl: 5,
    maxTtl: 5,
  };
}

function createEnemyBullet(x, y, targetX, targetY, speed) {
  const dx = targetX - x;
  const dy = targetY - y;
  const dist = Math.max(1, Math.hypot(dx, dy));
  return {
    x,
    y,
    vx: (dx / dist) * speed,
    vy: (dy / dist) * speed,
    radius: 5,
    ttl: 3.5,
    maxTtl: 3.5,
  };
}

function createExplosion(x, y, maxRadius, duration) {
  return {
    x,
    y,
    radius: 8,
    maxRadius,
    ttl: duration,
    maxTtl: duration,
    kind: 'explosion',
  };
}

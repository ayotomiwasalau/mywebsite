const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const levelValue = document.getElementById('levelValue');
const scoreValue = document.getElementById('scoreValue');
const livesValue = document.getElementById('livesValue');

const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const restartLevelBtn = document.getElementById('restartLevelBtn');
const resumeBtn = document.getElementById('resumeBtn');
const pauseBtn = document.getElementById('pauseBtn');
const sidebarPauseBtn = document.getElementById('sidebarPauseBtn');
const pauseButtons = [pauseBtn, sidebarPauseBtn].filter(Boolean);
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayText = document.getElementById('overlayText');

const inputManager = createInputManager();

const BUS_SIZE = {
  desktop: { width: 70, height: 44, speed: 290 },
  mobile: { width: 52, height: 33, speed: 275 },
};

function isMobileGameViewport() {
  return window.matchMedia('(max-width: 740px)').matches;
}

function applyBusDimensions() {
  const profile = isMobileGameViewport() ? BUS_SIZE.mobile : BUS_SIZE.desktop;
  state.player.width = profile.width;
  state.player.height = profile.height;
  state.player.speed = profile.speed;
}

const state = {
  running: false,
  paused: true,
  userPaused: false,
  gameOver: false,
  level: 1,
  score: 0,
  lives: 3,
  bullets: [],
  asteroids: [],
  enemies: [],
  enemyBullets: [],
  sentinelNets: [],
  fragments: [],
  effects: [],
  hiScore: 125000,
  lastShot: 0,
  spawn: null,
  missionStartedAt: 0,
  starField: [],
  invulnMs: 0,
  lastTime: performance.now(),
  player: {
    x: 0,
    y: 0,
    width: 70,
    height: 44,
    speed: 290,
  },
};

function loadHiScore() {
  const stored = parseInt(localStorage.getItem('astrolagbus_hi_score') || '', 10);
  state.hiScore = Number.isFinite(stored) ? stored : 125000;
}

function saveHiScore() {
  localStorage.setItem('astrolagbus_hi_score', String(state.hiScore));
}

function createStars() {
  state.starField = [];
  for (let i = 0; i < 85; i += 1) {
    const star = createStar();
    star.x = Math.random() * canvas.clientWidth;
    star.y = Math.random() * canvas.clientHeight;
    state.starField.push(star);
  }
}

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(canvas.clientWidth * ratio));
  canvas.height = Math.max(1, Math.floor(canvas.clientHeight * ratio));
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  applyBusDimensions();

  if (!state.player.x || !state.player.y) {
    state.player.x = canvas.clientWidth * 0.5;
    state.player.y = canvas.clientHeight * 0.72;
  } else {
    state.player.x = clamp(state.player.x, state.player.width * 0.6, canvas.clientWidth - state.player.width * 0.45);
    state.player.y = clamp(state.player.y, state.player.height * 0.6, canvas.clientHeight - state.player.height * 0.45);
  }
  createStars();
}

function updateStatus() {
  levelValue.textContent = state.level;
  scoreValue.textContent = state.score;
  livesValue.textContent = state.lives;
}

function showOverlay(title, message, buttonText, options = {}) {
  overlayTitle.textContent = title;
  overlayText.textContent = message;
  startBtn.textContent = buttonText;
  setScoreSubmitAvailable(!!options.showScoreSubmit);
  overlay.style.visibility = 'visible';
  overlay.style.opacity = '1';
}

function hideOverlay() {
  overlay.style.opacity = '0';
  overlay.style.visibility = 'hidden';
  setScoreSubmitAvailable(false);
  clearSubmitStatus();
}

function setScoreSubmitAvailable(available) {
  const scoreSubmit = document.getElementById('scoreSubmit');
  const submitBtn = document.getElementById('submitScoreBtn');
  if (scoreSubmit) scoreSubmit.hidden = !available;
  if (submitBtn) submitBtn.disabled = !available;
}

function clearSubmitStatus() {
  const status = document.getElementById('scoreSubmitStatus');
  if (!status) return;
  status.hidden = true;
  status.textContent = '';
  status.className = 'score-submit-status';
}

function getMissionDurationSec() {
  if (!state.missionStartedAt) return 0;
  return Math.max(0, Math.round((performance.now() - state.missionStartedAt) / 1000));
}

function recordFinalRun() {
  window.astrolagbusLastFinal = {
    score: state.score,
    level: state.level,
    duration: getMissionDurationSec(),
    ended: true,
  };
}

function clearFinalRun() {
  window.astrolagbusLastFinal = null;
  clearSubmitStatus();
}

function updatePauseButtons() {
  const canPause = state.running && !state.gameOver && !state.paused;
  const label = state.userPaused ? 'Resume' : 'Pause';
  const ariaLabel = state.userPaused ? 'Resume game' : 'Pause game';

  pauseButtons.forEach((button) => {
    button.textContent = label;
    button.setAttribute('aria-label', ariaLabel);
    button.disabled = !canPause && !state.userPaused;
  });
}

function resumeFromPause() {
  if (!state.userPaused) return;
  state.userPaused = false;
  state.paused = false;
  hideOverlay();
  updatePauseButtons();
}

function pauseMission() {
  if (!state.running || state.gameOver || state.paused) return;
  state.userPaused = true;
  state.paused = true;
  showOverlay(
    'Mission Paused',
    'The convoy holds position. Press Resume, P, or Escape to continue.',
    'Resume',
  );
  updatePauseButtons();
}

function togglePause() {
  if (state.userPaused) {
    resumeFromPause();
    return;
  }
  pauseMission();
}

function createSpawnState() {
  return {
    asteroids: { spawned: 0, timer: 0 },
    lasers: { spawned: 0, timer: 1200 },
    bikes: { spawned: 0, timer: 1800 },
    monsters: { spawned: 0, timer: 2600 },
    bombs: { spawned: 0, timer: 3200 },
    mines: { spawned: 0, timer: 3800 },
    streakers: { spawned: 0, timer: 4200 },
    drones: { spawned: 0, timer: 2200 },
    satellites: { spawned: 0, timer: 5500 },
  };
}

function resetRound(levelToPlay = 1) {
  state.level = levelToPlay;
  state.score = 0;
  state.lives = 3;
  state.running = true;
  state.paused = false;
  state.userPaused = false;
  state.gameOver = false;
  state.lastShot = 0;
  state.spawn = createSpawnState();
  state.invulnMs = 1000;
  state.bullets = [];
  state.asteroids = [];
  state.enemies = [];
  state.enemyBullets = [];
  state.sentinelNets = [];
  state.fragments = [];
  state.effects = [];
  state.player.x = canvas.clientWidth * 0.5;
  state.player.y = canvas.clientHeight * 0.72;
  state.missionStartedAt = performance.now();
  clearFinalRun();
  updateStatus();
  updatePauseButtons();
}

function startMission() {
  resetRound(1);
  hideOverlay();
}

function restartLevel() {
  const level = Math.max(1, state.level);
  const preservedScore = state.score;
  resetRound(level);
  state.score = preservedScore;
  hideOverlay();
  updatePauseButtons();
}

function isPointOnBus(x, y) {
  const { x: px, y: py, width, height } = state.player;
  const hitRadius = Math.max(width, height) * 0.55;
  return getDistance(x, y, px, py) < hitRadius;
}

const BUS_HULL = { hw: 35, hh: 22 };

function busLocalToWorld(lx, ly) {
  const { x, y, width, height } = state.player;
  const sx = width / 70;
  const sy = height / 44;
  return { x: x + lx * sx, y: y + ly * sy };
}

function getBusHullSegments() {
  const { hw, hh } = BUS_HULL;
  const local = [
    [-hw + 10, -hh + 6],
    [hw - 10, -hh + 6],
    [hw - 4, -hh + 18],
    [hw - 6, hh - 8],
    [-hw + 6, hh - 8],
    [-hw + 4, -hh + 18],
  ];
  const verts = local.map(([lx, ly]) => busLocalToWorld(lx, ly));
  return [
    { p1: verts[0], p2: verts[1], zone: 'top' },
    { p1: verts[1], p2: verts[2], zone: 'side' },
    { p1: verts[2], p2: verts[3], zone: 'side' },
    { p1: verts[5], p2: verts[0], zone: 'side' },
    { p1: verts[4], p2: verts[5], zone: 'side' },
  ];
}

function circleHitsBusSegment(cx, cy, radius, segment) {
  const dist = pointToSegmentDistance(cx, cy, segment.p1.x, segment.p1.y, segment.p2.x, segment.p2.y);
  return dist < radius + 2;
}

function entityHitsBus(cx, cy, entityRadius) {
  return getBusHullSegments().some((segment) => circleHitsBusSegment(cx, cy, entityRadius, segment));
}

function shoot() {
  const now = performance.now();
  if (!state.running || state.paused || state.gameOver) return;
  if (now - state.lastShot < 160) return;
  state.lastShot = now;
  state.bullets.push(createBullet(state.player.x, state.player.y, state.player.height));
}

function nextLevel() {
  if (state.level >= MAX_LEVEL) {
    state.gameOver = true;
    state.paused = true;
    state.userPaused = false;
    recordFinalRun();
    showOverlay(
      'Campaign Complete',
      `All thirty belts cleared! Final score: ${state.score}. Submit your run to the leaderboard.`,
      'Play Again',
      { showScoreSubmit: true },
    );
    updatePauseButtons();
    return;
  }

  state.level += 1;
  state.asteroids = [];
  state.enemies = [];
  state.bullets = [];
  state.enemyBullets = [];
  state.sentinelNets = [];
  state.fragments = [];
  state.effects = [];
  state.spawn = createSpawnState();
  state.spawn.asteroids.timer = 600;
  state.paused = true;
  state.userPaused = false;
  updateStatus();

  showOverlay(
    `Level ${state.level}: ${levelConfig(state.level).title}`,
    'Hostile traffic is intensifying — asteroids, bikes, monsters, bombs, and more. Clear the belt to advance.',
    'Launch Level',
  );
  updatePauseButtons();
}

function takeDamage() {
  if (state.invulnMs > 0) return;
  state.lives -= 1;
  state.invulnMs = 1300;
  if (state.lives <= 0) {
    state.gameOver = true;
    state.paused = true;
    state.userPaused = false;
    recordFinalRun();
    showOverlay(
      'Mission Failed',
      `The Astrolagbus hull was breached at level ${state.level}. Score: ${state.score}. Submit your run or restart.`,
      'Restart',
      { showScoreSubmit: true },
    );
    updatePauseButtons();
  }
}

function updatePlayer(dt) {
  const controls = inputManager.controls;
  const touchTarget = inputManager.touchTarget;
  let dx = 0;
  let dy = 0;

  if (controls.ArrowLeft || controls.a) dx -= 1;
  if (controls.ArrowRight || controls.d) dx += 1;
  if (controls.ArrowUp || controls.w) dy -= 1;
  if (controls.ArrowDown || controls.s) dy += 1;

  if (dx === 0 && dy === 0 && touchTarget.active) {
    const diffX = touchTarget.x - state.player.x;
    const diffY = touchTarget.y - state.player.y;
    const dist = Math.hypot(diffX, diffY);
    if (dist > 6) {
      dx = diffX / dist;
      dy = diffY / dist;
    }
  }

  if (dx !== 0 || dy !== 0) {
    const length = Math.hypot(dx, dy);
    state.player.x += (dx / length) * state.player.speed * dt;
    state.player.y += (dy / length) * state.player.speed * dt;
  }

  state.player.x = clamp(state.player.x, state.player.width * 0.6, canvas.clientWidth - state.player.width * 0.45);
  state.player.y = clamp(state.player.y, state.player.height * 0.6, canvas.clientHeight - state.player.height * 0.45);

  if (controls.Space) shoot();
}

function triggerBlast(x, y, blastRadius) {
  state.effects.push(createExplosion(x, y, blastRadius, 0.45));
  const hitRadius = blastRadius + Math.min(state.player.width, state.player.height) * 0.32;
  if (getDistance(state.player.x, state.player.y, x, y) < hitRadius) {
    takeDamage();
  }
}

function enemyScoreValue(enemy) {
  switch (enemy.type) {
    case 'bike': return 320;
    case 'laser': return 360;
    case 'monster': return 280;
    case 'bomb': return 180;
    case 'mine': return 220;
    case 'streaker': return 260;
    case 'drone': return 120;
    case 'satellite': return 450;
    default: return 150;
  }
}

function spawnWave(dt) {
  const config = levelConfig(state.level);
  const spawn = state.spawn;

  spawn.asteroids.timer -= dt * 1000;
  while (spawn.asteroids.timer <= 0 && spawn.asteroids.spawned < config.maxAsteroids) {
    state.asteroids.push(createAsteroid(canvas.clientWidth, canvas.clientHeight, state.level));
    spawn.asteroids.spawned += 1;
    spawn.asteroids.timer += config.spawnInterval * (0.78 + Math.random() * 0.45);
  }

  if (config.maxLasers > 0) {
    spawn.lasers.timer -= dt * 1000;
    while (spawn.lasers.timer <= 0 && spawn.lasers.spawned < config.maxLasers) {
      state.enemies.push(createLaserSentinel(canvas.clientWidth, state.level));
      spawn.lasers.spawned += 1;
      spawn.lasers.timer += config.laserInterval * (0.86 + Math.random() * 0.32);
    }
  }

  if (config.maxBikes > 0) {
    spawn.bikes.timer -= dt * 1000;
    while (spawn.bikes.timer <= 0 && spawn.bikes.spawned < config.maxBikes) {
      state.enemies.push(createSpaceBike(canvas.clientWidth, state.level));
      spawn.bikes.spawned += 1;
      spawn.bikes.timer += config.bikeInterval * (0.85 + Math.random() * 0.35);
    }
  }

  if (config.maxMonsters > 0) {
    spawn.monsters.timer -= dt * 1000;
    while (spawn.monsters.timer <= 0 && spawn.monsters.spawned < config.maxMonsters) {
      state.enemies.push(createSpaceMonster(
        canvas.clientWidth,
        canvas.clientHeight,
        state.player.x,
        state.player.y,
        state.level,
      ));
      spawn.monsters.spawned += 1;
      spawn.monsters.timer += config.monsterInterval * (0.8 + Math.random() * 0.4);
    }
  }

  if (config.maxBombs > 0) {
    spawn.bombs.timer -= dt * 1000;
    while (spawn.bombs.timer <= 0 && spawn.bombs.spawned < config.maxBombs) {
      state.enemies.push(createTinyBomb(canvas.clientWidth, state.level));
      spawn.bombs.spawned += 1;
      spawn.bombs.timer += config.bombInterval * (0.82 + Math.random() * 0.36);
    }
  }

  if (config.maxMines > 0) {
    spawn.mines.timer -= dt * 1000;
    while (spawn.mines.timer <= 0 && spawn.mines.spawned < config.maxMines) {
      state.enemies.push(createPulseMine(canvas.clientWidth, canvas.clientHeight, state.level));
      spawn.mines.spawned += 1;
      spawn.mines.timer += config.mineInterval * (0.88 + Math.random() * 0.3);
    }
  }

  if (config.maxStreakers > 0) {
    spawn.streakers.timer -= dt * 1000;
    while (spawn.streakers.timer <= 0 && spawn.streakers.spawned < config.maxStreakers) {
      state.enemies.push(createCometStreaker(canvas.clientWidth, canvas.clientHeight, state.level));
      spawn.streakers.spawned += 1;
      spawn.streakers.timer += config.streakerInterval * (0.86 + Math.random() * 0.32);
    }
  }

  if (config.maxDrones > 0) {
    spawn.drones.timer -= dt * 1000;
    while (spawn.drones.timer <= 0 && spawn.drones.spawned < config.maxDrones) {
      const groupSize = Math.min(3, config.maxDrones - spawn.drones.spawned);
      for (let i = 0; i < groupSize; i += 1) {
        state.enemies.push(createDrone(canvas.clientWidth, state.level));
        spawn.drones.spawned += 1;
      }
      spawn.drones.timer += config.droneInterval * (0.75 + Math.random() * 0.4);
    }
  }

  if (config.maxSatellites > 0) {
    spawn.satellites.timer -= dt * 1000;
    while (spawn.satellites.timer <= 0 && spawn.satellites.spawned < config.maxSatellites) {
      state.enemies.push(createSniperSatellite(canvas.clientWidth, state.level));
      spawn.satellites.spawned += 1;
      spawn.satellites.timer += config.satelliteInterval * (0.9 + Math.random() * 0.25);
    }
  }
}

function spawnAsteroids(dt) {
  spawnWave(dt);
}

function retargetMonster(enemy, playerX, playerY, canvasWidth, canvasHeight) {
  if (enemy.x < -60) enemy.x = canvasWidth + 24;
  else if (enemy.x > canvasWidth + 60) enemy.x = -24;
  if (enemy.y < -60) enemy.y = canvasHeight + 24;
  else if (enemy.y > canvasHeight + 60) enemy.y = -24;

  const dx = playerX - enemy.x + (Math.random() - 0.5) * 70;
  const dy = playerY - enemy.y + (Math.random() - 0.5) * 70;
  const dist = Math.max(1, Math.hypot(dx, dy));
  enemy.vx = (dx / dist) * enemy.speed;
  enemy.vy = (dy / dist) * enemy.speed;
}

function startBikeReturnPass(enemy, canvasWidth, level) {
  enemy.fromLeft = !enemy.fromLeft;
  enemy.x = enemy.fromLeft ? -30 : canvasWidth + 30;
  enemy.y = 40 + Math.random() * 80;
  enemy.vx = enemy.fromLeft ? enemy.baseVx : -enemy.baseVx;
  enemy.vy = 18 + level * 0.4;
  enemy.phase = 'cross';
  enemy.hasShotThisPass = false;
  enemy.shootTimer = 0;
  enemy.burstLeft = 0;
}

function aimSentinelNet(enemy, playerX, playerY, sweepSpeed, dt) {
  const targetAngle = Math.atan2(playerY - enemy.y, playerX - enemy.x);
  enemy.aimAngle = rotateToward(enemy.aimAngle, targetAngle, sweepSpeed * dt);
}

function fireSentinelNet(enemy, playerX, playerY, level) {
  const spawnDist = enemy.radius + 10;
  const nx = enemy.x + Math.cos(enemy.aimAngle) * spawnDist;
  const ny = enemy.y + Math.sin(enemy.aimAngle) * spawnDist;
  state.sentinelNets.push(createSentinelNet(nx, ny, playerX, playerY, level));
}

function updateSentinelNets(dt) {
  state.sentinelNets.forEach((net) => {
    net.x += net.vx * dt;
    net.y += net.vy * dt;
    net.rotation += net.rotationSpeed * dt;
    net.traveled += Math.hypot(net.vx, net.vy) * dt;
    net.ttl -= dt;
    const progress = Math.min(1, net.traveled / 260);
    net.radius = net.startRadius + (net.endRadius - net.startRadius) * progress;
  });
  state.sentinelNets = state.sentinelNets.filter((net) => (
    net.ttl > 0
    && net.x > -60
    && net.x < canvas.clientWidth + 60
    && net.y > -60
    && net.y < canvas.clientHeight + 60
  ));
}

function updateEnemyBullets(dt) {
  state.enemyBullets.forEach((bullet) => {
    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;
    bullet.ttl -= dt;
  });
  state.enemyBullets = state.enemyBullets.filter((bullet) => (
    bullet.ttl > 0
    && bullet.x > -30
    && bullet.x < canvas.clientWidth + 30
    && bullet.y > -30
    && bullet.y < canvas.clientHeight + 30
  ));
}

function updateEnemies(dt) {
  const playerX = state.player.x;
  const playerY = state.player.y;
  const toRemove = [];

  state.enemies.forEach((enemy) => {
    switch (enemy.type) {
      case 'bike': {
        enemy.ttl -= dt;
        const canvasW = canvas.clientWidth;
        const canvasH = canvas.clientHeight;

        if (enemy.phase === 'cross') {
          enemy.x += enemy.vx * dt;
          enemy.y += enemy.vy * dt;
          enemy.y = clamp(enemy.y, 35, canvasH * 0.48);

          const inShootLane = enemy.x > canvasW * 0.22 && enemy.x < canvasW * 0.78;
          if (inShootLane && !enemy.hasShotThisPass) {
            enemy.phase = 'shoot';
            enemy.shootTimer = 0;
            enemy.burstLeft = 4 + Math.floor(state.level / 8);
            enemy.vx *= 0.18;
          }

          const exitedRight = enemy.fromLeft && enemy.x > canvasW + 28;
          const exitedLeft = !enemy.fromLeft && enemy.x < -28;
          if (exitedRight || exitedLeft) {
            enemy.passesLeft -= 1;
            if (enemy.passesLeft <= 0) {
              toRemove.push(enemy);
            } else {
              startBikeReturnPass(enemy, canvasW, state.level);
            }
          }
        } else if (enemy.phase === 'shoot') {
          enemy.x += enemy.vx * dt;
          enemy.y += enemy.vy * dt;
          enemy.shootTimer -= dt;
          if (enemy.shootTimer <= 0 && enemy.burstLeft > 0) {
            state.enemyBullets.push(createEnemyBullet(
              enemy.x,
              enemy.y + 8,
              playerX,
              playerY,
              220 + state.level * 4,
            ));
            enemy.burstLeft -= 1;
            enemy.shootTimer = 0.36;
          }
          if (enemy.burstLeft <= 0) {
            enemy.phase = 'cross';
            enemy.hasShotThisPass = true;
            enemy.vx = enemy.fromLeft ? enemy.baseVx * 0.9 : -enemy.baseVx * 0.9;
          }
        }

        if (enemy.ttl <= 0) toRemove.push(enemy);
        break;
      }
      case 'monster': {
        enemy.wobble += dt * 6;
        enemy.x += enemy.vx * dt;
        enemy.y += enemy.vy * dt;
        enemy.x += Math.sin(enemy.wobble) * 18 * dt;

        const offScreen = (
          enemy.x < -60
          || enemy.x > canvas.clientWidth + 60
          || enemy.y < -60
          || enemy.y > canvas.clientHeight + 60
        );
        if (offScreen) {
          enemy.passesLeft -= 1;
          if (enemy.passesLeft <= 0) {
            toRemove.push(enemy);
          } else {
            retargetMonster(enemy, playerX, playerY, canvas.clientWidth, canvas.clientHeight);
          }
        }
        break;
      }
      case 'bomb': {
        enemy.fuse -= dt;
        enemy.y += enemy.speed * dt;
        enemy.x += enemy.drift * dt;
        if (enemy.fuse <= 0) {
          triggerBlast(enemy.x, enemy.y, enemy.blastRadius);
          toRemove.push(enemy);
        }
        break;
      }
      case 'mine': {
        if (!enemy.armed) {
          enemy.armTimer -= dt;
          if (enemy.armTimer <= 0) enemy.armed = true;
        } else {
          enemy.pulseTimer += dt;
          if (enemy.pulseTimer >= 3.2) {
            triggerBlast(enemy.x, enemy.y, enemy.blastRadius);
            toRemove.push(enemy);
          }
        }
        break;
      }
      case 'streaker': {
        enemy.x += enemy.vx * dt;
        enemy.y += enemy.vy * dt;
        enemy.tail += dt;
        if (enemy.x < -80 || enemy.x > canvas.clientWidth + 80 || enemy.y > canvas.clientHeight + 60) {
          toRemove.push(enemy);
        }
        break;
      }
      case 'drone': {
        enemy.wobblePhase += dt * 7;
        enemy.x += (enemy.vx + Math.sin(enemy.wobblePhase) * 45) * dt;
        enemy.y += enemy.vy * dt;
        if (enemy.y > canvas.clientHeight + 40) toRemove.push(enemy);
        break;
      }
      case 'satellite': {
        enemy.pulse += dt * 10;
        if (!enemy.fired) {
          enemy.charge += dt;
          if (enemy.charge >= enemy.lockDuration) {
            const spread = [-0.12, 0, 0.12];
            spread.forEach((offset) => {
              const angle = Math.atan2(playerY - enemy.y, playerX - enemy.x) + offset;
              state.enemyBullets.push({
                x: enemy.x,
                y: enemy.y + enemy.radius,
                vx: Math.cos(angle) * (260 + state.level * 5),
                vy: Math.sin(angle) * (260 + state.level * 5),
                radius: 6,
                ttl: 4,
                maxTtl: 4,
              });
            });
            enemy.fired = true;
          }
        }
        if (enemy.fired && enemy.charge > enemy.lockDuration + 2) {
          toRemove.push(enemy);
        }
        break;
      }
      case 'laser': {
        const canvasW = canvas.clientWidth;
        enemy.x += enemy.vx * dt;
        enemy.y = clamp(enemy.y, 22, canvas.clientHeight * 0.24);

        if (enemy.netCharge > 0) {
          aimSentinelNet(enemy, playerX, playerY, enemy.aimSweepSpeed, dt);
          enemy.netCharge -= dt;
          if (enemy.netCharge <= 0) {
            fireSentinelNet(enemy, playerX, playerY, state.level);
            enemy.fireTimer = enemy.fireCooldown + Math.random() * 0.5;
          }
        } else {
          enemy.fireTimer -= dt;
          if (enemy.fireTimer <= 0) {
            enemy.aimAngle = Math.atan2(playerY - enemy.y, playerX - enemy.x);
            enemy.netCharge = enemy.netChargeDuration;
          }
        }

        if (enemy.x <= 32 && enemy.vx < 0) {
          enemy.vx *= -1;
          enemy.passesLeft -= 1;
        } else if (enemy.x >= canvasW - 32 && enemy.vx > 0) {
          enemy.vx *= -1;
          enemy.passesLeft -= 1;
        }
        if (enemy.passesLeft <= 0) toRemove.push(enemy);
        break;
      }
      default:
        break;
    }
  });

  if (toRemove.length) {
    state.enemies = state.enemies.filter((enemy) => !toRemove.includes(enemy));
  }
}

function updateBullets(dt) {
  state.bullets.forEach((bullet) => {
    bullet.y -= bullet.speed * dt;
    bullet.ttl -= dt;
  });
  state.bullets = state.bullets.filter((bullet) => bullet.y > -20 && bullet.ttl > 0);
}

function updateFragments(dt) {
  state.fragments.forEach((fragment) => {
    fragment.x += fragment.vx * dt;
    fragment.y += fragment.vy * dt;
    fragment.rotation += fragment.rotationSpeed;
    fragment.ttl -= dt;
  });
  state.fragments = state.fragments.filter((fragment) => fragment.ttl > 0);
}

function updateEffects(dt) {
  state.effects.forEach((effect) => {
    effect.ttl -= dt;
    if (effect.kind === 'explosion') {
      const progress = 1 - effect.ttl / effect.maxTtl;
      effect.radius = 8 + (effect.maxRadius - 8) * Math.min(1, progress);
    } else {
      effect.radius += 40 * dt;
    }
  });
  state.effects = state.effects.filter((effect) => effect.ttl > 0);
}

function updateAsteroids(dt) {
  state.asteroids.forEach((asteroid) => {
    asteroid.y += asteroid.speed * dt;
    asteroid.x += asteroid.drift * dt;
    asteroid.rotation += asteroid.rotationSpeed;
  });
  state.asteroids = state.asteroids.filter((asteroid) => (
    asteroid.y - asteroid.radius < canvas.clientHeight + 40
    && asteroid.x + asteroid.radius > -40
    && asteroid.x - asteroid.radius < canvas.clientWidth + 40
  ));
}

function enemyHitRadius(enemy) {
  if (enemy.type === 'bike') return Math.max(enemy.width, enemy.height) * 0.45;
  return enemy.radius;
}

function destroyEnemy(enemy) {
  state.score += enemyScoreValue(enemy);
  state.effects.push(createImpact(enemy.x, enemy.y));
  if (enemy.type === 'bomb' || enemy.type === 'mine') {
    triggerBlast(enemy.x, enemy.y, enemy.blastRadius);
  }
}

function isLevelCleared() {
  const config = levelConfig(state.level);
  const spawn = state.spawn;
  if (!spawn) return false;
  if (spawn.asteroids.spawned < config.maxAsteroids) return false;
  if (spawn.lasers.spawned < config.maxLasers) return false;
  if (spawn.bikes.spawned < config.maxBikes) return false;
  if (spawn.monsters.spawned < config.maxMonsters) return false;
  if (spawn.bombs.spawned < config.maxBombs) return false;
  if (spawn.mines.spawned < config.maxMines) return false;
  if (spawn.streakers.spawned < config.maxStreakers) return false;
  if (spawn.drones.spawned < config.maxDrones) return false;
  if (spawn.satellites.spawned < config.maxSatellites) return false;
  if (state.asteroids.length > 0) return false;
  if (state.enemies.length > 0) return false;
  return true;
}

function checkCollisions() {
  const removedAsteroids = new Set();
  const removedEnemies = new Set();
  const removedBullets = new Set();

  state.asteroids.forEach((asteroid) => {
    state.bullets.forEach((bullet) => {
      if (removedAsteroids.has(asteroid) || removedBullets.has(bullet)) return;
      const hitLeft = getDistance(asteroid.x, asteroid.y, bullet.x - bullet.offset, bullet.y);
      const hitRight = getDistance(asteroid.x, asteroid.y, bullet.x + bullet.offset, bullet.y);
      const hitCenter = getDistance(asteroid.x, asteroid.y, bullet.x, bullet.y);
      const dist = Math.min(hitLeft, hitRight, hitCenter);
      if (dist < asteroid.radius + bullet.radius + 2) {
        asteroid.hp -= 1;
        removedBullets.add(bullet);
        if (asteroid.hp <= 0) {
          removedAsteroids.add(asteroid);
          state.score += Math.round(110 + asteroid.radius * 7);
          state.fragments.push(...createFragments(asteroid.x, asteroid.y, asteroid.radius, asteroid.variant));
          state.effects.push(createImpact(asteroid.x, asteroid.y));
        } else {
          state.score += 20;
          state.effects.push(createImpact(bullet.x, bullet.y));
        }
      }
    });
  });

  state.enemies.forEach((enemy) => {
    state.bullets.forEach((bullet) => {
      if (removedEnemies.has(enemy) || removedBullets.has(bullet)) return;
      const hitLeft = getDistance(enemy.x, enemy.y, bullet.x - bullet.offset, bullet.y);
      const hitRight = getDistance(enemy.x, enemy.y, bullet.x + bullet.offset, bullet.y);
      const hitCenter = getDistance(enemy.x, enemy.y, bullet.x, bullet.y);
      const dist = Math.min(hitLeft, hitRight, hitCenter);
      const radius = enemyHitRadius(enemy);
      if (dist < radius + bullet.radius + 2) {
        enemy.hp -= 1;
        removedBullets.add(bullet);
        if (enemy.hp <= 0) {
          removedEnemies.add(enemy);
          destroyEnemy(enemy);
        } else {
          state.score += 25;
          state.effects.push(createImpact(bullet.x, bullet.y));
        }
      }
    });
  });

  state.bullets = state.bullets.filter((bullet) => !removedBullets.has(bullet));
  state.asteroids = state.asteroids.filter((asteroid) => !removedAsteroids.has(asteroid));
  state.enemies = state.enemies.filter((enemy) => !removedEnemies.has(enemy));

  for (const asteroid of state.asteroids) {
    if (entityHitsBus(asteroid.x, asteroid.y, asteroid.radius)) {
      state.asteroids = state.asteroids.filter((candidate) => candidate !== asteroid);
      takeDamage();
      break;
    }
  }

  for (const enemy of state.enemies) {
    if (entityHitsBus(enemy.x, enemy.y, enemyHitRadius(enemy))) {
      if (enemy.type === 'bomb') {
        triggerBlast(enemy.x, enemy.y, enemy.blastRadius);
      } else if (enemy.type === 'mine') {
        if (enemy.armed) triggerBlast(enemy.x, enemy.y, enemy.blastRadius);
        else takeDamage();
      } else {
        takeDamage();
      }
      state.enemies = state.enemies.filter((candidate) => candidate !== enemy);
      break;
    }
  }

  for (const bullet of state.enemyBullets) {
    if (entityHitsBus(bullet.x, bullet.y, bullet.radius)) {
      state.enemyBullets = state.enemyBullets.filter((candidate) => candidate !== bullet);
      takeDamage();
      break;
    }
  }

  for (const net of state.sentinelNets) {
    if (entityHitsBus(net.x, net.y, net.radius)) {
      state.sentinelNets = state.sentinelNets.filter((candidate) => candidate !== net);
      takeDamage();
      break;
    }
  }
}

function updateGame(dt) {
  if (!state.running || state.paused || state.gameOver) return;

  if (state.invulnMs > 0) {
    state.invulnMs = Math.max(0, state.invulnMs - dt * 1000);
  }

  updatePlayer(dt);
  spawnAsteroids(dt);
  updateBullets(dt);
  updateEnemyBullets(dt);
  updateSentinelNets(dt);
  updateAsteroids(dt);
  updateEnemies(dt);
  updateFragments(dt);
  updateEffects(dt);
  checkCollisions();
  if (state.score > state.hiScore) {
    state.hiScore = state.score;
    saveHiScore();
  }
  updateStatus();

  if (!state.gameOver && isLevelCleared()) {
    nextLevel();
  }
}

function draw() {
  drawStars(ctx, canvas, state.starField);
  state.fragments.forEach((fragment) => drawFragment(ctx, fragment));
  state.asteroids.forEach((asteroid) => drawAsteroid(ctx, asteroid));
  drawEnemies(ctx, state.enemies);
  drawBullets(ctx, state.bullets);
  drawEnemyBullets(ctx, state.enemyBullets);
  drawSentinelNets(ctx, state.sentinelNets);
  state.effects.forEach((effect) => drawImpact(ctx, effect));
  if (!state.invulnMs || Math.floor(state.invulnMs / 100) % 2 === 0) {
    drawBus(ctx, state.player);
  }
  drawHUD(ctx, canvas, state.lives, state.score, state.hiScore);
}

function loop(timestamp) {
  const dt = Math.min((timestamp - state.lastTime) / 1000, 0.04);
  state.lastTime = timestamp;
  updateGame(dt);
  draw();
  requestAnimationFrame(loop);
}

function bindUI() {
  startBtn.addEventListener('click', () => {
    if (!state.running || state.gameOver) {
      startMission();
      return;
    }
    state.userPaused = false;
    state.paused = false;
    hideOverlay();
    updatePauseButtons();
  });

  restartBtn.addEventListener('click', startMission);

  restartLevelBtn.addEventListener('click', restartLevel);

  resumeBtn.addEventListener('click', () => {
    if (state.gameOver) restartLevel();
    else resumeFromPause();
  });

  pauseButtons.forEach((button) => {
    button.addEventListener('click', togglePause);
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    if (event.key !== 'p' && event.key !== 'P' && event.key !== 'Escape') return;
    if (!state.running || state.gameOver) return;
    if (state.paused && !state.userPaused) return;
    event.preventDefault();
    togglePause();
  });
}

function init() {
  loadHiScore();
  resizeCanvas();
  createStars();
  updateStatus();
  window.addEventListener('resize', resizeCanvas);
  inputManager.setupKeyboardInput(shoot);
  inputManager.setupTouchInput(shoot);
  inputManager.setupCanvasTouchNavigation(canvas, {
    shootCallback: shoot,
    isPointOnBus,
  });
  bindUI();
  showOverlay(
    'Neon Belt Run',
    'Thirty levels of escalating danger. Move with arrows/WASD or drag the screen. Tap the bus to shoot. Watch for bikes, monsters, bombs, and more.',
    'Start Mission',
  );
  updatePauseButtons();
  requestAnimationFrame(loop);
}

init();

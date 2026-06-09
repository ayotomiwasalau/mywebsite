const NEON = {
  green: '#39ff14',
  blue: '#00d4ff',
  magenta: '#ff4df5',
  magentaDeep: '#c93bff',
  yellow: '#ffd400',
  yellowDark: '#e6b800',
  black: '#0c0c0c',
};

const PIXEL_FONT = '"Press Start 2P", "Courier New", monospace';

function withGlow(ctx, color, blur, drawFn) {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
  drawFn();
  ctx.restore();
}

function setPixelFont(ctx, size = 11) {
  ctx.font = `${size}px ${PIXEL_FONT}`;
  ctx.textBaseline = 'top';
  ctx.imageSmoothingEnabled = false;
}

function drawNeonText(ctx, text, x, y, color = NEON.green, size = 11) {
  ctx.save();
  setPixelFont(ctx, size);
  ctx.shadowColor = color;
  ctx.shadowBlur = 14;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawStars(ctx, canvas, starField) {
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  starField.forEach((star) => {
    ctx.save();
    ctx.globalAlpha = star.alpha;
    ctx.fillStyle = NEON.blue;
    ctx.shadowColor = NEON.blue;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
  ctx.globalAlpha = 1;
}

function strokeAsteroidPath(ctx, verts) {
  ctx.beginPath();
  verts.forEach((v, i) => {
    if (i === 0) ctx.moveTo(v.x, v.y);
    else ctx.lineTo(v.x, v.y);
  });
  ctx.closePath();
}

function drawAsteroid(ctx, asteroid) {
  const color = asteroid.variant === 'blue' ? NEON.blue : NEON.magenta;
  const verts = asteroid.vertices;

  ctx.save();
  ctx.translate(asteroid.x, asteroid.y);
  ctx.rotate(asteroid.rotation);

  withGlow(ctx, color, 20, () => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.2;
    ctx.fillStyle = 'rgba(20, 0, 40, 0.35)';
    strokeAsteroidPath(ctx, verts);
    ctx.fill();
    ctx.stroke();
  });

  ctx.strokeStyle = 'rgba(255, 220, 255, 0.35)';
  ctx.lineWidth = 1;
  strokeAsteroidPath(ctx, verts);
  ctx.stroke();

  ctx.restore();
}

function drawFragment(ctx, fragment) {
  const color = fragment.color || NEON.magenta;
  ctx.save();
  ctx.translate(fragment.x, fragment.y);
  ctx.rotate(fragment.rotation);
  withGlow(ctx, color, 12, () => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-fragment.size, -fragment.size * 0.4);
    ctx.lineTo(fragment.size * 0.6, fragment.size * 0.5);
    ctx.lineTo(-fragment.size * 0.3, fragment.size);
    ctx.closePath();
    ctx.stroke();
  });
  ctx.restore();
}

function drawExhaustFlame(ctx, offsetX, baseY) {
  withGlow(ctx, NEON.blue, 16, () => {
    const grad = ctx.createLinearGradient(offsetX, baseY, offsetX, baseY + 28);
    grad.addColorStop(0, 'rgba(0, 212, 255, 0.95)');
    grad.addColorStop(0.45, 'rgba(0, 140, 255, 0.55)');
    grad.addColorStop(1, 'rgba(0, 80, 200, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(offsetX - 5, baseY);
    ctx.lineTo(offsetX + 5, baseY);
    ctx.lineTo(offsetX + 2, baseY + 26);
    ctx.lineTo(offsetX - 2, baseY + 26);
    ctx.closePath();
    ctx.fill();
  });
}

function drawBus(ctx, player) {
  const { x, y, width, height } = player;
  const sx = width / 70;
  const sy = height / 44;
  const hw = 35;
  const hh = 22;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(sx, sy);

  drawExhaustFlame(ctx, -14, hh - 4);
  drawExhaustFlame(ctx, 14, hh - 4);

  withGlow(ctx, NEON.green, 18, () => {
    ctx.fillStyle = NEON.yellow;
    ctx.strokeStyle = NEON.green;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-hw + 10, -hh + 6);
    ctx.lineTo(hw - 10, -hh + 6);
    ctx.lineTo(hw - 4, -hh + 18);
    ctx.lineTo(hw - 6, hh - 8);
    ctx.lineTo(-hw + 6, hh - 8);
    ctx.lineTo(-hw + 4, -hh + 18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });

  ctx.fillStyle = NEON.black;
  const stripeW = 46;
  ctx.fillRect(-stripeW / 2, -hh + 14, stripeW, 4);
  ctx.fillRect(-stripeW / 2, -4, stripeW, 4);
  ctx.fillRect(-stripeW / 2, hh - 16, stripeW, 4);

  ctx.fillStyle = 'rgba(0, 40, 60, 0.85)';
  ctx.strokeStyle = NEON.blue;
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i += 1) {
    const wx = -hw + 16 + i * 14;
    ctx.fillRect(wx, -hh + 12, 10, 11);
    ctx.strokeRect(wx, -hh + 12, 10, 11);
  }

  ctx.fillStyle = NEON.yellowDark;
  ctx.fillRect(-hw + 8, -hh + 2, 8, 6);
  ctx.fillRect(hw - 16, -hh + 2, 8, 6);

  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.arc(-hw + 14, hh - 10, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(hw - 14, hh - 10, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = NEON.green;
  ctx.lineWidth = 2;
  ctx.shadowColor = NEON.green;
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.moveTo(-hw + 10, -hh + 6);
  ctx.lineTo(hw - 10, -hh + 6);
  ctx.lineTo(hw - 4, -hh + 18);
  ctx.lineTo(hw - 6, hh - 8);
  ctx.lineTo(-hw + 6, hh - 8);
  ctx.lineTo(-hw + 4, -hh + 18);
  ctx.closePath();
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.restore();
}

function drawLaserBeam(ctx, x, y, length) {
  ctx.save();
  ctx.strokeStyle = NEON.blue;
  ctx.lineWidth = 2.5;
  ctx.setLineDash([7, 5]);
  ctx.shadowColor = NEON.blue;
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y - length);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function drawBullets(ctx, bullets) {
  bullets.forEach((bullet) => {
    const beamLen = 22 + (1 - bullet.ttl / bullet.maxTtl) * 18;
    drawLaserBeam(ctx, bullet.x - bullet.offset, bullet.y, beamLen);
    drawLaserBeam(ctx, bullet.x + bullet.offset, bullet.y, beamLen);
  });
}

function drawImpact(ctx, effect) {
  const alpha = effect.ttl / effect.maxTtl;
  ctx.save();
  ctx.globalAlpha = alpha;

  if (effect.kind === 'explosion') {
    const progress = 1 - alpha;
    const radius = effect.radius + (effect.maxRadius - effect.radius) * progress;
    withGlow(ctx, NEON.magenta, 28, () => {
      ctx.strokeStyle = NEON.magenta;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.fillStyle = 'rgba(255, 77, 245, 0.25)';
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, radius * 0.65, 0, Math.PI * 2);
    ctx.fill();
  } else {
    withGlow(ctx, '#ffffff', 22, () => {
      ctx.fillStyle = '#e8f8ff';
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  ctx.restore();
}

function drawEnemyBullet(ctx, bullet) {
  ctx.save();
  withGlow(ctx, NEON.magenta, 14, () => {
    ctx.fillStyle = NEON.magenta;
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function drawEnemyBullets(ctx, bullets) {
  bullets.forEach((bullet) => drawEnemyBullet(ctx, bullet));
}

function drawSpaceBike(ctx, bike) {
  ctx.save();
  ctx.translate(bike.x, bike.y);
  if (bike.vx < 0) ctx.scale(-1, 1);

  withGlow(ctx, NEON.blue, 16, () => {
    ctx.fillStyle = '#111';
    ctx.strokeStyle = NEON.blue;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-16, 4);
    ctx.lineTo(12, 4);
    ctx.lineTo(16, 0);
    ctx.lineTo(12, -4);
    ctx.lineTo(-16, -4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });

  ctx.fillStyle = NEON.magenta;
  ctx.fillRect(8, -2, 6, 4);

  if (bike.phase === 'shoot') {
    ctx.strokeStyle = NEON.magenta;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(14, 0);
    ctx.lineTo(24, 0);
    ctx.stroke();
  }

  ctx.restore();
}

function drawSpaceMonster(ctx, monster) {
  ctx.save();
  ctx.translate(monster.x, monster.y);
  ctx.rotate(Math.sin(monster.wobble) * 0.25);

  withGlow(ctx, NEON.magentaDeep, 20, () => {
    ctx.fillStyle = 'rgba(40, 0, 50, 0.85)';
    ctx.strokeStyle = NEON.magenta;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(0, -monster.radius);
    ctx.lineTo(monster.radius * 0.85, -monster.radius * 0.2);
    ctx.lineTo(monster.radius * 0.55, monster.radius);
    ctx.lineTo(-monster.radius * 0.55, monster.radius);
    ctx.lineTo(-monster.radius * 0.85, -monster.radius * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });

  ctx.fillStyle = '#ff0066';
  ctx.beginPath();
  ctx.arc(-6, -4, 3, 0, Math.PI * 2);
  ctx.arc(6, -4, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawTinyBomb(ctx, bomb) {
  const pulse = 0.7 + Math.sin(performance.now() * 0.012) * 0.3;
  ctx.save();
  ctx.translate(bomb.x, bomb.y);

  withGlow(ctx, '#ff8800', 14 * pulse, () => {
    ctx.fillStyle = '#221100';
    ctx.strokeStyle = '#ff8800';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, bomb.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  ctx.fillStyle = '#ffcc00';
  ctx.fillRect(-2, -bomb.radius - 5, 4, 5);

  ctx.restore();
}

function drawPulseMine(ctx, mine) {
  const pulse = mine.armed ? 0.5 + Math.sin(mine.pulseTimer * 8) * 0.5 : 0.3;
  ctx.save();
  ctx.translate(mine.x, mine.y);

  withGlow(ctx, mine.armed ? NEON.magenta : NEON.blue, 12 + pulse * 12, () => {
    ctx.strokeStyle = mine.armed ? NEON.magenta : NEON.blue;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 6; i += 1) {
      const angle = (i / 6) * Math.PI * 2;
      const r = mine.radius * (0.75 + pulse * 0.25);
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
  });

  ctx.restore();
}

function drawCometStreaker(ctx, streaker) {
  ctx.save();
  ctx.translate(streaker.x, streaker.y);

  withGlow(ctx, NEON.blue, 18, () => {
    ctx.fillStyle = 'rgba(0, 40, 80, 0.7)';
    ctx.strokeStyle = NEON.blue;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, streaker.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  ctx.strokeStyle = 'rgba(0, 212, 255, 0.45)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-streaker.vx * 0.04, -streaker.vy * 0.04);
  ctx.lineTo(-streaker.vx * 0.12, -streaker.vy * 0.12);
  ctx.stroke();

  ctx.restore();
}

function drawDrone(ctx, drone) {
  ctx.save();
  ctx.translate(drone.x, drone.y);
  ctx.rotate(Math.sin(drone.wobblePhase) * 0.4);

  withGlow(ctx, NEON.green, 10, () => {
    ctx.fillStyle = '#102010';
    ctx.strokeStyle = NEON.green;
    ctx.lineWidth = 1.5;
    ctx.fillRect(-drone.radius, -drone.radius * 0.6, drone.radius * 2, drone.radius * 1.2);
    ctx.strokeRect(-drone.radius, -drone.radius * 0.6, drone.radius * 2, drone.radius * 1.2);
  });

  ctx.restore();
}

function drawSentinelNetMesh(ctx, radius, alpha = 1) {
  const rings = 3;
  const spokes = 8;

  ctx.globalAlpha = alpha;
  ctx.strokeStyle = '#ff3366';
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();

  for (let i = 1; i <= rings; i += 1) {
    ctx.beginPath();
    ctx.arc(0, 0, radius * (i / rings), 0, Math.PI * 2);
    ctx.stroke();
  }

  for (let i = 0; i < spokes; i += 1) {
    const angle = (i / spokes) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    ctx.stroke();
  }

  for (let i = 0; i < spokes; i += 1) {
    const angle = (i / spokes) * Math.PI * 2 + Math.PI / spokes;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    ctx.lineTo(Math.cos(angle + Math.PI * 2 / spokes) * radius, Math.sin(angle + Math.PI * 2 / spokes) * radius);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
}

function drawSentinelNet(ctx, net) {
  ctx.save();
  ctx.translate(net.x, net.y);
  ctx.rotate(net.rotation);

  withGlow(ctx, '#ff6699', 14, () => {
    drawSentinelNetMesh(ctx, net.radius, 0.95);
  });

  ctx.fillStyle = 'rgba(255, 51, 102, 0.12)';
  ctx.beginPath();
  ctx.arc(0, 0, net.radius * 0.85, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawSentinelNets(ctx, nets) {
  nets.forEach((net) => drawSentinelNet(ctx, net));
}

function drawLaserSentinel(ctx, sentinel) {
  ctx.save();

  if (sentinel.netCharge > 0) {
    const chargeProgress = 1 - sentinel.netCharge / sentinel.netChargeDuration;
    const previewRadius = 8 + chargeProgress * 12;
    const previewDist = sentinel.radius + 14 + chargeProgress * 10;
    const px = sentinel.x + Math.cos(sentinel.aimAngle) * previewDist;
    const py = sentinel.y + Math.sin(sentinel.aimAngle) * previewDist;

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(sentinel.aimAngle + performance.now() * 0.004);
    withGlow(ctx, '#ff6699', 10 + chargeProgress * 8, () => {
      drawSentinelNetMesh(ctx, previewRadius, 0.35 + chargeProgress * 0.45);
    });
    ctx.restore();
  }

  ctx.translate(sentinel.x, sentinel.y);
  withGlow(ctx, '#ff3366', 16, () => {
    ctx.fillStyle = '#180810';
    ctx.strokeStyle = '#ff3366';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 6; i += 1) {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const px = Math.cos(angle) * sentinel.radius;
      const py = Math.sin(angle) * sentinel.radius;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });

  ctx.fillStyle = '#ff6699';
  ctx.beginPath();
  ctx.arc(0, 0, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawSniperSatellite(ctx, satellite) {
  const charging = !satellite.fired && satellite.charge > 0;
  const glow = charging ? 16 + Math.sin(satellite.pulse) * 8 : 10;

  ctx.save();
  ctx.translate(satellite.x, satellite.y);

  withGlow(ctx, charging ? NEON.magenta : NEON.blue, glow, () => {
    ctx.fillStyle = '#101018';
    ctx.strokeStyle = charging ? NEON.magenta : NEON.blue;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, satellite.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  ctx.strokeStyle = NEON.blue;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-satellite.radius - 8, 0);
  ctx.lineTo(-satellite.radius - 18, -6);
  ctx.moveTo(-satellite.radius - 8, 0);
  ctx.lineTo(-satellite.radius - 18, 6);
  ctx.moveTo(satellite.radius + 8, 0);
  ctx.lineTo(satellite.radius + 18, -6);
  ctx.moveTo(satellite.radius + 8, 0);
  ctx.lineTo(satellite.radius + 18, 6);
  ctx.stroke();

  if (charging) {
    ctx.strokeStyle = 'rgba(255, 77, 245, 0.55)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, satellite.radius);
    ctx.lineTo(0, satellite.radius + 40);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.restore();
}

function drawEnemies(ctx, enemies) {
  enemies.forEach((enemy) => {
    switch (enemy.type) {
      case 'bike':
        drawSpaceBike(ctx, enemy);
        break;
      case 'monster':
        drawSpaceMonster(ctx, enemy);
        break;
      case 'bomb':
        drawTinyBomb(ctx, enemy);
        break;
      case 'mine':
        drawPulseMine(ctx, enemy);
        break;
      case 'streaker':
        drawCometStreaker(ctx, enemy);
        break;
      case 'drone':
        drawDrone(ctx, enemy);
        break;
      case 'laser':
        drawLaserSentinel(ctx, enemy);
        break;
      case 'satellite':
        drawSniperSatellite(ctx, enemy);
        break;
      default:
        break;
    }
  });
}

function padScore(value) {
  return String(Math.max(0, Math.floor(value))).padStart(7, '0');
}

function formatLives(lives) {
  const hearts = [];
  for (let i = 0; i < lives; i += 1) {
    hearts.push('[♥]');
  }
  return hearts.join(' ');
}

function drawHUD(ctx, canvas, lives, score, hiScore) {
  drawNeonText(ctx, `LIVES: ${formatLives(lives)}`, 16, 14, NEON.green, 10);
  const bottomY = canvas.clientHeight - 42;
  drawNeonText(ctx, `SCORE: ${padScore(score)}`, 16, bottomY, NEON.green, 10);
  drawNeonText(ctx, `HI-SCORE: ${padScore(hiScore)}`, 16, bottomY + 18, NEON.green, 10);
}

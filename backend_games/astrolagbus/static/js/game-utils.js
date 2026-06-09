function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getGameSubmitUrl() {
  const fromData = document.querySelector('[data-submit-url]')?.dataset.submitUrl;
  if (fromData) return fromData;
  return window.location.pathname.replace(/\/?$/, '/') + 'submit-score';
}

function getRandomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

function getDistance(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

function pointToSegmentDistance(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function rotateToward(current, target, maxStep) {
  let diff = target - current;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  if (Math.abs(diff) <= maxStep) return target;
  return current + Math.sign(diff) * maxStep;
}

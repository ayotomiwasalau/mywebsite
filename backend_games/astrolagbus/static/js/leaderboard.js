const ASTROLAGBUS_SCORES_KEY = 'astrolagbus_local_scores';

function getSubmitScoreUrl() {
  return getGameSubmitUrl();
}

function storeLocalScore(name, score, level, duration) {
  try {
    const rows = JSON.parse(localStorage.getItem(ASTROLAGBUS_SCORES_KEY) || '[]');
    rows.push({
      name,
      score,
      level,
      duration,
      ts: Date.now(),
    });
    rows.sort((a, b) => b.score - a.score);
    localStorage.setItem(ASTROLAGBUS_SCORES_KEY, JSON.stringify(rows.slice(0, 50)));
  } catch (error) {
    console.warn('Failed to store local Astrolagbus score', error);
  }
}

async function submitAstrolagbusScore(playerName, score, level, gameDuration) {
  const payload = {
    player_name: playerName,
    score,
    level,
    game_duration: gameDuration,
  };

  storeLocalScore(playerName, score, level, gameDuration);

  try {
    const response = await fetch(getSubmitScoreUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return response.ok;
  } catch (error) {
    console.warn('Astrolagbus score submit failed', error);
    return false;
  }
}

function setSubmitStatus(message, isError = false) {
  const status = document.getElementById('scoreSubmitStatus');
  if (!status) return;
  status.hidden = !message;
  status.textContent = message;
  status.className = isError ? 'score-submit-status is-error' : 'score-submit-status is-success';
}

function canSubmitFinalRun() {
  const finalRun = window.astrolagbusLastFinal;
  return Boolean(finalRun?.ended && finalRun.score > 0);
}

function bindScoreSubmit() {
  const submitBtn = document.getElementById('submitScoreBtn');
  const nameInput = document.getElementById('playerName');
  if (!submitBtn) return;

  submitBtn.addEventListener('click', async () => {
    if (!canSubmitFinalRun()) return;

    const playerName = (nameInput?.value || '').trim() || 'Anonymous';
    const { score, level, duration } = window.astrolagbusLastFinal;

    submitBtn.disabled = true;
    setSubmitStatus('Submitting score...', false);

    const saved = await submitAstrolagbusScore(playerName, score, level, duration);

    if (saved) {
      setSubmitStatus('Score submitted to the leaderboard.', false);
      if (nameInput) nameInput.value = '';
    } else {
      setSubmitStatus('Saved locally. Leaderboard backend unreachable.', true);
      submitBtn.disabled = false;
    }
  });
}

function bindLeaderboardRefresh() {
  const refreshBtn = document.getElementById('refreshLeaderboardBtn');
  if (!refreshBtn) return;
  refreshBtn.addEventListener('click', () => {
    window.location.reload();
  });
}

window.addEventListener('load', () => {
  bindScoreSubmit();
  bindLeaderboardRefresh();
});

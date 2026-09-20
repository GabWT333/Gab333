const XP_IDLE_GRACE = 6 * 60 * 60 * 1000;
const XP_DECAY_INTERVAL = 60 * 60 * 1000;
const XP_DECAY_RATE = 0.01;
const XP_MAX_MULTIPLIER = 2;

export function ensureRpgXp(user) {
  if (!user || typeof user !== 'object') return null;

  user.rpgXp = Math.max(0, Number(user.rpgXp) || 0);
  user.rpgLastActivity = Number(user.rpgLastActivity) || Date.now();
  applyXpDecay(user);
  return user;
}

export function applyXpDecay(user, now = Date.now()) {
  if (!user || typeof user !== 'object') return 0;

  const lastActivity = Number(user.rpgLastActivity) || now;
  const idleTime = now - lastActivity;
  if (idleTime <= XP_IDLE_GRACE) return Math.max(0, Number(user.rpgXp) || 0);

  const decayHours = Math.floor((idleTime - XP_IDLE_GRACE) / XP_DECAY_INTERVAL) + 1;
  const currentXp = Math.max(0, Number(user.rpgXp) || 0);
  user.rpgXp = Math.max(0, Math.floor(currentXp * Math.pow(1 - XP_DECAY_RATE, decayHours)));
  user.rpgLastActivity = now;
  return user.rpgXp;
}

export function touchRpgActivity(user, now = Date.now()) {
  ensureRpgXp(user);
  user.rpgLastActivity = now;
  return user.rpgXp;
}

export function addRpgXp(user, amount) {
  ensureRpgXp(user);
  const change = Math.trunc(Number(amount) || 0);
  user.rpgXp = Math.max(0, user.rpgXp + change);
  user.rpgLastActivity = Date.now();
  return user.rpgXp;
}

export function getRpgWinMultiplier(user) {
  ensureRpgXp(user);
  return Math.min(XP_MAX_MULTIPLIER, 1 + user.rpgXp / 10000);
}

export function getRpgXpStatus(user) {
  ensureRpgXp(user);
  return {
    xp: user.rpgXp,
    multiplier: getRpgWinMultiplier(user),
    lastActivity: user.rpgLastActivity
  };
}

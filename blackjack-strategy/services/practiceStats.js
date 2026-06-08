import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@bj_practice_stats';

export function emptyPracticeStats() {
  return {
    handsPlayed: 0,
    wins: 0,
    losses: 0,
    pushes: 0,
    blackjacks: 0,
    netProfit: 0,
    startedAt: null,
    updatedAt: null,
  };
}

export async function loadPracticeStats() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyPracticeStats();
    return { ...emptyPracticeStats(), ...JSON.parse(raw) };
  } catch {
    return emptyPracticeStats();
  }
}

export async function savePracticeStats(stats) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

export function applyRoundResults(stats, roundResults = []) {
  const next = { ...stats };

  for (const result of roundResults) {
    next.handsPlayed += 1;
    if (result.outcome === 'blackjack') {
      next.blackjacks += 1;
    }
    if (result.payout > 0) {
      next.wins += 1;
    } else if (result.payout < 0) {
      next.losses += 1;
    } else {
      next.pushes += 1;
    }
    next.netProfit += result.payout ?? 0;
  }

  const now = Date.now();
  if (!next.startedAt) next.startedAt = now;
  next.updatedAt = now;
  return next;
}

export function getWinRate(stats) {
  if (!stats.handsPlayed) return 0;
  return Math.round((stats.wins / stats.handsPlayed) * 1000) / 10;
}

export function formatNetProfit(amount) {
  const n = Math.round(amount);
  if (n > 0) return `+$${n}`;
  if (n < 0) return `-$${Math.abs(n)}`;
  return '$0';
}

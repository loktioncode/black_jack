import { Actions } from './basicStrategy';

// Hi-Lo card counting values
const HI_LO_VALUES = {
  '2': 1, '3': 1, '4': 1, '5': 1, '6': 1,
  '7': 0, '8': 0, '9': 0,
  '10': -1, 'J': -1, 'Q': -1, 'K': -1, 'A': -1,
};

export class CardCounter {
  constructor(deckCount) {
    this.deckCount = deckCount;
    this.runningCount = 0;
    this.cardsSeen = [];
    this.totalCards = deckCount * 52;
  }

  addCards(cards) {
    for (const card of cards) {
      if (HI_LO_VALUES[card] !== undefined) {
        this.runningCount += HI_LO_VALUES[card];
        this.cardsSeen.push(card);
      }
    }
  }

  get cardsRemaining() {
    return Math.max(this.totalCards - this.cardsSeen.length, 0);
  }

  get decksRemaining() {
    return Math.max(this.cardsRemaining / 52, 0.5);
  }

  get trueCount() {
    return Math.round((this.runningCount / this.decksRemaining) * 10) / 10;
  }

  reset() {
    this.runningCount = 0;
    this.cardsSeen = [];
  }
}

function dealerValue(dealerCard) {
  if (['J', 'Q', 'K'].includes(dealerCard)) return 10;
  if (dealerCard === 'A') return 11;
  return parseInt(dealerCard, 10);
}

function isTenCard(card) {
  return ['10', 'J', 'Q', 'K'].includes(card);
}

// Illustrious 18 style deviations — adjust basic strategy when true count warrants it
function applyDeviations(playerHand, dealerCard, basicAction, trueCount) {
  const dv = dealerValue(dealerCard);
  const tc = trueCount;

  // 16 vs 10: stand at TC >= 0 (basic: hit)
  if (!playerHand.issoft && !playerHand.isPair && playerHand.value === 16 && dv === 10) {
    if (tc >= 0) {
      return { action: Actions.STAND, deviated: true, basicAction, reason: `Count ${tc >= 0 ? '+' : ''}${tc}: stand 16 vs 10` };
    }
  }

  // 15 vs 10: stand at TC >= +4
  if (!playerHand.issoft && playerHand.value === 15 && dv === 10 && tc >= 4) {
    return { action: Actions.STAND, deviated: true, basicAction, reason: `Count +${tc}: stand 15 vs 10` };
  }

  // 12 vs 2: stand at TC >= +3
  if (!playerHand.issoft && playerHand.value === 12 && dv === 2 && tc >= 3) {
    return { action: Actions.STAND, deviated: true, basicAction, reason: `Count +${tc}: stand 12 vs 2` };
  }

  // 12 vs 3: stand at TC >= +2
  if (!playerHand.issoft && playerHand.value === 12 && dv === 3 && tc >= 2) {
    return { action: Actions.STAND, deviated: true, basicAction, reason: `Count +${tc}: stand 12 vs 3` };
  }

  // 12 vs 4: hit at TC < 0 (basic: stand)
  if (!playerHand.issoft && playerHand.value === 12 && dv === 4 && tc < 0) {
    return { action: Actions.HIT, deviated: true, basicAction, reason: `Count ${tc}: hit 12 vs 4` };
  }

  // 13 vs 2: stand at TC >= -1
  if (!playerHand.issoft && playerHand.value === 13 && dv === 2 && tc >= -1) {
    return { action: Actions.STAND, deviated: true, basicAction, reason: `Count ${tc >= 0 ? '+' : ''}${tc}: stand 13 vs 2` };
  }

  // 13 vs 3: stand at TC >= -2
  if (!playerHand.issoft && playerHand.value === 13 && dv === 3 && tc >= -2) {
    return { action: Actions.STAND, deviated: true, basicAction, reason: `Count ${tc >= 0 ? '+' : ''}${tc}: stand 13 vs 3` };
  }

  // 10 vs 10: double at TC >= +4
  if (!playerHand.issoft && playerHand.value === 10 && dv === 10 && tc >= 4) {
    return { action: Actions.DOUBLE, deviated: true, basicAction, reason: `Count +${tc}: double 10 vs 10` };
  }

  // 10 vs Ace: double at TC >= +4
  if (!playerHand.issoft && playerHand.value === 10 && dv === 11 && tc >= 4) {
    return { action: Actions.DOUBLE, deviated: true, basicAction, reason: `Count +${tc}: double 10 vs Ace` };
  }

  // 9 vs 2: double at TC >= +1
  if (!playerHand.issoft && playerHand.value === 9 && dv === 2 && tc >= 1) {
    return { action: Actions.DOUBLE, deviated: true, basicAction, reason: `Count +${tc}: double 9 vs 2` };
  }

  // Pair of 10s vs 5: split at TC >= +5
  if (playerHand.isPair && isTenCard(playerHand.cards[0]) && dv === 5 && tc >= 5) {
    return { action: Actions.SPLIT, deviated: true, basicAction, reason: `Count +${tc}: split 10s vs 5` };
  }

  // Pair of 10s vs 6: split at TC >= +4
  if (playerHand.isPair && isTenCard(playerHand.cards[0]) && dv === 6 && tc >= 4) {
    return { action: Actions.SPLIT, deviated: true, basicAction, reason: `Count +${tc}: split 10s vs 6` };
  }

  return { action: basicAction, deviated: false, basicAction, reason: null };
}

export function getAdjustedRecommendation(strategy, playerHand, dealerCard, trueCount) {
  const basicAction = strategy.getBasicRecommendation(playerHand, dealerCard);

  if (trueCount === null || trueCount === undefined) {
    return { action: basicAction, deviated: false, basicAction, reason: null };
  }

  return applyDeviations(playerHand, dealerCard, basicAction, trueCount);
}

export function formatCountLabel(runningCount, trueCount) {
  const rc = runningCount >= 0 ? `+${runningCount}` : `${runningCount}`;
  const tc = trueCount >= 0 ? `+${trueCount}` : `${trueCount}`;
  return `RC ${rc} · TC ${tc}`;
}

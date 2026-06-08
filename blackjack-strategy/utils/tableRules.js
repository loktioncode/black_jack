import { Hand } from './basicStrategy';
import { cardsToRanks } from './cardUtils';

/** Standard 6-deck Vegas-style rules (H17, DAS, 3:2 BJ) */
export const DEFAULT_TABLE_RULES = {
  dealerHitsSoft17: true,
  blackjackPays: 1.5,
  /** 'any' | '9-11' | '10-11' */
  doubleOn: 'any',
  doubleAfterSplit: true,
  maxSplitHands: 4,
  resplitAces: false,
  splitAcesOneCardOnly: true,
  hitSplitAces: false,
  doubleSplitAces: false,
  peekOnAceAndTen: true,
};

export function getRuleSummary(rules = DEFAULT_TABLE_RULES) {
  const lines = [
    `Dealer ${rules.dealerHitsSoft17 ? 'hits' : 'stands on'} soft 17`,
    `Blackjack pays ${rules.blackjackPays === 1.5 ? '3:2' : '6:5'}`,
    `Double on ${rules.doubleOn === 'any' ? 'any two cards' : rules.doubleOn}`,
    rules.doubleAfterSplit ? 'Double after split allowed' : 'No double after split',
    rules.splitAcesOneCardOnly ? 'Split aces: one card each' : 'Split aces: play normally',
    `Up to ${rules.maxSplitHands} hands`,
    rules.peekOnAceAndTen ? 'Dealer peeks on Ace & 10' : 'No peek',
  ];
  return lines;
}

function getActiveHand(state) {
  return state.playerHands[state.activeHandIndex];
}

function handTotal(hand) {
  return new Hand(cardsToRanks(hand.cards)).value;
}

function isAcePair(hand) {
  return hand.cards.length >= 1 && hand.cards[0].rank === 'A';
}

export function canHitHand(state, rules = DEFAULT_TABLE_RULES) {
  const hand = getActiveHand(state);
  if (!hand || hand.stood || hand.busted || hand.doubled) return false;
  if (hand.splitAces && rules.splitAcesOneCardOnly && !rules.hitSplitAces) return false;
  return true;
}

export function canDoubleHand(state, rules = DEFAULT_TABLE_RULES) {
  const hand = getActiveHand(state);
  if (!hand || hand.cards.length !== 2 || hand.doubled) return false;
  if (state.bankroll < hand.bet) return false;

  if (hand.fromSplit && !rules.doubleAfterSplit) return false;
  if (hand.splitAces && !rules.doubleSplitAces) return false;

  const total = handTotal(hand);
  if (rules.doubleOn === '9-11') return total >= 9 && total <= 11;
  if (rules.doubleOn === '10-11') return total === 10 || total === 11;
  return true;
}

export function canSplitHand(state, rules = DEFAULT_TABLE_RULES) {
  const hand = getActiveHand(state);
  if (!hand || hand.cards.length !== 2 || !hand.isPair) return false;
  if (state.playerHands.length >= rules.maxSplitHands) return false;
  if (state.bankroll < hand.bet) return false;

  if (hand.fromSplit && isAcePair(hand) && !rules.resplitAces) return false;

  return true;
}

export function getDoubleBlockReason(state, rules = DEFAULT_TABLE_RULES) {
  const hand = getActiveHand(state);
  if (!hand || hand.cards.length !== 2) return 'Only on first two cards';
  if (hand.doubled) return 'Already doubled';
  if (state.bankroll < hand.bet) return 'Not enough chips';
  if (hand.fromSplit && !rules.doubleAfterSplit) return 'No double after split';
  if (hand.splitAces && !rules.doubleSplitAces) return 'No double on split aces';
  const total = handTotal(hand);
  if (rules.doubleOn === '9-11' && (total < 9 || total > 11)) return 'Double on 9–11 only';
  if (rules.doubleOn === '10-11' && total !== 10 && total !== 11) return 'Double on 10–11 only';
  return null;
}

export function getSplitBlockReason(state, rules = DEFAULT_TABLE_RULES) {
  const hand = getActiveHand(state);
  if (!hand || hand.cards.length !== 2) return 'Need two cards';
  if (!hand.isPair) return 'Must be a matching pair';
  if (state.playerHands.length >= rules.maxSplitHands) return `Max ${rules.maxSplitHands} hands`;
  if (state.bankroll < hand.bet) return 'Not enough chips';
  if (hand.fromSplit && isAcePair(hand) && !rules.resplitAces) return 'No re-split aces';
  return null;
}

export function getHitBlockReason(state, rules = DEFAULT_TABLE_RULES) {
  const hand = getActiveHand(state);
  if (!hand) return null;
  if (hand.splitAces && rules.splitAcesOneCardOnly && !rules.hitSplitAces) {
    return 'One card only on split aces';
  }
  return null;
}

export const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
export const SUITS = ['♠', '♥', '♦', '♣'];
export const CARDS = RANKS;

export function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function createShoe(deckCount) {
  const shoe = [];
  for (let d = 0; d < deckCount; d += 1) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        shoe.push({
          rank,
          suit,
          id: `${d}-${suit}-${rank}-${Math.random().toString(36).slice(2, 9)}`,
        });
      }
    }
  }
  return shuffle(shoe);
}

export function isRedSuit(suit) {
  return suit === '♥' || suit === '♦';
}

export function cardToRank(card) {
  return typeof card === 'string' ? card : card.rank;
}

export function cardsToRanks(cards) {
  return cards.map(cardToRank);
}

export function isTenValue(card) {
  return ['10', 'J', 'Q', 'K'].includes(card);
}

export function pairRank(card) {
  if (isTenValue(card)) return '10';
  return card;
}

export function pairValuesMatch(a, b) {
  return pairRank(a) === pairRank(b);
}

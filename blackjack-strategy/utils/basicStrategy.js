// Basic Strategy Logic for Blackjack (6-deck H17/S17, DAS)
import { isTenValue, pairRank, pairValuesMatch } from './cardUtils';

export const Actions = {
  HIT: 'H',
  STAND: 'ST',
  DOUBLE: 'D',
  SPLIT: 'SP',
};

export class Hand {
  constructor(cards) {
    this.cards = cards;
    this.value = this.calculateValue();
    this.issoft = this.calculateIsSoft();
    this.isPair = this.checkIsPair();
  }

  calculateValue() {
    let value = 0;
    let aces = 0;

    for (const card of this.cards) {
      if (isTenValue(card)) {
        value += 10;
      } else if (card === 'A') {
        aces += 1;
        value += 1;
      } else {
        value += parseInt(card, 10);
      }
    }

    if (aces > 0 && value + 10 <= 21) {
      value += 10;
    }

    return value;
  }

  calculateIsSoft() {
    let value = 0;
    let aces = 0;

    for (const card of this.cards) {
      if (isTenValue(card)) {
        value += 10;
      } else if (card === 'A') {
        aces += 1;
        value += 1;
      } else {
        value += parseInt(card, 10);
      }
    }

    return aces > 0 && value + 10 <= 21;
  }

  checkIsPair() {
    return this.cards.length === 2 && pairValuesMatch(this.cards[0], this.cards[1]);
  }

  get isBusted() {
    return this.value > 21;
  }
}

export class BasicStrategy {
  constructor(dealerHitsSoft17 = false) {
    this.dealerHitsSoft17 = dealerHitsSoft17;
  }

  getBasicRecommendation(playerHand, dealerCard, { ignorePair = false } = {}) {
    const dealerValue = this.getCardValue(dealerCard);
    let action;

    if (!ignorePair && playerHand.isPair) {
      action = this.getPairStrategy(pairRank(playerHand.cards[0]), dealerValue);
    } else if (playerHand.issoft) {
      action = this.getSoftStrategy(playerHand.value, dealerValue);
    } else {
      action = this.getHardStrategy(playerHand.value, dealerValue);
    }

    return this.applyTwoCardDoubleRule(action, playerHand.cards.length);
  }

  /** Double/split only on first two cards; if split blocked, re-evaluate as hard/soft hand. */
  resolvePlayAction(playerHand, dealerCard, action, { canDouble = true, canSplit = true } = {}) {
    let resolved = action;

    if (resolved === Actions.SPLIT && !canSplit) {
      resolved = this.getBasicRecommendation(playerHand, dealerCard, { ignorePair: true });
    }

    if (resolved === Actions.DOUBLE && !canDouble) {
      resolved = Actions.HIT;
    }

    return resolved;
  }

  applyTwoCardDoubleRule(action, cardCount) {
    if (cardCount > 2 && action === Actions.DOUBLE) {
      return Actions.HIT;
    }
    return action;
  }

  getRecommendation(playerHand, dealerCard) {
    return this.getBasicRecommendation(playerHand, dealerCard);
  }

  getCardValue(card) {
    if (isTenValue(card)) {
      return 10;
    }
    if (card === 'A') {
      return 11;
    }
    return parseInt(card, 10);
  }

  getPairStrategy(pairCard, dealerValue) {
    if (pairCard === 'A') {
      return Actions.SPLIT;
    }
    if (pairCard === '8') {
      return Actions.SPLIT;
    }
    if (pairCard === '9') {
      if ([7, 10, 11].includes(dealerValue)) {
        return Actions.STAND;
      }
      return Actions.SPLIT;
    }
    if (['2', '3'].includes(pairCard)) {
      return dealerValue <= 7 ? Actions.SPLIT : Actions.HIT;
    }
    if (pairCard === '7') {
      return dealerValue <= 7 ? Actions.SPLIT : Actions.HIT;
    }
    if (pairCard === '6') {
      return dealerValue <= 6 ? Actions.SPLIT : Actions.HIT;
    }
    if (pairCard === '5') {
      return dealerValue <= 9 ? Actions.DOUBLE : Actions.HIT;
    }
    if (pairCard === '4') {
      return [5, 6].includes(dealerValue) ? Actions.SPLIT : Actions.HIT;
    }
    return Actions.STAND;
  }

  getSoftStrategy(handValue, dealerValue) {
    const h17 = this.dealerHitsSoft17;

    if (handValue >= 20) {
      return Actions.STAND;
    }

    if (handValue === 19) {
      if (h17 && [3, 4, 5, 6].includes(dealerValue)) {
        return Actions.DOUBLE;
      }
      return Actions.STAND;
    }

    if (handValue === 18) {
      if ([3, 4, 5, 6].includes(dealerValue)) {
        return Actions.DOUBLE;
      }
      if (dealerValue === 2) {
        return h17 ? Actions.DOUBLE : Actions.STAND;
      }
      if ([7, 8].includes(dealerValue)) {
        return Actions.STAND;
      }
      return Actions.HIT;
    }

    if (handValue === 17) {
      if ([3, 4, 5, 6].includes(dealerValue)) {
        return Actions.DOUBLE;
      }
      return Actions.HIT;
    }

    if (handValue === 16 || handValue === 15) {
      if ([4, 5, 6].includes(dealerValue)) {
        return Actions.DOUBLE;
      }
      return Actions.HIT;
    }

    if ([5, 6].includes(dealerValue)) {
      return Actions.DOUBLE;
    }
    return Actions.HIT;
  }

  getHardStrategy(handValue, dealerValue) {
    if (handValue >= 17) {
      return Actions.STAND;
    }
    if (handValue === 16 || handValue === 15) {
      return dealerValue <= 6 ? Actions.STAND : Actions.HIT;
    }
    if (handValue >= 13) {
      return dealerValue <= 6 ? Actions.STAND : Actions.HIT;
    }
    if (handValue === 12) {
      return [4, 5, 6].includes(dealerValue) ? Actions.STAND : Actions.HIT;
    }
    if (handValue === 11) {
      if (dealerValue === 11 && !this.dealerHitsSoft17) {
        return Actions.HIT;
      }
      return Actions.DOUBLE;
    }
    if (handValue === 10) {
      return dealerValue <= 9 ? Actions.DOUBLE : Actions.HIT;
    }
    if (handValue === 9) {
      return [3, 4, 5, 6].includes(dealerValue) ? Actions.DOUBLE : Actions.HIT;
    }
    return Actions.HIT;
  }
}

export const getActionDescription = (action) => {
  switch (action) {
    case Actions.HIT:
      return 'Hit - Take another card';
    case Actions.STAND:
      return 'Stand - Keep current hand';
    case Actions.DOUBLE:
      return 'Double Down - Double bet, take one card';
    case Actions.SPLIT:
      return 'Split - Separate pair into two hands';
    default:
      return 'Unknown action';
  }
};

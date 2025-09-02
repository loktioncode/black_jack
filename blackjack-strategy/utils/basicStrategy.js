// Basic Strategy Logic for Blackjack
export const Actions = {
  HIT: 'H',
  STAND: 'ST', 
  DOUBLE: 'D',
  SPLIT: 'SP'
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

    for (let card of this.cards) {
      if (['J', 'Q', 'K'].includes(card)) {
        value += 10;
      } else if (card === 'A') {
        aces += 1;
        value += 1;
      } else {
        value += parseInt(card);
      }
    }

    // Try to make one ace count as 11 if it doesn't bust
    if (aces > 0 && value + 10 <= 21) {
      value += 10;
    }

    return value;
  }

  calculateIsSoft() {
    let value = 0;
    let aces = 0;

    for (let card of this.cards) {
      if (['J', 'Q', 'K'].includes(card)) {
        value += 10;
      } else if (card === 'A') {
        aces += 1;
        value += 1;
      } else {
        value += parseInt(card);
      }
    }

    return aces > 0 && value + 10 <= 21;
  }

  checkIsPair() {
    return this.cards.length === 2 && this.cards[0] === this.cards[1];
  }
}

export class BasicStrategy {
  constructor(dealerHitsSoft17 = true) {
    this.dealerHitsSoft17 = dealerHitsSoft17;
  }

  getRecommendation(playerHand, dealerCard) {
    const dealerValue = this.getCardValue(dealerCard);

    // Check for pairs first
    if (playerHand.isPair) {
      return this.getPairStrategy(playerHand.cards[0], dealerValue);
    }

    // Check for soft hands
    if (playerHand.issoft) {
      return this.getSoftStrategy(playerHand.value, dealerValue);
    }

    // Hard hands
    return this.getHardStrategy(playerHand.value, dealerValue);
  }

  getCardValue(card) {
    if (['J', 'Q', 'K'].includes(card)) {
      return 10;
    } else if (card === 'A') {
      return 11; // For dealer strategy, treat Ace as 11
    } else {
      return parseInt(card);
    }
  }

  getPairStrategy(pairCard, dealerValue) {
    if (pairCard === 'A') {
      return Actions.SPLIT;
    } else if (pairCard === '8') {
      return Actions.SPLIT;
    } else if (pairCard === '9') {
      if ([7, 10, 11].includes(dealerValue)) {
        return Actions.STAND;
      } else {
        return Actions.SPLIT;
      }
    } else if (['2', '3'].includes(pairCard)) {
      if (dealerValue <= 7) {
        return Actions.SPLIT;
      } else {
        return Actions.HIT;
      }
    } else if (pairCard === '7') {
      if (dealerValue <= 7) {
        return Actions.SPLIT;
      } else {
        return Actions.HIT;
      }
    } else if (pairCard === '6') {
      if (dealerValue <= 6) {
        return Actions.SPLIT;
      } else {
        return Actions.HIT;
      }
    } else if (pairCard === '5') {
      if (dealerValue <= 9) {
        return Actions.DOUBLE;
      } else {
        return Actions.HIT;
      }
    } else if (pairCard === '4') {
      if ([5, 6].includes(dealerValue)) {
        return Actions.SPLIT;
      } else {
        return Actions.HIT;
      }
    } else { // 10, J, Q, K
      return Actions.STAND;
    }
  }

  getSoftStrategy(handValue, dealerValue) {
    if (handValue === 19) {
      return Actions.STAND;
    } else if (handValue >= 20) {
      return Actions.STAND;
    } else if (handValue === 18) {
      if ([3, 4, 5, 6].includes(dealerValue)) {
        return Actions.DOUBLE;
      } else if ([2, 7, 8].includes(dealerValue)) {
        return Actions.STAND;
      } else {
        return Actions.HIT;
      }
    } else { // 17 or less
      if ([5, 6].includes(dealerValue)) {
        return Actions.DOUBLE;
      } else {
        return Actions.HIT;
      }
    }
  }

  getHardStrategy(handValue, dealerValue) {
    if (handValue >= 17) {
      return Actions.STAND;
    } else if (handValue === 16) {
      if (dealerValue <= 6) {
        return Actions.STAND;
      } else {
        return Actions.HIT;
      }
    } else if (handValue === 15) {
      if (dealerValue <= 6) {
        return Actions.STAND;
      } else {
        return Actions.HIT;
      }
    } else if (handValue >= 13) {
      if (dealerValue <= 6) {
        return Actions.STAND;
      } else {
        return Actions.HIT;
      }
    } else if (handValue === 12) {
      if ([4, 5, 6].includes(dealerValue)) {
        return Actions.STAND;
      } else {
        return Actions.HIT;
      }
    } else if (handValue === 11) {
      return Actions.DOUBLE;
    } else if (handValue === 10) {
      if (dealerValue <= 9) {
        return Actions.DOUBLE;
      } else {
        return Actions.HIT;
      }
    } else if (handValue === 9) {
      if ([3, 4, 5, 6].includes(dealerValue)) {
        return Actions.DOUBLE;
      } else {
        return Actions.HIT;
      }
    } else {
      return Actions.HIT;
    }
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

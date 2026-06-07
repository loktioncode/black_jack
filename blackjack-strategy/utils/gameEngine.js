import { Hand } from './basicStrategy';
import { createShoe, cardsToRanks } from './cardUtils';

export const PHASES = {
  SETUP: 'setup',
  DEALING: 'dealing',
  PLAYER: 'player',
  DEALER: 'dealer',
  RESULT: 'result',
};

function makeHand(cards = [], bet = 10) {
  return {
    cards,
    bet,
    stood: false,
    doubled: false,
    busted: false,
    blackjack: false,
  };
}

function evaluateHand(hand) {
  const ranks = cardsToRanks(hand.cards);
  const h = new Hand(ranks);
  return {
    ...hand,
    busted: h.isBusted,
    blackjack: ranks.length === 2 && h.value === 21 && !h.isBusted,
    value: h.value,
    isSoft: h.issoft,
    isPair: h.isPair,
  };
}

function isHandComplete(hand) {
  return hand.stood || hand.busted || (hand.doubled && hand.cards.length >= 3);
}

function advanceAfterHandAction(state, message) {
  for (let i = 0; i < state.playerHands.length; i += 1) {
    const h = state.playerHands[i];
    if (!isHandComplete(h)) {
      return {
        ...state,
        activeHandIndex: i,
        message: state.playerHands.length > 1 ? `Hand ${i + 1} — your turn` : message,
      };
    }
  }
  return runDealerTurn({ ...state, message: 'Dealer reveals…' });
}

function handOutcome(playerHand, dealerHand) {
  const p = evaluateHand({ ...playerHand, cards: [...playerHand.cards] });
  const d = evaluateHand({ ...dealerHand, cards: [...dealerHand.cards] });

  if (p.busted) return 'lose';
  if (d.busted) return 'win';
  if (p.blackjack && !d.blackjack) return 'blackjack';
  if (d.blackjack && !p.blackjack) return 'lose';
  if (p.value > d.value) return 'win';
  if (p.value < d.value) return 'lose';
  return 'push';
}

export function createInitialGameState(deckCount, bankroll = 1000, bet = 10) {
  return {
    phase: PHASES.SETUP,
    deckCount,
    shoe: createShoe(deckCount),
    dealerCards: [],
    dealerHoleHidden: true,
    playerHands: [makeHand([], bet)],
    activeHandIndex: 0,
    bankroll,
    bet,
    message: 'Place your bet and deal',
    roundResults: [],
    handsPlayed: 0,
  };
}

export function drawCard(state) {
  let shoe = state.shoe;
  if (shoe.length < 20) {
    shoe = createShoe(state.deckCount);
  }
  const card = shoe.pop();
  return { card, shoe };
}

export function startRound(state) {
  if (state.bankroll < state.bet) {
    return { ...state, message: 'Not enough chips!' };
  }

  let shoe = [...state.shoe];
  if (shoe.length < 20) shoe = createShoe(state.deckCount);

  const draw = () => {
    if (shoe.length < 20) shoe = createShoe(state.deckCount);
    return shoe.pop();
  };

  const playerCards = [draw(), draw()];
  const dealerCards = [draw(), draw()];
  const playerHand = evaluateHand(makeHand(playerCards, state.bet));

  let phase = PHASES.PLAYER;
  let message = 'Your turn';
  let bankroll = state.bankroll - state.bet;
  let dealerHoleHidden = true;
  let roundResults = [];

  const dealerFull = new Hand(cardsToRanks(dealerCards));

  if (dealerFull.value === 21) {
    phase = PHASES.RESULT;
    dealerHoleHidden = false;
    if (playerHand.blackjack) {
      message = 'Push — both blackjack';
      roundResults = [{ outcome: 'push', payout: 0, bet: state.bet }];
    } else {
      message = 'Dealer blackjack';
      roundResults = [{ outcome: 'lose', payout: -state.bet, bet: state.bet }];
    }
    bankroll += roundResults[0].payout;
  } else if (playerHand.blackjack) {
    phase = PHASES.RESULT;
    dealerHoleHidden = false;
    message = 'Blackjack!';
    roundResults = [{ outcome: 'blackjack', payout: Math.floor(state.bet * 1.5), bet: state.bet }];
    bankroll += roundResults[0].payout;
  }

  return {
    ...state,
    shoe,
    phase,
    dealerCards,
    dealerHoleHidden,
    playerHands: [playerHand],
    activeHandIndex: 0,
    bankroll,
    message,
    roundResults,
    handsPlayed: state.handsPlayed + 1,
  };
}

export function getActiveHand(state) {
  return state.playerHands[state.activeHandIndex];
}

export function canDouble(state) {
  const hand = getActiveHand(state);
  return hand.cards.length === 2 && !hand.doubled && state.bankroll >= hand.bet;
}

export function canSplit(state) {
  const hand = getActiveHand(state);
  return hand.isPair && hand.cards.length === 2 && state.playerHands.length < 4 && state.bankroll >= hand.bet;
}

export function playerHit(state) {
  const { card, shoe } = drawCard(state);
  const hands = state.playerHands.map((h, i) => {
    if (i !== state.activeHandIndex) return h;
    const updated = evaluateHand({ ...h, cards: [...h.cards, card] });
    return updated;
  });

  const active = hands[state.activeHandIndex];
  if (active.busted) {
    return advanceAfterHandAction({ ...state, shoe, playerHands: hands }, 'Bust!');
  }
  return { ...state, shoe, playerHands: hands, message: 'Hit or stand?' };
}

export function playerStand(state) {
  const hands = state.playerHands.map((h, i) =>
    i === state.activeHandIndex ? { ...h, stood: true } : h
  );
  return advanceAfterHandAction({ ...state, playerHands: hands }, 'Standing');
}

export function playerDouble(state) {
  if (!canDouble(state)) return state;
  const hand = getActiveHand(state);
  const { card, shoe } = drawCard(state);
  const updated = evaluateHand({
    ...hand,
    cards: [...hand.cards, card],
    bet: hand.bet * 2,
    doubled: true,
    stood: true,
  });

  const hands = [...state.playerHands];
  hands[state.activeHandIndex] = updated;
  const bankroll = state.bankroll - hand.bet;

  return advanceAfterHandAction(
    { ...state, shoe, playerHands: hands, bankroll },
    updated.busted ? 'Bust on double!' : 'Doubled down'
  );
}

export function playerSplit(state) {
  if (!canSplit(state)) return state;
  const hand = getActiveHand(state);
  const { card: c1, shoe: s1 } = drawCard(state);
  const { card: c2, shoe: s2 } = drawCard({ ...state, shoe: s1 });

  const hand1 = evaluateHand(makeHand([hand.cards[0], c1], hand.bet));
  const hand2 = evaluateHand(makeHand([hand.cards[1], c2], hand.bet));
  const hands = [...state.playerHands];
  hands.splice(state.activeHandIndex, 1, hand1, hand2);

  return {
    ...state,
    shoe: s2,
    playerHands: hands,
    activeHandIndex: state.activeHandIndex,
    bankroll: state.bankroll - hand.bet,
    message: 'Split — play first hand',
  };
}

export function runDealerTurn(state) {
  let dealerCards = [...state.dealerCards];
  let shoe = [...state.shoe];

  const draw = () => {
    if (shoe.length < 20) shoe = createShoe(state.deckCount);
    return shoe.pop();
  };

  let dealerHand = evaluateHand(makeHand(dealerCards));
  while (dealerHand.value < 17 || (dealerHand.isSoft && dealerHand.value === 17)) {
    dealerCards.push(draw());
    dealerHand = evaluateHand(makeHand(dealerCards));
  }

  const roundResults = state.playerHands.map((ph) => {
    const outcome = handOutcome(ph, dealerHand);
    let payout = 0;
    if (outcome === 'win') payout = ph.bet;
    else if (outcome === 'blackjack') payout = Math.floor(ph.bet * 1.5);
    else if (outcome === 'lose') payout = -ph.bet;
    return { outcome, payout, bet: ph.bet };
  });

  const bankroll = state.bankroll + roundResults.reduce((s, r) => s + r.payout, 0);
  const winCount = roundResults.filter((r) => r.payout > 0).length;
  const message =
    winCount === roundResults.length
      ? 'You win!'
      : winCount === 0
        ? 'Dealer wins'
        : 'Hand complete';

  return {
    ...state,
    shoe,
    dealerCards,
    dealerHoleHidden: false,
    phase: PHASES.RESULT,
    bankroll,
    roundResults,
    message,
  };
}

export function getDealerUpRank(state) {
  return state.dealerCards[0]?.rank ?? null;
}

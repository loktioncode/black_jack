import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AppHeader from '../components/AppHeader';
import DeckSelector from '../components/DeckSelector';
import PlayingCard from '../components/PlayingCard';
import { BasicStrategy, Hand, Actions, getActionDescription } from '../utils/basicStrategy';
import { CardCounter, getAdjustedRecommendation, formatCountLabel } from '../utils/cardCounting';
import { cardsToRanks } from '../utils/cardUtils';
import {
  PHASES,
  canDouble,
  canSplit,
  createInitialGameState,
  getActiveHand,
  getDealerUpRank,
  playerDouble,
  playerHit,
  playerSplit,
  playerStand,
  startRound,
} from '../utils/gameEngine';

export default function PlayScreen({ onOpenDrawer }) {
  const [deckSize, setDeckSize] = useState(null);
  const [game, setGame] = useState(null);
  const [cardCounter, setCardCounter] = useState(null);
  const [cardCountingEnabled, setCardCountingEnabled] = useState(false);
  const [showHints, setShowHints] = useState(true);
  const [dealKey, setDealKey] = useState(0);
  const pulse = useRef(new Animated.Value(1)).current;

  const strategy = useMemo(() => new BasicStrategy(true), []);

  useEffect(() => {
    if (deckSize) {
      setCardCounter(new CardCounter(deckSize));
      setGame(createInitialGameState(deckSize));
    }
  }, [deckSize]);

  const trackCards = useCallback(
    (cards) => {
      const ranks = cardsToRanks(cards);
      if (!ranks.length) return;
      setCardCounter((prev) => {
        const next = new CardCounter(deckSize);
        if (prev) {
          next.runningCount = prev.runningCount;
          next.cardsSeen = [...prev.cardsSeen];
        }
        next.addCards(ranks);
        return next;
      });
    },
    [deckSize]
  );

  const handleDeal = () => {
    setGame((prev) => {
      const next = startRound(prev);
      const allCards = [
        ...next.dealerCards,
        ...next.playerHands.flatMap((h) => h.cards),
      ];
      trackCards(allCards);
      setDealKey((k) => k + 1);
      return next;
    });
    Animated.sequence([
      Animated.timing(pulse, { toValue: 1.05, duration: 150, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
  };

  const handleNextHand = () => {
    setGame((prev) => {
      const next = startRound(prev);
      const allCards = [
        ...next.dealerCards,
        ...next.playerHands.flatMap((h) => h.cards),
      ];
      trackCards(allCards);
      setDealKey((k) => k + 1);
      return next;
    });
  };

  const handleAction = (action) => {
    setGame((prev) => {
      let next = prev;
      if (action === 'hit') next = playerHit(prev);
      if (action === 'stand') next = playerStand(prev);
      if (action === 'double') next = playerDouble(prev);
      if (action === 'split') next = playerSplit(prev);

      const prevActive = getActiveHand(prev);
      const nextActive = getActiveHand(next);
      if (nextActive && nextActive.cards.length > prevActive.cards.length) {
        trackCards([nextActive.cards[nextActive.cards.length - 1]]);
      }
      if (action === 'split') {
        const newCards = next.playerHands.flatMap((h) => h.cards).slice(2);
        trackCards(newCards);
      }
      if (next.phase === PHASES.RESULT && prev.phase !== PHASES.RESULT) {
        const newDealerCards = next.dealerCards.slice(prev.dealerCards.length);
        trackCards(newDealerCards);
      }
      return next;
    });
  };

  const hint = useMemo(() => {
    if (!game || game.phase !== PHASES.PLAYER || !showHints) return null;
    const hand = getActiveHand(game);
    const up = getDealerUpRank(game);
    if (!hand?.cards.length || !up) return null;
    const h = new Hand(cardsToRanks(hand.cards));
    const tc = cardCountingEnabled && cardCounter ? cardCounter.trueCount : null;
    return getAdjustedRecommendation(strategy, h, up, tc);
  }, [game, showHints, cardCountingEnabled, cardCounter, strategy]);

  if (!deckSize) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader onMenuPress={onOpenDrawer} subtitle="Play" />
        <DeckSelector title="Practice Table" onSelect={setDeckSize} />
      </SafeAreaView>
    );
  }

  if (!game) return null;

  const activeHand = getActiveHand(game);
  const canPlay = game.phase === PHASES.PLAYER;

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        onMenuPress={onOpenDrawer}
        subtitle={`${deckSize} decks · $${game.bankroll}`}
        rightContent={<Text style={styles.chipText}>${game.bet}</Text>}
      />

      <View style={styles.tableWrap}>
        <Animated.View style={[styles.table, { transform: [{ scale: pulse }] }]}>
          <View style={styles.tableRim} />
          <View style={styles.felt}>
            <Text style={styles.tableBrand}>BLACKJACK</Text>

            {/* Shoe */}
            <View style={styles.shoeArea}>
              <View style={styles.shoeStack}>
                {[0, 1, 2].map((i) => (
                  <View key={i} style={[styles.shoeCard, { top: i * 3, left: i * 2 }]} />
                ))}
              </View>
              <Text style={styles.shoeLabel}>{game.shoe.length} cards</Text>
            </View>

            {/* Dealer */}
            <View style={styles.dealerZone}>
              <View style={styles.dealerBadge}>
                <Text style={styles.dealerHandIcon}>🤚</Text>
                <Text style={styles.dealerLabel}>DEALER</Text>
              </View>
              <View style={styles.handRow}>
                {game.dealerCards.map((card, i) => (
                  <PlayingCard
                    key={`${dealKey}-d-${card.id}-${i}`}
                    card={card}
                    faceDown={game.dealerHoleHidden && i === 1}
                    delay={i === 0 ? 200 : i === 1 ? 500 : 200 + i * 250}
                  />
                ))}
              </View>
              {!game.dealerHoleHidden && game.dealerCards.length > 0 && (
                <Text style={styles.handValue}>
                  {new Hand(cardsToRanks(game.dealerCards)).value}
                </Text>
              )}
            </View>

            <View style={styles.divider} />

            {/* Player */}
            <View style={styles.playerZone}>
              {game.playerHands.map((hand, hi) => (
                <View
                  key={`hand-${hi}`}
                  style={[
                    styles.playerHandBlock,
                    hi === game.activeHandIndex && canPlay && styles.activeHand,
                  ]}
                >
                  {game.playerHands.length > 1 && (
                    <Text style={styles.handLabel}>Hand {hi + 1}</Text>
                  )}
                  <View style={styles.handRow}>
                    {hand.cards.map((card, ci) => (
                      <PlayingCard
                        key={`${dealKey}-p${hi}-${card.id}-${ci}`}
                        card={card}
                        delay={
                          ci === 0 ? 800 + hi * 200 : ci === 1 ? 1100 + hi * 200 : 300 + ci * 200
                        }
                      />
                    ))}
                  </View>
                  <Text style={styles.handValue}>
                    {hand.value ?? new Hand(cardsToRanks(hand.cards)).value}
                    {hand.busted ? ' BUST' : hand.blackjack ? ' BJ!' : ''}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>
      </View>

      <View style={styles.messageBar}>
        <Text style={styles.messageText}>{game.message}</Text>
        {game.phase === PHASES.RESULT && game.roundResults.length > 0 && (
          <Text style={styles.resultText}>
            {game.roundResults.map((r) => `${r.outcome}${r.payout ? ` ${r.payout > 0 ? '+' : ''}$${r.payout}` : ''}`).join(' · ')}
          </Text>
        )}
      </View>

      {hint && canPlay && (
        <View style={styles.hintBar}>
          <Text style={styles.hintLabel}>Hint: {hint.action}</Text>
          <Text style={styles.hintDesc}>{getActionDescription(hint.action)}</Text>
          {hint.deviated && (
            <Text style={styles.hintDev}>Count adjusted from {hint.basicAction}</Text>
          )}
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.controlsScroll}>
        <View style={styles.controls}>
          {canPlay ? (
            <>
              <TouchableOpacity style={[styles.btn, styles.hitBtn]} onPress={() => handleAction('hit')}>
                <Text style={styles.btnText}>Hit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.standBtn]} onPress={() => handleAction('stand')}>
                <Text style={styles.btnText}>Stand</Text>
              </TouchableOpacity>
              {canDouble(game) && (
                <TouchableOpacity style={[styles.btn, styles.doubleBtn]} onPress={() => handleAction('double')}>
                  <Text style={styles.btnText}>Double</Text>
                </TouchableOpacity>
              )}
              {canSplit(game) && (
                <TouchableOpacity style={[styles.btn, styles.splitBtn]} onPress={() => handleAction('split')}>
                  <Text style={styles.btnText}>Split</Text>
                </TouchableOpacity>
              )}
            </>
          ) : game.phase === PHASES.RESULT || game.phase === PHASES.SETUP ? (
            <TouchableOpacity
              style={[styles.btn, styles.dealBtn]}
              onPress={game.dealerCards.length > 0 && game.phase === PHASES.RESULT ? handleNextHand : handleDeal}
            >
              <Text style={styles.btnText}>
                {game.phase === PHASES.RESULT ? 'Next Hand' : 'Deal'}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>

      <View style={styles.settingsPanel}>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Strategy hints</Text>
          <Switch value={showHints} onValueChange={setShowHints} trackColor={{ false: '#3d3d5c', true: '#2a8f88' }} thumbColor={showHints ? '#4ECDC4' : '#888'} />
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Mix counting with basic strategy</Text>
          <Switch value={cardCountingEnabled} onValueChange={setCardCountingEnabled} trackColor={{ false: '#3d3d5c', true: '#2a8f88' }} thumbColor={cardCountingEnabled ? '#4ECDC4' : '#888'} />
        </View>
        {cardCounter && (
          <Text style={styles.countText}>
            {formatCountLabel(cardCounter.runningCount, cardCounter.trueCount)}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d18' },
  chipText: { color: '#f1c40f', fontWeight: '700', fontSize: 14 },
  tableWrap: { flex: 1, padding: 12 },
  table: { flex: 1 },
  tableRim: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    borderWidth: 8,
    borderColor: '#5c3a1e',
  },
  felt: {
    flex: 1,
    margin: 8,
    borderRadius: 14,
    backgroundColor: '#1a6b42',
    padding: 16,
    overflow: 'hidden',
  },
  tableBrand: {
    textAlign: 'center',
    color: 'rgba(255,215,0,0.25)',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 4,
    marginBottom: 8,
  },
  shoeArea: { position: 'absolute', top: 12, right: 12, alignItems: 'center' },
  shoeStack: { width: 40, height: 56, position: 'relative' },
  shoeCard: {
    position: 'absolute',
    width: 36,
    height: 50,
    backgroundColor: '#1a3a6e',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#c9a227',
  },
  shoeLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 4 },
  dealerZone: { alignItems: 'center', marginTop: 20, minHeight: 130 },
  dealerBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  dealerHandIcon: { fontSize: 28 },
  dealerLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '700', letterSpacing: 2 },
  divider: {
    height: 2,
    backgroundColor: 'rgba(255,215,0,0.2)',
    marginVertical: 16,
    marginHorizontal: 20,
  },
  playerZone: { flex: 1, justifyContent: 'flex-end', paddingBottom: 8 },
  playerHandBlock: { alignItems: 'center', marginBottom: 12, padding: 8, borderRadius: 10 },
  activeHand: { backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(78,205,196,0.4)' },
  handLabel: { color: '#4ECDC4', fontSize: 12, marginBottom: 4 },
  handRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', minHeight: 92 },
  handValue: { color: '#fff', fontSize: 14, fontWeight: '600', marginTop: 6 },
  messageBar: { paddingHorizontal: 16, paddingVertical: 8, alignItems: 'center' },
  messageText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  resultText: { color: '#4ECDC4', fontSize: 13, marginTop: 4 },
  hintBar: {
    marginHorizontal: 16,
    backgroundColor: '#16213e',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#9b59b6',
  },
  hintLabel: { color: '#fff', fontWeight: '700', fontSize: 15 },
  hintDesc: { color: '#aaa', fontSize: 12 },
  hintDev: { color: '#9b59b6', fontSize: 11, marginTop: 2 },
  controlsScroll: { maxHeight: 56, marginBottom: 4 },
  controls: { flexDirection: 'row', paddingHorizontal: 12, gap: 8 },
  btn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, minWidth: 80, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  hitBtn: { backgroundColor: '#e74c3c' },
  standBtn: { backgroundColor: '#4ECDC4' },
  doubleBtn: { backgroundColor: '#3498db' },
  splitBtn: { backgroundColor: '#27ae60' },
  dealBtn: { backgroundColor: '#f1c40f' },
  settingsPanel: {
    backgroundColor: '#12121f',
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: '#2a2a4a',
  },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  settingLabel: { color: '#bbb', fontSize: 13, flex: 1, marginRight: 8 },
  countText: { color: '#4ECDC4', fontSize: 13, textAlign: 'center', marginTop: 4 },
});

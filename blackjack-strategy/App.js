import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Modal,
  ScrollView,
  SafeAreaView,
  Alert,
  Switch,
} from 'react-native';
import { BasicStrategy, Hand, Actions, getActionDescription } from './utils/basicStrategy';
import { CardCounter, getAdjustedRecommendation, formatCountLabel } from './utils/cardCounting';

const CARDS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const HANDS_BEFORE_COUNTING_PROMPT = 10;
const BUST_AUTO_RESET_MS = 2500;

export default function App() {
  const [deckSize, setDeckSize] = useState(null);
  const [showDeckSelector, setShowDeckSelector] = useState(true);
  const [playerCards, setPlayerCards] = useState([]);
  const [dealerCard, setDealerCard] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [deviationInfo, setDeviationInfo] = useState(null);
  const [strategy, setStrategy] = useState(null);
  const [cardCounter, setCardCounter] = useState(null);
  const [handsPlayed, setHandsPlayed] = useState(0);
  const [cardCountingEnabled, setCardCountingEnabled] = useState(false);
  const [hasShownCountingPrompt, setHasShownCountingPrompt] = useState(false);
  const [isBusted, setIsBusted] = useState(false);
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const finishingHandRef = useRef(false);

  useEffect(() => {
    if (deckSize) {
      setStrategy(new BasicStrategy(true));
      setCardCounter(new CardCounter(deckSize));
    }
  }, [deckSize]);

  const clearCurrentHand = useCallback(() => {
    setPlayerCards([]);
    setDealerCard(null);
    setRecommendation(null);
    setDeviationInfo(null);
    setIsBusted(false);
    setShowRecommendationModal(false);
    finishingHandRef.current = false;
  }, []);

  const maybePromptCardCounting = useCallback((newHandsPlayed) => {
    setHasShownCountingPrompt((shown) => {
      if (newHandsPlayed >= HANDS_BEFORE_COUNTING_PROMPT && !shown) {
        Alert.alert(
          'Try count-adjusted strategy?',
          `You've played ${newHandsPlayed} hands. Turn on the switch below to blend Hi-Lo (RC/TC) with basic strategy — we never recommend counting-only plays.`,
          [
            { text: 'Got it', style: 'cancel' },
            { text: 'Turn On', onPress: () => setCardCountingEnabled(true) },
          ]
        );
        return true;
      }
      return shown;
    });
  }, [deckSize]);

  const finishHand = useCallback(() => {
    if (finishingHandRef.current) return;
    finishingHandRef.current = true;

    const cardsToTrack = [...playerCards];
    if (dealerCard) cardsToTrack.push(dealerCard);

    if (cardsToTrack.length > 0) {
      setCardCounter((prev) => {
        const next = prev ? new CardCounter(deckSize) : new CardCounter(deckSize);
        if (prev) {
          next.runningCount = prev.runningCount;
          next.cardsSeen = [...prev.cardsSeen];
        }
        next.addCards(cardsToTrack);
        return next;
      });
    }

    setHandsPlayed((prev) => {
      const next = prev + 1;
      maybePromptCardCounting(next);
      return next;
    });

    clearCurrentHand();
  }, [playerCards, dealerCard, deckSize, maybePromptCardCounting, clearCurrentHand]);

  useEffect(() => {
    if (playerCards.length > 0 && dealerCard && strategy) {
      const hand = new Hand(playerCards);

      if (hand.isBusted) {
        setIsBusted(true);
        setRecommendation(null);
        setDeviationInfo(null);
        setShowRecommendationModal(true);
        return;
      }

      setIsBusted(false);
      const trueCount = cardCountingEnabled && cardCounter ? cardCounter.trueCount : null;
      const result = getAdjustedRecommendation(strategy, hand, dealerCard, trueCount);
      setRecommendation(result.action);
      setDeviationInfo(result.deviated ? result : null);
      setShowRecommendationModal(true);
    } else if (!isBusted) {
      setRecommendation(null);
      setDeviationInfo(null);
      if (playerCards.length === 0) {
        setShowRecommendationModal(false);
      }
    }
  }, [playerCards, dealerCard, strategy, cardCountingEnabled, cardCounter, isBusted]);

  useEffect(() => {
    if (!isBusted) return;

    const timer = setTimeout(() => finishHand(), BUST_AUTO_RESET_MS);
    return () => clearTimeout(timer);
  }, [isBusted, finishHand]);

  const selectDeckSize = (size) => {
    setDeckSize(size);
    setShowDeckSelector(false);
    setHandsPlayed(0);
    setHasShownCountingPrompt(false);
  };

  const addPlayerCard = (card) => {
    if (playerCards.length < 5 && !isBusted) {
      setPlayerCards([...playerCards, card]);
    }
  };

  const removePlayerCard = (index) => {
    if (isBusted) return;
    const newCards = playerCards.filter((_, i) => i !== index);
    setPlayerCards(newCards);
    setIsBusted(false);
  };

  const selectDealerCard = (card) => {
    if (!isBusted) setDealerCard(card);
  };

  const resetHand = () => {
    if (playerCards.length >= 2 && dealerCard) {
      finishHand();
    } else {
      clearCurrentHand();
    }
  };

  const resetShoe = () => {
    if (deckSize) setCardCounter(new CardCounter(deckSize));
  };



  const getActionColor = (action) => {
    switch (action) {
      case Actions.HIT:
        return '#FF6B6B';
      case Actions.STAND:
        return '#4ECDC4';
      case Actions.DOUBLE:
        return '#45B7D1';
      case Actions.SPLIT:
        return '#96CEB4';
      default:
        return '#95A5A6';
    }
  };

  const renderCard = (card, onPress, isSelected = false, isDealer = false) => (
    <TouchableOpacity
      key={card}
      style={[
        styles.card,
        isSelected && styles.selectedCard,
        isDealer && styles.dealerCard
      ]}
      onPress={() => onPress(card)}
    >
      <Text style={[
        styles.cardText,
        isSelected && styles.selectedCardText,
        isDealer && styles.dealerCardText
      ]}>
        {card}
      </Text>
    </TouchableOpacity>
  );

  if (showDeckSelector) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.deckSelectorContainer}>
          <Text style={styles.title}>Blackjack Basic Strategy</Text>
          <Text style={styles.subtitle}>Select number of decks:</Text>
          
          <View style={styles.deckOptions}>
            {[1, 2, 4, 6, 8].map(size => (
              <TouchableOpacity
                key={size}
                style={styles.deckButton}
                onPress={() => selectDeckSize(size)}
              >
                <Text style={styles.deckButtonText}>{size} Deck{size > 1 ? 's' : ''}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={styles.note}>
            Most casinos use 6-8 decks. Single deck offers best odds for players.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Basic Strategy Helper</Text>
          <Text style={styles.subtitle}>{deckSize} Deck{deckSize > 1 ? 's' : ''} · Hand {handsPlayed + 1}</Text>
        </View>

        <View style={styles.countingToggleCard}>
          <View style={styles.countingToggleRow}>
            <View style={styles.countingToggleText}>
              <Text style={styles.countingToggleLabel}>
                Mix card counting with basic strategy
              </Text>
              <Text style={styles.countingToggleHint}>
                {cardCountingEnabled
                  ? 'Basic strategy + Hi-Lo adjustments when the count warrants it'
                  : 'Basic strategy only — count still tracked in the background'}
              </Text>
            </View>
            <Switch
              value={cardCountingEnabled}
              onValueChange={setCardCountingEnabled}
              trackColor={{ false: '#3d3d5c', true: '#2a8f88' }}
              thumbColor={cardCountingEnabled ? '#4ECDC4' : '#888'}
              ios_backgroundColor="#3d3d5c"
            />
          </View>

          {cardCounter && (
            <View style={[
              styles.countBadge,
              !cardCountingEnabled && styles.countBadgeMuted,
            ]}>
              <Text style={[
                styles.countBadgeText,
                !cardCountingEnabled && styles.countBadgeTextMuted,
              ]}>
                {formatCountLabel(cardCounter.runningCount, cardCounter.trueCount)}
              </Text>
              <Text style={styles.countSubtext}>
                {cardCountingEnabled
                  ? `${cardCounter.cardsRemaining} cards left · count affects recommendations`
                  : `${cardCounter.cardsRemaining} cards left · not affecting recommendations`}
              </Text>
            </View>
          )}

          {cardCountingEnabled && (
            <TouchableOpacity style={styles.resetShoeButton} onPress={resetShoe}>
              <Text style={styles.resetShoeButtonText}>New Shoe (Reset RC / TC)</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Player Cards Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Cards</Text>
          <View style={styles.selectedCards}>
            {playerCards.map((card, index) => (
              <TouchableOpacity
                key={index}
                style={styles.selectedCardChip}
                onPress={() => removePlayerCard(index)}
              >
                <Text style={styles.selectedCardChipText}>{card}</Text>
                <Text style={styles.removeText}>×</Text>
              </TouchableOpacity>
            ))}
            {playerCards.length === 0 && (
              <Text style={styles.placeholder}>Tap cards below to add</Text>
            )}
          </View>
          
          {/* Only show card selection grid when player has less than 2 cards */}
          {playerCards.length < 2 && (
            <View style={styles.cardGrid}>
              {CARDS.map(card => renderCard(
                card,
                addPlayerCard,
                false,
                false
              ))}
            </View>
          )}
        </View>

        {/* Dealer Card Section - Only show when player has at least 2 cards */}
        {playerCards.length >= 2 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dealer Shows</Text>
            <View style={styles.selectedCards}>
              {dealerCard ? (
                <TouchableOpacity
                  style={[styles.selectedCardChip, styles.dealerChip]}
                  onPress={() => setDealerCard(null)}
                >
                  <Text style={styles.selectedCardChipText}>{dealerCard}</Text>
                  <Text style={styles.removeText}>×</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.placeholder}>Select dealer's up card</Text>
              )}
            </View>
            
            <View style={styles.cardGrid}>
              {CARDS.map(card => renderCard(
                card,
                selectDealerCard,
                dealerCard === card,
                true
              ))}
            </View>
          </View>
        )}



        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetHand}
          >
            <Text style={styles.resetButtonText}>New Hand</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.changeDeckButton}
            onPress={() => setShowDeckSelector(true)}
          >
            <Text style={styles.changeDeckButtonText}>Change Decks</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Recommendation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showRecommendationModal}
        onRequestClose={() => setShowRecommendationModal(false)}
      >
        <View style={styles.bottomSheetOverlay}>
          <TouchableOpacity 
            style={styles.bottomSheetBackdrop}
            activeOpacity={1}
            onPress={() => setShowRecommendationModal(false)}
          />
          <View style={styles.bottomSheetContent}>
            {/* Handle bar */}
            <View style={styles.bottomSheetHandle} />
            
            <ScrollView style={styles.bottomSheetScroll}>
              <Text style={styles.bottomSheetTitle}>
                {isBusted ? 'Bust!' : 'Strategy Recommendation'}
              </Text>
              {!isBusted && (
                <Text style={styles.strategyModeLabel}>
                  {cardCountingEnabled
                    ? 'Basic strategy · count may adjust specific plays'
                    : 'Basic strategy only'}
                </Text>
              )}
              
              {isBusted && (
                <>
                  <View style={[styles.bottomSheetRecommendationCard, styles.bustCard]}>
                    <Text style={styles.bottomSheetActionText}>BUST</Text>
                    <Text style={styles.bottomSheetActionDescription}>
                      {playerCards.join(', ')} = {new Hand(playerCards).value} — over 21
                    </Text>
                  </View>
                  <Text style={styles.bustAutoResetText}>
                    Starting new hand automatically...
                  </Text>
                  <View style={styles.bottomSheetButtons}>
                    <TouchableOpacity
                      style={styles.newHandButton}
                      onPress={finishHand}
                    >
                      <Text style={styles.newHandButtonText}>New Hand Now</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {!isBusted && recommendation && (
                <>
                  <View style={[
                    styles.bottomSheetRecommendationCard,
                    { backgroundColor: getActionColor(recommendation) }
                  ]}>
                    <Text style={styles.bottomSheetActionText}>{recommendation}</Text>
                    <Text style={styles.bottomSheetActionDescription}>
                      {getActionDescription(recommendation)}
                    </Text>
                  </View>

                  {deviationInfo && (
                    <View style={styles.deviationBanner}>
                      <Text style={styles.deviationTitle}>Count-adjusted play</Text>
                      <Text style={styles.deviationText}>
                        Basic strategy: {deviationInfo.basicAction} → {deviationInfo.action}
                      </Text>
                      <Text style={styles.deviationReason}>{deviationInfo.reason}</Text>
                    </View>
                  )}
                  
                  {playerCards.length > 0 && (
                    <View style={styles.bottomSheetHandInfo}>
                      <Text style={styles.bottomSheetHandInfoText}>
                        Current Hand: {playerCards.join(', ')} = {new Hand(playerCards).value}
                        {new Hand(playerCards).issoft && ' (Soft)'}
                        {new Hand(playerCards).isPair && ' (Pair)'}
                      </Text>
                    </View>
                  )}

                  {/* Show card input for HIT recommendations */}
                  {recommendation === Actions.HIT && (
                    <View style={styles.addCardSection}>
                      <Text style={styles.addCardTitle}>Add Card After Hit</Text>
                      <Text style={styles.addCardSubtitle}>Select the card you drew:</Text>
                      
                      <View style={styles.bottomSheetCardGrid}>
                        {CARDS.map(card => (
                          <TouchableOpacity
                            key={card}
                            style={styles.bottomSheetCard}
                            onPress={() => addPlayerCard(card)}
                          >
                            <Text style={styles.bottomSheetCardText}>{card}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Show instructions for other actions */}
                  {recommendation === Actions.DOUBLE && (
                    <View style={styles.instructionSection}>
                      <Text style={styles.instructionTitle}>After Double Down:</Text>
                      <Text style={styles.instructionText}>
                        • Double your bet
                        • You'll receive exactly one more card
                        • Add that card above to see final hand value
                      </Text>
                      
                      <View style={styles.addCardSection}>
                        <Text style={styles.addCardSubtitle}>Add the one card you received:</Text>
                        <View style={styles.bottomSheetCardGrid}>
                          {CARDS.map(card => (
                            <TouchableOpacity
                              key={card}
                              style={styles.bottomSheetCard}
                              onPress={() => addPlayerCard(card)}
                            >
                              <Text style={styles.bottomSheetCardText}>{card}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    </View>
                  )}

                  {recommendation === Actions.SPLIT && (
                    <View style={styles.instructionSection}>
                      <Text style={styles.instructionTitle}>After Split:</Text>
                      <Text style={styles.instructionText}>
                        • Separate your pair into two hands
                        • Play each hand independently
                        • Use "New Hand" button to evaluate each hand separately
                      </Text>
                    </View>
                  )}
                </>
              )}
              
              <View style={styles.bottomSheetButtons}>
                <TouchableOpacity
                  style={styles.newHandButton}
                  onPress={resetHand}
                >
                  <Text style={styles.newHandButtonText}>New Hand</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  scrollContent: {
    padding: 20,
  },
  deckSelectorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#bbb',
    marginTop: 5,
    textAlign: 'center',
  },
  deckOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 30,
  },
  deckButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    margin: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  deckButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  note: {
    color: '#bbb',
    textAlign: 'center',
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 15,
  },
  selectedCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
    minHeight: 40,
    alignItems: 'center',
  },
  selectedCardChip: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dealerChip: {
    backgroundColor: '#FF6B6B',
  },
  selectedCardChipText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  removeText: {
    color: '#ffffff',
    marginLeft: 8,
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    color: '#888',
    fontStyle: 'italic',
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#16213e',
    width: 50,
    height: 70,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    borderWidth: 2,
    borderColor: '#0f3460',
  },
  selectedCard: {
    borderColor: '#4ECDC4',
    backgroundColor: '#4ECDC4',
  },
  dealerCard: {
    borderColor: '#FF6B6B',
  },
  cardText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedCardText: {
    color: '#ffffff',
  },
  dealerCardText: {
    color: '#FF6B6B',
  },
  recommendationSection: {
    alignItems: 'center',
  },
  recommendationCard: {
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    minWidth: 200,
    marginBottom: 10,
  },
  actionText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  actionDescription: {
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
  },
  handInfo: {
    marginTop: 10,
  },
  handInfoText: {
    color: '#bbb',
    fontSize: 16,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  resetButton: {
    backgroundColor: '#45B7D1',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  changeDeckButton: {
    backgroundColor: '#95A5A6',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  changeDeckButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal Styles
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheetBackdrop: {
    flex: 1,
  },
  bottomSheetContent: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '50%',
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#666',
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 2,
  },
  bottomSheetScroll: {
    paddingHorizontal: 20,
  },
  bottomSheetTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  strategyModeLabel: {
    color: '#888',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  bottomSheetRecommendationCard: {
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  bottomSheetActionText: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bottomSheetActionDescription: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
  },
  bottomSheetHandInfo: {
    backgroundColor: '#16213e',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  bottomSheetHandInfoText: {
    color: '#bbb',
    fontSize: 16,
    textAlign: 'center',
  },
  addCardSection: {
    marginBottom: 20,
  },
  addCardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  addCardSubtitle: {
    fontSize: 16,
    color: '#bbb',
    marginBottom: 15,
  },
  bottomSheetCardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  bottomSheetCard: {
    backgroundColor: '#16213e',
    width: 45,
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    borderWidth: 2,
    borderColor: '#0f3460',
  },
  bottomSheetCardText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  instructionSection: {
    backgroundColor: '#16213e',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4ECDC4',
    marginBottom: 10,
  },
  instructionText: {
    color: '#bbb',
    fontSize: 14,
    lineHeight: 20,
  },
  bottomSheetButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  newHandButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 10,
  },
  newHandButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  countingToggleCard: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  countingToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  countingToggleText: {
    flex: 1,
  },
  countingToggleLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  countingToggleHint: {
    color: '#888',
    fontSize: 13,
    lineHeight: 18,
  },
  countBadge: {
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 14,
    alignItems: 'center',
  },
  countBadgeMuted: {
    opacity: 0.65,
  },
  countBadgeText: {
    color: '#4ECDC4',
    fontSize: 18,
    fontWeight: '700',
  },
  countBadgeTextMuted: {
    color: '#7a9e9c',
  },
  countSubtext: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  resetShoeButton: {
    backgroundColor: '#1a1a2e',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  resetShoeButtonText: {
    color: '#bbb',
    fontSize: 14,
    fontWeight: '600',
  },
  bustCard: {
    backgroundColor: '#c0392b',
  },
  bustAutoResetText: {
    color: '#bbb',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  deviationBanner: {
    backgroundColor: '#2d1f4e',
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#9b59b6',
  },
  deviationTitle: {
    color: '#9b59b6',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  deviationText: {
    color: '#ddd',
    fontSize: 14,
    marginBottom: 4,
  },
  deviationReason: {
    color: '#aaa',
    fontSize: 13,
    fontStyle: 'italic',
  },
});

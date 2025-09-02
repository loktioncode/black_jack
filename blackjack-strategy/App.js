import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Modal,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { BasicStrategy, Hand, Actions, getActionDescription } from './utils/basicStrategy';

const CARDS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export default function App() {
  const [deckSize, setDeckSize] = useState(null);
  const [showDeckSelector, setShowDeckSelector] = useState(true);
  const [playerCards, setPlayerCards] = useState([]);
  const [dealerCard, setDealerCard] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [strategy, setStrategy] = useState(null);
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);


  useEffect(() => {
    if (deckSize) {
      setStrategy(new BasicStrategy(true));
    }
  }, [deckSize]);



  useEffect(() => {
    if (playerCards.length > 0 && dealerCard && strategy) {
      const hand = new Hand(playerCards);
      const rec = strategy.getRecommendation(hand, dealerCard);
      setRecommendation(rec);
      setShowRecommendationModal(true);
    } else {
      setRecommendation(null);
      setShowRecommendationModal(false);
    }
  }, [playerCards, dealerCard, strategy]);

  const selectDeckSize = (size) => {
    setDeckSize(size);
    setShowDeckSelector(false);
  };

  const addPlayerCard = (card) => {
    if (playerCards.length < 5) {
      setPlayerCards([...playerCards, card]);
    }
  };

  const removePlayerCard = (index) => {
    const newCards = playerCards.filter((_, i) => i !== index);
    setPlayerCards(newCards);
  };

  const selectDealerCard = (card) => {
    setDealerCard(card);
  };

  const resetHand = () => {
    setPlayerCards([]);
    setDealerCard(null);
    setRecommendation(null);
    setShowRecommendationModal(false);
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
          <Text style={styles.subtitle}>{deckSize} Deck{deckSize > 1 ? 's' : ''}</Text>
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
              <Text style={styles.bottomSheetTitle}>Strategy Recommendation</Text>
              
              {recommendation && (
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
    marginBottom: 20,
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
});

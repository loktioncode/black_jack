import React, { useEffect, useRef } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatCountLabel } from '../utils/cardCounting';
import DealerSoft17Switch from './DealerSoft17Switch';

export default function SettingsDrawer({
  visible,
  onClose,
  variant = 'practice',
  showHints,
  onShowHintsChange,
  cardCountingEnabled,
  onCardCountingChange,
  cardCounter,
  tableRules,
  dealerHitsSoft17,
  onDealerHitsSoft17Change,
  onResetShoe,
  onChangeDecks,
  deckSize,
}) {
  const slide = useRef(new Animated.Value(300)).current;
  const isStrategy = variant === 'strategy';

  useEffect(() => {
    Animated.timing(slide, {
      toValue: visible ? 0 : 300,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [visible, slide]);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <Animated.View style={[styles.drawer, { transform: [{ translateX: slide }] }]}>
        <View style={styles.headerRow}>
          <Text style={styles.drawerTitle}>Settings</Text>
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={24} color="#888" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {onDealerHitsSoft17Change && (
            <View style={styles.ruleSwitchWrap}>
              <DealerSoft17Switch
                value={dealerHitsSoft17 ?? true}
                onValueChange={onDealerHitsSoft17Change}
              />
            </View>
          )}

          {onShowHintsChange != null && (
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Show hints on table</Text>
              <Switch
                value={showHints}
                onValueChange={onShowHintsChange}
                trackColor={{ false: '#3d3d5c', true: '#2a8f88' }}
                thumbColor={showHints ? '#4ECDC4' : '#888'}
              />
            </View>
          )}

          <View style={styles.settingRow}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingLabel}>Mix counting with basic strategy</Text>
              {isStrategy && (
                <Text style={styles.settingHint}>
                  Hi-Lo RC/TC adjusts specific plays when the count warrants it
                </Text>
              )}
            </View>
            <Switch
              value={cardCountingEnabled}
              onValueChange={onCardCountingChange}
              trackColor={{ false: '#3d3d5c', true: '#2a8f88' }}
              thumbColor={cardCountingEnabled ? '#4ECDC4' : '#888'}
            />
          </View>

          {cardCounter && (
            <View style={styles.countBox}>
              <Text style={styles.countText}>
                {formatCountLabel(cardCounter.runningCount, cardCounter.trueCount)}
              </Text>
              <Text style={styles.countSub}>
                {cardCountingEnabled
                  ? `${cardCounter.cardsRemaining} cards left · count affects recommendations`
                  : `${cardCounter.cardsRemaining} cards left · tracked only`}
              </Text>
            </View>
          )}

          {isStrategy && cardCountingEnabled && onResetShoe && deckSize && (
            <TouchableOpacity style={styles.actionButton} onPress={onResetShoe}>
              <Text style={styles.actionButtonText}>New Shoe (Reset RC / TC)</Text>
            </TouchableOpacity>
          )}

          {isStrategy && onChangeDecks && (
            <TouchableOpacity style={styles.secondaryButton} onPress={onChangeDecks}>
              <Text style={styles.secondaryButtonText}>
                Change decks{deckSize ? ` (currently ${deckSize})` : ''}
              </Text>
            </TouchableOpacity>
          )}

          {tableRules && (
            <View style={styles.rulesBox}>
              <Text style={styles.rulesTitle}>Chart rules</Text>
              {tableRules.map((line) => (
                <Text key={line} style={styles.rulesLine}>· {line}</Text>
              ))}
            </View>
          )}

          <Text style={styles.note}>
            {isStrategy
              ? 'Pick your cards on the main screen. Open Settings anytime to change H17/S17 or counting.'
              : 'When hints are on, recommendations appear above the action buttons during your turn.'}
          </Text>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  drawer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 300,
    backgroundColor: '#12121f',
    paddingTop: 56,
    paddingHorizontal: 20,
    borderLeftWidth: 1,
    borderLeftColor: '#2a2a4a',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  drawerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  ruleSwitchWrap: {
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  settingTextCol: {
    flex: 1,
  },
  settingLabel: {
    color: '#bbb',
    fontSize: 14,
  },
  settingHint: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  countBox: {
    backgroundColor: '#16213e',
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    alignItems: 'center',
  },
  countText: {
    color: '#4ECDC4',
    fontSize: 17,
    fontWeight: '700',
  },
  countSub: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#0f3460',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionButtonText: {
    color: '#4ECDC4',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#16213e',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  secondaryButtonText: {
    color: '#bbb',
    fontSize: 14,
    fontWeight: '600',
  },
  rulesBox: {
    backgroundColor: '#16213e',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  rulesTitle: {
    color: '#888',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  rulesLine: {
    color: '#aaa',
    fontSize: 12,
    lineHeight: 18,
  },
  note: {
    color: '#666',
    fontSize: 13,
    lineHeight: 19,
    fontStyle: 'italic',
    marginBottom: 30,
  },
});

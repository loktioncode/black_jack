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
import { formatCountLabel } from '../utils/cardCounting';

export default function HintDrawer({
  visible,
  onClose,
  showHints,
  onShowHintsChange,
  cardCountingEnabled,
  onCardCountingChange,
  cardCounter,
  tableRules,
}) {
  const slide = useRef(new Animated.Value(300)).current;

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
        <Text style={styles.drawerTitle}>Settings</Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Show hints on table</Text>
            <Switch
              value={showHints}
              onValueChange={onShowHintsChange}
              trackColor={{ false: '#3d3d5c', true: '#2a8f88' }}
              thumbColor={showHints ? '#4ECDC4' : '#888'}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Mix counting with basic strategy</Text>
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
                {cardCountingEnabled ? 'Count affects hints' : 'Count tracked only'}
              </Text>
            </View>
          )}

          {tableRules && (
            <View style={styles.rulesBox}>
              <Text style={styles.rulesTitle}>Table rules</Text>
              {tableRules.map((line) => (
                <Text key={line} style={styles.rulesLine}>· {line}</Text>
              ))}
            </View>
          )}

          <Text style={styles.note}>
            When hints are on, recommendations appear above the action buttons during your turn.
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
    width: 280,
    backgroundColor: '#12121f',
    paddingTop: 56,
    paddingHorizontal: 20,
    borderLeftWidth: 1,
    borderLeftColor: '#2a2a4a',
  },
  drawerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  settingLabel: {
    color: '#bbb',
    fontSize: 14,
    flex: 1,
  },
  countBox: {
    backgroundColor: '#16213e',
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
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
  },
});

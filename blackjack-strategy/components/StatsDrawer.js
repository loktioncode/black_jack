import React, { useEffect, useRef } from 'react';
import {
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatNetProfit, getWinRate } from '../services/practiceStats';

function StatCard({ label, value, color = '#fff', sub }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
    </View>
  );
}

export default function StatsDrawer({ visible, onClose, stats, onReset, bankroll, startingBankroll }) {
  const slide = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    Animated.timing(slide, {
      toValue: visible ? 0 : 300,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [visible, slide]);

  if (!visible || !stats) return null;

  const winRate = getWinRate(stats);
  const sessionDelta = bankroll != null && startingBankroll != null
    ? bankroll - startingBankroll
    : null;

  const handleReset = () => {
    Alert.alert(
      'Reset practice stats?',
      'This clears all saved wins, losses, and profit history.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: onReset },
      ]
    );
  };

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <Animated.View style={[styles.drawer, { transform: [{ translateX: slide }] }]}>
        <View style={styles.headerRow}>
          <Text style={styles.drawerTitle}>Practice Stats</Text>
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={24} color="#888" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.heroBox}>
            <Text style={styles.heroLabel}>All-time record</Text>
            <Text style={styles.heroRecord}>
              {stats.wins}W · {stats.losses}L · {stats.pushes}P
            </Text>
            <Text style={[
              styles.heroProfit,
              stats.netProfit > 0 && styles.positive,
              stats.netProfit < 0 && styles.negative,
            ]}>
              {formatNetProfit(stats.netProfit)}
            </Text>
            <Text style={styles.heroSub}>
              {stats.handsPlayed} hand{stats.handsPlayed === 1 ? '' : 's'} played
              {stats.handsPlayed > 0 ? ` · ${winRate}% win rate` : ''}
            </Text>
          </View>

          <View style={styles.grid}>
            <StatCard label="Wins" value={stats.wins} color="#2ecc71" />
            <StatCard label="Losses" value={stats.losses} color="#e74c3c" />
            <StatCard label="Pushes" value={stats.pushes} color="#95a5a6" />
            <StatCard label="Blackjacks" value={stats.blackjacks} color="#f1c40f" />
          </View>

          {sessionDelta != null && (
            <View style={styles.sessionBox}>
              <Text style={styles.sessionTitle}>This session</Text>
              <Text style={styles.sessionLine}>Bankroll: ${bankroll}</Text>
              <Text style={[
                styles.sessionDelta,
                sessionDelta > 0 && styles.positive,
                sessionDelta < 0 && styles.negative,
              ]}>
                {formatNetProfit(sessionDelta)} vs start (${startingBankroll})
              </Text>
            </View>
          )}

          <Text style={styles.note}>
            Stats persist across sessions. Follow the hints and track whether your win rate and
            profit improve over time.
          </Text>

          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>Reset all stats</Text>
          </TouchableOpacity>
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
  heroBox: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  heroLabel: {
    color: '#888',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  heroRecord: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  heroProfit: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6,
  },
  heroSub: {
    color: '#888',
    fontSize: 13,
    textAlign: 'center',
  },
  positive: { color: '#2ecc71' },
  negative: { color: '#e74c3c' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  statLabel: {
    color: '#888',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  statSub: {
    color: '#666',
    fontSize: 11,
    marginTop: 2,
  },
  sessionBox: {
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  sessionTitle: {
    color: '#4ECDC4',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  sessionLine: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 4,
  },
  sessionDelta: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  note: {
    color: '#666',
    fontSize: 13,
    lineHeight: 19,
    fontStyle: 'italic',
    marginBottom: 20,
  },
  resetButton: {
    borderWidth: 1,
    borderColor: '#e74c3c55',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  resetButtonText: {
    color: '#e74c3c',
    fontSize: 14,
    fontWeight: '600',
  },
});

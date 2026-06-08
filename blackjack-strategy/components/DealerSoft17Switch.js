import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

export default function DealerSoft17Switch({ value, onValueChange, compact = false }) {
  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <View style={styles.row}>
        <View style={styles.textWrap}>
          <Text style={styles.label}>
            {value ? 'H17 — dealer hits soft 17' : 'S17 — dealer stands on soft 17'}
          </Text>
          {!compact && (
            <Text style={styles.hint}>
              Match your casino table. Affects soft doubles and 11 vs Ace.
            </Text>
          )}
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#3d3d5c', true: '#2a8f88' }}
          thumbColor={value ? '#4ECDC4' : '#888'}
          ios_backgroundColor="#3d3d5c"
        />
      </View>
      <Text style={styles.modeBadge}>{value ? 'H17' : 'S17'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  cardCompact: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  textWrap: {
    flex: 1,
  },
  label: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  hint: {
    color: '#888',
    fontSize: 13,
    lineHeight: 18,
  },
  modeBadge: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#1a1a2e',
    color: '#4ECDC4',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
});

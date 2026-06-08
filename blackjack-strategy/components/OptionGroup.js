import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function OptionGroup({ label, hint, options, value, onChange, accent = '#4ECDC4' }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      <View style={styles.row}>
        {options.map((opt) => {
          const active = value === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              style={[
                styles.chip,
                active && { borderColor: accent, backgroundColor: `${accent}22` },
              ]}
              onPress={() => onChange(opt.id)}
            >
              <Text style={[styles.chipText, active && { color: accent }]}>{opt.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 18 },
  label: {
    color: '#888',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  hint: {
    color: '#666',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 8,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#243552',
    backgroundColor: '#16213e',
  },
  chipText: {
    color: '#bbb',
    fontSize: 13,
    fontWeight: '600',
  },
});

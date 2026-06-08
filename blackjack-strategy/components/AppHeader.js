import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AppHeader({ onMenuPress, subtitle, rightContent, onHelpPress }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.menuButton} onPress={onMenuPress} hitSlop={12}>
        <View style={styles.bar} />
        <View style={[styles.bar, styles.barMid]} />
        <View style={styles.bar} />
      </TouchableOpacity>

      <View style={styles.center}>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      <View style={styles.right}>
        {rightContent}
        {onHelpPress ? (
          <TouchableOpacity style={styles.helpButton} onPress={onHelpPress} hitSlop={10}>
            <Ionicons name="help-circle-outline" size={28} color="#4ECDC4" />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#0f3460',
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    padding: 8,
  },
  bar: {
    height: 2.5,
    backgroundColor: '#fff',
    borderRadius: 2,
    width: 22,
  },
  barMid: {
    marginVertical: 5,
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  subtitle: {
    color: '#bbb',
    fontSize: 14,
    fontWeight: '500',
  },
  right: {
    minWidth: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  helpButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

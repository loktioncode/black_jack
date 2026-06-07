import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SideDrawer({ visible, activeScreen, onNavigate, onClose }) {
  const slide = useRef(new Animated.Value(-280)).current;

  useEffect(() => {
    Animated.timing(slide, {
      toValue: visible ? 0 : -280,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [visible, slide]);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <Animated.View style={[styles.drawer, { transform: [{ translateX: slide }] }]}>
        <Text style={styles.drawerTitle}>Menu</Text>

        <TouchableOpacity
          style={[styles.menuItem, activeScreen === 'strategy' && styles.menuItemActive]}
          onPress={() => onNavigate('strategy')}
        >
          <Text style={styles.menuIcon}>📋</Text>
          <View>
            <Text style={styles.menuLabel}>Strategy</Text>
            <Text style={styles.menuHint}>Hand lookup & recommendations</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, activeScreen === 'play' && styles.menuItemActive]}
          onPress={() => onNavigate('play')}
        >
          <Text style={styles.menuIcon}>🎰</Text>
          <View>
            <Text style={styles.menuLabel}>Play</Text>
            <Text style={styles.menuHint}>Practice vs the dealer</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: '#12121f',
    paddingTop: 56,
    paddingHorizontal: 20,
    borderRightWidth: 1,
    borderRightColor: '#2a2a4a',
  },
  drawerTitle: {
    color: '#666',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 14,
  },
  menuItemActive: {
    backgroundColor: '#1e2a4a',
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  menuIcon: {
    fontSize: 28,
  },
  menuLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  menuHint: {
    color: '#888',
    fontSize: 13,
    marginTop: 2,
  },
});

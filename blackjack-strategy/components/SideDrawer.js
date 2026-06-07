import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MENU_ITEMS = [
  {
    id: 'strategy',
    label: 'Strategy',
    icon: 'grid-outline',
  },
  {
    id: 'play',
    label: 'Play',
    icon: 'game-controller-outline',
  },
];

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

        {MENU_ITEMS.map((item) => {
          const active = activeScreen === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuItem, active && styles.menuItemActive]}
              onPress={() => onNavigate(item.id)}
            >
              <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
                <Ionicons
                  name={item.icon}
                  size={22}
                  color={active ? '#4ECDC4' : '#888'}
                />
              </View>
              <Text style={[styles.menuLabel, active && styles.menuLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
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
    width: 240,
    backgroundColor: '#12121f',
    paddingTop: 56,
    paddingHorizontal: 16,
    borderRightWidth: 1,
    borderRightColor: '#2a2a4a',
  },
  drawerTitle: {
    color: '#666',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 6,
    gap: 14,
  },
  menuItemActive: {
    backgroundColor: '#1e2a4a',
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapActive: {
    backgroundColor: '#16213e',
  },
  menuLabel: {
    color: '#ccc',
    fontSize: 17,
    fontWeight: '600',
  },
  menuLabelActive: {
    color: '#fff',
  },
});

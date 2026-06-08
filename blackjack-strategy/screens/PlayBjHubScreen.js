import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AppHeader from '../components/AppHeader';

const MODES = [
  {
    id: 'strategy',
    title: 'Strategy',
    description: 'Look up the right play for any hand',
    Icon: Ionicons,
    icon: 'grid-outline',
    accent: '#4ECDC4',
  },
  {
    id: 'table',
    title: 'Play',
    description: 'Practice blackjack at the table',
    Icon: MaterialCommunityIcons,
    icon: 'cards-playing-outline',
    accent: '#9b59b6',
  },
];

function HubCard({ mode, onPress }) {
  const Icon = mode.Icon;
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>
      <View style={[styles.iconWrap, { backgroundColor: `${mode.accent}22` }]}>
        <Icon name={mode.icon} size={32} color={mode.accent} />
      </View>
      <Text style={styles.cardTitle}>{mode.title}</Text>
      <Text style={styles.cardDesc}>{mode.description}</Text>
    </TouchableOpacity>
  );
}

export default function PlayBjHubScreen({ onOpenDrawer, onSelectMode }) {
  return (
    <SafeAreaView style={styles.container}>
      <AppHeader onMenuPress={onOpenDrawer} subtitle="Play BJ" />
      <View style={styles.content}>
        <Text style={styles.heading}>Choose a mode</Text>
        <View style={styles.grid}>
          {MODES.map((mode) => (
            <HubCard key={mode.id} mode={mode} onPress={() => onSelectMode(mode.id)} />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  content: { flex: 1, padding: 20, justifyContent: 'center' },
  heading: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  grid: { gap: 14 },
  card: {
    backgroundColor: '#16213e',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#243552',
    padding: 24,
    alignItems: 'center',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardDesc: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

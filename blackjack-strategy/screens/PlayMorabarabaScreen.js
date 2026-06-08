import React, { useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AppHeader from '../components/AppHeader';
import OptionGroup from '../components/OptionGroup';

const MORABARABA_URL = 'https://morabaraba.co.za/';

const OPPONENTS = [
  { id: 'computer', label: 'Computer' },
  { id: 'passAndPlay', label: 'Pass & play' },
  { id: 'online', label: 'Online' },
];

const DIFFICULTIES = [
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' },
  { id: 'expert', label: 'Expert' },
];

const RULE_SETS = [
  { id: 'southAfrica', label: 'South African' },
  { id: 'lesotho', label: 'Lesotho' },
];

const PHASES = [
  {
    step: '01',
    title: 'Place',
    desc: 'Take turns placing 12 pieces. Form lines of three to capture opponent pieces.',
  },
  {
    step: '02',
    title: 'Move',
    desc: 'Slide pieces along connected lines as the board fills up.',
  },
  {
    step: '03',
    title: 'Fly',
    desc: 'Down to 3 pieces? Move anywhere for one last chance to win.',
  },
];

export default function PlayMorabarabaScreen({ onOpenDrawer }) {
  const [opponent, setOpponent] = useState('computer');
  const [difficulty, setDifficulty] = useState('medium');
  const [ruleSet, setRuleSet] = useState('southAfrica');

  const configSummary = useMemo(() => {
    const opp = OPPONENTS.find((o) => o.id === opponent)?.label;
    const diff = DIFFICULTIES.find((d) => d.id === difficulty)?.label;
    const rules = RULE_SETS.find((r) => r.id === ruleSet)?.label;
    return `${opp} · ${diff} · ${rules} rules`;
  }, [opponent, difficulty, ruleSet]);

  const startLocal = () => {
    if (opponent === 'online') {
      Linking.openURL(MORABARABA_URL);
      return;
    }

    Alert.alert(
      'Morabaraba',
      `Native board coming soon.\n\n${configSummary}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open morabaraba.co.za', onPress: () => Linking.openURL(MORABARABA_URL) },
      ]
    );
  };

  const startOnline = () => Linking.openURL(MORABARABA_URL);

  const showHowToPlay = () => {
    Alert.alert(
      'How to play Morabaraba',
      'Morabaraba is a traditional African strategy board game.\n\nPlace your pieces, form mills (lines of three) to capture opponent pieces, then move and fly as pieces are removed.\n\nTwo rule sets are supported: South African traditional and the Lesotho variant.',
      [
        { text: 'Close', style: 'cancel' },
        { text: 'Learn more', onPress: () => Linking.openURL(MORABARABA_URL) },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        onMenuPress={onOpenDrawer}
        subtitle="Play Morabaraba"
        onHelpPress={showHowToPlay}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons name="grid" size={40} color="#9b59b6" />
          </View>
          <Text style={styles.title}>Morabaraba</Text>
          <Text style={styles.tagline}>
            The ancient game, reimagined — deep strategy with centuries of African heritage.
          </Text>
        </View>

        <View style={styles.phases}>
          {PHASES.map((phase) => (
            <View key={phase.step} style={styles.phaseCard}>
              <Text style={styles.phaseStep}>{phase.step}</Text>
              <View style={styles.phaseBody}>
                <Text style={styles.phaseTitle}>{phase.title}</Text>
                <Text style={styles.phaseDesc}>{phase.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.panel}>
          <OptionGroup
            label="Opponent"
            options={OPPONENTS}
            value={opponent}
            onChange={setOpponent}
            accent="#9b59b6"
          />

          {opponent === 'computer' && (
            <OptionGroup
              label="Difficulty"
              hint="Four AI levels — from beginner to expert."
              options={DIFFICULTIES}
              value={difficulty}
              onChange={setDifficulty}
              accent="#9b59b6"
            />
          )}

          <OptionGroup
            label="Rule set"
            hint="South African traditional or Lesotho variant."
            options={RULE_SETS}
            value={ruleSet}
            onChange={setRuleSet}
            accent="#9b59b6"
          />
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={startLocal}>
          <MaterialCommunityIcons name="play" size={20} color="#fff" />
          <Text style={styles.primaryBtnText}>
            {opponent === 'online' ? 'Play online' : 'Start playing'}
          </Text>
        </TouchableOpacity>

        {opponent !== 'online' && (
          <TouchableOpacity style={styles.secondaryBtn} onPress={startOnline}>
            <MaterialCommunityIcons name="web" size={18} color="#9b59b6" />
            <Text style={styles.secondaryBtnText}>Play online</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.footerNote}>
          No sign-up required on morabaraba.co.za — pick your rules and start in seconds.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  scroll: { padding: 16, paddingBottom: 32 },
  hero: { alignItems: 'center', marginBottom: 16 },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: '#9b59b622',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 6,
  },
  tagline: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  phases: { gap: 8, marginBottom: 16 },
  phaseCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#16213e',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#243552',
    padding: 12,
    gap: 12,
  },
  phaseStep: {
    color: '#9b59b6',
    fontSize: 13,
    fontWeight: '800',
    minWidth: 24,
  },
  phaseBody: { flex: 1 },
  phaseTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  phaseDesc: {
    color: '#777',
    fontSize: 12,
    lineHeight: 17,
  },
  panel: {
    backgroundColor: '#16213e',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#243552',
    padding: 16,
    marginBottom: 20,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#9b59b6',
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#9b59b6',
    marginBottom: 16,
  },
  secondaryBtnText: { color: '#9b59b6', fontSize: 15, fontWeight: '700' },
  footerNote: {
    color: '#555',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});

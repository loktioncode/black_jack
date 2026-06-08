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

const TSORO_URL = 'https://tsoro.app/';

const OPPONENTS = [
  { id: 'computer', label: 'Computer' },
  { id: 'passAndPlay', label: 'Pass & play' },
];

const DIFFICULTIES = [
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' },
  { id: 'fiendish', label: 'Fiendish' },
];

const RULES = [
  { id: 'authentic', label: 'Authentic' },
  { id: 'casual', label: 'Casual' },
];

const GUIDANCE = [
  { id: 'guided', label: 'Guided' },
  { id: 'quick', label: 'Quick' },
];

const RULE_HINTS = {
  authentic:
    'Your sowing direction locks after your first move, and a full hole keeps the sowing going.',
  casual: 'Relaxed rules — great for a quick game with friends.',
};

const GUIDANCE_HINTS = {
  guided: 'Tap a hole to preview the direction and seed path, then confirm. Best for learning.',
  quick: 'Play without previews — faster moves for experienced players.',
};

export default function PlayTsoroScreen({ onOpenDrawer }) {
  const [opponent, setOpponent] = useState('computer');
  const [difficulty, setDifficulty] = useState('medium');
  const [rules, setRules] = useState('authentic');
  const [guidance, setGuidance] = useState('guided');

  const rulesHint = RULE_HINTS[rules];
  const guidanceHint = GUIDANCE_HINTS[guidance];

  const configSummary = useMemo(() => {
    const opp = OPPONENTS.find((o) => o.id === opponent)?.label;
    const diff = DIFFICULTIES.find((d) => d.id === difficulty)?.label;
    const rule = RULES.find((r) => r.id === rules)?.label;
    const guide = GUIDANCE.find((g) => g.id === guidance)?.label;
    return `${opp} · ${diff} · ${rule} rules · ${guide}`;
  }, [opponent, difficulty, rules, guidance]);

  const startLocal = () => {
    Alert.alert(
      'Tsoro',
      `Native board coming soon.\n\n${configSummary}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open tsoro.app', onPress: () => Linking.openURL(TSORO_URL) },
      ]
    );
  };

  const startOnline = () => Linking.openURL(TSORO_URL);

  const showHowToPlay = () => {
    Alert.alert(
      'How to play Tsoro',
      'Tsoro is a traditional African sowing game. Pick up seeds from a hole on your side and drop one in each following hole.\n\nCapture opponent seeds by landing in certain positions. The player with the most seeds wins.\n\nNew to Tsoro? Visit tsoro.app for a guided lesson.',
      [
        { text: 'Close', style: 'cancel' },
        { text: 'Open guide', onPress: () => Linking.openURL(TSORO_URL) },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        onMenuPress={onOpenDrawer}
        subtitle="Play Tsoro"
        onHelpPress={showHowToPlay}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons name="dots-circle" size={40} color="#e67e22" />
          </View>
          <Text style={styles.title}>Tsoro</Text>
          <Text style={styles.tagline}>
            Traditional African sowing game — sow seeds, capture, and outplay your opponent.
          </Text>
        </View>

        <View style={styles.panel}>
          <OptionGroup label="Opponent" options={OPPONENTS} value={opponent} onChange={setOpponent} accent="#e67e22" />

          {opponent === 'computer' && (
            <OptionGroup
              label="Difficulty"
              options={DIFFICULTIES}
              value={difficulty}
              onChange={setDifficulty}
              accent="#e67e22"
            />
          )}

          <OptionGroup
            label="Rules"
            hint={rulesHint}
            options={RULES}
            value={rules}
            onChange={setRules}
            accent="#e67e22"
          />

          <OptionGroup
            label="Guidance"
            hint={guidanceHint}
            options={GUIDANCE}
            value={guidance}
            onChange={setGuidance}
            accent="#e67e22"
          />
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={startLocal}>
          <MaterialCommunityIcons name="play" size={20} color="#1a1a2e" />
          <Text style={styles.primaryBtnText}>Play</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={startOnline}>
          <MaterialCommunityIcons name="web" size={18} color="#e67e22" />
          <Text style={styles.secondaryBtnText}>Play online</Text>
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          New to Tsoro? Tap the help icon above for a quick guided lesson.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  scroll: { padding: 16, paddingBottom: 32 },
  hero: { alignItems: 'center', marginBottom: 20 },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: '#e67e2222',
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
    backgroundColor: '#e67e22',
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  primaryBtnText: { color: '#1a1a2e', fontSize: 16, fontWeight: '700' },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e67e22',
    marginBottom: 16,
  },
  secondaryBtnText: { color: '#e67e22', fontSize: 15, fontWeight: '700' },
  footerNote: {
    color: '#555',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});

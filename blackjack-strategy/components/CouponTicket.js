import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ICON_SETS = { MaterialCommunityIcons };

function CouponIcon({ game, size = 22, color }) {
  const Icon = ICON_SETS[game.iconSet] || MaterialCommunityIcons;
  return <Icon name={game.icon} size={size} color={color} />;
}

export default function CouponTicket({ game, owned = 0, selected, onPress, width }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.wrap, width ? { width } : null]}
    >
      <View
        style={[
          styles.ticket,
          { borderLeftColor: game.accent },
          selected && { borderColor: game.accent, backgroundColor: '#1c2844' },
        ]}
      >
        <View style={styles.top}>
          <View style={[styles.iconWrap, { backgroundColor: `${game.accent}22` }]}>
            <CouponIcon game={game} color={game.accent} />
          </View>
          <Text style={styles.price}>${game.price}</Text>
        </View>

        <Text style={styles.name} numberOfLines={2}>
          {game.name}
        </Text>

        <View style={styles.perforation} />

        <View style={styles.footer}>
          <Text style={styles.owned}>{owned > 0 ? `${owned} owned` : 'None owned'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 12,
  },
  ticket: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#243552',
    borderLeftWidth: 4,
    backgroundColor: '#16213e',
    padding: 12,
    minHeight: 132,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  price: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  name: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
    flex: 1,
  },
  perforation: {
    height: 1,
    marginVertical: 10,
    backgroundColor: '#3a4a66',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  owned: {
    color: '#8a9bb5',
    fontSize: 12,
  },
});

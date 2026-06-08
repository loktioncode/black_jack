import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../components/AppHeader';
import CouponTicket from '../components/CouponTicket';
import { COUPON_GAMES, useUser } from '../context/UserContext';

const GRID_GAP = 12;
const GRID_PADDING = 16;

export default function CouponsScreen({ onOpenDrawer, onNavigateWallet }) {
  const { width } = useWindowDimensions();
  const cardWidth = (width - GRID_PADDING * 2 - GRID_GAP) / 2;
  const { walletBalance, coupons, buyCoupons, sellCoupons } = useUser();
  const [selectedId, setSelectedId] = useState(COUPON_GAMES[0].id);
  const [qty, setQty] = useState(1);

  const selected = COUPON_GAMES.find((g) => g.id === selectedId) || COUPON_GAMES[0];
  const owned = coupons[selected.id] || 0;
  const canSell = owned >= qty;

  const handleBuy = () => {
    const result = buyCoupons(selected.id, qty);
    if (!result.ok) Alert.alert('Cannot buy', result.error);
  };

  const handleSell = () => {
    const result = sellCoupons(selected.id, qty);
    if (!result.ok) Alert.alert('Cannot sell', result.error);
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        onMenuPress={onOpenDrawer}
        subtitle="Coupons"
        rightContent={<Text style={styles.balance}>${walletBalance}</Text>}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.subtitle}>Stake friend matches · sell back at 85%</Text>
        <TouchableOpacity style={styles.walletLink} onPress={onNavigateWallet}>
          <Text style={styles.walletLinkText}>Add funds in Wallet</Text>
        </TouchableOpacity>

        <View style={styles.grid}>
          {COUPON_GAMES.map((game) => (
            <CouponTicket
              key={game.id}
              game={game}
              width={cardWidth}
              owned={coupons[game.id] || 0}
              selected={selectedId === game.id}
              onPress={() => {
                setSelectedId(game.id);
                setQty(1);
              }}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>{selected.name}</Text>
        <Text style={styles.panelMeta}>
          ${selected.price} each · {owned} owned
        </Text>

        <View style={styles.panelRow}>
          <View style={styles.qtyGroup}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => setQty((n) => Math.max(1, n - 1))}
            >
              <Ionicons name="remove" size={18} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.qtyVal}>{qty}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty((n) => n + 1)}>
              <Ionicons name="add" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.buyBtn, { backgroundColor: selected.accent }]}
            onPress={handleBuy}
          >
            <Text style={styles.buyBtnText}>Buy ${selected.price * qty}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sellBtn, !canSell && styles.btnDisabled]}
            onPress={handleSell}
            disabled={!canSell}
          >
            <Text style={[styles.sellBtnText, !canSell && styles.sellBtnTextDisabled]}>Sell</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  balance: { color: '#f1c40f', fontWeight: '700', fontSize: 14 },
  scroll: { padding: GRID_PADDING, paddingBottom: 16 },
  subtitle: { color: '#888', fontSize: 13, marginBottom: 6 },
  walletLink: { marginBottom: 16 },
  walletLinkText: { color: '#4ECDC4', fontSize: 14, fontWeight: '600' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  panel: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#243552',
    backgroundColor: '#16213e',
  },
  panelTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  panelMeta: { color: '#888', fontSize: 13, marginTop: 2, marginBottom: 12 },
  panelRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtyGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyVal: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    minWidth: 24,
    textAlign: 'center',
  },
  buyBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buyBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  sellBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#555',
  },
  sellBtnText: { color: '#ccc', fontWeight: '600', fontSize: 14 },
  sellBtnTextDisabled: { color: '#666' },
  btnDisabled: { opacity: 0.4 },
});

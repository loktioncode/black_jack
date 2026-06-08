import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AppHeader from '../components/AppHeader';
import { useUser } from '../context/UserContext';

const QUICK_AMOUNTS = [10, 25, 50, 100];

export default function WalletScreen({ onOpenDrawer }) {
  const { walletBalance, transactions, deposit, withdraw } = useUser();
  const [amount, setAmount] = useState('');

  const parsed = Math.floor(Number(amount) || 0);

  const handleDeposit = () => {
    const result = deposit(parsed);
    if (result.ok) {
      setAmount('');
      Alert.alert('Deposited', `$${parsed} added to your wallet.`);
    } else {
      Alert.alert('Deposit failed', result.error);
    }
  };

  const handleWithdraw = () => {
    const result = withdraw(parsed);
    if (result.ok) {
      setAmount('');
      Alert.alert('Withdrawal', `$${parsed} withdrawn from your wallet.`);
    } else {
      Alert.alert('Withdrawal failed', result.error);
    }
  };

  const formatTx = (tx) => {
    const sign = tx.amount >= 0 ? '+' : '';
    return `${sign}$${tx.amount} · ${tx.note}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader onMenuPress={onOpenDrawer} subtitle="Wallet" />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available balance</Text>
          <Text style={styles.balanceAmount}>${walletBalance}</Text>
          <Text style={styles.balanceHint}>Use balance to buy play coupons</Text>
        </View>

        <Text style={styles.sectionTitle}>Deposit / Withdraw</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          keyboardType="number-pad"
          placeholder="Amount"
          placeholderTextColor="#666"
        />

        <View style={styles.quickRow}>
          {QUICK_AMOUNTS.map((n) => (
            <TouchableOpacity key={n} style={styles.quickBtn} onPress={() => setAmount(String(n))}>
              <Text style={styles.quickBtnText}>${n}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.depositBtn} onPress={handleDeposit}>
            <Text style={styles.depositBtnText}>Deposit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.withdrawBtn} onPress={handleWithdraw}>
            <Text style={styles.withdrawBtnText}>Withdraw</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.note}>
          Practice mode — balances are for in-app play only.
        </Text>

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Recent activity</Text>
        {transactions.length === 0 ? (
          <Text style={styles.emptyTx}>No transactions yet.</Text>
        ) : (
          transactions.map((tx) => (
            <View key={tx.id} style={styles.txRow}>
              <Text style={[styles.txAmount, tx.amount >= 0 ? styles.txPos : styles.txNeg]}>
                {tx.amount >= 0 ? '+' : ''}${tx.amount}
              </Text>
              <Text style={styles.txNote}>{tx.note}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  scroll: { padding: 16, paddingBottom: 32 },
  balanceCard: {
    backgroundColor: '#16213e',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#f1c40f44',
  },
  balanceLabel: { color: '#888', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 },
  balanceAmount: { color: '#f1c40f', fontSize: 42, fontWeight: '800', marginVertical: 8 },
  balanceHint: { color: '#666', fontSize: 13 },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 12 },
  input: {
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 14,
    color: '#fff',
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#0f3460',
    marginBottom: 12,
  },
  quickRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  quickBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#16213e',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  quickBtnText: { color: '#bbb', fontWeight: '600' },
  actionRow: { flexDirection: 'row', gap: 10 },
  depositBtn: {
    flex: 1,
    backgroundColor: '#4ECDC4',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  depositBtnText: { color: '#1a1a2e', fontWeight: '700', fontSize: 16 },
  withdrawBtn: {
    flex: 1,
    backgroundColor: '#16213e',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#888',
  },
  withdrawBtnText: { color: '#ccc', fontWeight: '700', fontSize: 16 },
  note: { color: '#555', fontSize: 12, marginTop: 16, fontStyle: 'italic', lineHeight: 18 },
  emptyTx: { color: '#666', fontStyle: 'italic' },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#0f3460',
  },
  txAmount: { fontWeight: '700', fontSize: 15, minWidth: 70 },
  txPos: { color: '#2ecc71' },
  txNeg: { color: '#e74c3c' },
  txNote: { color: '#aaa', fontSize: 13, flex: 1, textAlign: 'right' },
});

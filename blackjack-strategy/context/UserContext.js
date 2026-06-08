import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@bj_app_profile';

export const COUPON_GAMES = [
  {
    id: 'diceroll',
    name: 'Dice Roll',
    price: 2,
    icon: 'dice-multiple-outline',
    iconSet: 'MaterialCommunityIcons',
    accent: '#c9a227',
    stub: '#8a6d12',
  },
  {
    id: 'crazy8',
    name: 'Crazy Eights',
    price: 3,
    icon: 'cards-outline',
    iconSet: 'MaterialCommunityIcons',
    accent: '#e74c3c',
    stub: '#a93226',
  },
  {
    id: 'fivecard',
    name: '5 Card',
    price: 3,
    icon: 'numeric-5-box-outline',
    iconSet: 'MaterialCommunityIcons',
    accent: '#3498db',
    stub: '#21618c',
  },
  {
    id: 'blackjack',
    name: 'Blackjack P2P',
    price: 5,
    icon: 'cards-playing-outline',
    iconSet: 'MaterialCommunityIcons',
    accent: '#1abc9c',
    stub: '#117a65',
  },
];

function emptyCoupons() {
  return COUPON_GAMES.reduce((acc, g) => ({ ...acc, [g.id]: 0 }), {});
}

function makeP2PCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function makeUserId() {
  return `usr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState('');
  const [username, setUsername] = useState('Player');
  const [p2pCode, setP2pCode] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [coupons, setCoupons] = useState(emptyCoupons);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const data = JSON.parse(raw);
          setUserId(data.userId);
          setUsername(data.username);
          setP2pCode(data.p2pCode);
          setWalletBalance(data.walletBalance ?? 0);
          setCoupons({ ...emptyCoupons(), ...data.coupons });
          setTransactions(data.transactions ?? []);
        } else {
          const id = makeUserId();
          const code = makeP2PCode();
          setUserId(id);
          setP2pCode(code);
          setWalletBalance(20);
          setTransactions([{ id: '1', type: 'bonus', amount: 20, note: 'Welcome bonus', at: Date.now() }]);
        }
      } catch {
        setUserId(makeUserId());
        setP2pCode(makeP2PCode());
      }
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!ready || !userId) return;
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ userId, username, p2pCode, walletBalance, coupons, transactions })
    );
  }, [ready, userId, username, p2pCode, walletBalance, coupons, transactions]);

  const addTransaction = useCallback((type, amount, note) => {
    setTransactions((prev) => [
      { id: `${Date.now()}`, type, amount, note, at: Date.now() },
      ...prev.slice(0, 49),
    ]);
  }, []);

  const deposit = useCallback((amount) => {
    const n = Math.floor(Number(amount));
    if (!n || n <= 0) return { ok: false, error: 'Enter a valid amount' };
    setWalletBalance((b) => b + n);
    addTransaction('deposit', n, 'Wallet deposit');
    return { ok: true };
  }, [addTransaction]);

  const withdraw = useCallback((amount) => {
    const n = Math.floor(Number(amount));
    if (!n || n <= 0) return { ok: false, error: 'Enter a valid amount' };
    if (n > walletBalance) return { ok: false, error: 'Insufficient balance' };
    setWalletBalance((b) => b - n);
    addTransaction('withdraw', -n, 'Wallet withdrawal');
    return { ok: true };
  }, [walletBalance, addTransaction]);

  const buyCoupons = useCallback((gameId, qty = 1) => {
    const game = COUPON_GAMES.find((g) => g.id === gameId);
    if (!game) return { ok: false, error: 'Unknown game' };
    const count = Math.max(1, Math.floor(qty));
    const cost = game.price * count;
    if (cost > walletBalance) return { ok: false, error: 'Insufficient wallet balance' };
    setWalletBalance((b) => b - cost);
    setCoupons((c) => ({ ...c, [gameId]: (c[gameId] || 0) + count }));
    addTransaction('buy', -cost, `Bought ${count}× ${game.name} coupon${count > 1 ? 's' : ''}`);
    return { ok: true };
  }, [walletBalance, addTransaction]);

  const sellCoupons = useCallback((gameId, qty = 1) => {
    const game = COUPON_GAMES.find((g) => g.id === gameId);
    if (!game) return { ok: false, error: 'Unknown game' };
    const count = Math.max(1, Math.floor(qty));
    if ((coupons[gameId] || 0) < count) return { ok: false, error: 'Not enough coupons' };
    const credit = Math.floor(game.price * count * 0.85);
    setCoupons((c) => ({ ...c, [gameId]: c[gameId] - count }));
    setWalletBalance((b) => b + credit);
    addTransaction('sell', credit, `Sold ${count}× ${game.name} coupon${count > 1 ? 's' : ''}`);
    return { ok: true };
  }, [coupons, addTransaction]);

  const updateUsername = useCallback((name) => {
    const trimmed = name.trim();
    if (trimmed.length >= 2) setUsername(trimmed);
  }, []);

  const value = useMemo(
    () => ({
      ready,
      userId,
      username,
      p2pCode,
      walletBalance,
      coupons,
      transactions,
      deposit,
      withdraw,
      buyCoupons,
      sellCoupons,
      updateUsername,
    }),
    [
      ready,
      userId,
      username,
      p2pCode,
      walletBalance,
      coupons,
      transactions,
      deposit,
      withdraw,
      buyCoupons,
      sellCoupons,
      updateUsername,
    ]
  );

  if (!ready) return null;

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}

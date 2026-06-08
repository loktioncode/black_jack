import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  SafeAreaView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AppHeader from '../components/AppHeader';
import { COUPON_GAMES, useUser } from '../context/UserContext';
import {
  getLanPeerHint,
  invitePeer,
  isLanPeerAvailable,
  startLanPeer,
  stopLanPeer,
} from '../services/lanPeer';

export default function PlayFriendsScreen({ onOpenDrawer }) {
  const { userId, username, p2pCode, updateUsername, coupons } = useUser();
  const [nearbyPlayers, setNearbyPlayers] = useState([]);
  const [peerState, setPeerState] = useState('idle'); // idle | connecting | online | offline | unavailable
  const [statusNote, setStatusNote] = useState(null);
  const [nameEdit, setNameEdit] = useState(username);

  const peerHandlers = useCallback(
    () => ({
      onConnecting: () => {
        setPeerState('connecting');
        setStatusNote(null);
      },
      onReady: () => {
        setPeerState('online');
        setStatusNote(null);
      },
      onPeers: (users) => {
        setNearbyPlayers(users);
      },
      onInvite: (payload) => {
        Alert.alert(
          'Game invite',
          `${payload.fromUsername} invited you to play.`,
          [{ text: 'OK' }]
        );
      },
      onError: (message) => {
        setPeerState('offline');
        setStatusNote(message);
      },
      onUnavailable: () => {
        setPeerState('unavailable');
        setStatusNote(getLanPeerHint());
      },
    }),
    []
  );

  const joinNearby = useCallback(() => {
    if (!isLanPeerAvailable()) {
      setPeerState('unavailable');
      setStatusNote(getLanPeerHint());
      return;
    }
    startLanPeer({ userId, username, p2pCode }, peerHandlers());
  }, [userId, username, p2pCode, peerHandlers]);

  useEffect(() => {
    joinNearby();
    return () => stopLanPeer();
  }, [joinNearby]);

  const shareProfile = async () => {
    try {
      await Share.share({
        message: `Play me on BJ Arena!\nUsername: ${username}\nP2P code: ${p2pCode}`,
      });
    } catch {
      /* cancelled */
    }
  };

  const saveUsername = () => {
    updateUsername(nameEdit);
  };

  const sendInvite = (target) => {
    const available = COUPON_GAMES.filter((g) => (coupons[g.id] || 0) > 0);
    if (!available.length) {
      Alert.alert('No coupons', 'Buy coupons first to stake a friend match.');
      return;
    }

    Alert.alert(
      'Pick a game',
      `Invite ${target.username} to play`,
      [
        ...available.map((game) => ({
          text: game.name,
          onPress: async () => {
            const ok = await invitePeer(target, game.id, 1);
            if (ok) {
              Alert.alert('Invite sent', `${target.username} can join your ${game.name} match.`);
            } else {
              Alert.alert(
                'Try again',
                "Couldn't reach that player. Make sure you're both on the same Wi‑Fi."
              );
            }
          },
        })),
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const statusLabel = {
    idle: 'Ready to connect',
    connecting: 'Searching nearby…',
    online: 'Connected on Wi‑Fi',
    offline: 'Not visible on Wi‑Fi',
    unavailable: 'Nearby play unavailable',
  }[peerState];

  const renderUser = ({ item }) => (
    <View style={styles.userRow}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.username}</Text>
        <Text style={styles.userCode}>P2P {item.p2pCode}</Text>
      </View>
      <TouchableOpacity style={styles.inviteBtn} onPress={() => sendInvite(item)}>
        <Text style={styles.inviteBtnText}>Invite</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader onMenuPress={onOpenDrawer} subtitle="Play Friends" />

      <Text style={styles.intro}>
        Connect with friends on the same Wi‑Fi. Invite them to any game — blackjack, dice, cards, and more.
      </Text>

      <View style={styles.profileCard}>
        <Text style={styles.profileTitle}>Your profile</Text>
        <View style={styles.nameRow}>
          <TextInput
            style={styles.nameInput}
            value={nameEdit}
            onChangeText={setNameEdit}
            onBlur={saveUsername}
            placeholder="Username"
            placeholderTextColor="#666"
          />
        </View>
        <Text style={styles.profileMeta}>
          P2P code: <Text style={styles.highlight}>{p2pCode}</Text>
        </Text>
        <TouchableOpacity style={styles.shareBtn} onPress={shareProfile}>
          <Text style={styles.shareBtnText}>Share my code</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statusRow}>
        <View
          style={[
            styles.dot,
            peerState === 'online' && styles.dotOn,
            peerState === 'connecting' && styles.dotPending,
            (peerState === 'offline' || peerState === 'idle' || peerState === 'unavailable') &&
              styles.dotOff,
          ]}
        />
        <Text style={styles.statusText}>{statusLabel}</Text>
      </View>

      {statusNote && <Text style={styles.statusNote}>{statusNote}</Text>}

      {peerState === 'offline' && isLanPeerAvailable() && (
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() => {
            stopLanPeer();
            joinNearby();
          }}
        >
          <Text style={styles.retryBtnText}>Try again</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.sectionTitle}>Nearby on Wi‑Fi ({nearbyPlayers.length})</Text>
      <FlatList
        data={nearbyPlayers}
        keyExtractor={(item) => item.userId}
        renderItem={renderUser}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No friends nearby yet. Anyone on the same Wi‑Fi will show up here so you can invite them to play.
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  intro: {
    color: '#888',
    fontSize: 13,
    lineHeight: 19,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  profileCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#16213e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  profileTitle: {
    color: '#888',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  nameRow: { marginBottom: 8 },
  nameInput: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    borderBottomWidth: 1,
    borderBottomColor: '#4ECDC4',
    paddingVertical: 4,
  },
  profileMeta: { color: '#aaa', fontSize: 13, marginTop: 4 },
  highlight: { color: '#4ECDC4', fontWeight: '700' },
  shareBtn: {
    marginTop: 14,
    backgroundColor: '#4ECDC4',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  shareBtnText: { color: '#1a1a2e', fontWeight: '700' },
  statusRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotOn: { backgroundColor: '#2ecc71' },
  dotPending: { backgroundColor: '#f1c40f' },
  dotOff: { backgroundColor: '#666' },
  statusText: { color: '#bbb', fontSize: 13 },
  statusNote: {
    color: '#888',
    fontSize: 13,
    paddingHorizontal: 16,
    marginTop: 8,
    lineHeight: 18,
  },
  retryBtn: {
    alignSelf: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  retryBtnText: { color: '#4ECDC4', fontWeight: '600' },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
  },
  userInfo: { flex: 1 },
  userName: { color: '#fff', fontSize: 16, fontWeight: '600' },
  userCode: { color: '#4ECDC4', fontSize: 13, marginTop: 2 },
  inviteBtn: {
    backgroundColor: '#2d1f4e',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#9b59b6',
  },
  inviteBtnText: { color: '#9b59b6', fontWeight: '700' },
  empty: {
    color: '#666',
    textAlign: 'center',
    marginTop: 24,
    fontStyle: 'italic',
    lineHeight: 22,
  },
});

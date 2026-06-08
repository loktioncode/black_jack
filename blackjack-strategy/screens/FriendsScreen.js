import React, { useEffect, useState } from 'react';
import {
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
import { useUser } from '../context/UserContext';
import {
  getLanPeerHint,
  isLanPeerActive,
  isLanPeerAvailable,
  onPeers,
} from '../services/lanPeer';

export default function FriendsScreen({ onOpenDrawer }) {
  const { username, p2pCode, updateUsername } = useUser();
  const [nearbyPlayers, setNearbyPlayers] = useState([]);
  const [peerState, setPeerState] = useState('idle');
  const [statusNote, setStatusNote] = useState(null);
  const [nameEdit, setNameEdit] = useState(username);

  useEffect(() => {
    if (!isLanPeerAvailable()) {
      setPeerState('unavailable');
      setStatusNote(getLanPeerHint());
      return undefined;
    }
    if (isLanPeerActive()) {
      setPeerState('online');
    }
    return onPeers((users) => {
      setNearbyPlayers(users);
      setPeerState('online');
    });
  }, []);

  const shareProfile = async () => {
    try {
      await Share.share({
        message: `Connect with me on the app!\nUsername: ${username}\nP2P code: ${p2pCode}`,
      });
    } catch {
      /* cancelled */
    }
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
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader onMenuPress={onOpenDrawer} subtitle="Friends" />

      <Text style={styles.intro}>
        Connect on the same Wi‑Fi to see friends nearby — no server needed.
      </Text>

      <View style={styles.profileCard}>
        <Text style={styles.profileTitle}>Your profile</Text>
        <TextInput
          style={styles.nameInput}
          value={nameEdit}
          onChangeText={setNameEdit}
          onBlur={() => updateUsername(nameEdit)}
          placeholder="Username"
          placeholderTextColor="#666"
        />
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

      {statusNote ? <Text style={styles.statusNote}>{statusNote}</Text> : null}

      <Text style={styles.sectionTitle}>Friends on Wi‑Fi ({nearbyPlayers.length})</Text>
      <FlatList
        data={nearbyPlayers}
        keyExtractor={(item) => item.userId}
        renderItem={renderUser}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No friends nearby yet. Anyone on the same Wi‑Fi appears here automatically.
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
  nameInput: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    borderBottomWidth: 1,
    borderBottomColor: '#4ECDC4',
    paddingVertical: 4,
    marginBottom: 8,
  },
  profileMeta: { color: '#aaa', fontSize: 13 },
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
  empty: {
    color: '#666',
    textAlign: 'center',
    marginTop: 24,
    fontStyle: 'italic',
    lineHeight: 22,
  },
});

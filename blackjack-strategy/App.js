import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import SideDrawer from './components/SideDrawer';
import { UserProvider, useUser } from './context/UserContext';
import PlayBjScreen from './screens/PlayBjScreen';
import FriendsScreen from './screens/FriendsScreen';
import CouponsScreen from './screens/CouponsScreen';
import WalletScreen from './screens/WalletScreen';
import {
  isLanPeerAvailable,
  startLanPeer,
} from './services/lanPeer';

function LanPeerHost({ children }) {
  const { userId, username, p2pCode } = useUser();

  useEffect(() => {
    if (!isLanPeerAvailable()) return undefined;

    startLanPeer({ userId, username, p2pCode }, {
      onPeers: () => {},
      onUnavailable: () => {},
    });

    return undefined;
  }, [userId, username, p2pCode]);

  return children;
}

function AppShell() {
  const [activeScreen, setActiveScreen] = useState('playBj');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);

  const navigate = (screen) => {
    setActiveScreen(screen);
    setDrawerOpen(false);
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case 'playBj':
        return <PlayBjScreen onOpenDrawer={openDrawer} />;
      case 'friends':
        return <FriendsScreen onOpenDrawer={openDrawer} />;
      case 'coupons':
        return (
          <CouponsScreen
            onOpenDrawer={openDrawer}
            onNavigateWallet={() => navigate('wallet')}
          />
        );
      case 'wallet':
        return <WalletScreen onOpenDrawer={openDrawer} />;
      default:
        return <PlayBjScreen onOpenDrawer={openDrawer} />;
    }
  };

  return (
    <LanPeerHost>
      <View style={styles.root}>
        <StatusBar style="light" />
        {renderScreen()}
        <SideDrawer
          visible={drawerOpen}
          activeScreen={activeScreen}
          onNavigate={navigate}
          onClose={closeDrawer}
        />
      </View>
    </LanPeerHost>
  );
}

export default function App() {
  return (
    <UserProvider>
      <AppShell />
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
});

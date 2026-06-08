import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import SideDrawer from './components/SideDrawer';
import { UserProvider } from './context/UserContext';
import PlayBjScreen from './screens/PlayBjScreen';
import PlayFriendsScreen from './screens/PlayFriendsScreen';
import PlayTsoroScreen from './screens/PlayTsoroScreen';
import PlayMorabarabaScreen from './screens/PlayMorabarabaScreen';
import CouponsScreen from './screens/CouponsScreen';
import WalletScreen from './screens/WalletScreen';

function AppShell() {
  const [activeScreen, setActiveScreen] = useState('playTsoro');
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
      case 'playFriends':
        return <PlayFriendsScreen onOpenDrawer={openDrawer} />;
      case 'playTsoro':
        return <PlayTsoroScreen onOpenDrawer={openDrawer} />;
      case 'playMorabaraba':
        return <PlayMorabarabaScreen onOpenDrawer={openDrawer} />;
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
        return <PlayTsoroScreen onOpenDrawer={openDrawer} />;
    }
  };

  return (
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

import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import SideDrawer from './components/SideDrawer';
import StrategyScreen from './screens/StrategyScreen';
import PlayScreen from './screens/PlayScreen';

export default function App() {
  const [activeScreen, setActiveScreen] = useState('strategy');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);

  const navigate = (screen) => {
    setActiveScreen(screen);
    setDrawerOpen(false);
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      {activeScreen === 'strategy' ? (
        <StrategyScreen onOpenDrawer={openDrawer} />
      ) : (
        <PlayScreen onOpenDrawer={openDrawer} />
      )}
      <SideDrawer
        visible={drawerOpen}
        activeScreen={activeScreen}
        onNavigate={navigate}
        onClose={closeDrawer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
});

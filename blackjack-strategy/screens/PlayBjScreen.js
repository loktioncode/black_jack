import React, { useState } from 'react';
import PlayBjHubScreen from './PlayBjHubScreen';
import PlayScreen from './PlayScreen';
import StrategyScreen from './StrategyScreen';

export default function PlayBjScreen({ onOpenDrawer }) {
  const [mode, setMode] = useState('hub');

  if (mode === 'strategy') {
    return <StrategyScreen onOpenDrawer={onOpenDrawer} onBack={() => setMode('hub')} />;
  }

  if (mode === 'table') {
    return <PlayScreen onOpenDrawer={onOpenDrawer} onBack={() => setMode('hub')} />;
  }

  return (
    <PlayBjHubScreen
      onOpenDrawer={onOpenDrawer}
      onSelectMode={setMode}
    />
  );
}

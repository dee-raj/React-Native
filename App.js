import React, { useEffect } from 'react';
import 'react-native-gesture-handler';
import RootDrawerNavigation from './routes/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from './theme/ThemeContext';
import soundManager from './shared/SoundManager';

function AppContent() {
  const { isDark, colors } = useTheme();

  useEffect(() => {
    soundManager.init();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar backgroundColor={colors.background} style={isDark ? 'light' : 'dark'} />
      <RootDrawerNavigation />
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

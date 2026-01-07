import React from 'react';
import 'react-native-gesture-handler';
import RootDrawerNavigation from './routes/drawer';
import { ReviewsProvider } from './shared/ReviewsData';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';


export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ReviewsProvider>
        <StatusBar style="light" />
        <RootDrawerNavigation />
      </ReviewsProvider>
    </GestureHandlerRootView>
  );
}

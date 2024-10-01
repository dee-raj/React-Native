import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import AppNavigator from './routes/homeStack';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [loaded, error] = useFonts({
    'nunito-Black': require('./assets/fonts/Nunito-Black.ttf'),
    'nunito-Bold': require('./assets/fonts/Nunito-Bold.ttf'),
    'nunito-Medium': require('./assets/fonts/Nunito-Medium.ttf'),
    'nunito-Regular': require('./assets/fonts/Nunito-Regular.ttf'),
    'nunito-SemiBold': require('./assets/fonts/Nunito-SemiBold.ttf')
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }
  return (
    <AppNavigator />
  );

}

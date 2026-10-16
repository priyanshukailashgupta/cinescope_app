/**
 * CineScope Application Root
 * Loads Urbanist font family from official Style Guide
 * Sets up SafeAreaProvider, WatchlistProvider, and AppNavigator
 */

import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Urbanist_400Regular,
  Urbanist_500Medium,
  Urbanist_600SemiBold,
  Urbanist_700Bold,
  Urbanist_800ExtraBold,
} from '@expo-google-fonts/urbanist';

import { WatchlistProvider } from './src/context/WatchlistContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { colors } from './src/theme';

export default function App() {
  const [fontsLoaded] = useFonts({
    Urbanist_400Regular,
    Urbanist_500Medium,
    Urbanist_600SemiBold,
    Urbanist_700Bold,
    Urbanist_800ExtraBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <WatchlistProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </WatchlistProvider>
    </SafeAreaProvider>
  );
}

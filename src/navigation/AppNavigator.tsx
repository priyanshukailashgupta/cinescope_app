/**
 * AppNavigator
 * Consolidated React Navigation setup featuring the animated scoop/bubble navbar:
 * - AnimatedTabBar with floating circular elevated active indicator & fluid spring transitions
 * - 5 Verified Tabs: Home, Explore, Live TV, My List, Profile
 * - Stack includes MovieDetail, PersonDetail, and TopMovies (Top 10 grid)
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AnimatedTabBar } from '../components/AnimatedTabBar';
import { HomeScreen } from '../screens/HomeScreen';
import { ExploreScreen } from '../screens/ExploreScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { WatchlistScreen } from '../screens/WatchlistScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { MovieDetailScreen } from '../screens/MovieDetailScreen';
import { PersonDetailScreen } from '../screens/PersonDetailScreen';
import { TopMoviesScreen } from '../screens/TopMoviesScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { colors } from '../theme';

export type RootStackParamList = {
  Splash: undefined;
  MainTabs:
    | {
        screen?: keyof MainTabsParamList;
        params?: MainTabsParamList[keyof MainTabsParamList];
      }
    | undefined;
  TopMovies: undefined;
  MovieDetail: { movieId: number; mediaType?: 'movie' | 'tv' };
  PersonDetail: { personId: number };
};

export type MainTabsParamList = {
  HomeTab: undefined;
  ExploreTab:
    | {
        genreName?: string;
        genreId?: number;
        mediaType?: 'movie' | 'tv';
        sortBy?: string;
        rating?: number;
        year?: number;
        timestamp?: number;
      }
    | undefined;
  SearchTab: undefined;
  WatchlistTab: undefined;
  ProfileTab: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabsParamList>();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ animation: 'fade' }}
        />
        <Stack.Screen
          name="MainTabs"
          component={BottomTabs}
          options={{ animation: 'fade' }}
        />
        <Stack.Screen name="TopMovies" component={TopMoviesScreen} />
        <Stack.Screen name="MovieDetail" component={MovieDetailScreen} />
        <Stack.Screen name="PersonDetail" component={PersonDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const BottomTabs = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} />
      <Tab.Screen name="ExploreTab" component={ExploreScreen} />
      <Tab.Screen name="SearchTab" component={SearchScreen} />
      <Tab.Screen name="WatchlistTab" component={WatchlistScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} />
    </Tab.Navigator>
  );
};


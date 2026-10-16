/**
 * WatchlistScreen
 * Renders user-saved favorites persisted locally via AsyncStorage.
 * Styled with Urbanist typography & Ionicons.
 */

import React, { useCallback, useRef } from 'react';
import {
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { MovieSummary } from '../api/types';
import { EmptyState } from '../components/EmptyState';
import { MovieCard } from '../components/MovieCard';
import { useWatchlist, WatchlistItem } from '../context/WatchlistContext';
import { borderRadius, colors, fonts, spacing } from '../theme';

interface WatchlistScreenProps {
  navigation: any;
}

export const WatchlistScreen: React.FC<WatchlistScreenProps> = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const { getWatchlistArray, removeFromWatchlist } = useWatchlist();

  const flatListRef = useRef<FlatList>(null);
  const scrollOffsetRef = useRef(0);

  // Reset scroll to top whenever screen gains focus
  useFocusEffect(
    useCallback(() => {
      if (scrollOffsetRef.current > 5) {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
        scrollOffsetRef.current = 0;
      }
    }, [])
  );

  const watchlistItems = getWatchlistArray();

  const NUM_COLUMNS = width > 600 ? 4 : 3;
  const COLUMN_WIDTH = (width - spacing.lg * 2 - spacing.md * 2) / NUM_COLUMNS;

  const handleMoviePress = (item: WatchlistItem) => {
    navigation.navigate('MovieDetail', { movieId: item.id });
  };

  const handleExplorePress = () => {
    navigation.navigate('ExploreTab');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Screen Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Image
            source={require('../../assets/icons/logo-square.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.title}>My Watchlist</Text>
            <Text style={styles.subtitle}>
              {watchlistItems.length === 1
                ? '1 saved film on this device'
                : `${watchlistItems.length} saved films on this device`}
            </Text>
          </View>
        </View>
        <View style={styles.storageBadge}>
          <Text style={styles.storageBadgeText}>OFFLINE PERSISTED</Text>
        </View>
      </View>

      {watchlistItems.length === 0 ? (
        <EmptyState
          iconName="bookmark-outline"
          title="Your Watchlist is Empty"
          message="Bookmark movies you want to watch later. Saved movies are stored right on your device for offline access."
          actionLabel="Explore Trending Movies"
          onAction={handleExplorePress}
        />
      ) : (
        <FlatList
          ref={flatListRef}
          data={watchlistItems}
          keyExtractor={(item) => item.id.toString()}
          numColumns={NUM_COLUMNS}
          key={NUM_COLUMNS}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={(e) => {
            scrollOffsetRef.current = e.nativeEvent.contentOffset.y;
          }}
          renderItem={({ item }) => {
            const summary: MovieSummary = {
              id: item.id,
              title: item.title,
              overview: '',
              poster_path: item.poster_path,
              backdrop_path: item.backdrop_path,
              release_date: item.release_date,
              vote_average: item.vote_average,
              vote_count: 0,
              popularity: 0,
            };

            return (
              <View style={[styles.gridCell, { width: COLUMN_WIDTH }]}>
                <MovieCard
                  movie={summary}
                  onPress={() => handleMoviePress(item)}
                  width={COLUMN_WIDTH}
                />
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => removeFromWatchlist(item.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  activeOpacity={0.75}
                >
                  <Ionicons name="trash-outline" size={13} color={colors.textSecondary} style={{ marginRight: 4 }} />
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              </View>
            );
          }}
          initialNumToRender={9}
          maxToRenderPerBatch={12}
          windowSize={5}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 36,
    height: 28,
    marginRight: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  title: {
    fontFamily: fonts.extrabold,
    fontSize: 22,
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  storageBadge: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  storageBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 9,
    color: colors.primaryLight,
    letterSpacing: 0.5,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 110,
  },
  gridCell: {
    marginBottom: spacing.xl,
    marginRight: spacing.md,
  },
  removeBtn: {
    flexDirection: 'row',
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  removeText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.textSecondary,
  },
});

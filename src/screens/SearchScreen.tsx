/**
 * SearchScreen
 * Dedicated Multi-Search Tab matching requirements:
 * - Search movies, shows and actors via TMDB /search/multi
 * - Real-time debounced query with instant clear
 * - Filter by All, Movies, TV Shows, or People (Actors / Directors)
 * - Navigation to MovieDetail and PersonDetail
 * - Responsive cards with badges and defensive typography
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  Keyboard,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { MultiSearchResultItem } from '../api/types';
import { tmdbService } from '../api/tmdb';
import { CustomImage } from '../components/CustomImage';
import { EmptyState } from '../components/EmptyState';
import { ErrorView } from '../components/ErrorView';
import { Skeleton } from '../components/Skeleton';
import { useDebounce } from '../hooks/useDebounce';
import { borderRadius, colors, fonts, spacing } from '../theme';
import { formatReleaseYear, getImageUrl } from '../utils';

interface SearchScreenProps {
  navigation: any;
}

type SearchFilter = 'all' | 'movie' | 'tv' | 'person';

const QUICK_SEARCHES = [
  'Christopher Nolan',
  'Marvel',
  'Sci-Fi',
  'Anime',
  'Batman',
  'Bollywood',
];

export const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  const { width } = useWindowDimensions();

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

  // Search input state
  const [query, setQuery] = useState<string>('');
  const debouncedQuery = useDebounce<string>(query, 350);
  const [filter, setFilter] = useState<SearchFilter>('all');

  // Search results state
  const [results, setResults] = useState<MultiSearchResultItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Execute /search/multi
  const executeSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length === 0) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await tmdbService.searchMulti(searchQuery.trim(), 1);
      setResults(res.results || []);
    } catch (err: any) {
      if (err?.name !== 'CanceledError') {
        setError('Unable to perform search. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    executeSearch(debouncedQuery);
  }, [debouncedQuery, executeSearch]);

  // Filter items based on active chip
  const filteredResults = results.filter((item) => {
    if (filter === 'all') return true;
    return item.media_type === filter;
  });

  const handleClear = () => {
    setQuery('');
    setResults([]);
    Keyboard.dismiss();
  };

  const handleSelectQuickSearch = (text: string) => {
    setQuery(text);
  };

  const handleItemPress = (item: MultiSearchResultItem) => {
    if (item.media_type === 'person') {
      navigation.navigate('PersonDetail', { personId: item.id });
    } else {
      // Movie or TV Show
      navigation.navigate('MovieDetail', {
        movieId: item.id,
        mediaType: item.media_type === 'tv' ? 'tv' : 'movie',
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Header Search Bar */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Ionicons
            name="search"
            size={18}
            color={colors.textMuted}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search movies, TV shows, actors..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={handleClear}
              style={styles.clearButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Media Type Filter Tabs */}
        <View style={styles.filterTabsRow}>
          {(
            [
              { key: 'all', label: 'All' },
              { key: 'movie', label: 'Movies' },
              { key: 'tv', label: 'TV Shows' },
              { key: 'person', label: 'People' },
            ] as { key: SearchFilter; label: string }[]
          ).map((tab) => {
            const isSelected = filter === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.filterTab,
                  isSelected && styles.filterTabActive,
                ]}
                onPress={() => setFilter(tab.key)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    isSelected && styles.filterTabTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Body Area */}
      {loading ? (
        <View style={styles.loadingList}>
          {Array.from({ length: 5 }).map((_, i) => (
            <View key={i} style={styles.loadingItem}>
              <Skeleton width={80} height={110} style={{ borderRadius: 10 }} />
              <View style={styles.loadingMeta}>
                <Skeleton width="70%" height={16} style={{ marginBottom: 8 }} />
                <Skeleton width="40%" height={12} style={{ marginBottom: 8 }} />
                <Skeleton width="90%" height={12} />
              </View>
            </View>
          ))}
        </View>
      ) : error ? (
        <ErrorView message={error} onRetry={() => executeSearch(debouncedQuery)} />
      ) : query.trim().length === 0 ? (
        /* Empty / Initial State with Trending Quick Searches */
        <View style={styles.initialStateWrapper}>
          <View style={styles.initialIconWrapper}>
            <Ionicons name="search-outline" size={48} color={colors.primary} />
          </View>
          <Text style={styles.initialTitle}>Search CineScope</Text>
          <Text style={styles.initialSubtitle}>
            Find your favorite films, binge-worthy series, and star actors.
          </Text>

          <Text style={styles.quickSearchHeading}>POPULAR SEARCHES</Text>
          <View style={styles.quickSearchGrid}>
            {QUICK_SEARCHES.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={styles.quickSearchChip}
                onPress={() => handleSelectQuickSearch(tag)}
                activeOpacity={0.75}
              >
                <Ionicons
                  name="trending-up"
                  size={14}
                  color={colors.primary}
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.quickSearchText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        /* Results List */
        <FlatList
          ref={flatListRef}
          data={filteredResults}
          keyExtractor={(item) => `${item.media_type}-${item.id}`}
          contentContainerStyle={styles.listContent}
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={(e) => {
            scrollOffsetRef.current = e.nativeEvent.contentOffset.y;
          }}
          ListEmptyComponent={
            <EmptyState
              title="No Results Found"
              message={`We couldn't find anything matching "${query}".`}
              actionLabel="Clear Search"
              onAction={handleClear}
            />
          }
          renderItem={({ item }) => {
            const isPerson = item.media_type === 'person';
            const displayTitle = item.title || item.name || 'Untitled';
            const releaseYear = formatReleaseYear(
              item.release_date || item.first_air_date
            );
            const imagePath = isPerson
              ? item.profile_path
              : item.poster_path || item.backdrop_path;
            const imageUri = getImageUrl(imagePath, 'w342');

            return (
              <TouchableOpacity
                style={styles.resultCard}
                onPress={() => handleItemPress(item)}
                activeOpacity={0.8}
              >
                {/* Thumbnail / Portrait */}
                <View
                  style={[
                    styles.thumbnailContainer,
                    isPerson && styles.thumbnailContainerPerson,
                  ]}
                >
                  <CustomImage
                    uri={imageUri}
                    fallbackTitle={displayTitle}
                    aspectRatio={isPerson ? 1 : 2 / 3}
                    style={isPerson ? styles.personImage : styles.posterImage}
                  />
                </View>

                {/* Details */}
                <View style={styles.resultDetails}>
                  {/* Badges Row */}
                  <View style={styles.badgesRow}>
                    <View
                      style={[
                        styles.typeBadge,
                        isPerson
                          ? styles.typeBadgePerson
                          : item.media_type === 'tv'
                          ? styles.typeBadgeTv
                          : styles.typeBadgeMovie,
                      ]}
                    >
                      <Text style={styles.typeBadgeText}>
                        {isPerson
                          ? 'ACTOR'
                          : item.media_type === 'tv'
                          ? 'TV SHOW'
                          : 'MOVIE'}
                      </Text>
                    </View>

                    {!isPerson && !!item.vote_average && item.vote_average > 0 && (
                      <View style={styles.ratingBadge}>
                        <Ionicons
                          name="star"
                          size={11}
                          color="#FFB800"
                          style={{ marginRight: 3 }}
                        />
                        <Text style={styles.ratingBadgeText}>
                          {item.vote_average.toFixed(1)}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Title */}
                  <Text style={styles.resultTitle} numberOfLines={1}>
                    {displayTitle}
                  </Text>

                  {/* Subtitle / Department / Year */}
                  <Text style={styles.resultSubtitle} numberOfLines={1}>
                    {isPerson
                      ? item.known_for_department || 'Artist'
                      : releaseYear
                      ? `Released ${releaseYear}`
                      : 'Release Date TBA'}
                  </Text>

                  {/* Overview snippet or known-for list */}
                  {isPerson ? (
                    item.known_for && item.known_for.length > 0 ? (
                      <Text style={styles.knownForText} numberOfLines={1}>
                        Known for:{' '}
                        {item.known_for
                          .map((kf: any) => kf.title || kf.name)
                          .filter(Boolean)
                          .join(', ')}
                      </Text>
                    ) : null
                  ) : item.overview ? (
                    <Text style={styles.resultOverview} numberOfLines={2}>
                      {item.overview}
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          }}
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: '#FFFFFF',
    height: '100%',
  },
  clearButton: {
    padding: 4,
  },
  filterTabsRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterTabText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textMuted,
  },
  filterTabTextActive: {
    fontFamily: fonts.bold,
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 110,
  },
  resultCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 14,
    marginBottom: spacing.md,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  thumbnailContainer: {
    width: 72,
    aspectRatio: 2 / 3,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#0F121C',
  },
  thumbnailContainerPerson: {
    width: 64,
    height: 64,
    borderRadius: 32,
    aspectRatio: 1,
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  personImage: {
    width: '100%',
    height: '100%',
  },
  resultDetails: {
    flex: 1,
    marginLeft: 12,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadgeMovie: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  typeBadgeTv: {
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
  },
  typeBadgePerson: {
    backgroundColor: 'rgba(234, 179, 8, 0.2)',
  },
  typeBadgeText: {
    fontFamily: fonts.extrabold,
    fontSize: 9,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 184, 0, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: '#FFB800',
  },
  resultTitle: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  resultSubtitle: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },
  resultOverview: {
    fontFamily: fonts.regular,
    fontSize: 11.5,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  knownForText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.primaryLight,
  },
  loadingList: {
    padding: spacing.lg,
  },
  loadingItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    backgroundColor: colors.card,
    padding: 10,
    borderRadius: 12,
  },
  loadingMeta: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  initialStateWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: 60,
  },
  initialIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  initialTitle: {
    fontFamily: fonts.extrabold,
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  initialSubtitle: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  quickSearchHeading: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 12,
  },
  quickSearchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  quickSearchChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickSearchText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: '#FFFFFF',
  },
});

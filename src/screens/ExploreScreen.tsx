/**
 * ExploreScreen
 * Dedicated Explore & Browse Tab with Side Filter Drawer:
 * - Side drawer filter matching the screenshot layout:
 *   - Year, Genre, Sort By, Region, Language, Rating
 *   - "APPLY" button and reset "↻" button at bottom
 * - Smooth right-to-left slide animation with dimmed backdrop
 * - Sub-picker modal for intuitive single-tap option selection
 * - Media Type Toggle: Movies vs TV Shows
 * - Active filter badges and 3-column responsive catalog grid
 * - Defensive typography & modern cinematic aesthetic
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Genre, MovieSummary } from '../api/types';
import { tmdbService } from '../api/tmdb';
import { EmptyState } from '../components/EmptyState';
import { ErrorView } from '../components/ErrorView';
import { MovieCard } from '../components/MovieCard';
import { Skeleton } from '../components/Skeleton';
import { borderRadius, colors, fonts, spacing } from '../theme';

interface ExploreScreenProps {
  navigation: any;
  route?: {
    params?: {
      genreName?: string;
      genreId?: number;
      mediaType?: 'movie' | 'tv';
      sortBy?: string;
      rating?: number;
      year?: number;
      timestamp?: number;
    };
  };
}

type MediaType = 'movie' | 'tv';
type PickerType = 'year' | 'genre' | 'sort' | 'region' | 'language' | 'rating' | null;

const YEAR_OPTIONS = [
  { label: 'Default', value: undefined },
  { label: '2026', value: 2026 },
  { label: '2025', value: 2025 },
  { label: '2024', value: 2024 },
  { label: '2023', value: 2023 },
  { label: '2022', value: 2022 },
  { label: '2021', value: 2021 },
  { label: '2020', value: 2020 },
  { label: '2010s', value: 2015 },
  { label: '2000s', value: 2005 },
];

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'primary_release_date.desc' },
  { label: 'Most Popular', value: 'popularity.desc' },
  { label: 'Top Rated', value: 'vote_average.desc' },
  { label: 'Oldest First', value: 'primary_release_date.asc' },
];

const REGION_OPTIONS = [
  { label: 'Global', value: undefined },
  { label: 'India (IN)', value: 'IN' },
  { label: 'United States (US)', value: 'US' },
  { label: 'South Korea (KR)', value: 'KR' },
  { label: 'Japan (JP)', value: 'JP' },
  { label: 'United Kingdom (GB)', value: 'GB' },
  { label: 'France (FR)', value: 'FR' },
  { label: 'Spain (ES)', value: 'ES' },
];

const LANGUAGE_OPTIONS = [
  { label: 'All Languages', value: undefined },
  { label: 'English', value: 'en' },
  { label: 'Hindi', value: 'hi' },
  { label: 'Korean', value: 'ko' },
  { label: 'Japanese', value: 'ja' },
  { label: 'Spanish', value: 'es' },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' },
  { label: 'Tamil', value: 'ta' },
  { label: 'Telugu', value: 'te' },
];

const RATING_OPTIONS = [
  { label: 'All Ratings', value: undefined },
  { label: '★ 8.0+ (Exceptional)', value: 8 },
  { label: '★ 7.0+ (Great)', value: 7 },
  { label: '★ 6.0+ (Good)', value: 6 },
];

export const ExploreScreen: React.FC<ExploreScreenProps> = ({
  navigation,
  route,
}) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  // Responsive 3-column grid calculation
  const HORIZONTAL_PADDING = spacing.lg * 2;
  const GAP = spacing.md * 2;
  const NUM_COLUMNS = width > 600 ? 4 : 3;
  const COLUMN_WIDTH = (width - HORIZONTAL_PADDING - GAP) / NUM_COLUMNS;
  const DRAWER_WIDTH = Math.min(width * 0.82, 340);

  // Media Type
  const [mediaType, setMediaType] = useState<MediaType>('movie');
  const [genres, setGenres] = useState<Genre[]>([]);

  // APPLIED Filter State
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string>('popularity.desc');
  const [selectedRegion, setSelectedRegion] = useState<string | undefined>(undefined);
  const [selectedLanguage, setSelectedLanguage] = useState<string | undefined>(undefined);
  const [selectedRating, setSelectedRating] = useState<number | undefined>(undefined);

  // DRAFT Filter State (inside drawer before clicking APPLY)
  const [draftGenreId, setDraftGenreId] = useState<number | null>(null);
  const [draftYear, setDraftYear] = useState<number | undefined>(undefined);
  const [draftSortBy, setDraftSortBy] = useState<string>('popularity.desc');
  const [draftRegion, setDraftRegion] = useState<string | undefined>(undefined);
  const [draftLanguage, setDraftLanguage] = useState<string | undefined>(undefined);
  const [draftRating, setDraftRating] = useState<number | undefined>(undefined);

  // Drawer & Sub-picker Visibility
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [activePicker, setActivePicker] = useState<PickerType>(null);

  // Animation values
  const drawerSlideAnim = useRef(new Animated.Value(DRAWER_WIDTH)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const scrollOffsetRef = useRef(0);

  // Reset scroll to top whenever screen gains focus & sync default media preference
  useFocusEffect(
    useCallback(() => {
      if (scrollOffsetRef.current > 5) {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
        scrollOffsetRef.current = 0;
      }

      if (!route?.params?.mediaType) {
        AsyncStorage.getItem('@cinescope/default_media_type').then((pref) => {
          if (pref === 'tv' && mediaType !== 'tv') {
            setMediaType('tv');
          } else if (pref === 'movie' && mediaType !== 'movie') {
            setMediaType('movie');
          }
        });
      }
    }, [mediaType, route?.params?.mediaType])
  );

  // Catalog Results & Pagination
  const [items, setItems] = useState<MovieSummary[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Count active filters (for badge)
  const activeFilterCount =
    (selectedGenreId !== null ? 1 : 0) +
    (selectedYear !== undefined ? 1 : 0) +
    (sortBy !== 'popularity.desc' ? 1 : 0) +
    (selectedRegion !== undefined ? 1 : 0) +
    (selectedLanguage !== undefined ? 1 : 0) +
    (selectedRating !== undefined ? 1 : 0);

  // Track last handled timestamp to avoid redundant re-triggers
  const lastParamTimestampRef = useRef<number | null>(null);

  // Synchronize incoming navigation params with both Applied and Draft filter states
  useEffect(() => {
    if (!route?.params) return;

    const currentTimestamp = route.params.timestamp || 0;
    if (lastParamTimestampRef.current === currentTimestamp && currentTimestamp !== 0) {
      return;
    }
    lastParamTimestampRef.current = currentTimestamp;

    const {
      mediaType: incomingMediaType,
      genreId: incomingGenreId,
      genreName: incomingGenreName,
      sortBy: incomingSortBy,
      rating: incomingRating,
      year: incomingYear,
    } = route.params;

    // 1. MediaType
    if (incomingMediaType && (incomingMediaType === 'movie' || incomingMediaType === 'tv')) {
      setMediaType(incomingMediaType);
    }

    // 2. SortBy
    const newSortBy = incomingSortBy || 'popularity.desc';
    setSortBy(newSortBy);
    setDraftSortBy(newSortBy);

    // 3. Rating
    setSelectedRating(incomingRating);
    setDraftRating(incomingRating);

    // 4. Year
    setSelectedYear(incomingYear);
    setDraftYear(incomingYear);

    // 5. Genre
    if (incomingGenreId !== undefined) {
      setSelectedGenreId(incomingGenreId);
      setDraftGenreId(incomingGenreId);
    } else if (!incomingGenreName) {
      setSelectedGenreId(null);
      setDraftGenreId(null);
    }
  }, [route?.params]);

  // Fetch Genres when MediaType changes and resolve genreName/genreId
  useEffect(() => {
    let isMounted = true;
    const fetchGenres = async () => {
      try {
        const res =
          mediaType === 'movie'
            ? await tmdbService.getMovieGenres()
            : await tmdbService.getTvGenres();
        if (isMounted) {
          setGenres(res.genres || []);

          if (route?.params?.genreId !== undefined) {
            setSelectedGenreId(route.params.genreId);
            setDraftGenreId(route.params.genreId);
          } else if (route?.params?.genreName) {
            const searchName = route.params.genreName.toLowerCase();
            const matched = (res.genres || []).find(
              (g) =>
                g.name.toLowerCase() === searchName ||
                g.name.toLowerCase().includes(searchName) ||
                searchName.includes(g.name.toLowerCase())
            );
            if (matched) {
              setSelectedGenreId(matched.id);
              setDraftGenreId(matched.id);
            }
          }
        }
      } catch (err) {
        console.warn('Failed to load genres:', err);
      }
    };
    fetchGenres();
    return () => {
      isMounted = false;
    };
  }, [mediaType, route?.params?.genreName, route?.params?.genreId]);

  // Fetch Discover Catalog
  const fetchDiscover = useCallback(
    async (targetPage = 1, append = false) => {
      if (targetPage === 1) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      try {
        const effectiveSortBy =
          mediaType === 'tv' && sortBy.startsWith('primary_release_date')
            ? sortBy.replace('primary_release_date', 'first_air_date')
            : mediaType === 'movie' && sortBy.startsWith('first_air_date')
            ? sortBy.replace('first_air_date', 'primary_release_date')
            : sortBy;

        const params = {
          with_genres: selectedGenreId || undefined,
          sort_by: effectiveSortBy,
          page: targetPage,
          'vote_average.gte': selectedRating,
          primary_release_year: mediaType === 'movie' ? selectedYear : undefined,
          first_air_date_year: mediaType === 'tv' ? selectedYear : undefined,
          with_origin_country: selectedRegion,
          with_original_language: selectedLanguage,
        };

        const res =
          mediaType === 'movie'
            ? await tmdbService.discoverMovies(params)
            : await tmdbService.discoverTv(params);

        const newResults = res.results || [];
        if (append) {
          setItems((prev) => [...prev, ...newResults]);
        } else {
          setItems(newResults);
        }

        setPage(targetPage);
        setHasMore(targetPage < (res.total_pages || 1));
      } catch (err) {
        if (targetPage === 1) {
          setError('Unable to load catalog. Please check your network.');
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [mediaType, selectedGenreId, sortBy, selectedRating, selectedYear, selectedRegion, selectedLanguage]
  );

  useEffect(() => {
    fetchDiscover(1, false);
  }, [fetchDiscover]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDiscover(1, false);
  };

  const onLoadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      fetchDiscover(page + 1, true);
    }
  };

  // Open Drawer (syncs draft state with current applied state)
  const openDrawer = () => {
    setDraftGenreId(selectedGenreId);
    setDraftYear(selectedYear);
    setDraftSortBy(sortBy);
    setDraftRegion(selectedRegion);
    setDraftLanguage(selectedLanguage);
    setDraftRating(selectedRating);
    setDrawerVisible(true);

    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(drawerSlideAnim, {
        toValue: 0,
        stiffness: 280,
        damping: 26,
        mass: 0.85,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Close Drawer
  const closeDrawer = () => {
    setActivePicker(null);
    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(drawerSlideAnim, {
        toValue: DRAWER_WIDTH,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setDrawerVisible(false);
    });
  };

  // Apply Filters
  const handleApply = () => {
    setSelectedGenreId(draftGenreId);
    setSelectedYear(draftYear);
    setSortBy(draftSortBy);
    setSelectedRegion(draftRegion);
    setSelectedLanguage(draftLanguage);
    setSelectedRating(draftRating);
    closeDrawer();
  };

  // Reset Draft Filters to Defaults
  const handleReset = () => {
    setDraftGenreId(null);
    setDraftYear(undefined);
    setDraftSortBy('popularity.desc');
    setDraftRegion(undefined);
    setDraftLanguage(undefined);
    setDraftRating(undefined);
  };

  // Helper Labels for Selected Values
  const getSelectedYearLabel = () =>
    YEAR_OPTIONS.find((y) => y.value === draftYear)?.label || 'Default';

  const getSelectedGenreLabel = () =>
    genres.find((g) => g.id === draftGenreId)?.name || 'All Genres';

  const getSelectedSortLabel = () => {
    if (draftSortBy === 'first_air_date.desc' || draftSortBy === 'primary_release_date.desc') {
      return 'Newest First';
    }
    if (draftSortBy === 'first_air_date.asc' || draftSortBy === 'primary_release_date.asc') {
      return 'Oldest First';
    }
    return SORT_OPTIONS.find((s) => s.value === draftSortBy)?.label || 'Most Popular';
  };

  const getSelectedRegionLabel = () =>
    REGION_OPTIONS.find((r) => r.value === draftRegion)?.label || 'Global';

  const getSelectedLanguageLabel = () =>
    LANGUAGE_OPTIONS.find((l) => l.value === draftLanguage)?.label || 'All Languages';

  const getSelectedRatingLabel = () =>
    RATING_OPTIONS.find((r) => r.value === draftRating)?.label || 'All Ratings';

  const handleMoviePress = (movie: MovieSummary) => {
    navigation.navigate('MovieDetail', {
      movieId: movie.id,
      mediaType: movie.media_type || mediaType,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Screen Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Explore</Text>
          <Text style={styles.headerSubtitle}>
            {mediaType === 'movie' ? 'Movies Catalog' : 'TV Shows Catalog'}
          </Text>
        </View>

        <View style={styles.headerRight}>
          {/* Media Type Toggle: Movies vs TV */}
          <View style={styles.typeToggle}>
            <TouchableOpacity
              style={[
                styles.typeTab,
                mediaType === 'movie' && styles.typeTabActive,
              ]}
              onPress={() => {
                if (mediaType !== 'movie') {
                  setSelectedGenreId(null);
                  setDraftGenreId(null);
                  setMediaType('movie');
                  if (sortBy.startsWith('first_air_date')) {
                    const converted = sortBy.replace('first_air_date', 'primary_release_date');
                    setSortBy(converted);
                    setDraftSortBy(converted);
                  }
                }
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.typeTabText,
                  mediaType === 'movie' && styles.typeTabTextActive,
                ]}
              >
                Movies
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeTab,
                mediaType === 'tv' && styles.typeTabActive,
              ]}
              onPress={() => {
                if (mediaType !== 'tv') {
                  setSelectedGenreId(null);
                  setDraftGenreId(null);
                  setMediaType('tv');
                  if (sortBy.startsWith('primary_release_date')) {
                    const converted = sortBy.replace('primary_release_date', 'first_air_date');
                    setSortBy(converted);
                    setDraftSortBy(converted);
                  }
                }
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.typeTabText,
                  mediaType === 'tv' && styles.typeTabTextActive,
                ]}
              >
                TV
              </Text>
            </TouchableOpacity>
          </View>

          {/* Filter Side-Drawer Launcher Button */}
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilterCount > 0 && styles.filterButtonActive,
            ]}
            onPress={openDrawer}
            activeOpacity={0.8}
          >
            <Ionicons
              name="options-outline"
              size={18}
              color="#FFFFFF"
            />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Active Filter Chips Row (if any active filters) */}
      {activeFilterCount > 0 && (
        <View style={styles.activeFiltersBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.activeFiltersList}
          >
            {selectedGenreId !== null && (
              <TouchableOpacity
                style={styles.activePill}
                onPress={() => setSelectedGenreId(null)}
              >
                <Text style={styles.activePillText}>
                  {genres.find((g) => g.id === selectedGenreId)?.name} ✕
                </Text>
              </TouchableOpacity>
            )}
            {selectedYear !== undefined && (
              <TouchableOpacity
                style={styles.activePill}
                onPress={() => setSelectedYear(undefined)}
              >
                <Text style={styles.activePillText}>{selectedYear} ✕</Text>
              </TouchableOpacity>
            )}
            {selectedRegion !== undefined && (
              <TouchableOpacity
                style={styles.activePill}
                onPress={() => setSelectedRegion(undefined)}
              >
                <Text style={styles.activePillText}>{selectedRegion} ✕</Text>
              </TouchableOpacity>
            )}
            {selectedLanguage !== undefined && (
              <TouchableOpacity
                style={styles.activePill}
                onPress={() => setSelectedLanguage(undefined)}
              >
                <Text style={styles.activePillText}>
                  Lang: {selectedLanguage} ✕
                </Text>
              </TouchableOpacity>
            )}
            {selectedRating !== undefined && (
              <TouchableOpacity
                style={styles.activePill}
                onPress={() => setSelectedRating(undefined)}
              >
                <Text style={styles.activePillText}>
                  ★ {selectedRating}+ ✕
                </Text>
              </TouchableOpacity>
            )}
            {sortBy !== 'popularity.desc' && (
              <TouchableOpacity
                style={styles.activePill}
                onPress={() => {
                  setSortBy('popularity.desc');
                  setDraftSortBy('popularity.desc');
                }}
              >
                <Text style={styles.activePillText}>
                  {sortBy === 'first_air_date.desc' || sortBy === 'primary_release_date.desc'
                    ? 'Newest First'
                    : sortBy === 'first_air_date.asc' || sortBy === 'primary_release_date.asc'
                    ? 'Oldest First'
                    : SORT_OPTIONS.find((s) => s.value === sortBy)?.label || 'Sorted'}{' '}
                  ✕
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.clearAllTextButton}
              onPress={() => {
                setSelectedGenreId(null);
                setSelectedYear(undefined);
                setSortBy('popularity.desc');
                setSelectedRegion(undefined);
                setSelectedLanguage(undefined);
                setSelectedRating(undefined);
              }}
            >
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Main Catalog Grid */}
      {loading && !refreshing ? (
        <View style={styles.loadingGrid}>
          {Array.from({ length: 9 }).map((_, i) => (
            <View key={i} style={[styles.cardWrapper, { width: COLUMN_WIDTH }]}>
              <Skeleton width="100%" aspectRatio={2 / 3} style={{ borderRadius: 12 }} />
              <Skeleton width="80%" height={14} style={{ marginTop: 8 }} />
              <Skeleton width="40%" height={12} style={{ marginTop: 4 }} />
            </View>
          ))}
        </View>
      ) : error ? (
        <ErrorView message={error} onRetry={() => fetchDiscover(1, false)} />
      ) : (
        <FlatList
          ref={flatListRef}
          data={items}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          numColumns={NUM_COLUMNS}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={(e) => {
            scrollOffsetRef.current = e.nativeEvent.contentOffset.y;
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <EmptyState
              title="No Titles Found"
              message="Try adjusting your filters in the side filter panel."
              actionLabel="Reset All Filters"
              onAction={() => {
                setSelectedGenreId(null);
                setSelectedYear(undefined);
                setSortBy('popularity.desc');
                setSelectedRegion(undefined);
                setSelectedLanguage(undefined);
                setSelectedRating(undefined);
              }}
            />
          }
          renderItem={({ item }) => (
            <View style={[styles.cardWrapper, { width: COLUMN_WIDTH }]}>
              <MovieCard
                movie={item}
                onPress={handleMoviePress}
                width={COLUMN_WIDTH}
              />
            </View>
          )}
        />
      )}

      {/*
        SIDE FILTER DRAWER MODAL (Matches Screenshot Layout)
      */}
      <Modal
        visible={drawerVisible}
        transparent
        animationType="none"
        onRequestClose={closeDrawer}
      >
        <View style={styles.modalRoot}>
          {/* Dimmed Backdrop */}
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: backdropAnim,
              },
            ]}
          >
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              onPress={closeDrawer}
              activeOpacity={1}
            />
          </Animated.View>

          {/* Slide-over Filter Panel */}
          <Animated.View
            style={[
              styles.drawerContainer,
              {
                width: DRAWER_WIDTH,
                transform: [{ translateX: drawerSlideAnim }],
                paddingTop: insets.top + 10,
                paddingBottom: insets.bottom + 12,
              },
            ]}
          >
            {/* Drawer Header */}
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Filter</Text>
              <TouchableOpacity
                onPress={closeDrawer}
                style={styles.closeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Filter Rows ScrollView */}
            <ScrollView
              style={styles.drawerScroll}
              contentContainerStyle={styles.drawerScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* 1. Year Row */}
              <View style={styles.filterSection}>
                <Text style={styles.sectionLabel}>Year</Text>
                <TouchableOpacity
                  style={styles.selectorCard}
                  onPress={() => setActivePicker('year')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.selectorValueText}>
                    {getSelectedYearLabel()}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              {/* 2. Genre Row */}
              <View style={styles.filterSection}>
                <Text style={styles.sectionLabel}>Genre</Text>
                <TouchableOpacity
                  style={styles.selectorCard}
                  onPress={() => setActivePicker('genre')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.selectorValueText} numberOfLines={1}>
                    {getSelectedGenreLabel()}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              {/* 3. Sort By Row */}
              <View style={styles.filterSection}>
                <Text style={styles.sectionLabel}>Sort By</Text>
                <TouchableOpacity
                  style={styles.selectorCard}
                  onPress={() => setActivePicker('sort')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.selectorValueText}>
                    {getSelectedSortLabel()}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              {/* 4. Region Row */}
              <View style={styles.filterSection}>
                <Text style={styles.sectionLabel}>Region</Text>
                <TouchableOpacity
                  style={styles.selectorCard}
                  onPress={() => setActivePicker('region')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.selectorValueText}>
                    {getSelectedRegionLabel()}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              {/* 5. Language Row */}
              <View style={styles.filterSection}>
                <Text style={styles.sectionLabel}>Language</Text>
                <TouchableOpacity
                  style={styles.selectorCard}
                  onPress={() => setActivePicker('language')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.selectorValueText}>
                    {getSelectedLanguageLabel()}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              {/* 6. Rating Row */}
              <View style={styles.filterSection}>
                <Text style={styles.sectionLabel}>Rating</Text>
                <TouchableOpacity
                  style={styles.selectorCard}
                  onPress={() => setActivePicker('rating')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.selectorValueText}>
                    {getSelectedRatingLabel()}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Bottom Action Controls: APPLY & RESET (Screenshot Layout) */}
            <View style={styles.drawerFooter}>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleApply}
                activeOpacity={0.85}
              >
                <Text style={styles.applyButtonText}>APPLY</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleReset}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Sub-Picker Option Selection Sheet */}
            {activePicker && (
              <View style={styles.pickerOverlay}>
                <View style={styles.pickerHeader}>
                  <Text style={styles.pickerTitle}>
                    Select{' '}
                    {activePicker.charAt(0).toUpperCase() + activePicker.slice(1)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setActivePicker(null)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.pickerList}>
                  {activePicker === 'year' &&
                    YEAR_OPTIONS.map((opt) => {
                      const isSelected = draftYear === opt.value;
                      return (
                        <TouchableOpacity
                          key={opt.label}
                          style={[
                            styles.pickerOption,
                            isSelected && styles.pickerOptionSelected,
                          ]}
                          onPress={() => {
                            setDraftYear(opt.value);
                            setActivePicker(null);
                          }}
                        >
                          <Text
                            style={[
                              styles.pickerOptionText,
                              isSelected && styles.pickerOptionTextSelected,
                            ]}
                          >
                            {opt.label}
                          </Text>
                          {isSelected && (
                            <Ionicons name="checkmark" size={18} color={colors.primary} />
                          )}
                        </TouchableOpacity>
                      );
                    })}

                  {activePicker === 'genre' && [
                    <TouchableOpacity
                      key="all-genres"
                      style={[
                        styles.pickerOption,
                        draftGenreId === null && styles.pickerOptionSelected,
                      ]}
                      onPress={() => {
                        setDraftGenreId(null);
                        setActivePicker(null);
                      }}
                    >
                      <Text
                        style={[
                          styles.pickerOptionText,
                          draftGenreId === null && styles.pickerOptionTextSelected,
                        ]}
                      >
                        All Genres
                      </Text>
                      {draftGenreId === null && (
                        <Ionicons name="checkmark" size={18} color={colors.primary} />
                      )}
                    </TouchableOpacity>,
                    ...genres.map((g) => {
                      const isSelected = draftGenreId === g.id;
                      return (
                        <TouchableOpacity
                          key={g.id}
                          style={[
                            styles.pickerOption,
                            isSelected && styles.pickerOptionSelected,
                          ]}
                          onPress={() => {
                            setDraftGenreId(g.id);
                            setActivePicker(null);
                          }}
                        >
                          <Text
                            style={[
                              styles.pickerOptionText,
                              isSelected && styles.pickerOptionTextSelected,
                            ]}
                          >
                            {g.name}
                          </Text>
                          {isSelected && (
                            <Ionicons name="checkmark" size={18} color={colors.primary} />
                          )}
                        </TouchableOpacity>
                      );
                    }),
                  ]}

                  {activePicker === 'sort' &&
                    SORT_OPTIONS.map((opt) => {
                      const isSelected =
                        draftSortBy === opt.value ||
                        ((opt.value === 'primary_release_date.desc' || opt.value === 'first_air_date.desc') &&
                          (draftSortBy === 'primary_release_date.desc' || draftSortBy === 'first_air_date.desc')) ||
                        ((opt.value === 'primary_release_date.asc' || opt.value === 'first_air_date.asc') &&
                          (draftSortBy === 'primary_release_date.asc' || draftSortBy === 'first_air_date.asc'));
                      return (
                        <TouchableOpacity
                          key={opt.value}
                          style={[
                            styles.pickerOption,
                            isSelected && styles.pickerOptionSelected,
                          ]}
                          onPress={() => {
                            const effectiveValue =
                              mediaType === 'tv' && opt.value.startsWith('primary_release_date')
                                ? opt.value.replace('primary_release_date', 'first_air_date')
                                : opt.value;
                            setDraftSortBy(effectiveValue);
                            setActivePicker(null);
                          }}
                        >
                          <Text
                            style={[
                              styles.pickerOptionText,
                              isSelected && styles.pickerOptionTextSelected,
                            ]}
                          >
                            {opt.label}
                          </Text>
                          {isSelected && (
                            <Ionicons name="checkmark" size={18} color={colors.primary} />
                          )}
                        </TouchableOpacity>
                      );
                    })}

                  {activePicker === 'region' &&
                    REGION_OPTIONS.map((opt) => {
                      const isSelected = draftRegion === opt.value;
                      return (
                        <TouchableOpacity
                          key={opt.label}
                          style={[
                            styles.pickerOption,
                            isSelected && styles.pickerOptionSelected,
                          ]}
                          onPress={() => {
                            setDraftRegion(opt.value);
                            setActivePicker(null);
                          }}
                        >
                          <Text
                            style={[
                              styles.pickerOptionText,
                              isSelected && styles.pickerOptionTextSelected,
                            ]}
                          >
                            {opt.label}
                          </Text>
                          {isSelected && (
                            <Ionicons name="checkmark" size={18} color={colors.primary} />
                          )}
                        </TouchableOpacity>
                      );
                    })}

                  {activePicker === 'language' &&
                    LANGUAGE_OPTIONS.map((opt) => {
                      const isSelected = draftLanguage === opt.value;
                      return (
                        <TouchableOpacity
                          key={opt.label}
                          style={[
                            styles.pickerOption,
                            isSelected && styles.pickerOptionSelected,
                          ]}
                          onPress={() => {
                            setDraftLanguage(opt.value);
                            setActivePicker(null);
                          }}
                        >
                          <Text
                            style={[
                              styles.pickerOptionText,
                              isSelected && styles.pickerOptionTextSelected,
                            ]}
                          >
                            {opt.label}
                          </Text>
                          {isSelected && (
                            <Ionicons name="checkmark" size={18} color={colors.primary} />
                          )}
                        </TouchableOpacity>
                      );
                    })}

                  {activePicker === 'rating' &&
                    RATING_OPTIONS.map((opt) => {
                      const isSelected = draftRating === opt.value;
                      return (
                        <TouchableOpacity
                          key={opt.label}
                          style={[
                            styles.pickerOption,
                            isSelected && styles.pickerOptionSelected,
                          ]}
                          onPress={() => {
                            setDraftRating(opt.value);
                            setActivePicker(null);
                          }}
                        >
                          <Text
                            style={[
                              styles.pickerOptionText,
                              isSelected && styles.pickerOptionTextSelected,
                            ]}
                          >
                            {opt.label}
                          </Text>
                          {isSelected && (
                            <Ionicons name="checkmark" size={18} color={colors.primary} />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                </ScrollView>
              </View>
            )}
          </Animated.View>
        </View>
      </Modal>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: fonts.extrabold,
    fontSize: 24,
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeTab: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: borderRadius.sm,
  },
  typeTabActive: {
    backgroundColor: colors.primary,
  },
  typeTabText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.textMuted,
  },
  typeTabTextActive: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.primaryLight,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    fontFamily: fonts.extrabold,
    fontSize: 9,
    color: '#FFFFFF',
  },
  activeFiltersBar: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  activeFiltersList: {
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activePill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 0.5,
    borderColor: colors.primary,
  },
  activePillText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.primaryLight,
  },
  clearAllTextButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  clearAllText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 110,
  },
  cardWrapper: {
    marginRight: spacing.md,
    marginBottom: spacing.md,
  },
  loadingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },

  /* Drawer & Modal Styles */
  modalRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlayDark,
  },
  drawerContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    backgroundColor: colors.modal,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    paddingHorizontal: spacing.lg,
    shadowColor: '#000000',
    shadowOffset: { width: -6, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 20,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  drawerTitle: {
    fontFamily: fonts.extrabold,
    fontSize: 22,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerScroll: {
    flex: 1,
  },
  drawerScrollContent: {
    paddingVertical: spacing.md,
  },
  filterSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.textPrimary,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  selectorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardElevated,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectorValueText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
    marginRight: 8,
  },
  drawerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  applyButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontFamily: fonts.extrabold,
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },
  resetButton: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },

  /* Sub-Picker Option Sheet (in Drawer) */
  pickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.modal,
    zIndex: 30,
    paddingHorizontal: spacing.lg,
    paddingTop: 40,
    paddingBottom: 20,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 10,
  },
  pickerTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  pickerList: {
    flex: 1,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pickerOptionSelected: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  pickerOptionText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  pickerOptionTextSelected: {
    fontFamily: fonts.bold,
    color: colors.primaryLight,
  },
});

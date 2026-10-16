/**
 * HeroFeature Component
 * Immersive Autoplay Carousel Hero matching the exact UI in the user's screenshot:
 * - Full bleed image extending all the way to the top behind the notification bar / status bar
 * - Top Header: Brand logo + bold title on left, white circular profile avatar on right
 * - 5-Second Autoplay carousel with smooth horizontal paging
 * - Centered bold movie title
 * - Centered star rating & release year metadata (★ 8.5 • 2024)
 * - 3-line centered synopsis / overview
 * - Pill-and-dot pagination indicators with active elongated capsule
 * - Touch & swipe enabled with timer reset
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MovieSummary } from '../api/types';
import { colors, fonts, spacing } from '../theme';
import { formatReleaseYear, getImageUrl } from '../utils';
import { CustomImage } from './CustomImage';
import { Skeleton } from './Skeleton';

interface HeroFeatureProps {
  movies: MovieSummary[];
  selectedIndex?: number;
  onSelectIndex?: (index: number) => void;
  onPressPlay?: (movie: MovieSummary) => void;
  onPressMovie: (movie: MovieSummary) => void;
  onPressNotifications?: () => void;
  onPressProfile?: () => void;
  loading?: boolean;
}

const HERO_HEIGHT = 530;
const AUTOPLAY_INTERVAL = 5000; // 5 seconds switch

export const HeroFeature: React.FC<HeroFeatureProps> = ({
  movies,
  selectedIndex = 0,
  onSelectIndex,
  onPressMovie,
  onPressProfile,
  loading = false,
}) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  // Limit carousel to top 7 trending movies
  const featuredMovies = movies.slice(0, 7);

  const [currentIndex, setCurrentIndex] = useState(selectedIndex);
  const currentIndexRef = useRef(selectedIndex);
  const flatListRef = useRef<FlatList<MovieSummary>>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync external index changes if any
  useEffect(() => {
    if (
      selectedIndex !== currentIndexRef.current &&
      selectedIndex >= 0 &&
      selectedIndex < featuredMovies.length
    ) {
      currentIndexRef.current = selectedIndex;
      setCurrentIndex(selectedIndex);
      flatListRef.current?.scrollToIndex({
        index: selectedIndex,
        animated: true,
      });
    }
  }, [selectedIndex, featuredMovies.length]);

  // 5-second autoplay loop
  const startAutoplay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (featuredMovies.length <= 1) return;

    timerRef.current = setInterval(() => {
      if (featuredMovies.length <= 1) return;
      const nextIndex = (currentIndexRef.current + 1) % featuredMovies.length;
      currentIndexRef.current = nextIndex;
      setCurrentIndex(nextIndex);
      if (onSelectIndex) {
        onSelectIndex(nextIndex);
      }
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, AUTOPLAY_INTERVAL);
  }, [featuredMovies.length, onSelectIndex]);

  useEffect(() => {
    startAutoplay();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startAutoplay]);

  const onScrollBeginDrag = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / width);
    if (
      newIndex >= 0 &&
      newIndex < featuredMovies.length &&
      newIndex !== currentIndexRef.current
    ) {
      currentIndexRef.current = newIndex;
      setCurrentIndex(newIndex);
      if (onSelectIndex) {
        onSelectIndex(newIndex);
      }
    }
    startAutoplay();
  };

  const handleDotPress = (index: number) => {
    currentIndexRef.current = index;
    setCurrentIndex(index);
    if (onSelectIndex) {
      onSelectIndex(index);
    }
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
    });
    startAutoplay();
  };

  if (loading || featuredMovies.length === 0) {
    return (
      <View style={[styles.skeletonContainer, { height: HERO_HEIGHT }]}>
        <Skeleton width="100%" height={HERO_HEIGHT} />
      </View>
    );
  }

  const activeMovie = featuredMovies[currentIndex] || featuredMovies[0];
  const ratingText =
    activeMovie.vote_average && activeMovie.vote_average > 0
      ? activeMovie.vote_average.toFixed(1)
      : 'N/A';
  const releaseYear = formatReleaseYear(activeMovie.release_date);

  return (
    <View style={[styles.container, { height: HERO_HEIGHT }]}>
      {/*
        Horizontal Paging Carousel:
        Extends full bleed to top: 0 behind the mobile status/notification bar
      */}
      <FlatList
        ref={flatListRef}
        data={featuredMovies}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        onScrollBeginDrag={onScrollBeginDrag}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({
              index: info.index,
              animated: true,
            });
          }, 100);
        }}
        renderItem={({ item }) => {
          const imageUri = getImageUrl(
            item.backdrop_path || item.poster_path,
            'w1280'
          );
          return (
            <TouchableOpacity
              style={[styles.slideItem, { width, height: HERO_HEIGHT }]}
              onPress={() => onPressMovie(item)}
              activeOpacity={0.95}
            >
              <CustomImage
                uri={imageUri}
                fallbackTitle={item.title}
                aspectRatio={width / HERO_HEIGHT}
                style={styles.slideImage}
              />
            </TouchableOpacity>
          );
        }}
      />

      {/* Top Gradient Scrim for status bar and header visibility */}
      <LinearGradient
        colors={[
          'rgba(0, 0, 0, 0.75)',
          'rgba(0, 0, 0, 0.35)',
          'transparent',
        ]}
        locations={[0, 0.45, 1]}
        style={[styles.topGradient, { height: Math.max(insets.top + 70, 110) }]}
        pointerEvents="none"
      />

      {/* Bottom Gradient Scrim for text legibility and smooth page blend */}
      <LinearGradient
        colors={[
          'transparent',
          'rgba(11, 13, 20, 0.3)',
          'rgba(11, 13, 20, 0.75)',
          'rgba(11, 13, 20, 0.95)',
          '#0B0D14',
        ]}
        locations={[0, 0.3, 0.62, 0.85, 1.0]}
        style={styles.bottomGradient}
        pointerEvents="none"
      />

      {/*
        Top Floating Header:
        Left: Brand logo & name | Right: White circular profile button
        Padded to clear the phone's notification bar / camera notch cleanly
      */}
      <View
        style={[
          styles.topHeader,
          { paddingTop: Math.max(insets.top + 4, 16) },
        ]}
      >
        <View style={styles.brandContainer}>
          <Image
            source={require('../../assets/icons/logo-square.png')}
            style={styles.brandLogo}
            resizeMode="contain"
          />
          <Text style={styles.brandTitle}>CineScope</Text>
        </View>

        <TouchableOpacity
          style={styles.profileButton}
          onPress={onPressProfile}
          activeOpacity={0.8}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="person" size={20} color="#161924" />
        </TouchableOpacity>
      </View>

      {/*
        Active Movie Metadata Overlay (Centered UI as in screenshot):
        - Bold Movie Title
        - Star Rating + Year
        - 3-line overview synopsis
        - Pagination dots with elongated active pill
      */}
      <View style={styles.bottomOverlay}>
        <TouchableOpacity
          onPress={() => onPressMovie(activeMovie)}
          activeOpacity={0.9}
          style={styles.titleWrapper}
        >
          <Text style={styles.movieTitle} numberOfLines={2}>
            {activeMovie.title}
          </Text>
        </TouchableOpacity>

        {/* Metadata row: ★ Rating • Year */}
        <View style={styles.metadataRow}>
          <Ionicons
            name="star"
            size={13}
            color="#FFB800"
            style={{ marginRight: 4 }}
          />
          <Text style={styles.ratingText}>{ratingText}</Text>
          <Text style={styles.metaBullet}>•</Text>
          <Text style={styles.yearText}>{releaseYear}</Text>
        </View>

        {/* 3-line Overview Synopsis */}
        {!!activeMovie.overview && (
          <TouchableOpacity
            onPress={() => onPressMovie(activeMovie)}
            activeOpacity={0.9}
          >
            <Text
              style={styles.overviewText}
              numberOfLines={3}
              ellipsizeMode="tail"
            >
              {activeMovie.overview}
            </Text>
          </TouchableOpacity>
        )}

        {/* Centered Pagination Dots */}
        <View style={styles.paginationRow}>
          {featuredMovies.map((_, index) => {
            const isActive = index === currentIndex;
            return (
              <TouchableOpacity
                key={`dot-${index}`}
                onPress={() => handleDotPress(index)}
                hitSlop={{ top: 12, bottom: 12, left: 6, right: 6 }}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.dot,
                    isActive ? styles.dotActive : styles.dotInactive,
                  ]}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    backgroundColor: '#0B0D14',
    overflow: 'hidden',
  },
  skeletonContainer: {
    width: '100%',
    backgroundColor: colors.card,
  },
  slideItem: {
    position: 'relative',
    overflow: 'hidden',
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 320,
    zIndex: 2,
  },
  topHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    zIndex: 10,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  brandTitle: {
    fontFamily: fonts.extrabold,
    fontSize: 22,
    color: '#FFFFFF',
    letterSpacing: -0.4,
    marginLeft: 8,
  },
  profileButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 4,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    zIndex: 5,
  },
  titleWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  movieTitle: {
    fontFamily: fonts.extrabold,
    fontSize: 24,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  metaBullet: {
    fontSize: 13,
    color: '#8E8D9A',
    marginHorizontal: 8,
  },
  yearText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: '#9E9DA8',
  },
  overviewText: {
    fontFamily: fonts.regular,
    fontSize: 12.5,
    color: '#C5C5CE',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    height: 5,
    borderRadius: 2.5,
  },
  dotActive: {
    width: 22,
    backgroundColor: '#FFFFFF',
  },
  dotInactive: {
    width: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
});

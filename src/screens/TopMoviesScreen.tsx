/**
 * TopMoviesScreen
 * Displays the full "Top 10 Movies This Week" 2-column grid matching Screen 3:
 * - Header with back arrow and bold title
 * - 2-column grid of movie cards with authentic IMDb rating badges
 */

import React, { useEffect, useState } from 'react';
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MovieSummary } from '../api/types';
import { tmdbService } from '../api/tmdb';
import { ErrorView } from '../components/ErrorView';
import { MovieCard } from '../components/MovieCard';
import { Skeleton } from '../components/Skeleton';
import { colors, fonts, spacing } from '../theme';

interface TopMoviesScreenProps {
  navigation: any;
}

export const TopMoviesScreen: React.FC<TopMoviesScreenProps> = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const [movies, setMovies] = useState<MovieSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopMovies = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await tmdbService.getTrendingMovies('week');
      setMovies(res.results.slice(0, 10));
    } catch (err: any) {
      setError('Unable to load top movies this week.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopMovies();
  }, []);

  const cardWidth = (width - spacing.lg * 2 - spacing.md) / 2;

  const handleMoviePress = (movie: MovieSummary) => {
    navigation.navigate('MovieDetail', { movieId: movie.id });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Top 10 Movies This Week</Text>
      </View>

      {loading ? (
        <View style={styles.gridContainer}>
          {[...Array(6)].map((_, i) => (
            <View key={i} style={[styles.cardItem, { width: cardWidth }]}>
              <Skeleton width="100%" aspectRatio={2 / 3} style={{ borderRadius: 14 }} />
              <Skeleton width="80%" height={14} style={{ marginTop: 8 }} />
            </View>
          ))}
        </View>
      ) : error ? (
        <ErrorView message={error} onRetry={fetchTopMovies} />
      ) : (
        <FlatList
          data={movies}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.cardItem}>
              <MovieCard
                movie={item}
                onPress={handleMoviePress}
                width={cardWidth}
                imdbBadge={true}
                showTitle={true}
              />
            </View>
          )}
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
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: spacing.sm,
    padding: spacing.xs,
  },
  headerTitle: {
    fontFamily: fonts.extrabold,
    fontSize: 20,
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  cardItem: {
    marginBottom: spacing.md,
  },
});

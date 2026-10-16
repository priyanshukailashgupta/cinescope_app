/**
 * MovieRail Component
 * Reusable horizontal scrolling feed for movie categories (Now Playing, Popular, etc.).
 * Styled with Urbanist typography.
 */

import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MovieSummary } from '../api/types';
import { colors, fonts, spacing } from '../theme';
import { ErrorView } from './ErrorView';
import { MovieCard } from './MovieCard';
import { Skeleton } from './Skeleton';

interface MovieRailProps {
  title: string;
  subtitle?: string;
  movies: MovieSummary[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onMoviePress: (movie: MovieSummary) => void;
  onSeeAllPress?: () => void;
  cardWidth?: number;
}

export const MovieRail: React.FC<MovieRailProps> = ({
  title,
  subtitle,
  movies,
  loading = false,
  error = null,
  onRetry,
  onMoviePress,
  onSeeAllPress,
  cardWidth = 130,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {onSeeAllPress && (
          <TouchableOpacity onPress={onSeeAllPress} activeOpacity={0.75}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.skeletonContainer}>
          {[1, 2, 3, 4].map((key) => (
            <View key={key} style={[styles.skeletonItem, { width: cardWidth }]}>
              <Skeleton width={cardWidth} aspectRatio={2 / 3} />
              <Skeleton width="85%" height={14} style={{ marginTop: 8 }} />
              <Skeleton width="50%" height={12} style={{ marginTop: 4 }} />
            </View>
          ))}
        </View>
      ) : error ? (
        <ErrorView message={error} onRetry={onRetry} compact />
      ) : movies.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No movies available at this time.</Text>
        </View>
      ) : (
        <FlatList
          horizontal
          data={movies}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <MovieCard movie={item} onPress={onMoviePress} width={cardWidth} />
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          initialNumToRender={4}
          maxToRenderPerBatch={6}
          windowSize={5}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  seeAllText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.primary,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
  },
  skeletonContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
  },
  skeletonItem: {
    marginRight: spacing.md,
  },
  emptyContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  emptyText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
  },
});

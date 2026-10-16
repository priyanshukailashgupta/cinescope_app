/**
 * MovieCard Component
 * Responsive, clean 2:3 movie poster card adhering strictly to the Style Guide:
 * - Urbanist typography
 * - Ionicons star rating badge
 * - #3B82F6 accent highlights
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MovieSummary } from '../api/types';
import { borderRadius, colors, fonts, spacing } from '../theme';
import { formatRating, formatReleaseYear, getImageUrl } from '../utils';
import { CustomImage } from './CustomImage';

interface MovieCardProps {
  movie: MovieSummary;
  onPress: (movie: MovieSummary) => void;
  width?: number;
  showTitle?: boolean;
  imdbBadge?: boolean;
  style?: any;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onPress,
  width = 134,
  showTitle = true,
  imdbBadge = true,
  style,
}) => {
  const posterUri = getImageUrl(movie.poster_path, 'w342');
  const rating = formatRating(movie.vote_average);
  const releaseYear = formatReleaseYear(movie.release_date);

  return (
    <TouchableOpacity
      style={[styles.card, { width }, style]}
      onPress={() => onPress(movie)}
      activeOpacity={0.8}
    >
      <View style={styles.posterContainer}>
        <CustomImage
          uri={posterUri}
          fallbackTitle={movie.title}
          aspectRatio={2 / 3}
          style={styles.poster}
        />
        {rating !== 'NR' && (
          imdbBadge ? (
            <View style={styles.imdbBadgeContainer}>
              <View style={styles.imdbTag}>
                <Text style={styles.imdbTagText}>IMDb</Text>
              </View>
              <Text style={styles.imdbRatingText}>{rating}</Text>
            </View>
          ) : (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={10} color={colors.rating} style={styles.ratingStar} />
              <Text style={styles.ratingText}>{rating}</Text>
            </View>
          )
        )}
      </View>
      {showTitle && (
        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {movie.title}
          </Text>
          <Text style={styles.year}>{releaseYear}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginRight: spacing.md,
  },
  posterContainer: {
    position: 'relative',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  poster: {
    width: '100%',
  },
  imdbBadgeContainer: {
    position: 'absolute',
    top: 7,
    left: 7,
    backgroundColor: 'rgba(11, 13, 20, 0.78)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  imdbTag: {
    backgroundColor: '#F5C518',
    paddingHorizontal: 3.5,
    paddingVertical: 1,
    borderRadius: 2,
    marginRight: 4,
  },
  imdbTagText: {
    fontFamily: fonts.extrabold,
    color: '#000000',
    fontSize: 9,
    letterSpacing: 0.2,
  },
  imdbRatingText: {
    fontFamily: fonts.bold,
    color: '#FFFFFF',
    fontSize: 11,
  },
  ratingBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: 'rgba(11, 13, 20, 0.88)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    borderWidth: 0.5,
    borderColor: colors.borderLight,
  },
  ratingStar: {
    marginRight: 3,
  },
  ratingText: {
    fontFamily: fonts.bold,
    color: colors.textPrimary,
    fontSize: 11,
  },
  infoContainer: {
    paddingTop: spacing.xs,
  },
  title: {
    fontFamily: fonts.semibold,
    color: colors.textPrimary,
    fontSize: 13,
    lineHeight: 18,
  },
  year: {
    fontFamily: fonts.medium,
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
});

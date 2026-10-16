/**
 * CustomImage Component
 * - Uses TMDB image paths with fallback handling
 * - Clean placeholder container with Ionicons film reel
 * - Respects aspect ratios (2:3 for posters, 16:9 for backdrops)
 */

import React, { useState } from 'react';
import { ActivityIndicator, Image, ImageProps, ImageStyle, StyleProp, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, fonts } from '../theme';

interface CustomImageProps extends Omit<ImageProps, 'source'> {
  uri: string | null | undefined;
  fallbackTitle?: string;
  style?: StyleProp<ImageStyle>;
  aspectRatio?: number;
}

export const CustomImage: React.FC<CustomImageProps> = ({
  uri,
  fallbackTitle,
  style,
  aspectRatio = 2 / 3,
  ...rest
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const showFallback = !uri || error;

  if (showFallback) {
    return (
      <View style={[styles.fallbackContainer, { aspectRatio }, style]}>
        <View style={styles.filmIconContainer}>
          <Ionicons name="film-outline" size={24} color={colors.primary} />
        </View>
        {fallbackTitle ? (
          <Text style={styles.fallbackTitle} numberOfLines={2} ellipsizeMode="tail">
            {fallbackTitle}
          </Text>
        ) : (
          <Text style={styles.fallbackSubtitle}>No Image Available</Text>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.imageWrapper, { aspectRatio }, style]}>
      <Image
        {...rest}
        source={{ uri }}
        style={[StyleSheet.absoluteFill, styles.image]}
        resizeMode="cover"
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
      />
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  imageWrapper: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackContainer: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  filmIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.badgeBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  fallbackTitle: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 16,
  },
  fallbackSubtitle: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
});

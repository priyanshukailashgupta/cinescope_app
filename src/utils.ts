/**
 * CineScope Utilities
 * Consolidated helper functions for image URL construction and text formatting.
 */

import { Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export type ImageSize = 'w185' | 'w342' | 'w500' | 'w780' | 'w1280' | 'original';

/**
 * Builds a valid TMDB CDN image URL with the requested resolution size.
 */
export function getImageUrl(
  path: string | null | undefined,
  size: ImageSize = 'w500'
): string | null {
  if (!path || typeof path !== 'string' || path.trim() === '') {
    return null;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const baseUrl = process.env.EXPO_PUBLIC_TMDB_IMAGE_BASE_URL || DEFAULT_IMAGE_BASE_URL;
  return `${baseUrl}/${size}${cleanPath}`;
}

/**
 * Formats minute durations into human-readable format: 142 -> "2h 22m"
 */
export function formatRuntime(minutes?: number | null): string {
  if (!minutes || minutes <= 0) return 'N/A';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `${remainingMinutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Extracts the 4-digit release year from an ISO date string: "2024-05-18" -> "2024"
 */
export function formatReleaseYear(dateStr?: string | null): string {
  if (!dateStr || typeof dateStr !== 'string') return 'TBA';
  const year = dateStr.split('-')[0];
  return year && year.length === 4 ? year : 'TBA';
}

/**
 * Formats TMDB 10-point vote averages to 1 decimal place: 7.842 -> "7.8"
 */
export function formatRating(voteAverage?: number | null): string {
  if (voteAverage === undefined || voteAverage === null || isNaN(voteAverage) || voteAverage === 0) {
    return 'NR';
  }
  return voteAverage.toFixed(1);
}

/**
 * Formats box office budget/revenue numbers into currency strings: 150000000 -> "$150,000,000"
 */
export function formatCurrency(amount?: number | null): string {
  if (!amount || amount <= 0) return 'N/A';
  return `$${amount.toLocaleString('en-US')}`;
}

const TMDB_GENRE_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

export function getGenreName(genreId?: number): string {
  if (!genreId) return 'Cinema';
  return TMDB_GENRE_MAP[genreId] || 'Cinema';
}

/**
 * Launches official YouTube trailer according to the user's discovery preference
 * ('app' for native YouTube app protocol, 'web' for mobile web player).
 */
export async function openTrailer(trailerKey?: string | null): Promise<void> {
  if (!trailerKey) return;
  try {
    const preference = await AsyncStorage.getItem('@cinescope/trailer_launcher');
    if (preference === 'web') {
      // Direct Web Player
      await Linking.openURL(`https://m.youtube.com/watch?v=${trailerKey}`);
    } else {
      // Default: Native YouTube App via deep link, fallback to web
      const appUrl = `vnd.youtube:${trailerKey}`;
      const canOpen = await Linking.canOpenURL(appUrl);
      if (canOpen) {
        await Linking.openURL(appUrl);
      } else {
        await Linking.openURL(`https://www.youtube.com/watch?v=${trailerKey}`);
      }
    }
  } catch {
    await Linking.openURL(`https://www.youtube.com/watch?v=${trailerKey}`);
  }
}



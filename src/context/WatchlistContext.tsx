/**
 * WatchlistContext
 * Manages device-persisted user favorites/watchlist via AsyncStorage.
 * Normalized Record<number, WatchlistItem> ensures O(1) membership checks on detail screens.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MovieSummary } from '../api/types';

const STORAGE_KEY = '@cinescope/watchlist_v1';

export interface WatchlistItem {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date: string;
  addedAt: number;
  media_type?: 'movie' | 'tv';
}

interface WatchlistContextType {
  watchlist: Record<number, WatchlistItem>;
  isMovieInWatchlist: (movieId: number) => boolean;
  addToWatchlist: (movie: MovieSummary) => Promise<void>;
  removeFromWatchlist: (movieId: number) => Promise<void>;
  toggleWatchlist: (movie: MovieSummary) => Promise<void>;
  clearWatchlist: () => Promise<void>;
  getWatchlistArray: () => WatchlistItem[];
  loading: boolean;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export const WatchlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [watchlist, setWatchlist] = useState<Record<number, WatchlistItem>>({});
  const [loading, setLoading] = useState<boolean>(true);

  // Load persisted favorites on app boot
  useEffect(() => {
    const loadStoredWatchlist = async () => {
      try {
        const storedJson = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedJson) {
          const parsed = JSON.parse(storedJson);
          if (parsed && typeof parsed === 'object') {
            setWatchlist(parsed);
          }
        }
      } catch (err) {
        console.warn('Failed to load watchlist from local storage:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStoredWatchlist();
  }, []);

  // Save changes to AsyncStorage
  const persistState = async (updated: Record<number, WatchlistItem>) => {
    setWatchlist(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to persist watchlist to local storage:', err);
    }
  };

  const isMovieInWatchlist = (movieId: number): boolean => {
    return Boolean(watchlist[movieId]);
  };

  const addToWatchlist = async (movie: MovieSummary) => {
    const item: WatchlistItem = {
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      vote_average: movie.vote_average,
      release_date: movie.release_date,
      addedAt: Date.now(),
      media_type: movie.media_type || 'movie',
    };

    const updated = {
      ...watchlist,
      [movie.id]: item,
    };
    await persistState(updated);
  };

  const removeFromWatchlist = async (movieId: number) => {
    const updated = { ...watchlist };
    delete updated[movieId];
    await persistState(updated);
  };

  const toggleWatchlist = async (movie: MovieSummary) => {
    if (isMovieInWatchlist(movie.id)) {
      await removeFromWatchlist(movie.id);
    } else {
      await addToWatchlist(movie);
    }
  };

  const clearWatchlist = async () => {
    await persistState({});
  };

  const getWatchlistArray = (): WatchlistItem[] => {
    return Object.values(watchlist).sort((a, b) => b.addedAt - a.addedAt);
  };

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        isMovieInWatchlist,
        addToWatchlist,
        removeFromWatchlist,
        toggleWatchlist,
        clearWatchlist,
        getWatchlistArray,
        loading,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = (): WatchlistContextType => {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
};

/**
 * Centralized Axios API Client
 * - Request interceptor: Injects Bearer token or api_key param
 * - Timeout guard: 10,000ms
 * - Response interceptor: Normalizes error messages
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const DEFAULT_BASE_URL = 'https://api.themoviedb.org/3';

export const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_TMDB_API_BASE_URL || DEFAULT_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

import AsyncStorage from '@react-native-async-storage/async-storage';

let includeAdultPreference = false;

// Initialize from storage on app start
AsyncStorage.getItem('@cinescope/include_adult').then((val) => {
  includeAdultPreference = val === 'true';
});

export function setGlobalAdultPreference(val: boolean) {
  includeAdultPreference = val;
}

// Request Interceptor: Attach credentials and global preferences
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const bearerToken = process.env.EXPO_PUBLIC_TMDB_ACCESS_TOKEN;
    const apiKey = process.env.EXPO_PUBLIC_TMDB_API_KEY;

    // Favor v4 Read Access Bearer Token if available
    if (bearerToken && bearerToken !== 'YOUR_TMDB_V4_READ_ACCESS_TOKEN_HERE') {
      config.headers.Authorization = `Bearer ${bearerToken}`;
    } else if (apiKey && apiKey !== 'YOUR_TMDB_V3_API_KEY_HERE') {
      config.params = {
        ...config.params,
        api_key: apiKey,
      };
    }

    // Automatically apply user's adult content discovery preference
    if (config.params && 'include_adult' in config.params) {
      config.params.include_adult = includeAdultPreference;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Normalize errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ status_message?: string; status_code?: number }>) => {
    let normalizedMessage = 'An unexpected error occurred while fetching movie data.';

    if (error.response) {
      const status = error.response.status;
      const apiMessage = error.response.data?.status_message;

      if (status === 401) {
        normalizedMessage = 'Invalid TMDB API credentials. Please verify your .env file.';
      } else if (status === 404) {
        normalizedMessage = 'The requested movie or talent could not be found.';
      } else if (status === 429) {
        normalizedMessage = 'TMDB rate limit reached. Please wait a moment and try again.';
      } else if (status >= 500) {
        normalizedMessage = 'TMDB service is temporarily experiencing issues. Please retry.';
      } else if (apiMessage) {
        normalizedMessage = apiMessage;
      }
    } else if (error.code === 'ECONNABORTED') {
      normalizedMessage = 'Network request timed out. Please check your internet connection.';
    } else if (error.message === 'Network Error') {
      normalizedMessage = 'Unable to reach TMDB API. If you are on Jio/Airtel in India, please set your phone Private DNS to dns.google to bypass the ISP block.';
    }

    const enhancedError = new Error(normalizedMessage);
    (enhancedError as any).status = error.response?.status;
    (enhancedError as any).originalError = error;

    return Promise.reject(enhancedError);
  }
);

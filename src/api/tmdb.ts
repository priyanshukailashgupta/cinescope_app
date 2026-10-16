/**
 * TMDB API v3 Service Layer
 * Clean, strongly-typed integration for all 20 verified TMDB endpoints.
 */

import { apiClient } from './client';
import {
  DiscoverFilterParams,
  GenresResponse,
  MovieDetails,
  MovieCreditsResponse,
  MovieImagesResponse,
  MovieKeywordsResponse,
  MovieSummary,
  MovieVideosResponse,
  MultiSearchResultItem,
  PaginatedResponse,
  PersonDetails,
  PersonMovieCreditsResponse,
  PersonSummary,
  ReleaseDatesResponse,
  ReviewItem,
} from './types';

export const tmdbService = {
  // 1. Trending Movies (Hero Carousel)
  getTrendingMovies: async (timeWindow: 'day' | 'week' = 'day'): Promise<PaginatedResponse<MovieSummary>> => {
    const response = await apiClient.get<PaginatedResponse<MovieSummary>>(`/trending/movie/${timeWindow}`);
    return response.data;
  },

  // 2. Now Playing (Theatrical Rail)
  getNowPlayingMovies: async (page = 1): Promise<PaginatedResponse<MovieSummary>> => {
    const response = await apiClient.get<PaginatedResponse<MovieSummary>>('/movie/now_playing', {
      params: { page },
    });
    return response.data;
  },

  // 3. Popular Movies Rail
  getPopularMovies: async (page = 1): Promise<PaginatedResponse<MovieSummary>> => {
    const response = await apiClient.get<PaginatedResponse<MovieSummary>>('/movie/popular', {
      params: { page },
    });
    return response.data;
  },

  // 4. Top Rated Rail
  getTopRatedMovies: async (page = 1): Promise<PaginatedResponse<MovieSummary>> => {
    const response = await apiClient.get<PaginatedResponse<MovieSummary>>('/movie/top_rated', {
      params: { page },
    });
    return response.data;
  },

  // 5. Upcoming Releases Rail
  getUpcomingMovies: async (page = 1): Promise<PaginatedResponse<MovieSummary>> => {
    const response = await apiClient.get<PaginatedResponse<MovieSummary>>('/movie/upcoming', {
      params: { page },
    });
    return response.data;
  },

  // 6. Movie Genres (Filter Chips)
  getMovieGenres: async (): Promise<GenresResponse> => {
    const response = await apiClient.get<GenresResponse>('/genre/movie/list');
    return response.data;
  },

  // 6b. TV Genres (Filter Chips)
  getTvGenres: async (): Promise<GenresResponse> => {
    const response = await apiClient.get<GenresResponse>('/genre/tv/list');
    return response.data;
  },

  // 7. Discover Movies (Dynamic Filter Grid: Genre, Rating, Year, Sorting, Region, Language)
  discoverMovies: async (params: DiscoverFilterParams): Promise<PaginatedResponse<MovieSummary>> => {
    const today = new Date().toISOString().split('T')[0];
    const isNewestFirst = params.sort_by === 'primary_release_date.desc';
    const response = await apiClient.get<PaginatedResponse<MovieSummary>>('/discover/movie', {
      params: {
        include_adult: false,
        sort_by: params.sort_by || 'popularity.desc',
        with_genres: params.with_genres,
        page: params.page || 1,
        'vote_average.gte': params['vote_average.gte'],
        primary_release_year: params.primary_release_year,
        with_origin_country: params.with_origin_country,
        with_original_language: params.with_original_language,
        'primary_release_date.lte': params['primary_release_date.lte'] || (isNewestFirst ? today : undefined),
        'primary_release_date.gte': params['primary_release_date.gte'],
        'vote_count.gte': params['vote_count.gte'] || (isNewestFirst ? 5 : undefined),
      },
    });
    return response.data;
  },

  // 7b. Discover TV Shows (Dynamic Filter Grid: Genre, Rating, Year, Sorting, Region, Language)
  discoverTv: async (params: DiscoverFilterParams): Promise<PaginatedResponse<MovieSummary>> => {
    const today = new Date().toISOString().split('T')[0];
    const isNewestFirst =
      params.sort_by === 'first_air_date.desc' || params.sort_by === 'primary_release_date.desc';
    const effectiveSortBy = isNewestFirst ? 'first_air_date.desc' : (params.sort_by || 'popularity.desc');

    const response = await apiClient.get<PaginatedResponse<any>>('/discover/tv', {
      params: {
        include_adult: false,
        sort_by: effectiveSortBy,
        with_genres: params.with_genres,
        page: params.page || 1,
        'vote_average.gte': params['vote_average.gte'],
        first_air_date_year: params.first_air_date_year,
        with_origin_country: params.with_origin_country,
        with_original_language: params.with_original_language,
        'first_air_date.lte': params['first_air_date.lte'] || (isNewestFirst ? today : undefined),
        'first_air_date.gte': params['first_air_date.gte'],
        'vote_count.gte': params['vote_count.gte'] || (isNewestFirst ? 5 : undefined),
        include_null_first_air_dates: false,
      },
    });
    // Normalize TV show results (name -> title, first_air_date -> release_date)
    const normalizedResults: MovieSummary[] = (response.data.results || []).map((tv: any) => ({
      id: tv.id,
      title: tv.name || tv.original_name || 'Untitled Show',
      overview: tv.overview || '',
      poster_path: tv.poster_path,
      backdrop_path: tv.backdrop_path,
      release_date: tv.first_air_date || '',
      vote_average: tv.vote_average || 0,
      vote_count: tv.vote_count || 0,
      popularity: tv.popularity || 0,
      genre_ids: tv.genre_ids || [],
      media_type: 'tv',
    }));

    return {
      ...response.data,
      results: normalizedResults,
    };
  },

  // 7c. Recent TV Shows (Authentic Newly Premiered Series)
  getRecentTv: async (page = 1): Promise<PaginatedResponse<MovieSummary>> => {
    const today = new Date().toISOString().split('T')[0];
    // Past 18 months boundary to capture fresh TV premieres
    const eighteenMonthsAgo = new Date(Date.now() - 540 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const response = await apiClient.get<PaginatedResponse<any>>('/discover/tv', {
      params: {
        page,
        sort_by: 'first_air_date.desc',
        'first_air_date.lte': today,
        'first_air_date.gte': eighteenMonthsAgo,
        'vote_count.gte': 6,
        include_null_first_air_dates: false,
      },
    });
    const normalizedResults: MovieSummary[] = (response.data.results || []).map((tv: any) => ({
      id: tv.id,
      title: tv.name || tv.original_name || 'Untitled Show',
      overview: tv.overview || '',
      poster_path: tv.poster_path,
      backdrop_path: tv.backdrop_path,
      release_date: tv.first_air_date || '',
      vote_average: tv.vote_average || 0,
      vote_count: tv.vote_count || 0,
      popularity: tv.popularity || 0,
      genre_ids: tv.genre_ids || [],
      media_type: 'tv',
    }));
    return {
      ...response.data,
      results: normalizedResults,
    };
  },

  // 7d. Popular TV Shows
  getPopularTv: async (page = 1): Promise<PaginatedResponse<MovieSummary>> => {
    const response = await apiClient.get<PaginatedResponse<any>>('/tv/popular', {
      params: { page },
    });
    const normalizedResults: MovieSummary[] = (response.data.results || []).map((tv: any) => ({
      id: tv.id,
      title: tv.name || tv.original_name || 'Untitled Show',
      overview: tv.overview || '',
      poster_path: tv.poster_path,
      backdrop_path: tv.backdrop_path,
      release_date: tv.first_air_date || '',
      vote_average: tv.vote_average || 0,
      vote_count: tv.vote_count || 0,
      popularity: tv.popularity || 0,
      genre_ids: tv.genre_ids || [],
      media_type: 'tv',
    }));
    return {
      ...response.data,
      results: normalizedResults,
    };
  },

  // 8. Search Multi (/search/multi: Movies, TV Shows, and Actors)
  searchMulti: async (query: string, page = 1, signal?: AbortSignal): Promise<PaginatedResponse<MultiSearchResultItem>> => {
    const response = await apiClient.get<PaginatedResponse<MultiSearchResultItem>>('/search/multi', {
      params: {
        query,
        page,
        include_adult: false,
      },
      signal,
    });
    return response.data;
  },

  // 8b. Search Movies (Debounced Query)
  searchMovies: async (query: string, page = 1, signal?: AbortSignal): Promise<PaginatedResponse<MovieSummary>> => {
    const response = await apiClient.get<PaginatedResponse<MovieSummary>>('/search/movie', {
      params: {
        query,
        page,
        include_adult: false,
      },
      signal,
    });
    return response.data;
  },

  // 9. Search People (Talent Search)
  searchPeople: async (query: string, page = 1, signal?: AbortSignal): Promise<PaginatedResponse<PersonSummary>> => {
    const response = await apiClient.get<PaginatedResponse<PersonSummary>>('/search/person', {
      params: {
        query,
        page,
        include_adult: false,
      },
      signal,
    });
    return response.data;
  },

  // 10. Movie Details (Core Dossier)
  getMovieDetails: async (movieId: number): Promise<MovieDetails> => {
    const response = await apiClient.get<MovieDetails>(`/movie/${movieId}`);
    return response.data;
  },

  // 11. Movie Credits (Cast & Crew)
  getMovieCredits: async (movieId: number): Promise<MovieCreditsResponse> => {
    const response = await apiClient.get<MovieCreditsResponse>(`/movie/${movieId}/credits`);
    return response.data;
  },

  // 12. Movie Videos (YouTube Trailers)
  getMovieVideos: async (movieId: number): Promise<MovieVideosResponse> => {
    const response = await apiClient.get<MovieVideosResponse>(`/movie/${movieId}/videos`);
    return response.data;
  },

  // 13. Movie Release Dates & Certifications (PG-13, R)
  getMovieReleaseDates: async (movieId: number): Promise<ReleaseDatesResponse> => {
    const response = await apiClient.get<ReleaseDatesResponse>(`/movie/${movieId}/release_dates`);
    return response.data;
  },

  // 14. Movie Reviews (Community Critiques)
  getMovieReviews: async (movieId: number, page = 1): Promise<PaginatedResponse<ReviewItem>> => {
    const response = await apiClient.get<PaginatedResponse<ReviewItem>>(`/movie/${movieId}/reviews`, {
      params: { page },
    });
    return response.data;
  },

  // 15. Movie Keywords (Story Topic Pills)
  getMovieKeywords: async (movieId: number): Promise<MovieKeywordsResponse> => {
    const response = await apiClient.get<MovieKeywordsResponse>(`/movie/${movieId}/keywords`);
    return response.data;
  },

  // 16. Movie Images (Backdrop & Stills Gallery)
  getMovieImages: async (movieId: number): Promise<MovieImagesResponse> => {
    const response = await apiClient.get<MovieImagesResponse>(`/movie/${movieId}/images`);
    return response.data;
  },

  // 17. Similar Movies Rail
  getSimilarMovies: async (movieId: number, page = 1): Promise<PaginatedResponse<MovieSummary>> => {
    const response = await apiClient.get<PaginatedResponse<MovieSummary>>(`/movie/${movieId}/similar`, {
      params: { page },
    });
    return response.data;
  },

  // 18. Recommended Movies Rail
  getMovieRecommendations: async (movieId: number, page = 1): Promise<PaginatedResponse<MovieSummary>> => {
    const response = await apiClient.get<PaginatedResponse<MovieSummary>>(`/movie/${movieId}/recommendations`, {
      params: { page },
    });
    return response.data;
  },

  // 19. Person Details (Actor Bio & Life Stats)
  getPersonDetails: async (personId: number): Promise<PersonDetails> => {
    const response = await apiClient.get<PersonDetails>(`/person/${personId}`);
    return response.data;
  },

  // 20. Person Movie Credits (Filmography Grid)
  getPersonMovieCredits: async (personId: number): Promise<PersonMovieCreditsResponse> => {
    const response = await apiClient.get<PersonMovieCreditsResponse>(`/person/${personId}/movie_credits`);
    return response.data;
  },

  // 21. TV Details (Fallback for TV Shows in Dossier)
  getTvDetails: async (tvId: number): Promise<MovieDetails> => {
    const response = await apiClient.get<any>(`/tv/${tvId}`);
    const tv = response.data;
    return {
      id: tv.id,
      title: tv.name || tv.original_name || 'Untitled Show',
      tagline: tv.tagline || null,
      overview: tv.overview || '',
      poster_path: tv.poster_path,
      backdrop_path: tv.backdrop_path,
      release_date: tv.first_air_date || '',
      runtime: tv.episode_run_time?.[0] || 45,
      vote_average: tv.vote_average || 0,
      vote_count: tv.vote_count || 0,
      genres: tv.genres || [],
      budget: 0,
      revenue: 0,
      status: tv.status || 'Ended',
      homepage: tv.homepage || null,
    };
  },

  // 21b. TV Credits
  getTvCredits: async (tvId: number): Promise<MovieCreditsResponse> => {
    const response = await apiClient.get<MovieCreditsResponse>(`/tv/${tvId}/credits`);
    return response.data;
  },

  // 21c. TV Videos
  getTvVideos: async (tvId: number): Promise<MovieVideosResponse> => {
    const response = await apiClient.get<MovieVideosResponse>(`/tv/${tvId}/videos`);
    return response.data;
  },

  // 21d. TV Reviews
  getTvReviews: async (tvId: number, page = 1): Promise<PaginatedResponse<ReviewItem>> => {
    const response = await apiClient.get<PaginatedResponse<ReviewItem>>(`/tv/${tvId}/reviews`, {
      params: { page },
    });
    return response.data;
  },

  // 21e. TV Images
  getTvImages: async (tvId: number): Promise<MovieImagesResponse> => {
    const response = await apiClient.get<MovieImagesResponse>(`/tv/${tvId}/images`);
    return response.data;
  },

  // 21f. TV Similar
  getTvSimilar: async (tvId: number, page = 1): Promise<PaginatedResponse<MovieSummary>> => {
    const response = await apiClient.get<PaginatedResponse<any>>(`/tv/${tvId}/similar`, {
      params: { page },
    });
    const normalized: MovieSummary[] = (response.data.results || []).map((tv: any) => ({
      id: tv.id,
      title: tv.name || tv.original_name || 'Untitled Show',
      overview: tv.overview || '',
      poster_path: tv.poster_path,
      backdrop_path: tv.backdrop_path,
      release_date: tv.first_air_date || '',
      vote_average: tv.vote_average || 0,
      vote_count: tv.vote_count || 0,
      popularity: tv.popularity || 0,
      genre_ids: tv.genre_ids || [],
      media_type: 'tv',
    }));
    return { ...response.data, results: normalized };
  },

  // 21g. TV Recommendations
  getTvRecommendations: async (tvId: number, page = 1): Promise<PaginatedResponse<MovieSummary>> => {
    const response = await apiClient.get<PaginatedResponse<any>>(`/tv/${tvId}/recommendations`, {
      params: { page },
    });
    const normalized: MovieSummary[] = (response.data.results || []).map((tv: any) => ({
      id: tv.id,
      title: tv.name || tv.original_name || 'Untitled Show',
      overview: tv.overview || '',
      poster_path: tv.poster_path,
      backdrop_path: tv.backdrop_path,
      release_date: tv.first_air_date || '',
      vote_average: tv.vote_average || 0,
      vote_count: tv.vote_count || 0,
      popularity: tv.popularity || 0,
      genre_ids: tv.genre_ids || [],
      media_type: 'tv',
    }));
    return { ...response.data, results: normalized };
  },
};

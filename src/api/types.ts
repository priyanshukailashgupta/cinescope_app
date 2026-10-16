/**
 * TMDB API v3 Strongly-Typed Interfaces
 * Full type coverage for all 20 verified endpoints.
 */

export interface PaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
  dates?: {
    maximum: string;
    minimum: string;
  };
}

export interface Genre {
  id: number;
  name: string;
}

export interface GenresResponse {
  genres: Genre[];
}

export interface MovieSummary {
  id: number;
  title: string;
  original_title?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids?: number[];
  adult?: boolean;
  media_type?: 'movie' | 'tv';
}

export interface MovieDetails {
  id: number;
  title: string;
  tagline: string | null;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  runtime: number | null;
  vote_average: number;
  vote_count: number;
  genres: Genre[];
  budget: number;
  revenue: number;
  status: string;
  homepage: string | null;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
  known_for_department?: string;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface MovieCreditsResponse {
  id: number;
  cast: CastMember[];
  crew: CrewMember[];
}

export interface VideoItem {
  id: string;
  key: string;
  name: string;
  site: string; // "YouTube"
  type: string; // "Trailer", "Teaser", "Clip"
  official: boolean;
  published_at?: string;
}

export interface MovieVideosResponse {
  id: number;
  results: VideoItem[];
}

export interface ReleaseDateEntry {
  certification: string;
  iso_639_1?: string;
  release_date: string;
  type: number;
}

export interface ReleaseDatesResult {
  iso_3166_1: string;
  release_dates: ReleaseDateEntry[];
}

export interface ReleaseDatesResponse {
  id: number;
  results: ReleaseDatesResult[];
}

export interface ReviewItem {
  id: string;
  author: string;
  content: string;
  created_at: string;
  author_details: {
    name?: string;
    username?: string;
    avatar_path: string | null;
    rating: number | null;
  };
}

export interface KeywordItem {
  id: number;
  name: string;
}

export interface MovieKeywordsResponse {
  id: number;
  keywords: KeywordItem[];
}

export interface MovieImageEntry {
  file_path: string;
  width: number;
  height: number;
  aspect_ratio: number;
  vote_average?: number;
}

export interface MovieImagesResponse {
  id: number;
  backdrops: MovieImageEntry[];
  posters: MovieImageEntry[];
}

export interface PersonSummary {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  known_for: MovieSummary[];
}

export interface PersonDetails {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  profile_path: string | null;
  known_for_department: string;
}

export interface PersonMovieCreditsResponse {
  id: number;
  cast: (MovieSummary & { character?: string })[];
  crew: (MovieSummary & { job?: string; department?: string })[];
}

export interface MultiSearchResultItem {
  id: number;
  media_type: 'movie' | 'tv' | 'person';
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  profile_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  vote_count?: number;
  known_for_department?: string;
  known_for?: (MovieSummary | { title?: string; name?: string })[];
}

export interface DiscoverFilterParams {
  with_genres?: string | number;
  sort_by?: string;
  page?: number;
  'vote_average.gte'?: number;
  primary_release_year?: number;
  first_air_date_year?: number;
  with_origin_country?: string;
  with_original_language?: string;
  'first_air_date.lte'?: string;
  'first_air_date.gte'?: string;
  'primary_release_date.lte'?: string;
  'primary_release_date.gte'?: string;
  'vote_count.gte'?: number;
}



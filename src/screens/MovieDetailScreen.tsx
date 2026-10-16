/**
 * MovieDetailScreen
 * Integrates 9 verified TMDB endpoints with Urbanist typography & Ionicons:
 * 10. GET /3/movie/{movie_id}                — Core details & stats
 * 11. GET /3/movie/{movie_id}/credits        — Cast & crew members
 * 12. GET /3/movie/{movie_id}/videos         — YouTube trailers
 * 13. GET /3/movie/{movie_id}/release_dates  — Age rating certification (PG-13, R)
 * 14. GET /3/movie/{movie_id}/reviews        — User reviews & critiques
 * 15. GET /3/movie/{movie_id}/keywords       — Story keyword pills
 * 16. GET /3/movie/{movie_id}/images         — Movie production stills gallery
 * 17. GET /3/movie/{movie_id}/similar        — Mechanically similar movies rail
 * 18. GET /3/movie/{movie_id}/recommendations— Collaborative recommendation rail
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  CastMember,
  KeywordItem,
  MovieDetails,
  MovieImageEntry,
  MovieSummary,
  ReviewItem,
  VideoItem,
} from '../api/types';
import { tmdbService } from '../api/tmdb';
import { CustomImage } from '../components/CustomImage';
import { ErrorView } from '../components/ErrorView';
import { MovieRail } from '../components/MovieRail';
import { Skeleton } from '../components/Skeleton';
import { useWatchlist } from '../context/WatchlistContext';
import { borderRadius, colors, fonts, spacing } from '../theme';
import {
  formatCurrency,
  formatRating,
  formatReleaseYear,
  formatRuntime,
  getImageUrl,
  openTrailer,
} from '../utils';

interface MovieDetailScreenProps {
  route: { params: { movieId: number; mediaType?: 'movie' | 'tv' } };
  navigation: any;
}

export const MovieDetailScreen: React.FC<MovieDetailScreenProps> = ({ route, navigation }) => {
  const { movieId, mediaType } = route.params;
  const { isMovieInWatchlist, toggleWatchlist } = useWatchlist();

  // Screen State for all 9 endpoints
  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [director, setDirector] = useState<string | null>(null);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [certification, setCertification] = useState<string | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [keywords, setKeywords] = useState<KeywordItem[]>([]);
  const [stills, setStills] = useState<MovieImageEntry[]>([]);
  const [similar, setSimilar] = useState<MovieSummary[]>([]);
  const [recommendations, setRecommendations] = useState<MovieSummary[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllDetails = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (mediaType === 'tv') {
        // Direct TV dossier fetch (prevents movie ID collision)
        const [
          tvDetailsRes,
          tvCreditsRes,
          tvVideosRes,
          tvReviewsRes,
          tvImagesRes,
          tvSimilarRes,
          tvRecsRes,
        ] = await Promise.all([
          tmdbService.getTvDetails(movieId),
          tmdbService.getTvCredits(movieId),
          tmdbService.getTvVideos(movieId),
          tmdbService.getTvReviews(movieId),
          tmdbService.getTvImages(movieId),
          tmdbService.getTvSimilar(movieId),
          tmdbService.getTvRecommendations(movieId),
        ]);

        setDetails(tvDetailsRes);
        setCast(tvCreditsRes.cast || []);
        const creator = tvCreditsRes.crew?.find((c) => c.job === 'Creator' || c.job === 'Executive Producer');
        setDirector(creator?.name || null);
        setVideos(tvVideosRes.results?.filter((v) => v.site === 'YouTube') || []);
        setCertification('TV-14');
        setReviews(tvReviewsRes.results || []);
        setKeywords([]);
        setStills(tvImagesRes.backdrops?.slice(0, 8) || []);
        setSimilar(tvSimilarRes.results || []);
        setRecommendations(tvRecsRes.results || []);
        return;
      }

      // Default: Movie dossier fetch with TV fallback on 404
      try {
        const [
          detailsRes,
          creditsRes,
          videosRes,
          releaseDatesRes,
          reviewsRes,
          keywordsRes,
          imagesRes,
          similarRes,
          recsRes,
        ] = await Promise.all([
          tmdbService.getMovieDetails(movieId),
          tmdbService.getMovieCredits(movieId),
          tmdbService.getMovieVideos(movieId),
          tmdbService.getMovieReleaseDates(movieId),
          tmdbService.getMovieReviews(movieId),
          tmdbService.getMovieKeywords(movieId),
          tmdbService.getMovieImages(movieId),
          tmdbService.getSimilarMovies(movieId),
          tmdbService.getMovieRecommendations(movieId),
        ]);

        setDetails(detailsRes);
        setCast(creditsRes.cast || []);
        const direct = creditsRes.crew?.find((c) => c.job === 'Director');
        setDirector(direct?.name || null);
        setVideos(videosRes.results?.filter((v) => v.site === 'YouTube') || []);

        const usCert = releaseDatesRes.results
          ?.find((r) => r.iso_3166_1 === 'US')
          ?.release_dates?.find((d) => d.certification && d.certification !== '');
        setCertification(usCert?.certification || null);

        setReviews(reviewsRes.results || []);
        setKeywords(keywordsRes.keywords || []);
        setStills(imagesRes.backdrops?.slice(0, 8) || []);
        setSimilar(similarRes.results || []);
        setRecommendations(recsRes.results || []);
      } catch (movieErr) {
        // Fallback for TV Shows: fetch TV dossier
        const [
          tvDetailsRes,
          tvCreditsRes,
          tvVideosRes,
          tvReviewsRes,
          tvImagesRes,
          tvSimilarRes,
          tvRecsRes,
        ] = await Promise.all([
          tmdbService.getTvDetails(movieId),
          tmdbService.getTvCredits(movieId),
          tmdbService.getTvVideos(movieId),
          tmdbService.getTvReviews(movieId),
          tmdbService.getTvImages(movieId),
          tmdbService.getTvSimilar(movieId),
          tmdbService.getTvRecommendations(movieId),
        ]);

        setDetails(tvDetailsRes);
        setCast(tvCreditsRes.cast || []);
        const creator = tvCreditsRes.crew?.find((c) => c.job === 'Creator' || c.job === 'Executive Producer');
        setDirector(creator?.name || null);
        setVideos(tvVideosRes.results?.filter((v) => v.site === 'YouTube') || []);
        setCertification('TV-14');
        setReviews(tvReviewsRes.results || []);
        setKeywords([]);
        setStills(tvImagesRes.backdrops?.slice(0, 8) || []);
        setSimilar(tvSimilarRes.results || []);
        setRecommendations(tvRecsRes.results || []);
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to load complete details.');
    } finally {
      setLoading(false);
    }
  }, [movieId, mediaType]);

  useEffect(() => {
    fetchAllDetails();
  }, [fetchAllDetails]);

  const handleOpenTrailer = (videoKey: string) => {
    openTrailer(videoKey);
  };

  const handleMoviePress = (movie: MovieSummary) => {
    navigation.push('MovieDetail', {
      movieId: movie.id,
      mediaType: movie.media_type || (mediaType === 'tv' ? 'tv' : 'movie'),
    });
  };

  const handlePersonPress = (personId: number) => {
    navigation.navigate('PersonDetail', { personId });
  };

  const isSaved = details ? isMovieInWatchlist(details.id) : false;

  const handleToggleWatchlist = async () => {
    if (!details) return;
    const summary: MovieSummary = {
      id: details.id,
      title: details.title,
      overview: details.overview,
      poster_path: details.poster_path,
      backdrop_path: details.backdrop_path,
      release_date: details.release_date,
      vote_average: details.vote_average,
      vote_count: details.vote_count,
      popularity: 0,
    };
    await toggleWatchlist(summary);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Skeleton width="100%" height={240} />
        <View style={styles.skeletonBody}>
          <Skeleton width="80%" height={26} />
          <Skeleton width="40%" height={16} style={{ marginTop: 8 }} />
          <Skeleton width="100%" height={80} style={{ marginTop: 16 }} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !details) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <ErrorView message={error || 'Movie not found.'} onRetry={fetchAllDetails} />
      </SafeAreaView>
    );
  }

  const backdropUri = getImageUrl(details.backdrop_path || details.poster_path, 'w1280');
  const posterUri = getImageUrl(details.poster_path, 'w342');
  const rating = formatRating(details.vote_average);
  const runtime = formatRuntime(details.runtime);
  const releaseYear = formatReleaseYear(details.release_date);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Endpoint 10: Backdrop Header with Dark Scrim */}
        <View style={styles.backdropContainer}>
          <CustomImage
            uri={backdropUri}
            fallbackTitle={details.title}
            aspectRatio={16 / 9}
            style={styles.backdropImage}
          />
          <View style={styles.backdropScrim} />

          {/* Floating Back & Watchlist Navigation Bar */}
          <SafeAreaView style={styles.floatingHeader} edges={['top']}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconCircle}>
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleToggleWatchlist} style={[styles.iconCircle, isSaved && styles.savedCircle]}>
              <Ionicons
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={20}
                color={isSaved ? '#FFFFFF' : colors.primaryLight}
              />
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        {/* Hero Meta Card */}
        <View style={styles.metaCard}>
          <View style={styles.posterAndTitles}>
            <View style={styles.primaryPoster}>
              <CustomImage uri={posterUri} fallbackTitle={details.title} aspectRatio={2 / 3} />
            </View>

            <View style={styles.titleColumn}>
              <Text style={styles.title} numberOfLines={2}>
                {details.title}
              </Text>
              {details.tagline ? (
                <Text style={styles.tagline} numberOfLines={2}>
                  "{details.tagline}"
                </Text>
              ) : null}

              {/* Badges Bar: Year, Cert, Runtime, Rating */}
              <View style={styles.badgeRow}>
                {certification ? (
                  <View style={styles.certBadge}>
                    <Text style={styles.certText}>{certification}</Text>
                  </View>
                ) : null}

                <Text style={styles.metaText}>{releaseYear}</Text>
                <Text style={styles.metaDot}>•</Text>
                <Text style={styles.metaText}>{runtime}</Text>

                {rating !== 'NR' && (
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={10} color={colors.rating} style={{ marginRight: 3 }} />
                    <Text style={styles.ratingText}>{rating}</Text>
                  </View>
                )}
              </View>

              {director ? (
                <Text style={styles.directorText} numberOfLines={1}>
                  Dir: <Text style={styles.directorName}>{director}</Text>
                </Text>
              ) : null}
            </View>
          </View>

          {/* Watchlist Action Button */}
          <TouchableOpacity
            style={[styles.watchlistBtn, isSaved && styles.watchlistBtnActive]}
            onPress={handleToggleWatchlist}
            activeOpacity={0.75}
          >
            <Ionicons
              name={isSaved ? 'checkmark-circle' : 'bookmark-outline'}
              size={18}
              color="#FFFFFF"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.watchlistBtnText}>
              {isSaved ? 'In Your Watchlist' : 'Add to Watchlist'}
            </Text>
          </TouchableOpacity>

          {/* Genre Chips */}
          <View style={styles.genreChipsRow}>
            {details.genres?.map((g) => (
              <View key={g.id} style={styles.genreTag}>
                <Text style={styles.genreTagText}>{g.name}</Text>
              </View>
            ))}
          </View>

          {/* Overview */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHeading}>Synopsis</Text>
            <Text style={styles.overviewText}>
              {details.overview || 'No synopsis is currently available for this film.'}
            </Text>
          </View>

          {/* Endpoint 15: Story Keywords */}
          {keywords.length > 0 && (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeading}>Plot Keywords</Text>
              <View style={styles.keywordsWrap}>
                {keywords.slice(0, 10).map((kw) => (
                  <View key={kw.id} style={styles.keywordPill}>
                    <Text style={styles.keywordText}>#{kw.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Endpoint 12: Official YouTube Trailers */}
          {videos.length > 0 && (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeading}>Official Trailers & Clips</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trailersList}>
                {videos.map((vid) => (
                  <TouchableOpacity
                    key={vid.id}
                    style={styles.trailerCard}
                    onPress={() => handleOpenTrailer(vid.key)}
                    activeOpacity={0.75}
                  >
                    <CustomImage
                      uri={`https://img.youtube.com/vi/${vid.key}/hqdefault.jpg`}
                      fallbackTitle={vid.name}
                      aspectRatio={16 / 9}
                      style={styles.trailerThumbnail}
                    />
                    <View style={styles.playIconOverlay}>
                      <Ionicons name="play" size={16} color="#FFFFFF" style={{ marginLeft: 2 }} />
                    </View>
                    <Text style={styles.trailerName} numberOfLines={1}>
                      {vid.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Endpoint 11: Cast & Crew */}
          {cast.length > 0 && (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeading}>Top Billed Cast</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.castList}>
                {cast.slice(0, 12).map((actor) => (
                  <TouchableOpacity
                    key={actor.id}
                    style={styles.castCard}
                    onPress={() => handlePersonPress(actor.id)}
                    activeOpacity={0.75}
                  >
                    <CustomImage
                      uri={getImageUrl(actor.profile_path, 'w185')}
                      fallbackTitle={actor.name}
                      aspectRatio={1}
                      style={styles.actorAvatar}
                    />
                    <Text style={styles.actorName} numberOfLines={1}>
                      {actor.name}
                    </Text>
                    <Text style={styles.characterName} numberOfLines={1}>
                      {actor.character}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Endpoint 16: Movie Images / Production Stills */}
          {stills.length > 0 && (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeading}>Production Stills</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stillsList}>
                {stills.map((still, idx) => (
                  <View key={idx} style={styles.stillItem}>
                    <CustomImage
                      uri={getImageUrl(still.file_path, 'w780')}
                      fallbackTitle={details.title}
                      aspectRatio={16 / 9}
                      style={styles.stillImage}
                    />
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Box Office Stats */}
          {(details.budget > 0 || details.revenue > 0) && (
            <View style={styles.statsCard}>
              <Text style={styles.sectionHeading}>Box Office</Text>
              <View style={styles.statsRow}>
                {details.budget > 0 && (
                  <View style={styles.statCol}>
                    <Text style={styles.statLabel}>Budget</Text>
                    <Text style={styles.statValue}>{formatCurrency(details.budget)}</Text>
                  </View>
                )}
                {details.revenue > 0 && (
                  <View style={styles.statCol}>
                    <Text style={styles.statLabel}>Revenue</Text>
                    <Text style={styles.statValue}>{formatCurrency(details.revenue)}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Endpoint 14: Movie Reviews */}
          {reviews.length > 0 && (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeading}>Community Reviews ({reviews.length})</Text>
              {reviews.slice(0, 2).map((rev) => (
                <View key={rev.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewAuthor}>{rev.author}</Text>
                    {rev.author_details.rating ? (
                      <View style={styles.reviewRatingBadge}>
                        <Ionicons name="star" size={10} color={colors.rating} style={{ marginRight: 3 }} />
                        <Text style={styles.ratingText}>{rev.author_details.rating}/10</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.reviewContent} numberOfLines={4}>
                    {rev.content}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Endpoint 17: Similar Movies */}
          {similar.length > 0 && (
            <MovieRail
              title="Mechanically Similar Movies"
              subtitle="Films sharing similar tags and genre structures"
              movies={similar}
              onMoviePress={handleMoviePress}
            />
          )}

          {/* Endpoint 18: Collaborative Recommendations */}
          {recommendations.length > 0 && (
            <MovieRail
              title="Recommended For You"
              subtitle="Viewers of this movie also enjoyed"
              movies={recommendations}
              onMoviePress={handleMoviePress}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  skeletonBody: {
    padding: spacing.lg,
  },
  navBar: {
    padding: spacing.md,
  },
  backButton: {
    padding: spacing.sm,
  },
  backdropContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 16 / 9,
  },
  backdropImage: {
    width: '100%',
    height: '100%',
  },
  backdropScrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(11, 13, 20, 0.4)',
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(11, 13, 20, 0.8)',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedCircle: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  metaCard: {
    paddingHorizontal: spacing.lg,
    marginTop: -30,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    backgroundColor: colors.background,
    paddingTop: spacing.lg,
  },
  posterAndTitles: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  primaryPoster: {
    width: 105,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  titleColumn: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  title: {
    fontFamily: fonts.extrabold,
    fontSize: 20,
    color: colors.textPrimary,
    letterSpacing: -0.4,
    lineHeight: 24,
  },
  tagline: {
    fontFamily: fonts.medium,
    fontSize: 12,
    fontStyle: 'italic',
    color: colors.primaryLight,
    marginVertical: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
    flexWrap: 'wrap',
  },
  certBadge: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginRight: spacing.sm,
  },
  certText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: colors.primary,
  },
  metaText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  metaDot: {
    fontSize: 12,
    color: colors.textMuted,
    marginHorizontal: 6,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardElevated,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.sm,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  ratingText: {
    fontFamily: fonts.bold,
    color: colors.textPrimary,
    fontSize: 11,
  },
  directorText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  directorName: {
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  watchlistBtn: {
    flexDirection: 'row',
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  watchlistBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  watchlistBtnText: {
    fontFamily: fonts.bold,
    color: '#FFFFFF',
    fontSize: 14,
  },
  genreChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  genreTag: {
    backgroundColor: colors.badgeBackground,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  genreTagText: {
    fontFamily: fonts.semibold,
    color: colors.badgeText,
    fontSize: 11,
  },
  sectionBlock: {
    marginVertical: spacing.md,
  },
  sectionHeading: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    letterSpacing: -0.3,
  },
  overviewText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  keywordsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  keywordPill: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  keywordText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.primaryLight,
  },
  trailersList: {
    paddingRight: spacing.lg,
  },
  trailerCard: {
    width: 200,
    marginRight: spacing.md,
  },
  trailerThumbnail: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  playIconOverlay: {
    position: 'absolute',
    top: '32%',
    left: '42%',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(59, 130, 246, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trailerName: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.textPrimary,
    marginTop: 6,
  },
  castList: {
    paddingRight: spacing.lg,
  },
  castCard: {
    width: 80,
    marginRight: spacing.md,
    alignItems: 'center',
  },
  actorAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  actorName: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.textPrimary,
    marginTop: 6,
    textAlign: 'center',
  },
  characterName: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
  },
  stillsList: {
    paddingRight: spacing.lg,
  },
  stillItem: {
    width: 240,
    marginRight: spacing.md,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  stillImage: {
    width: '100%',
  },
  statsCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginVertical: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
  },
  statCol: {
    flex: 1,
  },
  statLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.textPrimary,
    marginTop: 2,
  },
  reviewCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewAuthor: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  reviewRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.badgeBackground,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  reviewContent: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});

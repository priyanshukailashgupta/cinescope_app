/**
 * PersonDetailScreen
 * Integrates 2 verified TMDB endpoints with Urbanist typography & Ionicons:
 * 19. GET /3/person/{person_id}               — Actor biography & life stats
 * 20. GET /3/person/{person_id}/movie_credits — Full filmography grid
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
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
import { MovieSummary, PersonDetails } from '../api/types';
import { tmdbService } from '../api/tmdb';
import { CustomImage } from '../components/CustomImage';
import { ErrorView } from '../components/ErrorView';
import { MovieCard } from '../components/MovieCard';
import { Skeleton } from '../components/Skeleton';
import { borderRadius, colors, fonts, spacing } from '../theme';
import { getImageUrl } from '../utils';

interface PersonDetailScreenProps {
  route: { params: { personId: number } };
  navigation: any;
}

export const PersonDetailScreen: React.FC<PersonDetailScreenProps> = ({ route, navigation }) => {
  const { personId } = route.params;
  const { width } = useWindowDimensions();

  const NUM_COLUMNS = width > 600 ? 4 : 3;
  const COLUMN_WIDTH = (width - spacing.lg * 2 - spacing.md * 2) / NUM_COLUMNS;

  const [person, setPerson] = useState<PersonDetails | null>(null);
  const [filmography, setFilmography] = useState<MovieSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [bioExpanded, setBioExpanded] = useState<boolean>(false);

  const fetchPersonData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [personRes, creditsRes] = await Promise.all([
        tmdbService.getPersonDetails(personId),
        tmdbService.getPersonMovieCredits(personId),
      ]);

      setPerson(personRes);

      const combined = [...(creditsRes.cast || []), ...(creditsRes.crew || [])];
      const uniqueMovies = Array.from(new Map(combined.map((m) => [m.id, m])).values());
      uniqueMovies.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

      setFilmography(uniqueMovies);
    } catch (err: any) {
      setError(err?.message || 'Unable to load talent profile.');
    } finally {
      setLoading(false);
    }
  }, [personId]);

  useEffect(() => {
    fetchPersonData();
  }, [fetchPersonData]);

  const handleMoviePress = (movie: MovieSummary) => {
    navigation.push('MovieDetail', { movieId: movie.id });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.skeletonContainer}>
          <Skeleton width={110} height={110} borderRadius={55} style={{ alignSelf: 'center' }} />
          <Skeleton width="60%" height={24} style={{ alignSelf: 'center', marginTop: 16 }} />
          <Skeleton width="40%" height={14} style={{ alignSelf: 'center', marginTop: 8 }} />
          <Skeleton width="100%" height={100} style={{ marginTop: 24 }} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !person) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <ErrorView message={error || 'Talent profile not found.'} onRetry={fetchPersonData} />
      </SafeAreaView>
    );
  }

  const profileUri = getImageUrl(person.profile_path, 'w500');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Navigation Header */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {person.name}
        </Text>
        <View style={{ width: 50 }} />
      </View>

      <FlatList
        data={filmography}
        keyExtractor={(item) => item.id.toString()}
        numColumns={NUM_COLUMNS}
        key={NUM_COLUMNS}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.profileHeader}>
            <View style={styles.avatarWrapper}>
              <CustomImage
                uri={profileUri}
                fallbackTitle={person.name}
                aspectRatio={1}
                style={styles.avatar}
              />
            </View>

            <Text style={styles.name}>{person.name}</Text>
            <Text style={styles.department}>{person.known_for_department || 'Cinema Artist'}</Text>

            <View style={styles.statsRow}>
              {person.birthday ? (
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Born</Text>
                  <Text style={styles.statValue}>{person.birthday}</Text>
                </View>
              ) : null}
              {person.place_of_birth ? (
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Birthplace</Text>
                  <Text style={styles.statValue} numberOfLines={1}>
                    {person.place_of_birth}
                  </Text>
                </View>
              ) : null}
            </View>

            {person.biography ? (
              <View style={styles.bioContainer}>
                <Text style={styles.sectionHeading}>Biography</Text>
                <Text
                  style={styles.bioText}
                  numberOfLines={bioExpanded ? undefined : 4}
                  ellipsizeMode="tail"
                >
                  {person.biography}
                </Text>
                <TouchableOpacity
                  onPress={() => setBioExpanded(!bioExpanded)}
                  activeOpacity={0.75}
                  style={styles.expandButton}
                >
                  <Text style={styles.expandText}>
                    {bioExpanded ? 'Read Less ▴' : 'Read More ▾'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <View style={styles.filmographyHeadingRow}>
              <Text style={styles.sectionHeading}>Known Filmography ({filmography.length})</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.gridCell, { width: COLUMN_WIDTH }]}>
            <MovieCard movie={item} onPress={handleMoviePress} width={COLUMN_WIDTH} />
          </View>
        )}
        initialNumToRender={9}
        maxToRenderPerBatch={12}
        windowSize={5}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    paddingVertical: spacing.xs,
  },
  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  listContent: {
    padding: spacing.lg,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatarWrapper: {
    width: 110,
    height: 110,
    borderRadius: 55,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.primary,
    marginBottom: spacing.md,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontFamily: fonts.extrabold,
    fontSize: 22,
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  department: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.primary,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    width: '100%',
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  statValue: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.textPrimary,
    marginTop: 2,
  },
  bioContainer: {
    width: '100%',
    marginTop: spacing.lg,
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeading: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  bioText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  expandButton: {
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
  },
  expandText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.primary,
  },
  filmographyHeadingRow: {
    width: '100%',
    marginTop: spacing.xl,
    marginBottom: spacing.xs,
  },
  gridCell: {
    marginBottom: spacing.lg,
    marginRight: spacing.md,
  },
  skeletonContainer: {
    padding: spacing.xl,
  },
});

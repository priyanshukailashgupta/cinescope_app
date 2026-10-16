/**
 * ErrorView Component
 * Network-aware error display with Ionicons alert icon and retry button.
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { borderRadius, colors, fonts, spacing } from '../theme';

interface ErrorViewProps {
  message?: string;
  onRetry?: () => void;
  compact?: boolean;
}

export const ErrorView: React.FC<ErrorViewProps> = ({
  message = 'Unable to load movie data. Please check your network.',
  onRetry,
  compact = false,
}) => {
  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Text style={styles.compactMessage} numberOfLines={2}>
          {message}
        </Text>
        {onRetry && (
          <TouchableOpacity style={styles.compactButton} onPress={onRetry} activeOpacity={0.75}>
            <Text style={styles.compactButtonText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="alert-circle-outline" size={28} color={colors.primary} />
      </View>
      <Text style={styles.title}>Connection Notice</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry} activeOpacity={0.75}>
          <Text style={styles.retryButtonText}>Tap to Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    margin: spacing.lg,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.full,
    backgroundColor: colors.badgeBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  message: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.lg,
    maxWidth: 280,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    fontFamily: fonts.bold,
    color: '#FFFFFF',
    fontSize: 14,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: spacing.sm,
  },
  compactMessage: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textSecondary,
    marginRight: spacing.md,
  },
  compactButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  compactButtonText: {
    fontFamily: fonts.bold,
    color: '#FFFFFF',
    fontSize: 12,
  },
});

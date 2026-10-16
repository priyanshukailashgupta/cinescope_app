/**
 * Skeleton Loader Component
 * Subtle dark shimmering placeholder matching exact card and banner dimensions.
 * Zero neon glow, zero artificial decorative artifacts.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { borderRadius, colors } from '../theme';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  aspectRatio?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height,
  borderRadius: radius = borderRadius.md,
  style,
  aspectRatio,
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height: height as any,
          borderRadius: radius,
          opacity,
          ...(aspectRatio ? { aspectRatio } : {}),
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
});

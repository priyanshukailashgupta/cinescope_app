/**
 * CineScope Design System & Tokens
 * Strictly modeled after the Official Style Guide:
 * - Font Family: Urbanist (Regular 400, Medium 500, SemiBold 600, Bold 700, ExtraBold 800)
 * - Main Gradient / Primary Accent: #3B82F6 (Electric Azure Blue)
 * - Blue Shades: #3B82F6, #60A5FA, #93C5FD, #BFDBFE, #EFF6FF
 * - Dark Base Palette: #0B0D14 (Midnight Obsidian), #161924 (Surface Card), #282F44 (Hairline Border)
 * - Ratings Gold: #FFB800
 */

export const colors = {
  // Brand Main Gradient / Primary Accent (Style Guide: #3B82F6)
  primary: '#3B82F6',
  primaryDark: '#2563EB',
  primaryLight: '#60A5FA',
  primaryHover: '#1D4ED8',

  // Style Guide Blue Shades
  blue50: '#EFF6FF',
  blue100: '#DBEAFE',
  blue200: '#BFDBFE',
  blue300: '#93C5FD',
  blue400: '#60A5FA',
  blue500: '#3B82F6',
  blueGlow: 'rgba(59, 130, 246, 0.25)',

  // Dark Base Palette from Style Guide
  background: '#0B0D14',
  card: '#161924',
  cardElevated: '#1F2433',
  modal: '#131620',

  // Borders & Dividers
  border: '#282F44',
  borderLight: '#39425E',

  // Typography Colors
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',

  // Accents & Functional
  rating: '#FFB800', // Film Gold Star
  badgeBackground: '#1E2538',
  badgeText: '#93C5FD',
  error: '#EF4444',
  success: '#10B981',

  // Overlays
  overlayDark: 'rgba(11, 13, 20, 0.85)',
  backdropGradientTop: 'rgba(11, 13, 20, 0.2)',
  backdropGradientBottom: '#0B0D14',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const fonts = {
  regular: 'Urbanist_400Regular',
  medium: 'Urbanist_500Medium',
  semibold: 'Urbanist_600SemiBold',
  bold: 'Urbanist_700Bold',
  extrabold: 'Urbanist_800ExtraBold',
} as const;

export const typography = {
  heroTitle: {
    fontFamily: fonts.extrabold,
    fontSize: 26,
    fontWeight: '800' as const,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  cardTitle: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 14,
    fontWeight: '400' as const,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  bodyEmphasis: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  caption: {
    fontFamily: fonts.medium,
    fontSize: 12,
    fontWeight: '500' as const,
    color: colors.textMuted,
    lineHeight: 16,
  },
  badge: {
    fontFamily: fonts.bold,
    fontSize: 11,
    fontWeight: '700' as const,
    color: colors.badgeText,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
} as const;

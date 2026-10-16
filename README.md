# CineScope — Mobile Movie Discovery Application

[![React Native](https://img.shields.io/badge/React%20Native-0.86-blue.svg)](https://reactnative.dev)
[![Expo](https://img.shields.io/badge/Expo%20SDK-57-black.svg)](https://expo.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%205.3-3178C6.svg)](https://www.typescriptlang.org)
[![TMDB Endpoints](https://img.shields.io/badge/TMDB%20Endpoints-20%20Active-01d277.svg)](https://developer.themoviedb.org)
[![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-4A90E2.svg)](https://expo.dev)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

A high-performance, dark-themed cinematic movie discovery mobile application built with **React Native (Expo SDK 57)** and **TypeScript**, powered by **The Movie Database (TMDB) API v3**.

Designed with a restrained obsidian aesthetic (`#0B0D14`), fluid tab navigation with animated indicators, dynamic screen responsiveness, and defensive error boundaries.

---

## 📑 Table of Contents

- [Overview & Architecture](#-overview--architecture)
- [Key Features & Screens](#-key-features--screens)
- [Technology Stack](#-technology-stack)
- [The 20 Integrated TMDB Endpoints](#-the-20-integrated-tmdb-endpoints)
- [Project Directory Structure](#-project-directory-structure)
- [Quickstart & Setup Instructions](#-quickstart--setup-instructions)
- [Engineering Standards & Defensive Design](#-engineering-standards--defensive-design)
- [Code Quality & Type Safety](#-code-quality--type-safety)
- [Attribution](#-attribution)

---

## 📖 Overview & Architecture

CineScope provides film enthusiasts and casual viewers with an exploratory cinema interface featuring real-time theatrical feeds, multi-parameter discoverability, deep movie dossiers, cast filmographies, and an offline-persisted personal watchlist.

### Architectural Highlights
- **Zero Heavy State Bloat:** Uses native React Context (`WatchlistContext`) combined with `@react-native-async-storage/async-storage` for local library persistence, eliminating unnecessary Redux/MobX boilerplate.
- **Centralized API Client:** Custom Axios instance with automatic authentication injection, unified 10-second timeout guards, and normalized user-friendly error formatting.
- **Defensive Layout Design:** All cards and text dynamically compute dimensions using `useWindowDimensions()` and adhere to strict industry aspect ratios (`2:3` for movie posters, `16:9` for backdrops and trailers, `1:1` for actor portraits).
- **Graceful Multi-State Handling:** Every primary view implements three distinct states:
  1. *Loading:* Geometry-matched shimmer skeleton.
  2. *Error:* Actionable network error banner with a user-facing "Retry" trigger.
  3. *Empty:* Contextual empty state with clear calls to action.

---

## 🎬 Key Features & Screens

### 1. Home Screen (`HomeScreen.tsx`)
- **Hero Carousel Banner:** 5-second auto-scrolling backdrop carousel featuring today's top trending cinema with quick Play and Details actions.
- **10 Dynamic Discovery Rails:**
  - *Top 10 Movies This Week* (with custom IMDb rating badges)
  - *Recent Added Movies* (`/movie/now_playing`)
  - *Recent Added TV Shows* (curated newly debuted television premieres)
  - *Top Rated Movies* (`/movie/top_rated`)
  - *Popular TV Shows* (`/tv/popular`)
  - *Genre Feeds:* Crime Thrillers, Animation & Anime, Music & Musicals, Sci-Fi Television, Reality TV.
- **Interactive Mood Chips:** Instant visual filtering by mood (Trending, Top Rated, Sci-Fi, Action).
- **"See All" Deep Linking:** Every rail's "See all" button seamlessly routes into the Explore tab with the corresponding media type, genre, and sort criteria pre-applied.

### 2. Explore & Advanced Filter Drawer (`ExploreScreen.tsx`)
- **Responsive 3-Column Grid:** Dynamically adjusts card widths according to screen resolution and device orientation.
- **Side Filter Drawer:** Slide-in drawer with modal sub-pickers supporting 6 simultaneous filter dimensions:
  - *Release Year:* 2026, 2025, 2024, 2023, 2022, 2021, 2020, 2010s, 2000s
  - *Genre:* Real-time genre taxonomy fetched from TMDB
  - *Sort Criteria:* Newest First, Most Popular, Top Rated, Oldest First
  - *Origin Region:* Global, India (IN), United States (US), South Korea (KR), Japan (JP), United Kingdom (GB), France (FR), Spain (ES)
  - *Original Language:* English, Hindi, Korean, Japanese, Spanish, French, German, Tamil, Telugu
  - *Minimum Rating:* Any, ★ 6.0+, ★ 7.0+, ★ 8.0+
- **Media Switcher:** Instantly toggle between **Movies** and **TV Shows** with automatic sort-key translation (`primary_release_date` ⇄ `first_air_date`).
- **Active Filter Chips & Badges:** Shows active count badge and dismissible filter pills.

### 3. Live Debounced Search (`SearchScreen.tsx`)
- **Multi-Search Integration:** Searches across Movies, TV Series, and People (`/search/multi`).
- **Debounced Input:** 400ms debounce prevents API rate limiting while typing.
- **Recent Search History:** Locally persisted past queries with single-tap replay and clearing.
- **Genre Quick-Launch Chips:** Instant genre exploration chips when query is empty.

### 4. Deep Movie & TV Dossier (`MovieDetailScreen.tsx`)
- **Hero Stills & Backdrop:** Edge-to-edge backdrop imagery with gradient scrim.
- **Trailer Playback:** Automatically queries TMDB official YouTube trailers and teasers, supporting playback via native YouTube app or in-app web player.
- **Cast & Crew Avatars:** Horizontal carousel of talent cards linking directly to actor profiles.
- **Production Dossier:** Age certification badge (PG-13, R, U/A), release date, runtime, budget, revenue, and vote averages.
- **Story Keywords:** Plot keyword topic pills (`/movie/{id}/keywords`).
- **Production Stills Gallery:** Production backdrops and stills viewer (`/movie/{id}/images`).
- **Community Critiques:** Verified user reviews with expandable commentary (`/movie/{id}/reviews`).
- **Double Discovery Rails:** Mechanically *Similar Movies* rail + Algorithmic *Recommended Movies* rail.
- **Watchlist Toggle:** Single-tap add/remove with instant AsyncStorage synchronization.

### 5. Talent Dossier (`PersonDetailScreen.tsx`)
- **Biography & Stats:** Actor profile image, biography, birthdate, birthplace, and department.
- **Complete Filmography Grid:** Chronological grid of all movie credits linking back to movie details.

### 6. Top Rated Cinema (`TopMoviesScreen.tsx`)
- Numbered leaderboard of all-time highest-rated cinema with custom badge rankings.

### 7. Offline Watchlist (`WatchlistScreen.tsx`)
- **Local Persistence:** Backed by `@react-native-async-storage/async-storage` for instantaneous offline access.
- **Filtering & Search:** Search through saved items and filter by genre.
- **Fast Deletion:** Individual item removal with immediate UI feedback.

### 8. Custom Profile & App Preferences (`ProfileScreen.tsx`)
- **Identity Customization:** Choose from 8 cinema avatar presets, set custom display name and favorite film genres.
- **Live Discovery Preferences:**
  - *Trailer Launcher:* Select between native YouTube App or Web Player.
  - *Explore Default Media:* Set default catalog to All Media, Movies, or TV Shows.
  - *Adult Content Filter:* Dynamic toggle automatically injected into TMDB search and discovery parameters.
- **Storage Management:** Clear image cache and reset watchlist database.
- **Diagnostics:** Real-time TMDB API latency ping monitor.

### 9. Interactive Cinema Splash Screen (`SplashScreen.tsx`)
- Animated brand mark with cinematic premiere backdrop, progress scrubber, and quick Skip/Enter controls.

---

## 🛠️ Technology Stack

| Category | Technology | Purpose |
|---|---|---|
| **Core Framework** | React Native (0.86.3) | Native mobile runtime |
| **Tooling & Platform** | Expo SDK 57 (Managed) | Cross-platform build pipeline (iOS, Android, Web) |
| **Language** | TypeScript 5.3 (Strict) | Compile-time type safety across all endpoints and components |
| **Navigation** | React Navigation v7 | Native Stack + Custom Bottom Tab Bar with animated indicator |
| **HTTP Client** | Axios 1.7 | Centralized API client with interceptors, timeouts, and token guards |
| **Local Persistence** | AsyncStorage 2.2 | Client-side offline storage for Watchlist & User Preferences |
| **Typography** | `@expo-google-fonts/urbanist` | Geometric Google Font family (`400`, `500`, `600`, `700`, `800`) |
| **Icons** | `@expo/vector-icons` (Ionicons) | Vector iconography matching iOS/Android design conventions |
| **Safe Areas** | `react-native-safe-area-context` | Notches, dynamic islands, and home indicator bar padding |

---

## 🎯 The 20 Integrated TMDB Endpoints

All 20 endpoints are active, verified, and mapped to strongly typed TypeScript interfaces:

| No. | Screen | Method | Endpoint Path | UI Feature / Purpose | Status |
|:---:|---|:---:|---|---|:---:|
| **1** | Home | `GET` | `/trending/movie/{time_window}` | Hero auto-scrolling carousel | ✅ Active |
| **2** | Home | `GET` | `/movie/now_playing` | Theatrical Now Playing rail | ✅ Active |
| **3** | Home | `GET` | `/movie/popular` | Globally popular movies rail | ✅ Active |
| **4** | Home | `GET` | `/movie/top_rated` | All-time highest rated movies rail | ✅ Active |
| **5** | Home | `GET` | `/movie/upcoming` | Upcoming theatrical releases rail | ✅ Active |
| **6** | Explore / Search | `GET` | `/genre/movie/list` | Dynamic genre filter taxonomy chips | ✅ Active |
| **7** | Explore | `GET` | `/discover/movie` | Multi-filter discovery catalog grid | ✅ Active |
| **8** | Search | `GET` | `/search/movie` | Debounced live title search | ✅ Active |
| **9** | Search | `GET` | `/search/person` | Cast, crew, and talent search | ✅ Active |
| **10** | Details | `GET` | `/movie/{movie_id}` | Core movie dossier, overview & stats | ✅ Active |
| **11** | Details | `GET` | `/movie/{movie_id}/credits` | Cast & crew horizontal carousel | ✅ Active |
| **12** | Details | `GET` | `/movie/{movie_id}/videos` | Official YouTube trailers and teasers | ✅ Active |
| **13** | Details | `GET` | `/movie/{movie_id}/release_dates` | Age rating certification (PG-13, R, U/A) | ✅ Active |
| **14** | Details | `GET` | `/movie/{movie_id}/reviews` | Community critiques & author reviews | ✅ Active |
| **15** | Details | `GET` | `/movie/{movie_id}/keywords` | Story keyword topic pills | ✅ Active |
| **16** | Details | `GET` | `/movie/{movie_id}/images` | Production stills & backdrops gallery | ✅ Active |
| **17** | Details | `GET` | `/movie/{movie_id}/similar` | Mechanically similar movies rail | ✅ Active |
| **18** | Details | `GET` | `/movie/{movie_id}/recommendations` | Algorithmic collaborative recommendations | ✅ Active |
| **19** | Person | `GET` | `/person/{person_id}` | Actor biography, stats & birthday | ✅ Active |
| **20** | Person | `GET` | `/person/{person_id}/movie_credits` | Actor complete filmography grid | ✅ Active |

*(Companion TV endpoints also implemented: `/genre/tv/list`, `/discover/tv`, `/tv/popular`, `/tv/{id}`, `/tv/{id}/credits`, `/tv/{id}/videos`, `/tv/{id}/reviews`, `/tv/{id}/images`, `/tv/{id}/similar`, `/tv/{id}/recommendations`)*

---

## 📁 Project Directory Structure

```text
cinescope_app/
├── assets/                  # App icons, splash screens, and transparent brand assets
├── docs/                    # Complete architectural & technical specifications
│   ├── API_DOCUMENTATION.md # Detailed specification of all 20 TMDB endpoints
│   ├── ARCHITECTURE.md      # Navigation architecture, state topology, data pipeline
│   ├── DATABASE_SCHEMA.md   # AsyncStorage local persistence schema & data models
│   ├── DECISIONS.md         # Architecture Decision Records (ADRs)
│   ├── PRODUCT_REQUIREMENTS.md # Product requirements document (PRD)
│   └── PROJECT_OVERVIEW.md  # Executive summary and problem statement
├── src/
│   ├── api/
│   │   ├── client.ts        # Centralized Axios client with token/error interceptors
│   │   ├── tmdb.ts          # Strongly typed TMDB API service layer
│   │   └── types.ts         # TypeScript definitions for all 20 API endpoints
│   ├── components/
│   │   ├── AnimatedTabBar.tsx # Fluid bottom tab bar with animated sliding bubble
│   │   ├── CustomImage.tsx  # Image wrapper with loading placeholder
│   │   ├── EmptyState.tsx   # Reusable contextual empty state component
│   │   ├── ErrorView.tsx    # Network-aware error view with retry action
│   │   ├── HeroFeature.tsx  # Autoplay hero carousel with quick trailer action
│   │   ├── MovieCard.tsx    # Standardized 2:3 poster card with defensive labels
│   │   ├── MovieRail.tsx    # Horizontal scrolling movie rail with "See all" header
│   │   └── Skeleton.tsx     # Geometry-matched loading shimmer skeleton
│   ├── context/
│   │   └── WatchlistContext.tsx # Offline watchlist provider (AsyncStorage)
│   ├── navigation/
│   │   └── AppNavigator.tsx # Root Native Stack & Bottom Tab navigation routing
│   ├── screens/
│   │   ├── ExploreScreen.tsx # 3-column discovery grid with 6-filter side drawer
│   │   ├── HomeScreen.tsx    # Home screen with hero banner and 10 dynamic rails
│   │   ├── MovieDetailScreen.tsx # Comprehensive movie dossier with video trailers
│   │   ├── PersonDetailScreen.tsx# Actor biography and filmography grid
│   │   ├── ProfileScreen.tsx # User profile, preferences, cache, and diagnostics
│   │   ├── SearchScreen.tsx  # Debounced live search across movies, TV, and cast
│   │   ├── SplashScreen.tsx  # Interactive brand splash screen
│   │   ├── TopMoviesScreen.tsx # Ranked leaderboard of top-rated movies
│   │   └── WatchlistScreen.tsx # Offline saved library with search & filter
│   ├── theme.ts             # Centralized design tokens (colors, typography, spacing)
│   └── utils.ts             # Formatting utilities, image URL builders, trailer opener
├── .env.example             # Safe environment variable template
├── app.json                 # Expo application configuration & splash settings
├── package.json             # NPM dependencies and scripts
└── tsconfig.json            # Strict TypeScript compiler options
```

---

## 🚀 Quickstart & Setup Instructions

Follow these simple steps to run the application locally on your machine in under 2 minutes:

### 1. Prerequisites
- **Node.js**: LTS version (`>= 18.x` or `20.x` recommended)
- **npm** or **yarn**
- **Expo Go App** (optional, available for free on [iOS App Store](https://apps.apple.com/app/expo-go/id982107779) and [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) to run on a physical phone)

### 2. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/your-username/cinescope_app.git
cd cinescope_app

# Install project dependencies
npm install
```

### 3. Configure TMDB Credentials
Create a `.env` file from the provided `.env.example`:
```bash
cp .env.example .env
```

Ensure your `.env` contains your TMDB API credentials:
```env
EXPO_PUBLIC_TMDB_API_BASE_URL=https://api.themoviedb.org/3
EXPO_PUBLIC_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p
EXPO_PUBLIC_TMDB_API_KEY=YOUR_TMDB_V3_API_KEY_HERE
EXPO_PUBLIC_TMDB_ACCESS_TOKEN=YOUR_TMDB_V4_READ_ACCESS_TOKEN_HERE
```
*(A free TMDB API key can be generated instantly at [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)).*

### 4. Launch the Development Server
```bash
# Start the Metro bundler
npm start
```

### 5. Preview Options
- **Physical Device (Recommended):** Scan the QR code displayed in your terminal using the **Expo Go** app (Android) or Camera app (iOS).
- **Web Browser:** Press `w` in the terminal to launch the web preview at `http://localhost:8081`.
- **Android Emulator:** Press `a` in the terminal (requires Android Studio).
- **iOS Simulator:** Press `i` in the terminal (requires Xcode on macOS).
- **Remote Tunnel (if on a restricted network):**
  ```bash
  npm run tunnel
  ```

---

## 📐 Engineering Standards & Defensive Design

1. **Defensive Typography:** All dynamic text elements specify `numberOfLines` and `ellipsizeMode="tail"` to prevent layout breakage or awkward text wrapping across variable screen sizes.
2. **Safe Area Discipline:** Handled cleanly with `react-native-safe-area-context` to guarantee zero overlapping with hardware camera notches, dynamic islands, or bottom home indicator bars.
3. **Aspect Ratio Conformance:** 
   - Posters: `aspectRatio: 2/3`
   - Backdrops & Trailers: `aspectRatio: 16/9`
   - Actor Avatars: `aspectRatio: 1`
4. **Network Resilience:** Centralized Axios client handles transient network drops gracefully, presenting a contextual error card with a one-tap retry button.

---

## 🛡️ Code Quality & Type Safety

This project strictly adheres to TypeScript 5.3 standards with zero compilation errors:

```bash
# Run strict TypeScript compiler verification
npm run typecheck
```

---

## ⚖️ Attribution & Legal

- This product uses the TMDB API but is not endorsed or certified by TMDB.
- All movie metadata, backdrops, and poster artwork are provided courtesy of [The Movie Database (TMDB)](https://www.themoviedb.org).
- Official video trailer previews are indexed from public YouTube distributors via the TMDB API.

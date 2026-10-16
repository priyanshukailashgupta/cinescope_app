# PROJECT_OVERVIEW.md — Executive Summary & Product Scope

> **Project:** CineScope  
> **Company:** Xplor BizConnect Take-Home Assessment  
> **Target Role:** React Native Developer (0–2 Years Experience)  
> **Evaluation Deadline:** 2 Days (48 Hours)

---

## 1. Executive Summary

CineScope is a cinematic movie discovery mobile application built for film enthusiasts. The application provides an exploratory interface with real-time curated feeds, dynamic genre-based catalog exploration, multi-layered movie dossiers, actor filmographies, official trailer previews, and an offline-capable watchlist.

The application serves as a comprehensive technical demonstration of modern React Native engineering, integrating **20 distinct, documented TMDB v3 API endpoints** across a sleek, restrained dark cinematic interface.

---

## 2. Core Capabilities

1. **Curated Theatrical & Streaming Feeds:** Real-time trending, now playing in cinemas, upcoming releases, popular movies, and all-time top-rated cinema.
2. **Dynamic Search & Discovery:** Debounced live keyword search for titles and actors, alongside genre-filtered catalog exploration.
3. **Comprehensive Movie Dossiers:** High-resolution backdrops, age certification ratings (PG-13, R), plot keyword pills, trailer playback, cast avatars, community critiques, and collaborative recommendation rails.
4. **Talent Filmographies:** Dedicated actor and director profiles with biographical stats and complete movie credits.
5. **Offline Watchlist:** Device-persisted collection of saved movies with fast O(1) membership lookups.

---

## 3. Technology Stack

- **Framework:** React Native (Expo SDK 57+, TypeScript)
- **Networking:** Axios with request/response interceptors, timeout guards, and error normalization
- **Navigation:** React Navigation v6 (Native Stack Navigator + Bottom Tab Navigator)
- **Local Persistence:** `@react-native-async-storage/async-storage`
- **Design System:** Custom Dark Obsidian Design System (`src/theme.ts`) with custom Urbanist typography, curated color palette, and defensive layout design

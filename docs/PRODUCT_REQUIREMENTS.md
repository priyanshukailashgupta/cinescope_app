# PRODUCT_REQUIREMENTS.md — Product Requirements Document (PRD)

> **Document Version:** 1.0.0  
> **Target Audience:** Reviewers at Xplor BizConnect  

---

## 1. Functional Requirements

### 1.1 Home / Discover Module
- **FR-1.1:** Render an auto-scrolling hero carousel featuring the top trending movies of the day (`GET /3/trending/movie/{time_window}`).
- **FR-1.2:** Display horizontal rails for "Now Playing", "Popular", "Top Rated", and "Upcoming Releases" with 2:3 aspect ratio cards.
- **FR-1.3:** Support pull-to-refresh to re-fetch all 5 feeds simultaneously.
- **FR-1.4:** Tapping any card navigates to the `MovieDetailScreen` passing `{ movieId: number }`.

### 1.2 Search & Discovery Module
- **FR-2.1:** Provide real-time debounced search input (350ms delay) to prevent rate limits (`GET /3/search/movie`).
- **FR-2.2:** Support searching for actors/directors (`GET /3/search/person`).
- **FR-2.3:** Dynamically render official genre filter chips (`GET /3/genre/movie/list`).
- **FR-2.4:** Discover and filter catalog based on selected genre with responsive 3-column grid (`GET /3/discover/movie`).

### 1.3 Movie Details Module
- **FR-3.1:** Display high-resolution backdrop with title, tagline, release year, runtime, and TMDB vote average (`GET /3/movie/{movie_id}`).
- **FR-3.2:** Display age rating badge (e.g. PG-13, R) extracted from localized release dates (`GET /3/movie/{movie_id}/release_dates`).
- **FR-3.3:** Render clickable plot keyword topic pills (`GET /3/movie/{movie_id}/keywords`).
- **FR-3.4:** Display horizontal cast avatars with actor name and character role (`GET /3/movie/{movie_id}/credits`).
- **FR-3.5:** Display trailer previews with play triggers (`GET /3/movie/{movie_id}/videos`).
- **FR-3.6:** Render backdrop stills gallery (`GET /3/movie/{movie_id}/images`).
- **FR-3.7:** Display community user reviews and critiques (`GET /3/movie/{movie_id}/reviews`).
- **FR-3.8:** Display "Similar Movies" rail (`GET /3/movie/{movie_id}/similar`) and "Recommended" rail (`GET /3/movie/{movie_id}/recommendations`).
- **FR-3.9:** Provide a persistent bookmark button to toggle movie in local Watchlist.

### 1.4 Person Details Module
- **FR-4.1:** Display actor/director headshot, biography, birthdate, and birthplace (`GET /3/person/{person_id}`).
- **FR-4.2:** Display full filmography grid of movies acted or directed (`GET /3/person/{person_id}/movie_credits`).

### 1.5 Watchlist Module
- **FR-5.1:** Persist saved movies to device storage via `@react-native-async-storage/async-storage`.
- **FR-5.2:** Render list of saved movies with remove action.
- **FR-5.3:** Provide an informative empty state with an "Explore Movies" CTA linking to discovery.

---

## 2. Non-Functional Requirements

- **NFR-1 (Performance):** Screen transitions under 100ms; FlatLists use `initialNumToRender`, `maxToRenderPerBatch`, and `windowSize` optimizations.
- **NFR-2 (Resilience):** Every screen provides explicit Loading (skeleton), Error (with Retry button), and Empty states.
- **NFR-3 (Defensive UI):** Dynamic text never clips or breaks layouts (`numberOfLines={2}`, `ellipsizeMode="tail"`).
- **NFR-4 (Security):** API keys injected via environment variables; never hardcoded in git.

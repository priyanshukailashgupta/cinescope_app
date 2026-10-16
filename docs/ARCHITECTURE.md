# ARCHITECTURE.md — System Design & Component Topology

> **Project:** CineScope  
> **Architecture Style:** Clean Modular Feature Architecture

---

## 1. System Topology

```
                  ┌─────────────────────────────────────┐
                  │          TMDB REST API v3           │
                  └──────────────────┬──────────────────┘
                                     │ HTTPS
                                     ▼
                  ┌─────────────────────────────────────┐
                  │    Centralized Axios API Client     │
                  │   • Request Interceptor (Bearer)    │
                  │   • Timeout Guard (10,000ms)        │
                  │   • Error Normalization             │
                  └──────────────────┬──────────────────┘
                                     │
                 ┌───────────────────┴───────────────────┐
                 ▼                                       ▼
    ┌─────────────────────────┐             ┌─────────────────────────┐
    │  Unified TMDB Service   │             │   AsyncStorage Engine   │
    │  (All 20 Endpoints)     │             │  (Local Device Cache)   │
    └────────────┬────────────┘             └────────────┬────────────┘
                 │                                       │
                 ▼                                       ▼
    ┌─────────────────────────┐             ┌─────────────────────────┐
    │     Custom UI Hooks     │             │    Watchlist Context    │
    │   (Async Data Fetchers) │             │ (O(1) In-Memory Lookup) │
    └────────────┬────────────┘             └────────────┬────────────┘
                 │                                       │
                 └───────────────────┬───────────────────┘
                                     ▼
                  ┌─────────────────────────────────────┐
                  │        React Navigation v6          │
                  │    • Root Native Stack Navigator    │
                  │    • Bottom Tab Navigator           │
                  └──────────────────┬──────────────────┘
                                     │
            ┌────────────────────────┼────────────────────────┐
            ▼                        ▼                        ▼
    ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
    │  HomeScreen  │         │ SearchScreen │         │WatchlistScrn │
    └───────┬──────┘         └───────┬──────┘         └───────┬──────┘
            │                        │                        │
            └────────────────────────┼────────────────────────┘
                                     ▼
                          ┌─────────────────────┐
                          │  MovieDetailScreen  │
                          └──────────┬──────────┘
                                     ▼
                          ┌─────────────────────┐
                          │ PersonDetailScreen  │
                          └─────────────────────┘
```

---

## 2. Navigation Architecture

- **RootStack (Native Stack):**
  - `MainTabs` (Bottom Tab Navigator)
  - `MovieDetail` (Screen param: `{ movieId: number }`)
  - `PersonDetail` (Screen param: `{ personId: number }`)
- **MainTabs (Bottom Tabs):**
  - `HomeTab` -> `HomeScreen`
  - `SearchTab` -> `SearchScreen`
  - `WatchlistTab` -> `WatchlistScreen`

Passing only primitive IDs (`movieId`, `personId`) ensures each screen fetches canonical, fresh data without memory leaks or stale object serialization.

---

## 3. Data Fetching & Caching Strategy

- Custom async hooks provide uniform `{ data, loading, error, refetch }` states.
- Search requests leverage `AbortController` to cancel pending in-flight requests when the user modifies the search query.
- Local Watchlist uses a normalized key-value schema stored in `@react-native-async-storage/async-storage`.

# DATABASE_SCHEMA.md — Local Persistence & Storage Models

> **Engine:** `@react-native-async-storage/async-storage`  
> **Key Namespace:** `@cinescope/watchlist_v1`

---

## 1. Storage Keys

| Key | Type | Description |
|---|---|---|
| `@cinescope/watchlist_v1` | `string` (JSON-serialized Map) | Record of saved movies keyed by `movieId` |

---

## 2. Watchlist Entity Schema

```typescript
export interface WatchlistItem {
  id: number;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  voteAverage: number;
  releaseDate: string;
  genres: string[];
  addedAt: number; // Unix timestamp
}

export type WatchlistStore = Record<number, WatchlistItem>;
```

### Why a Normalized Dictionary Record?
Storing items as `{ [movieId: number]: WatchlistItem }` enables:
- **O(1) Instant Lookup:** Checking whether a movie is saved on the detail screen: `Boolean(watchlist[movieId])`.
- **O(1) Insertion & Deletion:** Adding/removing without traversing or filtering arrays.
- **Conversion to Array:** `Object.values(watchlist)` sorted by `addedAt` descending for UI rendering.

---

## 3. Resilience & Parsing Safeguards
If stored JSON is corrupted, the parser catches the exception, recovers with an empty `{}` store, and prevents runtime app crashes.

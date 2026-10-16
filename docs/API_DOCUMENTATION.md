# API_DOCUMENTATION.md — Complete 20 TMDB Endpoints Specification

> **Base URL:** `https://api.themoviedb.org/3`  
> **Image CDN Base:** `https://image.tmdb.org/t/p/`  
> **Authorization:** Bearer Token via Header `Authorization: Bearer <TOKEN>` or `?api_key=<KEY>`  
> **Audit Status:** 20 of 20 Endpoints Active & Verified in `src/api/tmdb.ts`

---

## The 20 Verified Endpoints

| No. | Screen | Method | Endpoint Path | Function / UI Purpose | Query Params | Status |
|---|---|---|---|---|---|---|
| **1** | Home | `GET` | `/trending/movie/{time_window}` | Hero auto-scroll carousel | `time_window: 'day'` | Active & Verified |
| **2** | Home | `GET` | `/movie/now_playing` | Theatrical releases rail | `page` | Active & Verified |
| **3** | Home | `GET` | `/movie/popular` | Globally popular movies rail | `page` | Active & Verified |
| **4** | Home | `GET` | `/movie/top_rated` | All-time highest rated rail | `page` | Active & Verified |
| **5** | Home | `GET` | `/movie/upcoming` | Coming soon releases rail | `page` | Active & Verified |
| **6** | Search | `GET` | `/genre/movie/list` | Dynamic genre filter chips | `language` | Active & Verified |
| **7** | Search | `GET` | `/discover/movie` | Filtered genre/sort catalog | `with_genres`, `sort_by`, `page` | Active & Verified |
| **8** | Search | `GET` | `/search/movie` | Live debounced title search | `query`, `page` | Active & Verified |
| **9** | Search | `GET` | `/search/person` | Search actors & directors | `query`, `page` | Active & Verified |
| **10** | Details | `GET` | `/movie/{movie_id}` | Core movie dossier & overview | Path: `movie_id` | Active & Verified |
| **11** | Details | `GET` | `/movie/{movie_id}/credits` | Cast & crew horizontal avatars | Path: `movie_id` | Active & Verified |
| **12** | Details | `GET` | `/movie/{movie_id}/videos` | Official YouTube trailers | Path: `movie_id` | Active & Verified |
| **13** | Details | `GET` | `/movie/{movie_id}/release_dates`| Age certification (PG-13, R) | Path: `movie_id` | Active & Verified |
| **14** | Details | `GET` | `/movie/{movie_id}/reviews` | User reviews and critiques | Path: `movie_id`, `page` | Active & Verified |
| **15** | Details | `GET` | `/movie/{movie_id}/keywords` | Story keyword topic pills | Path: `movie_id` | Active & Verified |
| **16** | Details | `GET` | `/movie/{movie_id}/images` | Backdrop & stills photo gallery| Path: `movie_id` | Active & Verified |
| **17** | Details | `GET` | `/movie/{movie_id}/similar` | Mechanically similar movies rail | Path: `movie_id`, `page` | Active & Verified |
| **18** | Details | `GET` | `/movie/{movie_id}/recommendations` | User collaborative recommendations | Path: `movie_id`, `page` | Active & Verified |
| **19** | Person | `GET` | `/person/{person_id}` | Actor biography & life stats | Path: `person_id` | Active & Verified |
| **20** | Person | `GET` | `/person/{person_id}/movie_credits` | Actor complete filmography grid | Path: `person_id` | Active & Verified |

---

## Image Sizing Specifications

- Poster: `https://image.tmdb.org/t/p/w342{poster_path}` (Card thumbnail), `w500` (Hero detail)
- Backdrop: `https://image.tmdb.org/t/p/w780{backdrop_path}`
- Profile Avatar: `https://image.tmdb.org/t/p/w185{profile_path}`

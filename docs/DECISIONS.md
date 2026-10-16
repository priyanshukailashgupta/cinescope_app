# DECISIONS.md — Architecture Decision Records (ADRs)

---

## ADR-001: Selection of Expo Managed Workflow over React Native CLI
* **Status:** Accepted
* **Context:** The project is a take-home assessment evaluated by technical reviewers within a 2-day deadline.
* **Decision:** Use Expo SDK with TypeScript.
* **Consequences:** Eliminates CocoaPods/Xcode and Android NDK build roadblocks on reviewer machines, while allowing instant evaluation via Expo Go or web preview.

---

## ADR-002: Rejection of Global State Libraries (Redux, MobX, Zustand)
* **Status:** Accepted
* **Context:** The application requirements center on movie browsing with client-side favorites persistence.
* **Decision:** Use React Context (`WatchlistContext`) combined with `@react-native-async-storage/async-storage`.
* **Consequences:** Eliminates hundreds of lines of boilerplate actions, reducers, and thunks; keeps code clean, idiomatic, and maintainable for a 0–2 year developer rubric.

---

## ADR-003: Selection of Axios with Interceptors over Native Fetch
* **Status:** Accepted
* **Context:** Connecting 20 distinct TMDB endpoints requires consistent authorization, timeout guards, and error normalization.
* **Decision:** Use a centralized Axios client instance (`src/api/client.ts`).
* **Consequences:** Uniform Bearer token injection, automatic JSON parsing, request cancellation via `AbortController`, and a uniform 10-second timeout guard.

---

## ADR-004: Restrained Dark Cinematic Design System
* **Status:** Accepted
* **Context:** Standard template applications often suffer from cluttered interfaces, inconsistent gradients, and illegible font contrast.
* **Decision:** Establish a custom, tokenized Dark Obsidian design system (`#0B0D14` base, `#161924` elevated cards, `#3B82F6` primary azure accent) with strict 2:3 and 16:9 aspect ratios, defensive boundary constraints (`numberOfLines`, `ellipsizeMode="tail"`), and dynamic layout calculations.
* **Consequences:** The app delivers an authentic, premium movie discovery experience with fluid navigation, consistent visual rhythm, and full responsiveness across diverse phone screens.

---

## ADR-005: Adoption of Official Style Guide (Urbanist Typography & #3B82F6 Palette)
* **Status:** Accepted
* **Context:** Project style guide requires an electric blue aesthetic with `Urbanist` font family.
* **Decision:** Integrated `@expo-google-fonts/urbanist` (`Urbanist_400Regular`, `Urbanist_500Medium`, `Urbanist_600SemiBold`, `Urbanist_700Bold`, `Urbanist_800ExtraBold`) and configured the `#3B82F6` primary accent and shades in `src/theme.ts`. Replaced text glyphs with clean `Ionicons` from `@expo/vector-icons`.
* **Consequences:** The app strictly matches the official visual specification with native vector icons and premium typography.

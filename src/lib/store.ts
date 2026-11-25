import { useSyncExternalStore } from "react";
import type { Title } from "./types";

export type LocalStore<T> = {
  get: () => T;
  set: (v: T | ((prev: T) => T)) => void;
  subscribe: (fn: () => void) => () => void;
  server: () => T;
};

export function createLocalStore<T>(key: string, initial: T): LocalStore<T> {
  let state = initial;
  let loaded = false;
  const subs = new Set<() => void>();
  const load = () => {
    if (loaded || typeof window === "undefined") return;
    loaded = true;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) state = JSON.parse(raw) as T;
    } catch {
      /* ignore corrupt storage */
    }
  };
  return {
    get: () => {
      load();
      return state;
    },
    set: (v) => {
      load();
      state = typeof v === "function" ? (v as (p: T) => T)(state) : v;
      try {
        window.localStorage.setItem(key, JSON.stringify(state));
      } catch {
        /* storage full or blocked */
      }
      subs.forEach((f) => f());
    },
    subscribe: (fn) => {
      subs.add(fn);
      return () => subs.delete(fn);
    },
    server: () => initial,
  };
}

export function useLocalStore<T>(s: LocalStore<T>) {
  return useSyncExternalStore(s.subscribe, s.get, s.server);
}

// ---- App stores ----
export const watchlistStore = createLocalStore<Title[]>("dat.watchlist.v2", []);

export type Preferences = {
  autoplay: boolean;
  startMuted: boolean;
  showDemoChannels: boolean;
  reduceMotion: boolean;
};
export const defaultPreferences: Preferences = {
  autoplay: true,
  startMuted: true,
  showDemoChannels: true,
  reduceMotion: false,
};
export const prefsStore = createLocalStore<Preferences>("dat.prefs", defaultPreferences);

export type CustomChannel = { id: string; name: string; category: string; url: string; addedAt: number };
export const channelsStore = createLocalStore<CustomChannel[]>("dat.channels", []);

export type ProviderSettings = { providerName: string; apiBaseUrl: string; notes: string };
export const providerStore = createLocalStore<ProviderSettings>("dat.provider", {
  providerName: "",
  apiBaseUrl: "",
  notes: "",
});

export function isInWatchlist(list: Title[], id: string): boolean {
  return list.some((title) => title.id === id);
}

export function toggleWatchlist(title: Title) {
  watchlistStore.set((list) =>
    isInWatchlist(list, title.id)
      ? list.filter((item) => item.id !== title.id)
      : [title, ...list],
  );
}

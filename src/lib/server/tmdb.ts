import { createServerFn } from "@tanstack/react-start";

import type { HomeCatalog, Title, TitleType, WatchProvider } from "@/lib/types";
import { cachedJson, serverEnv } from "./http";

const BASE = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/";

type TmdbItem = {
  id?: unknown;
  title?: unknown;
  name?: unknown;
  media_type?: unknown;
  release_date?: unknown;
  first_air_date?: unknown;
  runtime?: unknown;
  number_of_seasons?: unknown;
  vote_average?: unknown;
  genre_ids?: unknown;
  adult?: unknown;
  overview?: unknown;
  poster_path?: unknown;
  backdrop_path?: unknown;
  videos?: unknown;
  watch_providers?: unknown;
  genres?: unknown;
};
type TmdbVideo = {
  key?: string;
  site?: string;
  type?: string;
  official?: boolean;
};
type TmdbProvider = {
  provider_id?: number;
  provider_name?: string;
  logo_path?: string;
};
type TmdbResults = { results?: TmdbItem[] };

const image = (path: unknown, size: string): string =>
  typeof path === "string" && path ? `${IMG}${size}${path}` : "";

const GENRES: Record<number, string> = {
  12: "Adventure", 14: "Fantasy", 16: "Animation", 18: "Drama", 27: "Horror",
  28: "Action", 35: "Comedy", 36: "History", 37: "Western", 53: "Thriller",
  80: "Crime", 99: "Documentary", 878: "Science Fiction", 931: "Mystery",
  9648: "Mystery", 10402: "Music", 10749: "Romance", 10751: "Family",
  10752: "War", 10759: "Action & Adventure", 10762: "Kids", 10763: "News",
  10764: "Reality", 10765: "Sci-Fi & Fantasy", 10766: "Soap", 10767: "Talk",
  10768: "War & Politics",
};

const apiUrl = (path: string, params: Record<string, string> = {}): string => {
  const url = new URL(`${BASE}${path}`);
  url.searchParams.set("api_key", serverEnv("TMDB_API_KEY"));
  url.searchParams.set("language", "en-US");
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  return url.toString();
};

const yearOf = (item: TmdbItem): number | null => {
  const raw = item.release_date ?? item.first_air_date;
  if (typeof raw !== "string" || raw.length < 4) return null;
  const year = Number(raw.slice(0, 4));
  return Number.isFinite(year) ? year : null;
};

const isUpcoming = (item: TmdbItem): boolean => {
  const raw = item.release_date ?? item.first_air_date;
  if (typeof raw !== "string" || !raw) return false;
  const date = new Date(raw);
  return !Number.isNaN(date.getTime()) && date.getTime() > Date.now();
};

const runtimeLabel = (item: TmdbItem): string => {
  const minutes = item.runtime;
  if (typeof minutes === "number" && minutes > 0) {
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  }
  const seasons = item.number_of_seasons;
  if (typeof seasons === "number" && seasons > 0) {
    return `${seasons} ${seasons === 1 ? "Season" : "Seasons"}`;
  }
  return "";
};

export const parseTitleId = (id: string): { type: TitleType; tmdbId: string } | null => {
  const match = /^tmdb-(movie|tv)-(\d+)$/.exec(id);
  if (!match) return null;
  return { type: match[1] as TitleType, tmdbId: match[2] ?? "" };
};

export const titleId = (type: TitleType, id: unknown): string =>
  `tmdb-${type}-${String(id ?? "")}`;

export function mapTmdbItem(item: TmdbItem, type: TitleType): Title {
  const year = yearOf(item);
  const vote = typeof item.vote_average === "number" ? item.vote_average : 0;
  const genreIds = Array.isArray(item.genre_ids) ? item.genre_ids : [];
  return {
    id: titleId(type, item.id),
    type,
    name: String(item.title ?? item.name ?? "Untitled"),
    year,
    releaseDate: String(item.release_date ?? item.first_air_date ?? ""),
    decade: year ? `${Math.floor(year / 10) * 10}s` : "",
    rating: item.adult === true ? "18+" : "",
    duration: runtimeLabel(item),
    genres: genreIds.map((g) => GENRES[Number(g)] ?? String(g)),
    synopsis: String(item.overview ?? ""),
    posterUrl: image(item.poster_path, "w500"),
    backdropUrl: image(item.backdrop_path, "w1280"),
    match: Math.round(vote * 10),
    status: isUpcoming(item) ? "upcoming" : "released",
    trailerKey: "",
    watchProviders: [],
    playback: null,
    source: "tmdb",
    sourceName: "TMDB",
  };
}

const mapVideos = (item: TmdbItem): string => {
  const videosResponse = item.videos as TmdbResults | undefined;
  const results = videosResponse?.results ?? [];
  const videos = results as TmdbVideo[];
  const trailer =
    videos.find((v) => v.site === "YouTube" && v.type === "Trailer" && v.official) ??
    videos.find((v) => v.site === "YouTube" && v.type === "Trailer") ??
    videos.find((v) => v.site === "YouTube");
  return trailer?.key ?? "";
};

const mapProviders = (
  item: TmdbItem,
  type: TitleType,
  tmdbId: string,
): WatchProvider[] => {
  const raw = item.watch_providers as { results?: Record<string, { flatrate?: TmdbProvider[] }> } | undefined;
  const results = raw?.results ?? {};
  const country = results["US"] ?? results["GB"] ?? Object.values(results)[0];
  const providers = country?.flatrate ?? [];
  return providers.slice(0, 5).map((p) => ({
    name: String(p.provider_name ?? "Provider"),
    logoUrl: image(p.logo_path, "w92"),
    link: `https://www.themoviedb.org/${type}/${tmdbId}/watch`,
  }));
};

const enrichTitle = (item: TmdbItem, type: TitleType, parsed: { tmdbId: string }): Title => {
  const base = mapTmdbItem(item, type);
  const genres = Array.isArray(item.genres)
    ? item.genres.map((g: TmdbItem) => String(g.name ?? "")).filter(Boolean)
    : base.genres;
  return {
    ...base,
    genres,
    trailerKey: mapVideos(item),
    watchProviders: mapProviders(item, type, parsed.tmdbId),
  };
};

const emptyCatalog = (error: string): HomeCatalog => ({
  trending: [],
  nowPlaying: [],
  upcoming: [],
  topRated: [],
  tvPopular: [],
  classics: [],
  archive: [],
  error,
});

export const getHomeCatalog = createServerFn({ method: "GET" }).handler(async (): Promise<HomeCatalog> => {
  if (!serverEnv("TMDB_API_KEY")) {
    return emptyCatalog("TMDB_API_KEY is not configured. Add it to .env to load real catalogue data.");
  }
  try {
    const [trending, nowPlaying, upcoming, topRated, tvPopular, classics] = await Promise.all([
      cachedJson<TmdbResults>("tmdb:trending", apiUrl("/trending/all/week")),
      cachedJson<TmdbResults>("tmdb:now-playing", apiUrl("/movie/now_playing")),
      cachedJson<TmdbResults>("tmdb:upcoming", apiUrl("/movie/upcoming")),
      cachedJson<TmdbResults>("tmdb:top-rated", apiUrl("/movie/top_rated")),
      cachedJson<TmdbResults>("tmdb:tv-popular", apiUrl("/tv/popular")),
      cachedJson<TmdbResults>("tmdb:classics", apiUrl("/discover/movie", {
        sort_by: "vote_count.desc",
        "primary_release_date.gte": "1930-01-01",
        "primary_release_date.lte": "1989-12-31",
      })),
    ]);

    return {
      trending: (trending.results ?? []).map((item) =>
        mapTmdbItem(item, item.media_type === "tv" ? "tv" : "movie"),
      ),
      nowPlaying: (nowPlaying.results ?? []).map((item) => mapTmdbItem(item, "movie")),
      upcoming: (upcoming.results ?? []).map((item) => mapTmdbItem(item, "movie")),
      topRated: (topRated.results ?? []).map((item) => mapTmdbItem(item, "movie")),
      tvPopular: (tvPopular.results ?? []).map((item) => mapTmdbItem(item, "tv")),
      classics: (classics.results ?? []).map((item) => mapTmdbItem(item, "movie")),
      archive: [],
      error: "",
    };
  } catch (error) {
    return emptyCatalog(error instanceof Error ? error.message : "Could not load TMDB catalogue.");
  }
});

export async function fetchTmdbTitle(id: string): Promise<Title | null> {
  const parsed = parseTitleId(id);
  if (!parsed || !serverEnv("TMDB_API_KEY")) return null;
  try {
    const item = await cachedJson<TmdbItem>(
      `tmdb:detail:${parsed.type}:${parsed.tmdbId}`,
      apiUrl(`/${parsed.type}/${parsed.tmdbId}`, { append_to_response: "videos,watch_providers" }),
    );
    return enrichTitle(item, parsed.type, parsed);
  } catch {
    return null;
  }
}

export const getTitle = createServerFn({ method: "GET" })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }): Promise<Title | null> => fetchTmdbTitle(data.id));

export const searchTitles = createServerFn({ method: "GET" })
  .validator((input: { query: string }) => input)
  .handler(async ({ data }): Promise<Title[]> => {
    const q = data.query.trim();
    if (!q || !serverEnv("TMDB_API_KEY")) return [];
    try {
      const results = await cachedJson<TmdbResults>(
        `tmdb:search:${q.toLowerCase()}`,
        apiUrl("/search/multi", { query: q, include_adult: "false" }),
      );
      return (results.results ?? [])
        .filter((item) => item.media_type === "movie" || item.media_type === "tv")
        .map((item) => mapTmdbItem(item, item.media_type === "tv" ? "tv" : "movie"));
    } catch {
      return [];
    }
  });

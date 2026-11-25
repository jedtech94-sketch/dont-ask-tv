import type { Title } from "./types";

export type {
  HomeCatalog,
  LiveChannel,
  PlaybackKind,
  PlaybackSource,
  SportsData,
  SportsEvent,
  Title,
  TitleType,
  WatchProvider,
} from "./types";

export const formatYear = (title: Title): string =>
  title.year ? String(title.year) : title.status === "upcoming" ? "Coming soon" : "—";

export const decadeOf = (year: number | null): string =>
  year ? `${Math.floor(year / 10) * 10}s` : "";

export const allGenres = (titles: Title[]): string[] =>
  Array.from(new Set(titles.flatMap((t) => t.genres))).sort();

export const filterByGenre = (titles: Title[], genre: string | null): Title[] =>
  genre ? titles.filter((t) => t.genres.includes(genre)) : titles;

export const searchLocal = (titles: Title[], query: string): Title[] => {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return titles.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.synopsis.toLowerCase().includes(q) ||
      t.genres.some((g) => g.toLowerCase().includes(q)),
  );
};

export const uniqueById = (titles: Title[]): Title[] => {
  const seen = new Set<string>();
  return titles.filter((t) => {
    if (seen.has(t.id)) return false;
    seen.add(t.id);
    return true;
  });
};

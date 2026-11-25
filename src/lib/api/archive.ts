import { createServerFn } from "@tanstack/react-start";

import type { Title } from "@/lib/types";
import { cachedJson, serverEnv } from "./http";

type SearchResponse = {
  response?: {
    docs?: Array<{ identifier?: string; title?: string; year?: string }>;
  };
};

type ArchiveFile = { name?: string; format?: string; size?: string };
type MetadataResponse = {
  metadata?: { title?: string; description?: string | string[]; year?: string; licenseurl?: string };
  files?: ArchiveFile[];
};

const searchUrl = (collections: string): string => {
  const params = new URLSearchParams();
  const clause = collections
    .split(",")
    .map((value) => `collection:${value.trim()}`)
    .filter(Boolean)
    .join(" OR ");
  params.set("q", `(${clause || "collection:feature_films"}) AND mediatype:movies`);
  params.append("fl[]", "identifier");
  params.append("fl[]", "title");
  params.append("fl[]", "year");
  params.set("rows", "12");
  params.set("page", "1");
  params.set("output", "json");
  return `https://archive.org/advancedsearch.php?${params.toString()}`;
};

const pickMp4 = (files: ArchiveFile[]): string => {
  const mp4s = files
    .filter((file) => typeof file.name === "string" && file.name.toLowerCase().endsWith(".mp4"))
    .filter((file) => Number(file.size ?? 0) > 0)
    .sort((a, b) => Number(a.size ?? 0) - Number(b.size ?? 0));
  const file = mp4s.find((f) => /mpeg4|h\.264/i.test(f.format ?? "")) ?? mp4s[0];
  return file?.name ?? "";
};

const toTitle = (doc: { identifier?: string; title?: string }, meta: MetadataResponse): Title | null => {
  const identifier = doc.identifier;
  if (!identifier) return null;
  const filename = pickMp4(meta.files ?? []);
  if (!filename) return null;

  const rawYear = meta.metadata?.year ?? "";
  const year = Number.parseInt(String(rawYear).slice(0, 4), 10);
  const description = meta.metadata?.description;
  const synopsis = Array.isArray(description)
    ? description.join(" ")
    : typeof description === "string"
      ? description
      : String(doc.title ?? "");

  return {
    id: `archive-${identifier}`,
    type: "movie",
    name: String(meta.metadata?.title ?? doc.title ?? identifier),
    year: Number.isFinite(year) ? year : null,
    releaseDate: Number.isFinite(year) ? String(year) : "",
    decade: Number.isFinite(year) ? `${Math.floor(year / 10) * 10}s` : "",
    rating: "Public domain",
    duration: "",
    genres: ["Public domain"],
    synopsis: synopsis.slice(0, 600),
    posterUrl: `https://archive.org/services/img/${encodeURIComponent(identifier)}`,
    backdropUrl: `https://archive.org/services/img/${encodeURIComponent(identifier)}`,
    match: 0,
    status: "released",
    trailerKey: "",
    watchProviders: [],
    playback: {
      kind: "archive",
      url: `https://archive.org/download/${encodeURIComponent(identifier)}/${encodeURIComponent(filename)}`,
      label: "Play public-domain film",
      licenseNote: meta.metadata?.licenseurl
        ? `Licence: ${String(meta.metadata.licenseurl)}`
        : "Public-domain / Creative Commons item hosted by Internet Archive.",
    },
    source: "archive",
    sourceName: "Internet Archive",
  };
};

export async function fetchArchiveMovies(): Promise<Title[]> {
  const collections = serverEnv("ARCHIVE_COLLECTIONS") || "feature_films,public_domain,opensource_movies";
  if (!collections.trim()) return [];
  try {
    const search = await cachedJson<SearchResponse>(
      `archive:search:${collections}`,
      searchUrl(collections),
      60 * 60 * 1000,
    );
    const docs = search.response?.docs ?? [];
    const titles = await Promise.all(
      docs.map(async (doc) => {
        const identifier = doc.identifier ?? "";
        const meta = await cachedJson<MetadataResponse>(
          `archive:meta:${identifier}`,
          `https://archive.org/metadata/${encodeURIComponent(identifier)}`,
          60 * 60 * 1000,
        );
        return toTitle(doc, meta);
      }),
    );
    return titles.filter((title): title is Title => title !== null);
  } catch {
    return [];
  }
}

export async function fetchArchiveTitle(id: string): Promise<Title | null> {
  const identifier = id.replace(/^archive-/, "");
  if (!identifier) return null;
  try {
    const meta = await cachedJson<MetadataResponse>(
      `archive:meta:${identifier}`,
      `https://archive.org/metadata/${encodeURIComponent(identifier)}`,
      60 * 60 * 1000,
    );
    return toTitle({ identifier, title: String(meta.metadata?.title ?? "") }, meta);
  } catch {
    return null;
  }
}

export const getArchiveMovies = createServerFn({ method: "GET" }).handler(
  async (): Promise<Title[]> => fetchArchiveMovies(),
);

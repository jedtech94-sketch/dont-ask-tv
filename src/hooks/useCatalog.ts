import { useQuery } from "@tanstack/react-query";

import { getArchiveMovies } from "@/lib/server/archive";
import { getTitleById } from "@/lib/server/catalog";
import { getLiveChannels } from "@/lib/server/liveChannels";
import { getSportsData } from "@/lib/server/sports";
import { getHomeCatalog, searchTitles } from "@/lib/server/tmdb";
import type { HomeCatalog, SportsData } from "@/lib/types";

const EMPTY_CATALOG: HomeCatalog = {
  trending: [],
  nowPlaying: [],
  upcoming: [],
  topRated: [],
  tvPopular: [],
  classics: [],
  archive: [],
  error: "",
};

const EMPTY_SPORTS: SportsData = { events: [], tv: [], highlights: [], error: "" };

export function useCatalog() {
  const home = useQuery({
    queryKey: ["catalog", "home"],
    queryFn: () => getHomeCatalog(),
    staleTime: 10 * 60 * 1000,
  });
  const archive = useQuery({
    queryKey: ["catalog", "archive"],
    queryFn: () => getArchiveMovies(),
    staleTime: 60 * 60 * 1000,
  });

  const data: HomeCatalog = {
    ...(home.data ?? EMPTY_CATALOG),
    archive: archive.data ?? [],
    error:
      home.data?.error ||
      (archive.isError ? "Could not load public-domain films from Internet Archive." : ""),
  };

  return {
    ...data,
    isLoading: home.isLoading || archive.isLoading,
    isError: home.isError || archive.isError,
  };
}

export function useTitle(id: string) {
  return useQuery({
    queryKey: ["title", id],
    queryFn: () => getTitleById({ data: { id } }),
    enabled: Boolean(id),
    staleTime: 10 * 60 * 1000,
  });
}

export function useSearchTitles(query: string) {
  return useQuery({
    queryKey: ["search", query.trim().toLowerCase()],
    queryFn: () => searchTitles({ data: { query } }),
    enabled: query.trim().length > 0,
    staleTime: 10 * 60 * 1000,
  });
}

export function useSports() {
  const query = useQuery({
    queryKey: ["sports"],
    queryFn: () => getSportsData(),
    staleTime: 10 * 60 * 1000,
  });
  return { ...(query.data ?? EMPTY_SPORTS), isLoading: query.isLoading };
}

export function useLiveChannels() {
  return useQuery({
    queryKey: ["live", "channels"],
    queryFn: () => getLiveChannels(),
    staleTime: 10 * 60 * 1000,
  });
}

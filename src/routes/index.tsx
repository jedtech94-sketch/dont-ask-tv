import { createFileRoute } from "@tanstack/react-router";
import { Film } from "lucide-react";
import { EmptyState } from "@/components/tv/Empty";
import { Hero } from "@/components/tv/Hero";
import { Row } from "@/components/tv/Row";
import { useCatalog } from "@/hooks/useCatalog";
import { useLocalStore, watchlistStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DONT ASK TV — Home" },
      { name: "description", content: "Real movies, series, upcoming releases, free public-domain films, live TV and sports." },
      { property: "og:title", content: "DONT ASK TV — Home" },
      { property: "og:description", content: "Real movies, series, upcoming releases, free public-domain films, live TV and sports." },
    ],
  }),
  component: Index,
});

function Index() {
  const { trending, nowPlaying, upcoming, topRated, tvPopular, classics, archive, error, isLoading } = useCatalog();
  const saved = useLocalStore(watchlistStore);

  const featured = trending[0] ?? nowPlaying[0] ?? upcoming[0] ?? archive[0];

  if (!featured) {
    return (
      <EmptyState
        icon={<Film className="h-7 w-7" />}
        title={isLoading ? "Loading real catalogue…" : "Catalogue unavailable"}
      >
        {error || "Add TMDB_API_KEY to .env, then restart the app to load real titles."}
      </EmptyState>
    );
  }

  return (
    <>
      <Hero title={featured} eyebrow="Featured now" />
      {error && (
        <p className="px-4 pt-6 text-sm text-warning sm:px-8 lg:px-12" role="status">
          {error}
        </p>
      )}
      <div className="relative z-10 -mt-10 space-y-10">
        {saved.length > 0 && <Row label="My List" titles={saved} />}
        <Row label="Trending this week" titles={trending} />
        <Row label="Now playing" titles={nowPlaying} />
        <Row label="Coming soon" titles={upcoming} />
        <Row label="Free public-domain films" titles={archive} />
        <Row label="Classics" titles={classics} />
        <Row label="Top rated" titles={topRated} />
        <Row label="TV series" titles={tvPopular} />
      </div>
    </>
  );
}

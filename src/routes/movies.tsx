import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { EmptyState, PageHeader } from "@/components/tv/Empty";
import { Grid } from "@/components/tv/Row";
import { useCatalog } from "@/hooks/useCatalog";
import { allGenres, filterByGenre, uniqueById } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/movies")({
  head: () => ({
    meta: [
      { title: "Movies — DONT ASK TV" },
      { name: "description", content: "Real movies: new releases, upcoming titles, classics and free public-domain films." },
      { property: "og:title", content: "Movies — DONT ASK TV" },
      { property: "og:description", content: "Real movies: new releases, upcoming titles, classics and free public-domain films." },
    ],
  }),
  component: Page,
});

function Page() {
  const { trending, nowPlaying, upcoming, topRated, classics, archive, error, isLoading } = useCatalog();
  const [genre, setGenre] = useState<string | null>(null);

  const items = uniqueById([
    ...nowPlaying,
    ...upcoming,
    ...topRated,
    ...classics,
    ...archive,
    ...trending.filter((title) => title.type === "movie"),
  ]);
  const genres = allGenres(items);
  const shown = filterByGenre(items, genre);

  return (
    <>
      <PageHeader title="Movies">
        Real releases, upcoming titles and classics from TMDB, plus free public-domain films from Internet Archive.
      </PageHeader>
      {genre && <div className="px-4 pb-4 text-sm text-muted-foreground sm:px-8 lg:px-12">Filtering by {genre}</div>}
      {items.length === 0 ? (
        <EmptyState icon={null} title={isLoading ? "Loading movies…" : "No movies available"}>
          {error || "Add TMDB_API_KEY to .env to load real movies."}
        </EmptyState>
      ) : (
        <>
          <div className="scrollbar-none mb-6 flex gap-2 overflow-x-auto px-4 sm:px-8 lg:px-12" role="group" aria-label="Filter by genre">
            {[null, ...genres].map((g) => (
              <button
                key={g ?? "all"}
                onClick={() => setGenre(g)}
                aria-pressed={genre === g}
                className={cn(
                  "min-h-11 shrink-0 rounded-full border px-4 text-sm transition",
                  genre === g ? "border-foreground bg-foreground text-background" : "hover:bg-accent",
                )}
              >
                {g ?? "All"}
              </button>
            ))}
          </div>
          <Grid titles={shown} />
        </>
      )}
    </>
  );
}

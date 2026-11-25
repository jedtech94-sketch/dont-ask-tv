import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { EmptyState, PageHeader } from "@/components/tv/Empty";
import { Grid } from "@/components/tv/Row";
import { useCatalog } from "@/hooks/useCatalog";
import { allGenres, filterByGenre, uniqueById } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/series")({
  head: () => ({
    meta: [
      { title: "Series — DONT ASK TV" },
      { name: "description", content: "Real TV series metadata, artwork and trailers from TMDB." },
      { property: "og:title", content: "Series — DONT ASK TV" },
      { property: "og:description", content: "Real TV series metadata, artwork and trailers from TMDB." },
    ],
  }),
  component: Page,
});

function Page() {
  const { tvPopular, trending, error, isLoading } = useCatalog();
  const [genre, setGenre] = useState<string | null>(null);

  const items = uniqueById([...tvPopular, ...trending.filter((title) => title.type === "tv")]);
  const genres = allGenres(items);
  const shown = filterByGenre(items, genre);

  return (
    <>
      <PageHeader title="Series">Real TV series metadata, artwork and official trailers from TMDB.</PageHeader>
      {items.length === 0 ? (
        <EmptyState icon={null} title={isLoading ? "Loading series…" : "No series available"}>
          {error || "Add TMDB_API_KEY to .env to load real series."}
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

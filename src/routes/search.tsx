import { createFileRoute } from "@tanstack/react-router";
import { Search as SearchIcon, X } from "lucide-react";
import { useEffect, useState } from "react";
import { EmptyState, PageHeader } from "@/components/tv/Empty";
import { Grid } from "@/components/tv/Row";
import { useSearchTitles } from "@/hooks/useCatalog";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search — DONT ASK TV" },
      { name: "description", content: "Search real movies and TV series from TMDB." },
      { property: "og:title", content: "Search — DONT ASK TV" },
      { property: "og:description", content: "Search real movies and TV series from TMDB." },
    ],
  }),
  component: Page,
});

function Page() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const results = useSearchTitles(query);

  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(input), 300);
    return () => window.clearTimeout(timer);
  }, [input]);

  const items = results.data ?? [];

  return (
    <>
      <PageHeader title="Search">Search real movies and TV series from TMDB.</PageHeader>
      <div className="px-4 pb-8 sm:px-8 lg:px-12">
        <label className="relative block max-w-2xl">
          <span className="sr-only">Search titles</span>
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            autoFocus
            value={input}
            onChange={(event) => setInput(event.target.value)}
            maxLength={80}
            placeholder="Titles, people, genres…"
            className="h-14 w-full rounded-md border border-input bg-surface pl-12 pr-12 text-base outline-none focus:border-ring"
          />
          {input && (
            <button
              onClick={() => setInput("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full hover:bg-accent"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </label>
        <p className="mt-3 text-sm text-muted-foreground" aria-live="polite">
          {query.trim()
            ? results.isLoading
              ? "Searching…"
              : `${items.length} result${items.length === 1 ? "" : "s"}`
            : "Try a movie, a series or a genre."}
        </p>
      </div>
      {query.trim() && items.length > 0 ? (
        <Grid titles={items} />
      ) : query.trim() && !results.isLoading ? (
        <EmptyState icon={<SearchIcon className="h-7 w-7" />} title={`No matches for “${query.trim()}”`}>
          Try a different title or genre.
        </EmptyState>
      ) : null}
    </>
  );
}

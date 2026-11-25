import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeft, Check, ExternalLink, Info, Plus } from "lucide-react";
import { PosterArt } from "@/components/tv/Poster";
import { Player } from "@/components/tv/Player";
import { Row } from "@/components/tv/Row";
import { TrailerButton } from "@/components/tv/Trailer";
import { useCatalog } from "@/hooks/useCatalog";
import { isInWatchlist, toggleWatchlist, useLocalStore, watchlistStore } from "@/lib/store";
import { getTitleById } from "@/lib/server/catalog";

export const Route = createFileRoute("/title/$id")({
  loader: async ({ params }) => {
    const title = await getTitleById({ data: { id: params.id } });
    if (!title) throw notFound();
    return { title };
  },
  head: ({ loaderData }) => {
    const title = loaderData?.title;
    const name = title ? `${title.name} — DONT ASK TV` : "Title unavailable — DONT ASK TV";
    const desc = title?.synopsis ?? "This title isn't in the catalogue.";
    return {
      meta: [
        { title: name },
        { name: "description", content: desc },
        { property: "og:title", content: name },
        { property: "og:description", content: desc },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="px-6 pt-32 text-center">
      <h1 className="text-2xl font-bold">Title not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Configure TMDB_API_KEY to load real catalogue data.
      </p>
      <Link to="/" className="mt-6 inline-flex min-h-12 items-center rounded-md bg-primary px-6 font-bold text-primary-foreground">
        Back home
      </Link>
    </div>
  ),
  component: Page,
});

function Page() {
  const { title } = Route.useLoaderData();
  const list = useLocalStore(watchlistStore);
  const saved = isInWatchlist(list, title.id);
  const catalog = useCatalog();
  const similar = [...catalog.trending, ...catalog.nowPlaying, ...catalog.tvPopular, ...catalog.archive]
    .filter((item) => item.id !== title.id && item.genres.some((genre) => title.genres.includes(genre)))
    .filter((item, index, all) => all.findIndex((other) => other.id === item.id) === index)
    .slice(0, 12);
  const playable = title.playback;

  return (
    <article className="pt-20">
      <div className="px-4 sm:px-8 lg:px-12">
        <Link to="/" className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div className="grid gap-8 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <PosterArt title={title} wide className="shadow-card" />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
              {title.type === "movie" ? "Movie" : "Series"} · {title.sourceName}
            </p>
            <h1 className="mt-2 font-display text-5xl leading-none md:text-7xl">{title.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {title.match > 0 && <span className="font-semibold text-success">{title.match}% match</span>}
              <span>{title.year ?? "—"}</span>
              {title.rating && <span className="rounded-sm border border-input px-1.5 text-xs">{title.rating}</span>}
              {title.duration && <span>{title.duration}</span>}
              {title.status === "upcoming" && <span className="text-primary">Coming soon</span>}
            </div>
            <p className="mt-4 text-foreground/85">{title.synopsis}</p>
            {title.genres.length > 0 && (
              <p className="mt-3 text-sm text-muted-foreground">Genres: {title.genres.join(", ")}</p>
            )}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => toggleWatchlist(title)}
                aria-pressed={saved}
                className="inline-flex min-h-12 items-center gap-2 rounded-md bg-foreground px-6 font-bold text-background hover:bg-foreground/85"
              >
                {saved ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                {saved ? "In My List" : "Add to My List"}
              </button>
              <TrailerButton videoKey={title.trailerKey} />
            </div>

            {title.status === "upcoming" && (
              <p className="mt-6 flex gap-3 rounded-md border bg-surface p-4 text-sm text-muted-foreground">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                This title hasn't been released yet. Watch the official trailer above and check availability below.
              </p>
            )}

            {playable && (playable.kind === "archive" || playable.kind === "mp4" || playable.kind === "hls") && (
              <div className="mt-8">
                <h2 className="mb-3 text-lg font-bold">{playable.label}</h2>
                <Player url={playable.url} label={title.name} />
                <p className="mt-2 text-xs text-muted-foreground">{playable.licenseNote}</p>
              </div>
            )}

            {title.watchProviders.length > 0 && (
              <div className="mt-8">
                <h2 className="mb-3 text-lg font-bold">Where to watch</h2>
                <ul className="flex flex-wrap gap-3">
                  {title.watchProviders.map((provider) => (
                    <li key={provider.name}>
                      <a
                        href={provider.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-11 items-center gap-2 rounded-md border px-3 text-sm hover:bg-accent"
                      >
                        {provider.logoUrl && <img src={provider.logoUrl} alt="" className="h-6 w-6 rounded" />}
                        {provider.name}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-muted-foreground">
                  Links open TMDB. Availability varies by region; no playback is hosted here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      {similar.length > 0 && <div className="mt-12"><Row label="More like this" titles={similar} /></div>}
    </article>
  );
}

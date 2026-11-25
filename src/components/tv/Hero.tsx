import { Link } from "@tanstack/react-router";
import { Check, Info, Plus } from "lucide-react";
import type { Title } from "@/lib/catalog";
import { isInWatchlist, toggleWatchlist, useLocalStore, watchlistStore } from "@/lib/store";
import { TrailerButton } from "./Trailer";

export function Hero({ title, eyebrow = "Featured today" }: { title: Title; eyebrow?: string }) {
  const list = useLocalStore(watchlistStore);
  const saved = isInWatchlist(list, title.id);
  const image = title.backdropUrl || title.posterUrl;

  return (
    <section className="relative min-h-[70vh] w-full overflow-hidden md:min-h-[82vh]">
      {image && <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />}
      <div className="bg-hero-fade absolute inset-0" />
      <div className="relative flex min-h-[70vh] flex-col justify-end px-4 pb-14 pt-28 sm:px-8 md:min-h-[82vh] md:max-w-2xl lg:px-12">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-primary">
          {eyebrow} · {title.sourceName}
        </p>
        <h1 className="font-display text-6xl leading-[0.9] md:text-8xl">{title.name}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          {title.match > 0 && <span className="font-semibold text-success">{title.match}% match</span>}
          <span>{title.year ?? "—"}</span>
          {title.rating && <span className="rounded-sm border border-input px-1.5 text-xs">{title.rating}</span>}
          {title.duration && <span>{title.duration}</span>}
          {title.status === "upcoming" && <span className="text-primary">Coming soon</span>}
        </div>
        <p className="mt-4 max-w-xl text-base text-foreground/85 md:text-lg">{title.synopsis}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/title/$id"
            params={{ id: title.id }}
            className="inline-flex min-h-12 items-center gap-2 rounded-md bg-foreground px-6 font-bold text-background transition hover:bg-foreground/85"
          >
            <Info className="h-5 w-5" /> More info
          </Link>
          <TrailerButton videoKey={title.trailerKey} className="bg-secondary/80 backdrop-blur" />
          <button
            onClick={() => toggleWatchlist(title)}
            aria-pressed={saved}
            className="inline-flex min-h-12 items-center gap-2 rounded-md bg-secondary/80 px-6 font-bold backdrop-blur transition hover:bg-accent"
          >
            {saved ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            {saved ? "In My List" : "My List"}
          </button>
        </div>
      </div>
    </section>
  );
}

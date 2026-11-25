import { useState } from "react";
import type { Title } from "@/lib/catalog";
import { cn } from "@/lib/utils";

/** Real TMDB / Internet Archive artwork with a graceful gradient fallback. */
export function PosterArt({ title, wide = false, className }: { title: Title; wide?: boolean; className?: string }) {
  const [failed, setFailed] = useState(false);
  const src = wide
    ? title.backdropUrl || title.posterUrl
    : title.posterUrl || title.backdropUrl;
  const badge = title.source === "archive"
    ? "Public domain"
    : title.status === "upcoming"
      ? "Upcoming"
      : "TMDB";

  return (
    <div
      className={cn("relative overflow-hidden rounded-md bg-surface", wide ? "aspect-video" : "aspect-[2/3]", className)}
      role="img"
      aria-label={`Artwork for ${title.name}`}
    >
      {src && !failed ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-surface to-background" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-transparent to-transparent" />
      <span className="absolute left-2 top-2 rounded-sm bg-overlay px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {badge}
      </span>
      <div className="absolute inset-x-0 bottom-0 p-3">
        <p className={cn("font-display leading-none text-foreground drop-shadow", wide ? "text-3xl" : "text-2xl")}>
          {title.name}
        </p>
      </div>
    </div>
  );
}

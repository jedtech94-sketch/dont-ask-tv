import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import type { Title } from "@/lib/catalog";
import { PosterArt } from "./Poster";

export function TitleCard({ title }: { title: Title }) {
  return (
    <Link
      to="/title/$id"
      params={{ id: title.id }}
      className="group block w-36 shrink-0 snap-start sm:w-44 lg:w-48"
      aria-label={`${title.name}, ${title.year}, ${title.type}`}
    >
      <PosterArt title={title} className="shadow-card transition-transform duration-300 group-hover:scale-[1.04] group-focus-visible:scale-[1.04]" />
      <p className="mt-2 truncate text-sm font-medium text-foreground/90">{title.name}</p>
      <p className="text-xs text-muted-foreground">{title.year ?? "—"} · {title.genres[0] ?? title.sourceName}</p>
    </Link>
  );
}

export function Row({ label, titles }: { label: string; titles: Title[] }) {
  const ref = useRef<HTMLDivElement>(null);
  if (!titles.length) return null;
  const scroll = (d: number) => ref.current?.scrollBy({ left: d * ref.current.clientWidth * 0.85, behavior: "smooth" });
  return (
    <section className="group/row relative" aria-label={label}>
      <h2 className="mb-3 px-4 text-lg font-bold sm:px-8 lg:px-12">{label}</h2>
      <div className="relative">
        <button onClick={() => scroll(-1)} aria-label={`Scroll ${label} left`} className="absolute left-0 top-0 z-10 hidden h-[calc(100%-3rem)] w-12 items-center justify-center bg-gradient-to-r from-background to-transparent opacity-0 transition group-hover/row:opacity-100 focus-visible:opacity-100 md:flex">
          <ChevronLeft className="h-8 w-8" />
        </button>
        <div ref={ref} className="scrollbar-none flex snap-x gap-3 overflow-x-auto scroll-px-4 px-4 pb-2 sm:scroll-px-8 sm:px-8 lg:scroll-px-12 lg:px-12">
          {titles.map((t) => <TitleCard key={t.id} title={t} />)}
        </div>
        <button onClick={() => scroll(1)} aria-label={`Scroll ${label} right`} className="absolute right-0 top-0 z-10 hidden h-[calc(100%-3rem)] w-12 items-center justify-center bg-gradient-to-l from-background to-transparent opacity-0 transition group-hover/row:opacity-100 focus-visible:opacity-100 md:flex">
          <ChevronRight className="h-8 w-8" />
        </button>
      </div>
    </section>
  );
}

export function Grid({ titles }: { titles: Title[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 px-4 sm:grid-cols-3 sm:px-8 md:grid-cols-4 lg:grid-cols-6 lg:px-12">
      {titles.map((t) => (
        <Link key={t.id} to="/title/$id" params={{ id: t.id }} className="group block" aria-label={t.name}>
          <PosterArt title={t} className="shadow-card transition-transform group-hover:scale-[1.03]" />
          <p className="mt-2 truncate text-sm font-medium">{t.name}</p>
          <p className="text-xs text-muted-foreground">{t.year ?? "—"} · {t.genres.join(", ") || t.sourceName}</p>
        </Link>
      ))}
    </div>
  );
}

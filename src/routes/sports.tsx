import { Link, createFileRoute } from "@tanstack/react-router";
import { CalendarDays, ExternalLink, PlayCircle, Radio, Tv } from "lucide-react";
import type { ReactNode } from "react";
import { EmptyState, PageHeader } from "@/components/tv/Empty";
import { EmbedPlayer } from "@/components/tv/EmbedPlayer";
import { useSports } from "@/hooks/useCatalog";
import type { SportsEvent } from "@/lib/types";

export const Route = createFileRoute("/sports")({
  head: () => ({
    meta: [
      { title: "Sports — DONT ASK TV" },
      { name: "description", content: "Sports fixtures, TV listings and official highlights from TheSportsDB." },
      { property: "og:title", content: "Sports — DONT ASK TV" },
      { property: "og:description", content: "Sports fixtures, TV listings and official highlights from TheSportsDB." },
    ],
  }),
  component: Page,
});

function EventCard({ event }: { event: SportsEvent }) {
  return (
    <li className="flex items-center gap-4 rounded-lg border bg-card p-4">
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{event.name}</p>
        <p className="text-xs text-muted-foreground">
          {event.league || event.sport} · {event.date || "Date TBA"} {event.time}
        </p>
        {event.tvChannels.length > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">TV: {event.tvChannels.join(", ")}</p>
        )}
      </div>
      {event.status === "live" && (
        <span className="shrink-0 rounded-sm bg-destructive px-2 py-1 text-[10px] font-bold uppercase text-destructive-foreground">
          Live
        </span>
      )}
      {event.homeScore || event.awayScore ? (
        <span className="shrink-0 font-display text-xl">{event.homeScore} – {event.awayScore}</span>
      ) : null}
      <a
        href={event.link}
        target="_blank"
        rel="noreferrer"
        aria-label={`Details for ${event.name}`}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-accent"
      >
        <ExternalLink className="h-4 w-4" />
      </a>
    </li>
  );
}

function Section({ title, icon, events }: { title: string; icon: ReactNode; events: SportsEvent[] }) {
  if (!events.length) return null;
  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 text-xl font-bold">{icon}{title}</h2>
      <ul className="grid gap-3 lg:grid-cols-2">
        {events.map((event) => <EventCard key={`${title}-${event.id}`} event={event} />)}
      </ul>
    </section>
  );
}

function Page() {
  const { events, tv, highlights, error, isLoading } = useSports();

  return (
    <>
      <PageHeader title="Sports">
        Real fixtures, TV listings and official highlights from TheSportsDB. For live broadcaster streams, see{" "}
        <Link to="/live" className="text-primary hover:underline">Live TV</Link>.
      </PageHeader>
      <div className="space-y-10 px-4 pb-12 sm:px-8 lg:px-12">
        {error && (
          <p className="rounded-md border border-warning/30 bg-warning/10 p-3 text-sm">{error}</p>
        )}
        <Section title="Live now" icon={<Radio className="h-5 w-5 text-destructive" />} events={events.filter((e) => e.status === "live")} />
        <Section title="Upcoming fixtures" icon={<CalendarDays className="h-5 w-5 text-primary" />} events={events.filter((e) => e.status === "scheduled")} />
        <Section title="TV schedule" icon={<Tv className="h-5 w-5 text-primary" />} events={tv} />

        {highlights.length > 0 && (
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-xl font-bold"><PlayCircle className="h-5 w-5 text-primary" /> Official highlights</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {highlights.filter((event) => event.highlightKey).map((event) => (
                <div key={`highlight-${event.id}`}>
                  <EmbedPlayer
                    url={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(event.highlightKey)}`}
                    label={event.name}
                  />
                  <p className="mt-2 text-sm font-medium">{event.name}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {isLoading && <p className="text-sm text-muted-foreground">Loading sports data…</p>}
        {!isLoading && events.length === 0 && tv.length === 0 && highlights.length === 0 && (
          <EmptyState icon={<Radio className="h-7 w-7" />} title="No sports data available">
            Check the connection to TheSportsDB or try again later.
          </EmptyState>
        )}
      </div>
    </>
  );
}

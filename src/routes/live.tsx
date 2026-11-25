import { Link, createFileRoute } from "@tanstack/react-router";
import { ExternalLink, Link2Off, Plus, Radio, Tv } from "lucide-react";
import { useState } from "react";
import { EmptyState, PageHeader } from "@/components/tv/Empty";
import { EmbedPlayer } from "@/components/tv/EmbedPlayer";
import { Player } from "@/components/tv/Player";
import { useLiveChannels } from "@/hooks/useCatalog";
import { channelsStore, useLocalStore } from "@/lib/store";
import type { LiveChannel } from "@/lib/types";
import { streamKind } from "@/lib/validation";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/live")({
  head: () => ({
    meta: [
      { title: "Live TV — DONT ASK TV" },
      { name: "description", content: "Official free live TV and sports channels you can watch legally." },
      { property: "og:title", content: "Live TV — DONT ASK TV" },
      { property: "og:description", content: "Official free live TV and sports channels you can watch legally." },
    ],
  }),
  component: Page,
});

function Page() {
  const curated = useLiveChannels();
  const custom = useLocalStore(channelsStore);
  const [cat, setCat] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const customChannels: LiveChannel[] = custom.map((channel, index) => {
    const kind = streamKind(channel.url);
    return {
      id: channel.id,
      name: channel.name,
      category: channel.category,
      number: 1000 + index,
      region: "Your device",
      sourceName: "Your authorized stream",
      licenseNote: "Added by you. You confirmed you are licensed to access this stream.",
      playback: {
        kind: kind === "hls" ? "hls" : "mp4",
        url: channel.url,
        label: `Play ${channel.name}`,
        licenseNote: "Authorized stream configured in Admin.",
      },
    };
  });

  const items = [...customChannels, ...(curated.data ?? [])];
  const cats = Array.from(new Set(items.map((item) => item.category)));
  const shown = cat ? items.filter((item) => item.category === cat) : items;
  const current = items.find((item) => item.id === selected);

  return (
    <>
      <PageHeader title="Live TV">
        Official free channels and your own authorized streams. Looking for fixtures?{" "}
        <Link to="/sports" className="text-primary hover:underline">Browse sports</Link>.
      </PageHeader>
      <div className="px-4 sm:px-8 lg:px-12">
        {current && (
          <section className="mb-8" aria-label="Now playing">
            {current.playback.kind === "youtube" || current.playback.kind === "link-out" ? (
              current.playback.kind === "youtube" ? (
                <EmbedPlayer url={current.playback.url} label={current.name} />
              ) : (
                <a
                  href={current.playback.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-surface p-6 text-center hover:bg-accent"
                >
                  <ExternalLink className="h-10 w-10 text-muted-foreground" />
                  <span className="text-lg font-bold">Open {current.name} live</span>
                  <span className="max-w-md text-sm text-muted-foreground">
                    This broadcaster stream plays on YouTube. Geo restrictions may apply.
                  </span>
                </a>
              )
            ) : (
              <Player url={current.playback.url} label={current.name} />
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold">{current.name}</h2>
              <span className="rounded-sm bg-muted px-2 py-0.5 text-xs uppercase text-muted-foreground">
                {current.playback.kind === "youtube" || current.playback.kind === "link-out" ? "YouTube" : current.playback.kind}
              </span>
              <span className="text-xs text-muted-foreground">{current.region} · {current.sourceName}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{current.playback.licenseNote}</p>
          </section>
        )}

        {items.length === 0 ? (
          <EmptyState
            icon={<Radio className="h-7 w-7" />}
            title={curated.isLoading ? "Loading channels…" : "No channels yet"}
            action={
              <Link to="/admin" className="inline-flex min-h-12 items-center rounded-md bg-primary px-6 font-bold text-primary-foreground">
                Add a channel
              </Link>
            }
          >
            Add a stream you're authorized to access in Admin.
          </EmptyState>
        ) : (
          <>
            <div className="scrollbar-none mb-6 flex gap-2 overflow-x-auto" role="group" aria-label="Channel categories">
              {[null, ...cats].map((c) => (
                <button
                  key={c ?? "all"}
                  onClick={() => setCat(c)}
                  aria-pressed={cat === c}
                  className={cn(
                    "min-h-11 shrink-0 rounded-full border px-4 text-sm transition",
                    cat === c ? "border-foreground bg-foreground text-background" : "hover:bg-accent",
                  )}
                >
                  {c ?? "All"}
                </button>
              ))}
            </div>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {shown.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setSelected(item.id);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    aria-pressed={selected === item.id}
                    className={cn(
                      "flex min-h-20 w-full items-center gap-4 rounded-lg border bg-card p-4 text-left transition hover:bg-accent",
                      selected === item.id && "border-primary",
                    )}
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-muted">
                      <Tv className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.category}{item.number ? ` · Ch ${item.number}` : ""}
                      </p>
                    </div>
                    {item.playback.kind === "link-out" ? (
                      <span className="shrink-0 rounded-sm border border-warning/40 px-2 py-1 text-[10px] font-bold uppercase text-warning">
                        Opens YouTube
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-sm bg-muted px-2 py-1 text-[10px] font-bold uppercase text-muted-foreground">
                        {item.playback.kind}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/admin"
                className="inline-flex min-h-12 items-center gap-2 rounded-md border px-6 font-semibold hover:bg-accent"
              >
                <Plus className="h-5 w-5" /> Add your own authorized stream
              </Link>
              {items.some((item) => item.playback.kind === "link-out") && (
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Link2Off className="h-4 w-4" />
                  Some broadcasters only allow playback on YouTube. Rights remain with the channel owner.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

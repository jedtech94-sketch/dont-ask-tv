import { Link, createFileRoute } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/tv/Empty";
import { Grid } from "@/components/tv/Row";
import { useLocalStore, watchlistStore } from "@/lib/store";

export const Route = createFileRoute("/my-list")({
  head: () => ({
    meta: [
      { title: "My List — DONT ASK TV" },
      { name: "description", content: "Real titles you saved to watch later, stored on this device." },
      { property: "og:title", content: "My List — DONT ASK TV" },
      { property: "og:description", content: "Real titles you saved to watch later, stored on this device." },
    ],
  }),
  component: Page,
});

function Page() {
  const items = useLocalStore(watchlistStore);
  return (
    <>
      <PageHeader title="My List">Saved on this device.</PageHeader>
      {items.length ? (
        <Grid titles={items} />
      ) : (
        <EmptyState
          icon={<Bookmark className="h-7 w-7" />}
          title="Your list is empty"
          action={
            <Link to="/" className="inline-flex min-h-12 items-center rounded-md bg-primary px-6 font-bold text-primary-foreground">
              Browse titles
            </Link>
          }
        >
          Tap “My List” on any real title to save it here.
        </EmptyState>
      )}
    </>
  );
}

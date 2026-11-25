import { createFileRoute } from "@tanstack/react-router";
import { KeyRound, ShieldCheck, Trash2 } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { PageHeader } from "@/components/tv/Empty";
import { channelsStore, defaultPreferences, prefsStore, providerStore, useLocalStore, watchlistStore, type Preferences } from "@/lib/store";
import { CHANNEL_CATEGORIES, channelSchema, isHttpUrl } from "@/lib/validation";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin & Settings — DONT ASK TV" },
      { name: "description", content: "Manage authorized live channel URLs, preferences and provider settings." },
      { property: "og:title", content: "Admin & Settings — DONT ASK TV" },
      { property: "og:description", content: "Manage authorized live channel URLs, preferences and provider settings." },
    ],
  }),
  component: Page,
});

const field = "h-12 w-full rounded-md border border-input bg-surface px-3 text-base outline-none focus:border-ring";

function Card({ title, icon, children }: { title: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-lg border bg-card p-5 md:p-6">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">{icon}{title}</h2>
      {children}
    </section>
  );
}

function Page() {
  return (
    <>
      <PageHeader title="Admin">
        Settings and custom streams are stored on this device only. Real catalogue data comes from TMDB via a server-side key.
      </PageHeader>
      <div className="grid gap-6 px-4 sm:px-8 lg:grid-cols-2 lg:px-12">
        <ChannelForm />
        <ChannelList />
        <PrefsCard />
        <ProviderCard />
      </div>
    </>
  );
}

function ChannelForm() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>(CHANNEL_CATEGORIES[0]);
  const [url, setUrl] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [ok, setOk] = useState<string | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setOk(null);
    const r = channelSchema.safeParse({ name, category, url, authorized });
    if (!r.success) {
      const errs: Record<string, string> = {};
      r.error.issues.forEach((i) => (errs[String(i.path[0])] ??= i.message));
      return setErrors(errs);
    }
    setErrors({});
    channelsStore.set((l) => [{ id: crypto.randomUUID(), name: r.data.name, category: r.data.category, url: r.data.url, addedAt: Date.now() }, ...l]);
    setOk(`“${r.data.name}” added to Live TV.`);
    setName(""); setUrl(""); setAuthorized(false);
  };

  const err = (k: string) => errors[k] && <p id={`${k}-err`} className="mt-1 text-sm text-destructive">{errors[k]}</p>;

  return (
    <Card title="Add live channel" icon={<ShieldCheck className="h-5 w-5 text-primary" />}>
      <p className="mb-4 rounded-md border border-warning/30 bg-warning/10 p-3 text-sm">
        Only add streams you are licensed or otherwise authorized to access. DRM-protected or paywalled streams are not supported and must not be bypassed.
      </p>
      <form onSubmit={submit} noValidate className="space-y-4">
        <div>
          <label htmlFor="ch-name" className="mb-1 block text-sm font-medium">Channel name</label>
          <input id="ch-name" className={field} value={name} maxLength={60} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors["name"]} aria-describedby="name-err" />
          {err("name")}
        </div>
        <div>
          <label htmlFor="ch-cat" className="mb-1 block text-sm font-medium">Category</label>
          <select id="ch-cat" className={field} value={category} onChange={(e) => setCategory(e.target.value)}>
            {CHANNEL_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="ch-url" className="mb-1 block text-sm font-medium">Stream URL (.m3u8 or .mp4)</label>
          <input id="ch-url" type="url" inputMode="url" className={field} placeholder="https://your-provider.example/stream.m3u8" value={url} onChange={(e) => setUrl(e.target.value)} aria-invalid={!!errors["url"]} aria-describedby="url-err" />
          {err("url")}
          {url && !errors["url"] && !isHttpUrl(url) && <p className="mt-1 text-xs text-muted-foreground">Must start with http:// or https://</p>}
        </div>
        <label className="flex min-h-11 cursor-pointer items-start gap-3 text-sm">
          <input type="checkbox" className="mt-1 h-5 w-5 accent-primary" checked={authorized} onChange={(e) => setAuthorized(e.target.checked)} aria-describedby="authorized-err" />
          <span>I confirm I am licensed or authorized to access this stream.</span>
        </label>
        {err("authorized")}
        <button type="submit" className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-primary px-6 font-bold text-primary-foreground hover:bg-primary/90 sm:w-auto">Add channel</button>
        {ok && <p role="status" className="text-sm text-success">{ok}</p>}
      </form>
    </Card>
  );
}

function ChannelList() {
  const list = useLocalStore(channelsStore);
  return (
    <Card title={`Your channels (${list.length})`}>
      {list.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No channels added yet. Channels you add appear in Live TV.</p>
      ) : (
        <ul className="divide-y">
          {list.map((c) => (
            <li key={c.id} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{c.name} <span className="text-xs text-muted-foreground">· {c.category}</span></p>
                <p className="truncate text-xs text-muted-foreground">{c.url}</p>
              </div>
              <button onClick={() => { if (confirm(`Remove “${c.name}”?`)) channelsStore.set((l) => l.filter((x) => x.id !== c.id)); }}
                aria-label={`Remove ${c.name}`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-destructive">
                <Trash2 className="h-5 w-5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

const PREF_LABELS: Record<keyof Preferences, string> = {
  autoplay: "Autoplay live channels",
  startMuted: "Start playback muted",
  showDemoChannels: "Show demo channel placeholders",
  reduceMotion: "Reduce motion",
};

function PrefsCard() {
  const prefs = useLocalStore(prefsStore);
  return (
    <Card title="Preferences">
      <ul className="space-y-1">
        {(Object.keys(PREF_LABELS) as (keyof Preferences)[]).map((k) => (
          <li key={k}>
            <label className="flex min-h-12 cursor-pointer items-center justify-between gap-4">
              <span className="text-sm">{PREF_LABELS[k]}</span>
              <input type="checkbox" role="switch" className="h-5 w-5 accent-primary" checked={prefs[k]} onChange={(e) => prefsStore.set({ ...prefs, [k]: e.target.checked })} />
            </label>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap gap-3 border-t pt-4">
        <button onClick={() => prefsStore.set(defaultPreferences)} className="min-h-11 rounded-md border px-4 text-sm hover:bg-accent">Reset preferences</button>
        <button onClick={() => { if (confirm("Clear My List?")) watchlistStore.set([]); }} className="min-h-11 rounded-md border px-4 text-sm hover:bg-accent">Clear My List</button>
      </div>
    </Card>
  );
}

function ProviderCard() {
  const saved = useLocalStore(providerStore);
  const [form, setForm] = useState(saved);
  const [msg, setMsg] = useState<string | null>(null);
  const save = (e: FormEvent) => {
    e.preventDefault();
    if (form.apiBaseUrl && !isHttpUrl(form.apiBaseUrl)) return setMsg("API base URL must be http:// or https://");
    providerStore.set({ providerName: form.providerName.trim().slice(0, 80), apiBaseUrl: form.apiBaseUrl.trim(), notes: form.notes.slice(0, 500) });
    setMsg("Saved locally. No connection is made yet.");
  };
  return (
    <Card title="Provider integration" icon={<KeyRound className="h-5 w-5 text-primary" />}>
      <div className="mb-4 flex items-center gap-2">
        <span className="rounded-sm bg-muted px-2 py-1 text-xs font-bold uppercase text-muted-foreground">Not connected</span>
        <span className="text-xs text-muted-foreground">Placeholder for a future licensed provider API</span>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        Real catalogue metadata is loaded through TMDB using a server-only key in <code className="rounded bg-muted px-1">.env</code>. On-demand playback requires a licensed provider and a secure backend; credentials must never be stored in the app.
      </p>
      <form onSubmit={save} className="space-y-4">
        <div>
          <label htmlFor="pv-name" className="mb-1 block text-sm font-medium">Provider name</label>
          <input id="pv-name" className={field} value={form.providerName} maxLength={80} onChange={(e) => setForm({ ...form, providerName: e.target.value })} />
        </div>
        <div>
          <label htmlFor="pv-url" className="mb-1 block text-sm font-medium">API base URL</label>
          <input id="pv-url" type="url" className={field} placeholder="https://api.provider.example" value={form.apiBaseUrl} onChange={(e) => setForm({ ...form, apiBaseUrl: e.target.value })} />
        </div>
        <div>
          <label htmlFor="pv-notes" className="mb-1 block text-sm font-medium">Notes</label>
          <textarea id="pv-notes" rows={3} maxLength={500} className="w-full rounded-md border border-input bg-surface p-3 text-base outline-none focus:border-ring" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
        <button type="submit" className="min-h-12 rounded-md border px-6 font-semibold hover:bg-accent">Save placeholder</button>
        {msg && <p role="status" className="text-sm text-muted-foreground">{msg}</p>}
      </form>
    </Card>
  );
}

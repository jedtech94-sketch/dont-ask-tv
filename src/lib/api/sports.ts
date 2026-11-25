import { createServerFn } from "@tanstack/react-start";

import type { SportsData, SportsEvent } from "@/lib/types";
import { cachedJson, serverEnv } from "./http";

type SportsRow = {
  idEvent?: unknown;
  id?: unknown;
  strEvent?: unknown;
  name?: unknown;
  strStatus?: unknown;
  intHomeScore?: unknown;
  intAwayScore?: unknown;
  strSport?: unknown;
  strLeague?: unknown;
  dateEvent?: unknown;
  date?: unknown;
  strTime?: unknown;
  strHomeTeam?: unknown;
  strAwayTeam?: unknown;
  strThumb?: unknown;
  strChannel?: unknown;
  strTVStation?: unknown;
  strYoutube?: unknown;
};
type SportsResponse = { events?: SportsRow[] | null };

const BASE = "https://www.thesportsdb.com/api/v1/json";
const LEAGUES = ["4328", "4335", "4331", "4332", "4370"];

const text = (value: unknown): string => (value == null ? "" : String(value));

const today = (): string => new Date().toISOString().slice(0, 10);

const youtubeKey = (value: unknown): string => {
  const raw = text(value);
  const match = /(?:v=|youtu\.be\/|embed\/|\/)([\w-]{11})(?:\?|&|$)/.exec(raw);
  return match?.[1] ?? "";
};

const mapEvent = (row: SportsRow): SportsEvent | null => {
  const id = text(row.idEvent ?? row.id);
  const name = text(row.strEvent ?? row.name);
  if (!id || !name) return null;
  const status = text(row.strStatus).toLowerCase();
  const homeScore = text(row.intHomeScore);
  const awayScore = text(row.intAwayScore);
  const finished = Boolean(homeScore || awayScore) && !status.includes("live");
  return {
    id,
    name,
    sport: text(row.strSport),
    league: text(row.strLeague),
    date: text(row.dateEvent ?? row.date),
    time: text(row.strTime),
    status: status.includes("live") ? "live" : finished ? "finished" : "scheduled",
    homeTeam: text(row.strHomeTeam),
    awayTeam: text(row.strAwayTeam),
    homeScore,
    awayScore,
    thumbnail: text(row.strThumb),
    tvChannels: [text(row.strChannel), text(row.strTVStation)].filter(Boolean),
    highlightKey: youtubeKey(row.strYoutube),
    link: `https://www.thesportsdb.com/event/${id}`,
  };
};

const endpoint = (key: string, path: string, params: Record<string, string> = {}): string => {
  const url = new URL(`${BASE}/${key}/${path}`);
  Object.entries(params).forEach(([name, value]) => url.searchParams.set(name, value));
  return url.toString();
};

export const getSportsData = createServerFn({ method: "GET" }).handler(async (): Promise<SportsData> => {
  const key = serverEnv("SPORTS_API_KEY") || "123";
  try {
    const [day, ...leagues] = await Promise.all([
      cachedJson<SportsResponse>("sports:day", endpoint(key, "eventsday.php", { d: today() }), 15 * 60 * 1000),
      ...LEAGUES.map((id) =>
        cachedJson<SportsResponse>(`sports:league:${id}`, endpoint(key, "eventsnextleague.php", { id }), 60 * 60 * 1000),
      ),
    ]);

    const tv = await cachedJson<SportsResponse>(
      "sports:tv",
      endpoint(key, "eventstv.php", { d: today() }),
      30 * 60 * 1000,
    );
    const highlights = await cachedJson<SportsResponse>(
      "sports:highlights",
      endpoint(key, "eventshighlights.php", { d: today() }),
      30 * 60 * 1000,
    );

    const toEvents = (response: SportsResponse): SportsEvent[] =>
      (response.events ?? []).map(mapEvent).filter((event): event is SportsEvent => event !== null);

    const events = [...toEvents(day), ...leagues.flatMap(toEvents)].filter(
      (event, index, all) => all.findIndex((other) => other.id === event.id) === index,
    );

    return {
      events,
      tv: toEvents(tv),
      highlights: toEvents(highlights),
      error: "",
    };
  } catch (error) {
    return {
      events: [],
      tv: [],
      highlights: [],
      error: error instanceof Error ? error.message : "Could not load sports data.",
    };
  }
});

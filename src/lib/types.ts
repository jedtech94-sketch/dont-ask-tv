export type TitleType = "movie" | "tv";

export type PlaybackKind =
  | "trailer"
  | "archive"
  | "youtube"
  | "mp4"
  | "hls"
  | "link-out";

export type WatchProvider = {
  name: string;
  logoUrl: string;
  link: string;
};

export type PlaybackSource = {
  kind: PlaybackKind;
  url: string;
  label: string;
  licenseNote: string;
};

export type Title = {
  id: string;
  type: TitleType;
  name: string;
  year: number | null;
  releaseDate: string;
  decade: string;
  rating: string;
  duration: string;
  genres: string[];
  synopsis: string;
  posterUrl: string;
  backdropUrl: string;
  match: number;
  status: "released" | "upcoming";
  trailerKey: string;
  watchProviders: WatchProvider[];
  playback: PlaybackSource | null;
  source: "tmdb" | "archive";
  sourceName: string;
};

export type LiveChannel = {
  id: string;
  name: string;
  category: string;
  number: number;
  playback: PlaybackSource;
  sourceName: string;
  licenseNote: string;
  region: string;
};

export type SportsEvent = {
  id: string;
  name: string;
  sport: string;
  league: string;
  date: string;
  time: string;
  status: "scheduled" | "live" | "finished";
  homeTeam: string;
  awayTeam: string;
  homeScore: string;
  awayScore: string;
  thumbnail: string;
  tvChannels: string[];
  highlightKey: string;
  link: string;
};

export type HomeCatalog = {
  trending: Title[];
  nowPlaying: Title[];
  upcoming: Title[];
  topRated: Title[];
  tvPopular: Title[];
  classics: Title[];
  archive: Title[];
  error: string;
};

export type SportsData = {
  events: SportsEvent[];
  tv: SportsEvent[];
  highlights: SportsEvent[];
  error: string;
};

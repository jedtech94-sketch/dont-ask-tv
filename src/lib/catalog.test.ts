import { describe, expect, it } from "vitest";

import { allGenres, filterByGenre, searchLocal, uniqueById } from "./catalog";
import type { Title } from "./types";

const title = (id: string, name: string, genres: string[]): Title => ({
  id,
  type: "movie",
  name,
  year: 2024,
  releaseDate: "2024-01-01",
  decade: "2020s",
  rating: "",
  duration: "",
  genres,
  synopsis: `Story about ${name}.`,
  posterUrl: "",
  backdropUrl: "",
  match: 80,
  status: "released",
  trailerKey: "",
  watchProviders: [],
  playback: null,
  source: "tmdb",
  sourceName: "TMDB",
});

describe("catalogue helpers", () => {
  const titles = [title("a", "Alpha", ["Drama"]), title("b", "Beta", ["Comedy"]), title("c", "Gamma", ["Drama"])];

  it("collects and sorts genres", () => {
    expect(allGenres(titles)).toEqual(["Comedy", "Drama"]);
  });

  it("filters by genre", () => {
    expect(filterByGenre(titles, "Drama").map((t) => t.id)).toEqual(["a", "c"]);
  });

  it("searches by name, synopsis and genre", () => {
    expect(searchLocal(titles, "drama").map((t) => t.id)).toEqual(["a", "c"]);
    expect(searchLocal(titles, "Beta").map((t) => t.id)).toEqual(["b"]);
  });

  it("removes duplicate ids", () => {
    expect(uniqueById([...titles, titles[0] as Title])).toHaveLength(3);
  });
});

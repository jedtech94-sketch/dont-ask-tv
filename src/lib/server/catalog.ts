import { createServerFn } from "@tanstack/react-start";

import type { Title } from "@/lib/types";
import { fetchArchiveTitle } from "./archive";
import { fetchTmdbTitle } from "./tmdb";

/** Resolves a detail page for either a TMDB id or a public-domain Archive id. */
export const getTitleById = createServerFn({ method: "GET" })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }): Promise<Title | null> => {
    if (data.id.startsWith("archive-")) return fetchArchiveTitle(data.id);
    return fetchTmdbTitle(data.id);
  });

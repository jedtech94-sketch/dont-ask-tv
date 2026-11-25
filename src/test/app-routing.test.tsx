import { readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const routesDir = path.resolve(process.cwd(), "src", "routes");

describe("App routes", () => {
  const files = readdirSync(routesDir).filter((name) => name.endsWith(".tsx"));

  it.each([
    "index.tsx",
    "movies.tsx",
    "series.tsx",
    "live.tsx",
    "sports.tsx",
    "search.tsx",
    "admin.tsx",
    "my-list.tsx",
    "title.$id.tsx",
  ])("has the %s route file", (name) => {
    expect(files).toContain(name);
  });
});

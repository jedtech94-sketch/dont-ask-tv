import { describe, expect, it } from "vitest";
import { channelSchema, isHttpUrl, streamKind } from "./validation";

describe("channel URL rules", () => {
  it("accepts http and https only", () => {
    expect(isHttpUrl("https://example.com/live.m3u8")).toBe(true);
    expect(isHttpUrl("http://example.com/a.mp4")).toBe(true);
    expect(isHttpUrl("ftp://example.com/a.mp4")).toBe(false);
    expect(isHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isHttpUrl("not a url")).toBe(false);
  });
  it("detects stream type", () => {
    expect(streamKind("https://x.com/a.m3u8?t=1")).toBe("hls");
    expect(streamKind("https://x.com/a.MP4")).toBe("mp4");
  });
  it("requires authorization confirmation", () => {
    const r = channelSchema.safeParse({ name: "A", category: "News", url: "https://x.com/a.m3u8", authorized: false });
    expect(r.success).toBe(false);
  });
});

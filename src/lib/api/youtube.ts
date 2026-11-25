import { cachedJson, serverEnv } from "./http";

type ChannelsResponse = { items?: Array<{ id?: string }> };
type SearchResponse = { items?: Array<{ id?: { videoId?: string } }> };

/** Resolves a broadcaster's current official YouTube live stream into a privacy-enhanced embed URL. */
export async function resolveLiveEmbed(handle: string): Promise<string> {
  const key = serverEnv("YOUTUBE_API_KEY");
  if (!key || !handle) return "";

  try {
    const channels = await cachedJson<ChannelsResponse>(
      `youtube:channel:${handle}`,
      `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${encodeURIComponent(handle)}&key=${key}`,
      60 * 60 * 1000,
    );
    const channelId = channels.items?.[0]?.id;
    if (!channelId) return "";

    const search = await cachedJson<SearchResponse>(
      `youtube:live:${channelId}`,
      `https://www.googleapis.com/youtube/v3/search?part=id&type=video&eventType=live&channelId=${channelId}&key=${key}`,
      5 * 60 * 1000,
    );
    const videoId = search.items?.[0]?.id?.videoId;
    return videoId
      ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1`
      : "";
  } catch {
    return "";
  }
}

import { createServerFn } from "@tanstack/react-start";

import type { LiveChannel } from "@/lib/types";
import { resolveLiveEmbed } from "./youtube";

type CuratedChannel = {
  id: string;
  name: string;
  category: string;
  handle: string;
  number: number;
  region: string;
};

const CURATED: CuratedChannel[] = [
  { id: "nasa", name: "NASA TV", category: "Documentary", handle: "NASA", number: 101, region: "Global" },
  { id: "dw", name: "DW News", category: "News", handle: "DW", number: 201, region: "Global" },
  { id: "france24", name: "France 24", category: "News", handle: "France24", number: 202, region: "Global" },
  { id: "aljazeera", name: "Al Jazeera English", category: "News", handle: "AlJazeeraEnglish", number: 203, region: "Global" },
  { id: "espn", name: "ESPN", category: "Sports", handle: "ESPN", number: 301, region: "Regional" },
  { id: "fifa", name: "FIFA", category: "Sports", handle: "FIFA", number: 302, region: "Global" },
  { id: "nba", name: "NBA", category: "Sports", handle: "NBA", number: 303, region: "Regional" },
  { id: "icc", name: "ICC Cricket", category: "Sports", handle: "ICC", number: 304, region: "Global" },
];

const licenseNote = (name: string): string =>
  `Official ${name} YouTube stream. Video rights remain with the broadcaster; geo restrictions may apply.`;

export const getLiveChannels = createServerFn({ method: "GET" }).handler(async (): Promise<LiveChannel[]> => {
  return Promise.all(
    CURATED.map(async (channel): Promise<LiveChannel> => {
      const embed = await resolveLiveEmbed(channel.handle);
      const url = embed || `https://www.youtube.com/${channel.handle}/live`;
      return {
        id: `live-${channel.id}`,
        name: channel.name,
        category: channel.category,
        number: channel.number,
        region: channel.region,
        sourceName: `${channel.name} (official YouTube)`,
        licenseNote: licenseNote(channel.name),
        playback: {
          kind: embed ? "youtube" : "link-out",
          url,
          label: embed ? `Watch ${channel.name} live` : `Open ${channel.name} live`,
          licenseNote: licenseNote(channel.name),
        },
      };
    }),
  );
});

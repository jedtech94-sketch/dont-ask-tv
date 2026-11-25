import { z } from "zod";

export const CHANNEL_CATEGORIES = ["News", "Sports", "Entertainment", "Kids", "Music", "Documentary", "Local"] as const;

export function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function streamKind(url: string): "hls" | "mp4" | "other" {
  const path = (url.split("?")[0] ?? "").toLowerCase();
  if (path.endsWith(".m3u8")) return "hls";
  if (path.endsWith(".mp4")) return "mp4";
  return "other";
}

export const channelSchema = z.object({
  name: z.string().trim().min(1, "Channel name is required").max(60, "Keep the name under 60 characters"),
  category: z.enum(CHANNEL_CATEGORIES),
  url: z
    .string()
    .trim()
    .max(2000, "URL is too long")
    .refine(isHttpUrl, "Enter a valid http:// or https:// URL"),
  authorized: z.literal(true, { errorMap: () => ({ message: "Confirm you are licensed to access this stream" }) }),
});

import { AlertTriangle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { streamKind } from "@/lib/validation";
import { prefsStore, useLocalStore } from "@/lib/store";

/** Plays an authorized HLS (.m3u8) or MP4 URL. No DRM handling — protected streams need a licensed provider SDK. */
export function Player({ url, label }: { url: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const prefs = useLocalStore(prefsStore);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    setError(null);
    let destroy: (() => void) | undefined;
    let cancelled = false;
    const kind = streamKind(url);
    if (kind === "hls" && !video.canPlayType("application/vnd.apple.mpegurl")) {
      import("hls.js").then(({ default: Hls }) => {
        if (cancelled) return;
        if (!Hls.isSupported()) return setError("This browser can't play HLS streams.");
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (_e, data) => {
          if (data.fatal) setError("The stream couldn't be loaded. Check the URL, your access rights, or the provider's CORS settings.");
        });
        destroy = () => hls.destroy();
      });
    } else {
      video.src = url;
      destroy = () => { video.removeAttribute("src"); video.load(); };
    }
    return () => { cancelled = true; destroy?.(); };
  }, [url]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-surface shadow-card">
      <video
        ref={ref}
        className="h-full w-full"
        controls
        playsInline
        autoPlay={prefs.autoplay}
        muted={prefs.startMuted}
        aria-label={`Player: ${label}`}
        onError={() => setError("The video couldn't be played. Check the URL and that you are authorized to access it.")}
      />
      {error && (
        <div role="alert" className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-overlay p-6 text-center">
          <AlertTriangle className="h-10 w-10 text-warning" />
          <p className="max-w-sm text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}

import { Play, X } from "lucide-react";
import { useEffect, useState } from "react";

export function TrailerButton({ videoKey, className = "" }: { videoKey: string; className?: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);

  if (!videoKey) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex min-h-12 items-center gap-2 rounded-md border border-input px-6 font-semibold hover:bg-accent ${className}`}
      >
        <Play className="h-5 w-5" /> Watch trailer
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Official trailer"
          onClick={() => setOpen(false)}
        >
          <div className="w-full max-w-4xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close trailer"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-input bg-background hover:bg-accent"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black shadow-card">
              <iframe
                className="absolute inset-0 h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoKey)}?autoplay=1`}
                title="Official trailer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

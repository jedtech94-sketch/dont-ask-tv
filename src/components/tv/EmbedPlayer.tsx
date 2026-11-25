export function EmbedPlayer({ url, label }: { url: string; label: string }) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black shadow-card">
      <iframe
        className="absolute inset-0 h-full w-full"
        src={url}
        title={`Player: ${label}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

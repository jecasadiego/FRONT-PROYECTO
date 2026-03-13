import { useState } from "react";
import type { MediaItem } from "../types";

interface MediaPosterProps {
  item: MediaItem;
  variant?: "hero" | "tile" | "modal";
  className?: string;
}

export function MediaPoster({ item, variant = "tile", className = "" }: MediaPosterProps) {
  const [failed, setFailed] = useState(false);
  const showFallback = failed || !item.coverImage.trim();

  return (
    <div className={`media-poster media-poster--${variant} ${className}`.trim()}>
      {!showFallback ? (
        <img src={item.coverImage} alt={item.title} loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <div className="media-poster__fallback">
          <span className="media-poster__type">{item.type.name}</span>
          <strong>{item.title}</strong>
          <p>{item.genre.name}</p>
          <span className="media-poster__year">{item.releaseYear}</span>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";

interface CardImageProps {
  src?: string;
  alt: string;
  aspect?: "square" | "video";
  fallbackGradient?: string;
}

const DEFAULT_GRADIENT = "linear-gradient(135deg, #fbcfe8, #c4b5fd)";

// Thumbnail with a themed gradient fallback. Renders <img> when src loads;
// on missing src or load error, renders a same-aspect gradient block so
// layout never collapses.
export function CardImage({
  src,
  alt,
  aspect = "square",
  fallbackGradient = DEFAULT_GRADIENT,
}: CardImageProps) {
  const [errored, setErrored] = useState(false);
  const aspectClass = aspect === "video" ? "aspect-video" : "aspect-square";
  const showFallback = !src || errored;

  if (showFallback) {
    return (
      <div
        data-testid="card-image-fallback"
        className={`w-full ${aspectClass} rounded-md`}
        style={{ background: fallbackGradient }}
        aria-label={alt}
      />
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setErrored(true)}
      className={`w-full ${aspectClass} object-cover rounded-md`}
    />
  );
}

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
  // Wrap the <img> in an overflow-hidden container so the hover-zoom
  // doesn't leak out of the rounded frame. The `group-hover` selector
  // pairs with the surrounding CardGrid item or anchor — falls back
  // gracefully to no-zoom if the parent doesn't add the `group` class
  // (CSS selectors without a matching ancestor are silently inert).
  return (
    <div className={`relative w-full ${aspectClass} overflow-hidden rounded-md`}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onError={() => setErrored(true)}
        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
      />
    </div>
  );
}

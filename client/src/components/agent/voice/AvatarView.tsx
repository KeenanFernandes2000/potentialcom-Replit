import { useEffect, useRef } from "react";
import type { RemoteVideoTrack } from "livekit-client";

interface AvatarViewProps {
  /** Anam video track from useLiveKitVoice.avatarVideoTrack. Null
   *  while connecting (or if avatar mode wasn't requested). */
  track: RemoteVideoTrack | null;
  /** Fallback static avatar image (Ruby's existing PNG) shown during
   *  the connection delay. */
  avatarUrl?: string;
  /** Agent name — alt text for the fallback img + sr-only label for
   *  the video element. */
  agentName: string;
}

/**
 * Renders an Anam-provided video track into a <video> element, with a
 * static-image fallback while the track is null. Audio routing: Anam
 * publishes audio separately as an audio track on the same participant;
 * useLiveKitVoice's existing TrackSubscribed handler auto-attaches all
 * audio tracks. This <video> is rendered muted so we don't double-play
 * audio.
 *
 * Aspect ratio: aspect-video (16:9) — verify against Anam's default
 * output during smoke test; switch to aspect-[4/5] if portrait reads
 * better.
 */
export function AvatarView({ track, avatarUrl, agentName }: AvatarViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !track) return;
    track.attach(el);
    return () => {
      track.detach();
    };
  }, [track]);

  if (!track) {
    // Connecting / no-avatar state: show the static avatar with a
    // caption so the user knows the dot is loading.
    return (
      <div
        className="relative flex h-full w-full items-center justify-center bg-muted"
        data-testid="avatar-view-fallback"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={agentName}
            className="h-32 w-32 rounded-full object-cover opacity-90"
          />
        ) : (
          <div className="h-32 w-32 rounded-full bg-primary/10" />
        )}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-background/80 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
          Connecting…
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-muted">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        aria-label={`${agentName} avatar video`}
        className="h-full w-full object-cover"
        data-testid="avatar-view-video"
      />
    </div>
  );
}

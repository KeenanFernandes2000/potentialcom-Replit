import { Mic, MicOff, PhoneOff } from "lucide-react";
import type { RemoteVideoTrack } from "livekit-client";
import { AvatarView } from "./AvatarView";
import type { VoiceState } from "./useLiveKitVoice";

interface AvatarPaneProps {
  /** Anam-published video track. Null while connecting. */
  track: RemoteVideoTrack | null;
  /** Fallback static avatar shown until the track arrives. */
  avatarUrl?: string;
  /** Used in the LIVE badge, sr labels, and the alt text for the
   *  static-image fallback. */
  agentName: string;
  state: VoiceState;
  durationMs: number;
  isMuted: boolean;
  onMute: () => void;
  onHangup: () => void;
}

function formatDuration(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function stateLabel(state: VoiceState): string {
  switch (state) {
    case "connecting":
      return "Connecting…";
    case "listening":
      return "Listening";
    case "user-speaking":
      return "Listening";
    case "agent-speaking":
      return "Speaking";
    case "ending":
      return "Ending call";
    case "error":
      return "Call dropped";
    default:
      return "On call";
  }
}

/**
 * Premium video-call pane that hosts Ruby's Anam avatar on the LEFT
 * side of the AgentChat shell when the user picks "Voice + Avatar".
 *
 * Visual treatment is intentionally on-brand: blurred purple orb
 * ambience behind a centered video tile with rounded-3xl + soft
 * shadow, a LIVE pill overlaid top-left, and a glow ring that
 * intensifies when Ruby is speaking. Controls (Mute, End Call) sit
 * below the tile in a card-style row with the call timer and state
 * label, mirroring the language VoiceHero already uses.
 *
 * The chrome (orbs, padding, control row) belongs HERE, not inside
 * AvatarView — AvatarView is a thin track-attach primitive that just
 * fills its parent. That keeps the bare-bones primitive reusable if
 * we ever need an unstyled avatar (e.g. embedded in another surface).
 */
export function AvatarPane({
  track,
  avatarUrl,
  agentName,
  state,
  durationMs,
  isMuted,
  onMute,
  onHangup,
}: AvatarPaneProps) {
  const isSpeaking = state === "agent-speaking";
  const isLive = state !== "idle" && state !== "error";
  // Avatar warmup: voice session can be "listening" before Anam has
  // published its video track (~7-8s warmup). During that window the
  // tile shows the static "Connecting…" fallback, so the status row
  // below should agree — saying "Listening" while the avatar is
  // visibly mid-spin-up reads as a UI contradiction.
  const isAvatarWarmingUp = !track && isLive;
  const effectiveLabel = isAvatarWarmingUp
    ? "Connecting…"
    : stateLabel(state);
  // Match VoiceHero: hide mute while the agent is speaking (it's a
  // no-op there) and during transient connecting/ending states.
  // Mute stays visible during avatar warmup so the user can pre-mute
  // (their mic is already publishing — Anam just isn't visible yet).
  const showMute =
    !isSpeaking && state !== "connecting" && state !== "ending";

  return (
    <div className="relative flex flex-shrink-0 flex-col items-center justify-center gap-5 overflow-hidden border-b border-border bg-muted/40 px-6 py-6 md:w-1/3 md:border-b-0 md:border-r lg:w-[36%]">
      {/* Brand-purple ambient orb — sits BEHIND the video tile, soft
          blur, low opacity. Decorative only (aria-hidden). On big
          screens it adds the "real product" depth the page hero has.
          On mobile it's clipped by overflow-hidden. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
      />

      {/* Video tile — fixed 480px max width so it stays card-shaped on
          big monitors. aspect-video preserves 16:9 from Anam.
          rounded-3xl + shadow + ring matches the premium chat-card
          treatment elsewhere in the app. The ring brightens to the
          brand primary when Ruby is speaking, with a slow breathe
          animation so the surface feels alive without strobing. */}
      <div className="relative z-10 w-full max-w-[320px]">
        {isSpeaking && (
          <div
            aria-hidden="true"
            className="absolute -inset-2 rounded-[28px] bg-primary/30 blur-2xl motion-safe:animate-voice-breathe-fast"
          />
        )}
        <div
          className={
            "relative aspect-video overflow-hidden rounded-3xl bg-muted shadow-2xl ring-1 transition-shadow " +
            (isSpeaking
              ? "ring-primary/60 shadow-primary/20"
              : "ring-border/60")
          }
        >
          <AvatarView
            track={track}
            avatarUrl={avatarUrl}
            agentName={agentName}
          />

          {/* LIVE pill — overlaid top-left of the video. Glassy
              backdrop blur so it reads against any background frame
              Anam happens to publish. Pulsing dot only when actually
              live; static when ending/error. */}
          {isLive && (
            <div
              className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-background/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-foreground backdrop-blur"
              data-testid="avatar-pane-live-badge"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 rounded-full bg-red-500 motion-safe:animate-ping opacity-75" />
                <span className="relative h-2 w-2 rounded-full bg-red-500" />
              </span>
              Live
            </div>
          )}
        </div>
      </div>

      {/* State label row — sits beneath the tile, above the controls.
          Tracks the live VoiceState so it stays in sync with what the
          user can hear. Three-bar waveform appears only while Ruby is
          actively speaking, mirroring VoiceHero's affordance. */}
      <div
        className="relative z-10 flex items-center gap-2 text-sm"
        data-testid="avatar-pane-status"
      >
        <span className="font-semibold tracking-tight text-foreground">
          {effectiveLabel}
        </span>
        {/* Hide the call timer during avatar warmup — having "0:08"
            tick while the tile still says "Connecting…" reads like
            the call has already been going for 8s, which is jarring.
            Timer reappears once the avatar lands and the state is
            actually live. */}
        {!isAvatarWarmingUp && (
          <span className="font-mono text-xs font-normal tabular-nums text-muted-foreground">
            {formatDuration(durationMs)}
          </span>
        )}
        {isSpeaking && (
          <span
            aria-hidden="true"
            className="ml-1 inline-flex h-3 items-end gap-0.5"
            data-testid="avatar-pane-waveform"
          >
            {[0, 0.15, 0.3, 0.15, 0].map((delay, i) => (
              <span
                key={i}
                className="block h-full w-0.5 origin-bottom rounded-full bg-primary motion-safe:animate-sound-bar"
                style={{ animationDelay: `${delay}s` }}
              />
            ))}
          </span>
        )}
      </div>

      {/* Control row — Mute + End Call. Sized comfortably (h-11) so
          they're easy to hit on touch devices. End Call is the
          primary destructive action, so it gets the red pill with
          icon + label so it can't be confused with anything else. */}
      <div className="relative z-10 flex items-center gap-3">
        {showMute && (
          <button
            type="button"
            onClick={onMute}
            aria-label={isMuted ? "Unmute" : "Mute"}
            title={isMuted ? "Unmute" : "Mute"}
            data-testid="avatar-pane-mute"
            className={
              "inline-flex h-11 w-11 items-center justify-center rounded-full border shadow-sm transition-colors " +
              (isMuted
                ? "border-foreground/30 bg-muted text-foreground"
                : "border-border bg-background hover:bg-muted")
            }
          >
            {isMuted ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </button>
        )}
        <button
          type="button"
          onClick={onHangup}
          aria-label="End call"
          title="End call"
          data-testid="avatar-view-hangup"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-red-500 px-5 text-sm font-medium text-white shadow-md transition-colors hover:bg-red-600"
        >
          <PhoneOff className="h-4 w-4" />
          End call
        </button>
      </div>
    </div>
  );
}

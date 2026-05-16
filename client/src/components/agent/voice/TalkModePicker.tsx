import { Mic, UserCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TalkModePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Fires when the user picks an option. Parent then mints a LiveKit
   *  room with the chosen withAvatar flag. */
  onPick: (withAvatar: boolean) => void;
}

/**
 * Modal that asks "Voice only" vs "Voice + Avatar" before starting a
 * LiveKit call. Used by AgentChat's header "Talk to Ruby" button. The
 * binary choice is presented as two equally-weighted cards so neither
 * option feels like the "advanced" or "hidden" path.
 *
 * Closing the dialog (Escape, click outside) calls onOpenChange(false)
 * without firing onPick — the parent stays in idle state.
 */
export function TalkModePicker({
  open,
  onOpenChange,
  onPick,
}: TalkModePickerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Talk to Ruby</DialogTitle>
          <DialogDescription>How would you like to connect?</DialogDescription>
        </DialogHeader>
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onPick(false)}
            className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-5 text-center transition-colors hover:border-primary/40 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            data-testid="talk-mode-voice-only"
          >
            <Mic className="h-7 w-7 text-primary" />
            <div className="font-semibold text-foreground">Voice only</div>
            <div className="text-xs text-muted-foreground">
              Talk to Ruby
            </div>
          </button>
          <button
            type="button"
            onClick={() => onPick(true)}
            className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-5 text-center transition-colors hover:border-primary/40 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            data-testid="talk-mode-voice-avatar"
          >
            <UserCircle2 className="h-7 w-7 text-primary" />
            <div className="font-semibold text-foreground">Voice + Avatar</div>
            <div className="text-xs text-muted-foreground">
              Talk and see her face
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

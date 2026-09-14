import { useEffect } from "react";

interface ConsultationBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConsultationBookingModal({
  isOpen,
  onClose,
}: ConsultationBookingModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${
        isOpen
          ? "bg-black/60 opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
      style={{ visibility: isOpen ? "visible" : "hidden" }}
      aria-hidden={!isOpen}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-4xl h-[85vh] relative flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="consultation-booking-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h3 id="consultation-booking-title" className="text-2xl font-bold text-foreground">
              Book Free Demo
            </h3>
            <p className="text-muted-foreground mt-1">
              Select a time that works best for you
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close booking dialog"
          >
            <span className="sr-only">Close</span>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="flex-1 bg-white overflow-hidden">
          <iframe
            src="https://meetings-eu1.hubspot.com/rawzaba?embed=true"
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ border: 0, minHeight: "100%" }}
            title="Book a strategy demo"
            allow="microphone; camera"
          />
        </div>
      </div>
    </div>
  );
}
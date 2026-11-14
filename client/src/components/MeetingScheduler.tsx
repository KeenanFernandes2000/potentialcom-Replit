/** Rawzaba's CRM booking page, embedded. `src`: the voice call's page with its signed ref (checked by safeBookingUrl). */
export function MeetingScheduler({
  className = "block w-full h-[740px] md:h-[600px] rounded-2xl border-0",
  src = "https://crm.potentiallead.com/book/rawzaba?embed=1",
}: { className?: string; src?: string }) {
  return (
    <iframe
      src={src}
      title="Book a meeting with Potential.com"
      loading="lazy"
      referrerPolicy="no-referrer"
      className={className}
      allow="clipboard-write"
    />
  );
}

export function MeetingScheduler({ className = "block w-full h-[740px] md:h-[600px] rounded-2xl border-0" }: { className?: string }) {
  return (
    <iframe
      src="https://crm.potentiallead.com/book/rawzaba?embed=1"
      title="Book a meeting with Potential.com"
      loading="lazy"
      referrerPolicy="no-referrer"
      className={className}
      allow="clipboard-write"
    />
  );
}

export function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function getDateString() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function formatJobDate(
  date: string | Date,
  opts?: { weekday?: boolean },
) {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: opts?.weekday ? "short" : undefined,
    month: "short",
    day: "numeric",
  });
}

export function formatJobDateTime(date: string | Date, time?: string | null) {
  const formatted = formatJobDate(date, { weekday: true });
  return time ? `${formatted} at ${time}` : formatted;
}

export function formatAddress(property: {
  address: string;
  city: string;
  state: string;
  zip: string;
}) {
  return `${property.address}, ${property.city}, ${property.state} ${property.zip}`;
}

export function nextDays(count = 7) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    return { iso, label };
  });
}

export const TIME_PRESETS = ["08:00", "09:00", "10:00", "13:00", "15:00"];

export const STATUS_BADGE: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  OPEN: { bg: "bg-brand-lime/20", text: "text-brand-lime", label: "Open" },
  PENDING: { bg: "bg-slate-700", text: "text-slate-300", label: "Needs schedule" },
  SCHEDULED: { bg: "bg-blue-500/20", text: "text-blue-400", label: "Scheduled" },
  IN_PROGRESS: { bg: "bg-amber-500/20", text: "text-amber-400", label: "In progress" },
  COMPLETED: { bg: "bg-green-500/20", text: "text-green-400", label: "Completed" },
  CANCELLED: { bg: "bg-red-500/20", text: "text-red-400", label: "Cancelled" },
};

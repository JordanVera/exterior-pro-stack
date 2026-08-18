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

/**
 * Badge styling per status. Tints are heavier and text is a lighter shade than
 * a typical dark-UI badge, because these get read on a phone in direct sun.
 */
export const STATUS_BADGE: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  OPEN: {
    bg: "bg-brand-lime/25",
    text: "text-brand-lime",
    label: "Open",
  },
  PENDING: {
    bg: "bg-slate-500/30",
    text: "text-slate-200",
    label: "Needs schedule",
  },
  SCHEDULED: {
    bg: "bg-blue-500/30",
    text: "text-blue-200",
    label: "Scheduled",
  },
  IN_PROGRESS: {
    bg: "bg-amber-500/30",
    text: "text-amber-200",
    label: "In progress",
  },
  COMPLETED: {
    bg: "bg-green-500/30",
    text: "text-green-200",
    label: "Completed",
  },
  CANCELLED: { bg: "bg-red-500/30", text: "text-red-200", label: "Cancelled" },
};

/** Left rail color on a job card — the fastest status read while scrolling. */
export const STATUS_RAIL: Record<string, string> = {
  OPEN: "bg-brand-lime",
  PENDING: "bg-slate-400",
  SCHEDULED: "bg-blue-400",
  IN_PROGRESS: "bg-amber-400",
  COMPLETED: "bg-green-400",
  CANCELLED: "bg-red-400",
};

/**
 * Best-guess icon for a service, matched on keywords in its name so new
 * services get something reasonable without a data migration.
 */
export function serviceIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes("gutter")) return "rainy-outline" as const;
  if (n.includes("window")) return "grid-outline" as const;
  if (n.includes("roof")) return "home-outline" as const;
  if (n.includes("lawn") || n.includes("landscap")) return "leaf-outline" as const;
  if (n.includes("paint")) return "color-palette-outline" as const;
  if (n.includes("press") || n.includes("wash") || n.includes("clean"))
    return "water-outline" as const;
  if (n.includes("deck") || n.includes("fence")) return "layers-outline" as const;
  return "construct-outline" as const;
}

export function initialsFor(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function isToday(date: string | Date) {
  const d = new Date(date);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

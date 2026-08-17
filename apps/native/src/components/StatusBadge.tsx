import { Text } from "react-native";
import { STATUS_BADGE } from "../lib/utils";

export function StatusBadge({ status }: { status: string }) {
  const badge = STATUS_BADGE[status] ?? {
    bg: "bg-slate-700",
    text: "text-slate-300",
    label: status,
  };

  return (
    <Text
      className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.bg} ${badge.text}`}
    >
      {badge.label}
    </Text>
  );
}

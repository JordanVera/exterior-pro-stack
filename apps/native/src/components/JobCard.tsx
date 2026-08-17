import { Pressable, Text, View } from "react-native";
import type { FieldJob } from "../lib/types";
import { formatAddress, formatJobDateTime } from "../lib/utils";
import { StatusBadge } from "./StatusBadge";

export function JobCard({
  job,
  onPress,
}: {
  job: FieldJob;
  onPress: () => void;
}) {
  const crewName = job.assignments[0]?.crew.name;
  const when = job.scheduledDate
    ? formatJobDateTime(job.scheduledDate, job.scheduledTime)
    : "Not scheduled";

  return (
    <Pressable
      onPress={onPress}
      className="active:opacity-80 mb-3 rounded-2xl border border-white/10 bg-navy-800 p-4"
    >
      <View className="mb-2 flex-row items-start justify-between gap-3">
        <Text className="flex-1 text-lg font-semibold text-white">
          {job.service.name}
        </Text>
        <StatusBadge status={job.status} />
      </View>
      <Text className="text-base text-slate-300">{when}</Text>
      <Text className="mt-1 text-sm text-slate-400">
        {formatAddress(job.property)}
      </Text>
      {crewName ? (
        <Text className="mt-2 text-sm text-cyan-400">{crewName}</Text>
      ) : null}
    </Pressable>
  );
}

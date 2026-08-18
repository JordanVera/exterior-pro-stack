import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import type { FieldJob } from "../lib/types";
import {
  STATUS_RAIL,
  formatAddress,
  formatJobDateTime,
  serviceIcon,
} from "../lib/utils";
import { colors } from "../lib/theme";
import { StatusBadge } from "./StatusBadge";

type CardJob = Pick<
  FieldJob,
  "status" | "scheduledDate" | "scheduledTime" | "service" | "assignments"
> & {
  property: Pick<FieldJob["property"], "address" | "city" | "state" | "zip">;
};

export function JobCard({
  job,
  onPress,
}: {
  job: CardJob;
  onPress: () => void;
}) {
  const crewName = job.assignments[0]?.crew.name;
  const when = job.scheduledDate
    ? formatJobDateTime(job.scheduledDate, job.scheduledTime)
    : "Not scheduled";

  return (
    <Pressable
      onPress={onPress}
      className="mb-3 flex-row overflow-hidden rounded-2xl border border-line bg-surface active:opacity-80"
    >
      <View className={`w-1.5 ${STATUS_RAIL[job.status] ?? "bg-slate-400"}`} />
      <View className="flex-1 p-4">
        <View className="mb-2 flex-row items-start justify-between gap-3">
          <View className="flex-1 flex-row items-center gap-2.5">
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-white/[0.07]">
              <Ionicons
                name={serviceIcon(job.service.name)}
                size={18}
                color={colors.lime}
              />
            </View>
            <Text className="flex-1 font-semibold text-[17px] text-white">
              {job.service.name}
            </Text>
          </View>
          <StatusBadge status={job.status} size="sm" />
        </View>

        <View className="flex-row items-center gap-1.5">
          <Ionicons name="time-outline" size={14} color={colors.muted} />
          <Text className="text-[15px] text-slate-200">{when}</Text>
        </View>
        <View className="mt-1 flex-row items-center gap-1.5">
          <Ionicons name="location-outline" size={14} color={colors.muted} />
          <Text className="flex-1 text-sm text-slate-400" numberOfLines={1}>
            {formatAddress(job.property)}
          </Text>
        </View>
        {crewName ? (
          <View className="mt-2 flex-row items-center gap-1.5">
            <Ionicons name="people-outline" size={14} color={colors.lime} />
            <Text className="font-medium text-sm text-brand-lime">
              {crewName}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

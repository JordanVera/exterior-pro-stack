import type { ReactNode } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function Screen({
  children,
  edges,
}: {
  children: ReactNode;
  edges?: ("top" | "bottom" | "left" | "right")[];
}) {
  return (
    <SafeAreaView
      className="flex-1 bg-navy"
      edges={edges ?? ["top", "left", "right"]}
    >
      {children}
    </SafeAreaView>
  );
}

export function LoadingScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-navy">
      <ActivityIndicator color="#02ddf5" size="large" />
    </View>
  );
}

export function EmptyState({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <View className="items-center rounded-2xl border border-white/10 bg-navy-800 px-6 py-10">
      <Text className="text-center text-lg font-semibold text-white">
        {title}
      </Text>
      <Text className="mt-2 text-center text-base leading-6 text-slate-400">
        {body}
      </Text>
    </View>
  );
}

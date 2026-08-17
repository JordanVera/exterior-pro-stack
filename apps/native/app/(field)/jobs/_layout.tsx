import { Stack } from "expo-router";
import { colors } from "@/lib/theme";

export default function JobsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.night },
        headerTintColor: colors.lime,
        headerTitleStyle: { color: "#fff", fontWeight: "700" },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.night },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[id]" options={{ title: "Job" }} />
    </Stack>
  );
}

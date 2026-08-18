import type { ReactNode } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Pins a screen's primary action above the home indicator so it stays reachable
 * without scrolling — the whole point on a job someone is standing in front of.
 */
export function StickyActionBar({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="border-t border-line bg-brand-night px-5 pt-4"
      style={{ paddingBottom: Math.max(insets.bottom, 16) }}
    >
      {children}
    </View>
  );
}

import type { ReactNode } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, Text, View } from "react-native";
import { colors } from "@/lib/theme";

/**
 * Bottom-anchored modal. Tapping the scrim closes it, matching the platform
 * gesture people expect from a sheet.
 */
export function BottomSheet({
  visible,
  onClose,
  title,
  subtitle,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/70" onPress={onClose} />
      <View className="rounded-t-3xl border-t border-line-strong bg-surface-raised px-5 pb-10 pt-3">
        <View className="mb-4 h-1 w-10 self-center rounded-full bg-white/20" />
        <View className="mb-4 flex-row items-start justify-between gap-4">
          <View className="flex-1">
            <Text className="font-bold text-xl text-white">{title}</Text>
            {subtitle ? (
              <Text className="mt-1 text-sm text-slate-400">{subtitle}</Text>
            ) : null}
          </View>
          <Pressable
            onPress={onClose}
            hitSlop={10}
            className="h-9 w-9 items-center justify-center rounded-full bg-white/10 active:opacity-70"
          >
            <Ionicons name="close" size={18} color={colors.mist} />
          </Pressable>
        </View>
        {children}
      </View>
    </Modal>
  );
}

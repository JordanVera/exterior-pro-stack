import * as Haptics from 'expo-haptics';
import { Pressable, Text } from 'react-native';

/** Selectable pill used for schedule day and time-window choices. */
export function Chip({
  label,
  sublabel,
  selected,
  onPress,
}: {
  label: string;
  sublabel?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync().catch(() => undefined);
        onPress();
      }}
      className={`min-w-[76px] items-center rounded-2xl border px-4 py-3 active:opacity-80 ${
        selected
          ? 'border-brand-lime bg-brand-lime'
          : 'border-line-strong bg-surface'
      }`}
    >
      <Text
        className={`font-semibold text-sm ${
          selected ? 'text-brand-ink' : 'text-white'
        }`}
      >
        {label}
      </Text>
      {sublabel ? (
        <Text
          className={`mt-0.5 text-xs ${
            selected ? 'text-brand-ink/70' : 'text-slate-400'
          }`}
        >
          {sublabel}
        </Text>
      ) : null}
    </Pressable>
  );
}

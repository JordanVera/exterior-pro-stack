import * as Haptics from 'expo-haptics';
import { Pressable, ScrollView, Text, View } from 'react-native';

export type FilterOption<T extends string> = {
  value: T;
  label: string;
  count?: number;
};

/** Horizontally scrollable status filter row. */
export function FilterPills<T extends string>({
  options,
  value,
  onChange,
}: {
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}
      // Cancels the pill press when the row is being scrolled instead.
      keyboardShouldPersistTaps="handled"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => {
              Haptics.selectionAsync().catch(() => undefined);
              onChange(option.value);
            }}
            className={`flex-row items-center gap-2 rounded-full border px-4 py-2.5 active:opacity-80 ${
              active
                ? 'border-brand-lime bg-brand-lime'
                : 'border-line-strong bg-surface'
            }`}
          >
            <Text
              className={`font-semibold text-sm ${
                active ? 'text-brand-ink' : 'text-slate-300'
              }`}
            >
              {option.label}
            </Text>
            {typeof option.count === 'number' && option.count > 0 ? (
              <View
                className={`rounded-full px-1.5 ${
                  active ? 'bg-brand-ink/15' : 'bg-white/10'
                }`}
              >
                <Text
                  className={`font-semibold text-xs ${
                    active ? 'text-brand-ink' : 'text-slate-400'
                  }`}
                >
                  {option.count}
                </Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

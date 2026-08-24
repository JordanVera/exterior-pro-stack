import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

/**
 * Standard page masthead: optional lime eyebrow, large title, supporting line.
 */
export function ScreenHeader({
  eyebrow,
  title,
  subtitle,
  meta,
  right,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  /** Small line above the title, e.g. today's date. */
  meta?: string;
  right?: ReactNode;
}) {
  return (
    <View className="flex-row gap-4 justify-between items-start">
      <View className="flex-1">
        {eyebrow ? (
          <Text className="font-semibold text-xs uppercase tracking-[2px] text-brand-lime">
            {eyebrow}
          </Text>
        ) : null}
        {meta ? (
          <Text className={`${eyebrow ? 'mt-1.5' : ''} text-sm text-slate-400`}>
            {meta}
          </Text>
        ) : null}
        <Text
          className={`${eyebrow || meta ? 'mt-1' : ''} font-bold text-[32px] leading-[38px] text-white`}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text className="mt-2 text-base leading-6 text-slate-300">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ? <View className="pt-1">{right}</View> : null}
    </View>
  );
}

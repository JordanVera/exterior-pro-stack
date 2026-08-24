import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/lib/theme';

export function SearchBar({
  placeholder = 'Find a service',
  onSubmit,
}: {
  placeholder?: string;
  onSubmit: (query: string) => void;
}) {
  const [query, setQuery] = useState('');

  const submit = () => {
    onSubmit(query.trim());
  };

  return (
    <View className="flex-row items-center rounded-2xl border border-line bg-surface py-1.5 pr-1.5 pl-4">
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        returnKeyType="search"
        onSubmitEditing={submit}
        accessibilityLabel={placeholder}
        className="flex-1 py-2 font-sans text-base text-white"
      />
      <Pressable
        onPress={submit}
        accessibilityRole="button"
        accessibilityLabel="Search services"
        className="justify-center items-center w-11 h-11 rounded-xl bg-brand-lime active:opacity-80"
      >
        <Ionicons name="search" size={20} color={colors.ink} />
      </Pressable>
    </View>
  );
}

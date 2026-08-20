import { Text, TextInput, View } from 'react-native';

/** +1 phone input matching the login screen pattern. */
export function PhoneField({
  value,
  onChange,
  autoFocus,
}: {
  value: string;
  onChange: (digits: string) => void;
  autoFocus?: boolean;
}) {
  const digits = value.replace(/\D/g, '').slice(0, 10);

  return (
    <View className="flex-row overflow-hidden rounded-2xl border border-line-strong bg-surface-sunken">
      <View className="justify-center border-r border-line px-4">
        <Text className="text-lg text-slate-300">+1</Text>
      </View>
      <TextInput
        value={digits}
        onChangeText={(text) => onChange(text.replace(/\D/g, '').slice(0, 10))}
        keyboardType="phone-pad"
        placeholder="5551234567"
        placeholderTextColor="#64748b"
        className="h-14 flex-1 px-4 font-sans text-lg text-white"
        autoFocus={autoFocus}
      />
    </View>
  );
}

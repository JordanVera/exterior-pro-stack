import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { JobMessageThread } from '@/components/JobMessageThread';
import { colors } from '@/lib/theme';

export default function CustomerJobMessagesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return (
    <Screen edges={['top', 'left', 'right', 'bottom']}>
      <View className="flex-row gap-2 items-center px-5 pb-2">
        <Pressable onPress={() => router.back()} className="active:opacity-70">
          <View className="flex-row gap-2 items-center">
            <Ionicons name="arrow-back" size={22} color={colors.lime} />
            <Text className="text-base font-semibold text-brand-lime">
              Back
            </Text>
          </View>
        </Pressable>
      </View>
      <Text className="px-5 pb-2 text-2xl font-bold text-white">Messages</Text>
      {id ? <JobMessageThread jobId={id} /> : null}
    </Screen>
  );
}

import { Ionicons } from '@expo/vector-icons';
import { FlatList, Image, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '../ui/Card';
import { colors } from '@/lib/theme';

type PropertySummary = {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  imageUrl: string | null;
  jobCount: number;
  completedCount: number;
};

type PropertyCarouselProps = {
  properties: PropertySummary[];
  onRequestService?: (propertyId: string) => void;
};

export function PropertyCarousel({
  properties,
  onRequestService,
}: PropertyCarouselProps) {
  const router = useRouter();

  if (properties.length === 0) {
    return null;
  }

  return (
    <View>
      <Text className="mb-3 text-sm font-bold tracking-wider uppercase text-slate-400">
        My Properties
      </Text>
      <FlatList
        horizontal
        data={properties}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-3"
        renderItem={({ item }) => (
          <PropertyCard
            property={item}
            onRequestService={
              onRequestService ? () => onRequestService(item.id) : undefined
            }
          />
        )}
      />
    </View>
  );
}

function PropertyCard({
  property,
  onRequestService,
}: {
  property: PropertySummary;
  onRequestService?: () => void;
}) {
  return (
    <Card className="w-72">
      {property.imageUrl ? (
        <Image
          source={{ uri: property.imageUrl }}
          className="mb-3 w-full h-32 rounded-2xl bg-surface-sunken"
          resizeMode="cover"
        />
      ) : (
        <View className="justify-center items-center mb-3 w-full h-32 rounded-2xl border border-line-strong bg-surface-sunken">
          <Ionicons name="home-outline" size={40} color={colors.muted} />
        </View>
      )}

      <Text className="text-base font-semibold text-white">
        {property.address}
      </Text>
      <Text className="mt-0.5 text-sm text-slate-400">
        {property.city}, {property.state} {property.zip}
      </Text>

      <View className="flex-row gap-4 mt-3">
        <View>
          <Text className="text-lg font-bold text-white">
            {property.jobCount}
          </Text>
          <Text className="text-xs text-slate-400">
            {property.jobCount === 1 ? 'job' : 'jobs'}
          </Text>
        </View>
        <View>
          <Text className="text-lg font-bold text-brand-lime">
            {property.completedCount}
          </Text>
          <Text className="text-xs text-slate-400">completed</Text>
        </View>
      </View>

      {onRequestService ? (
        <Pressable
          onPress={onRequestService}
          className="mt-3 flex-row items-center justify-center gap-2 rounded-xl border border-brand-lime/30 bg-brand-lime/10 py-2.5 active:opacity-70"
        >
          <Ionicons name="add-circle-outline" size={16} color={colors.lime} />
          <Text className="text-sm font-semibold text-brand-lime">
            Request service
          </Text>
        </Pressable>
      ) : null}
    </Card>
  );
}

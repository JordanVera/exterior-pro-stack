import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc';
import { queryClient } from '@/lib/query';
import { LoadingScreen, Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card, PressableCard } from '@/components/ui/Card';
import { PrimaryButton } from '@/components/PrimaryButton';
import { colors } from '@/lib/theme';
import { serviceIcon } from '@/lib/utils';

type Step = 'category' | 'service' | 'property' | 'notes';

export default function NewJobRequestScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    propertyId?: string;
    serviceId?: string;
    categoryId?: string;
  }>();
  const categoryId = firstParam(params.categoryId);
  const serviceId = firstParam(params.serviceId);
  const propertyId = firstParam(params.propertyId);

  const [step, setStep] = useState<Step>(() => {
    if (serviceId) return 'property';
    if (categoryId) return 'service';
    return 'category';
  });
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    categoryId ?? null,
  );
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    serviceId ?? null,
  );
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    propertyId ?? null,
  );
  const [notes, setNotes] = useState('');

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: () => trpc.service.listCategories.query(),
  });

  const servicesQuery = useQuery({
    queryKey: ['services', selectedCategoryId],
    queryFn: () => trpc.service.list.query({ categoryId: selectedCategoryId! }),
    enabled: !!selectedCategoryId,
  });

  const propertiesQuery = useQuery({
    queryKey: ['properties'],
    queryFn: () => trpc.property.list.query(),
  });

  const categories = categoriesQuery.data ?? [];
  const services = servicesQuery.data ?? [];
  const properties = propertiesQuery.data ?? [];

  const createJob = useMutation({
    mutationFn: (input: {
      serviceId: string;
      propertyId: string;
      customerNotes?: string;
    }) => trpc.job.create.mutate(input),
    onSuccess: (job) => {
      queryClient.invalidateQueries({ queryKey: ['jobs', 'customer'] });
      Alert.alert(
        'Success!',
        'Your service request has been submitted. Providers will send bids soon.',
        [
          {
            text: 'View Job',
            onPress: () => router.replace(`/jobs/${job.id}`),
          },
        ],
      );
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message);
    },
  });

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setStep('service');
  };

  const handleServiceSelect = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setStep('property');
  };

  const handlePropertySelect = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    setStep('notes');
  };

  const handleSubmit = () => {
    if (!selectedServiceId || !selectedPropertyId) {
      Alert.alert('Error', 'Please select a service and property');
      return;
    }

    createJob.mutate({
      serviceId: selectedServiceId,
      propertyId: selectedPropertyId,
      customerNotes: notes || undefined,
    });
  };

  const selectedService = services.find((s: any) => s.id === selectedServiceId);
  const selectedProperty = properties.find(
    (p: any) => p.id === selectedPropertyId,
  );

  if (categoriesQuery.isLoading || propertiesQuery.isLoading)
    return <LoadingScreen />;

  return (
    <Screen>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-20">
        <Pressable
          onPress={() => {
            if (step === 'service' && !serviceId) setStep('category');
            else if (step === 'property') {
              setStep(serviceId ? 'property' : 'service');
            } else if (step === 'notes') setStep('property');
            else router.back();
          }}
          className="mb-4 active:opacity-70"
        >
          <View className="flex-row gap-2 items-center">
            <Ionicons name="arrow-back" size={22} color={colors.lime} />
            <Text className="text-base font-semibold text-brand-lime">
              {step === 'category'
                ? 'Cancel'
                : step === 'service' && !serviceId
                  ? 'Back to categories'
                  : step === 'property'
                    ? 'Back to services'
                    : 'Back to properties'}
            </Text>
          </View>
        </Pressable>

        <ScreenHeader
          title="Request a service"
          subtitle={
            step === 'category'
              ? 'Choose a service category'
              : step === 'service'
                ? 'Select a service'
                : step === 'property'
                  ? 'Choose a property'
                  : 'Add any details'
          }
        />

        {/* Progress indicator */}
        <View className="flex-row gap-2 mt-4">
          <View
            className={`h-1 flex-1 rounded-full ${selectedCategoryId || step !== 'category' ? 'bg-brand-lime' : 'bg-line'}`}
          />
          <View
            className={`h-1 flex-1 rounded-full ${selectedServiceId ? 'bg-brand-lime' : 'bg-line'}`}
          />
          <View
            className={`h-1 flex-1 rounded-full ${selectedPropertyId ? 'bg-brand-lime' : 'bg-line'}`}
          />
          <View
            className={`h-1 flex-1 rounded-full ${step === 'notes' ? 'bg-brand-lime' : 'bg-line'}`}
          />
        </View>

        <View className="mt-6">
          {step === 'category' ? (
            <View className="gap-3">
              {categories.map((category: any) => (
                <PressableCard
                  key={category.id}
                  onPress={() => handleCategorySelect(category.id)}
                >
                  <View className="flex-row gap-3 items-center">
                    <View className="justify-center items-center w-12 h-12 rounded-xl bg-brand-lime/15">
                      <Ionicons
                        name={serviceIcon(category.name)}
                        size={24}
                        color={colors.lime}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-bold text-white">
                        {category.name}
                      </Text>
                      {category.description ? (
                        <Text className="mt-0.5 text-sm text-slate-400">
                          {category.description}
                        </Text>
                      ) : null}
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={colors.muted}
                    />
                  </View>
                </PressableCard>
              ))}
            </View>
          ) : step === 'service' ? (
            <View className="gap-3">
              {servicesQuery.isLoading ? (
                <LoadingScreen />
              ) : (
                services.map((service: any) => (
                  <PressableCard
                    key={service.id}
                    onPress={() => handleServiceSelect(service.id)}
                    tone={
                      selectedServiceId === service.id ? 'accent' : 'default'
                    }
                  >
                    <View className="flex-row gap-3 items-center">
                      <View className="h-10 w-10 items-center justify-center rounded-xl bg-white/[0.07]">
                        <Ionicons
                          name={serviceIcon(service.name)}
                          size={20}
                          color={colors.lime}
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-white">
                          {service.name}
                        </Text>
                        {service.description ? (
                          <Text className="mt-0.5 text-sm text-slate-400">
                            {service.description}
                          </Text>
                        ) : null}
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={colors.muted}
                      />
                    </View>
                  </PressableCard>
                ))
              )}
            </View>
          ) : step === 'property' ? (
            <View className="gap-3">
              {properties.length === 0 ? (
                <Card tone="accent">
                  <Text className="text-base font-bold text-white">
                    No properties yet
                  </Text>
                  <Text className="mt-2 text-sm text-slate-300">
                    Add a property in Settings before requesting service.
                  </Text>
                  <View className="mt-4">
                    <PrimaryButton
                      label="Go to Settings"
                      icon="settings"
                      onPress={() => router.push('/settings')}
                    />
                  </View>
                </Card>
              ) : (
                properties.map((property: any) => (
                  <PressableCard
                    key={property.id}
                    onPress={() => handlePropertySelect(property.id)}
                    tone={
                      selectedPropertyId === property.id ? 'accent' : 'default'
                    }
                  >
                    <View className="flex-row gap-3 items-center">
                      <View className="h-10 w-10 items-center justify-center rounded-xl bg-white/[0.07]">
                        <Ionicons name="home" size={20} color={colors.lime} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-white">
                          {property.address}
                        </Text>
                        <Text className="mt-0.5 text-sm text-slate-400">
                          {property.city}, {property.state} {property.zip}
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={colors.muted}
                      />
                    </View>
                  </PressableCard>
                ))
              )}
            </View>
          ) : step === 'notes' ? (
            <View>
              <Card>
                <Text className="mb-2 text-sm font-semibold text-slate-400">
                  Selected Service
                </Text>
                <Text className="text-base font-bold text-white">
                  {selectedService?.name}
                </Text>
              </Card>

              <Card className="mt-3">
                <Text className="mb-2 text-sm font-semibold text-slate-400">
                  Property
                </Text>
                <Text className="text-base font-bold text-white">
                  {selectedProperty?.address}
                </Text>
                <Text className="mt-0.5 text-sm text-slate-400">
                  {selectedProperty?.city}, {selectedProperty?.state}{' '}
                  {selectedProperty?.zip}
                </Text>
              </Card>

              <Card className="mt-3">
                <Text className="mb-2 text-sm font-semibold text-slate-400">
                  Additional Details (Optional)
                </Text>
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Add any special instructions or details..."
                  placeholderTextColor="#64748b"
                  multiline
                  numberOfLines={4}
                  className="min-h-[100px] rounded-xl border border-line bg-surface-sunken p-3 font-sans text-base text-white"
                  textAlignVertical="top"
                />
              </Card>

              <View className="mt-6">
                <PrimaryButton
                  label="Submit Request"
                  icon="checkmark-circle"
                  onPress={handleSubmit}
                  loading={createJob.status === 'pending'}
                />
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  );
}

function firstParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

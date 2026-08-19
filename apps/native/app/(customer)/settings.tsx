import { useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { useQuery, useMutation } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc';
import { queryClient } from '@/lib/query';
import { useAuth } from '@/lib/auth';
import { LoadingScreen, Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card, PressableCard } from '@/components/ui/Card';
import { PrimaryButton } from '@/components/PrimaryButton';
import { colors } from '@/lib/theme';

type PropertyFormData = {
  id?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  accessNotes: string;
};

export default function CustomerSettingsScreen() {
  const router = useRouter();
  const { user, signOut, refresh } = useAuth();
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [editingProperty, setEditingProperty] =
    useState<PropertyFormData | null>(null);

  const propertiesQuery = useQuery({
    queryKey: ['properties'],
    queryFn: () => trpc.property.list.query(),
  });

  const properties = propertiesQuery.data ?? [];

  const updateProfile = useMutation({
    mutationFn: (input: {
      firstName: string;
      lastName: string;
      email: string;
    }) => trpc.auth.updateCustomerProfile.mutate(input),
    onSuccess: () => {
      refresh();
      Alert.alert('Success', 'Profile updated successfully');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message);
    },
  });

  const deleteProperty = useMutation({
    mutationFn: (id: string) => trpc.property.delete.mutate({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      Alert.alert('Success', 'Property deleted successfully');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message);
    },
  });

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/login');
        },
      },
    ]);
  };

  const handleAddProperty = () => {
    setEditingProperty({
      address: '',
      city: '',
      state: '',
      zip: '',
      accessNotes: '',
    });
    setShowPropertyModal(true);
  };

  const handleEditProperty = (property: any) => {
    setEditingProperty({
      id: property.id,
      address: property.address,
      city: property.city,
      state: property.state,
      zip: property.zip,
      accessNotes: property.accessNotes || '',
    });
    setShowPropertyModal(true);
  };

  const handleDeleteProperty = (property: any) => {
    Alert.alert(
      'Delete Property',
      `Are you sure you want to delete ${property.address}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteProperty.mutate(property.id),
        },
      ],
    );
  };

  if (propertiesQuery.isLoading) return <LoadingScreen />;

  const appVersion = Constants.expoConfig?.version || '1.0.0';

  return (
    <Screen>
      <ScrollView className="flex-1 px-5" contentContainerClassName="pb-20">
        <ScreenHeader
          eyebrow="Settings"
          title="Account Settings"
          subtitle="Manage your profile and preferences"
        />

        {/* Profile */}
        <View className="mt-6">
          <Text className="mb-3 text-sm font-bold tracking-wider uppercase text-slate-400">
            Profile
          </Text>
          <Card>
            <View className="flex-row gap-3 items-center pb-3 border-b border-line">
              <View className="justify-center items-center w-12 h-12 rounded-full bg-brand-lime/20">
                <Ionicons name="person" size={24} color={colors.lime} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-white">
                  {user?.customerProfile?.firstName}{' '}
                  {user?.customerProfile?.lastName}
                </Text>
                <Text className="mt-0.5 text-sm text-slate-400">
                  {user?.phone}
                </Text>
              </View>
            </View>
            <View className="gap-3 pt-3">
              <View>
                <Text className="mb-1 text-xs font-semibold tracking-wider uppercase text-slate-400">
                  Email
                </Text>
                <Text className="text-sm text-slate-300">
                  {user?.customerProfile?.email || 'Not set'}
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Properties */}
        <View className="mt-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-sm font-bold tracking-wider uppercase text-slate-400">
              Properties
            </Text>
            <Pressable
              onPress={handleAddProperty}
              className="flex-row gap-1 items-center active:opacity-70"
            >
              <Ionicons name="add-circle" size={20} color={colors.lime} />
              <Text className="text-sm font-semibold text-brand-lime">Add</Text>
            </Pressable>
          </View>

          {properties.length === 0 ? (
            <Card>
              <Text className="text-sm text-center text-slate-400">
                No properties yet. Add one to get started.
              </Text>
            </Card>
          ) : (
            <View className="gap-3">
              {properties.map((property: any) => (
                <Card key={property.id}>
                  <View className="flex-row gap-3 justify-between items-start">
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-white">
                        {property.address}
                      </Text>
                      <Text className="mt-0.5 text-sm text-slate-400">
                        {property.city}, {property.state} {property.zip}
                      </Text>
                      {property.accessNotes ? (
                        <Text className="mt-2 text-sm text-slate-300">
                          {property.accessNotes}
                        </Text>
                      ) : null}
                    </View>
                    <View className="flex-row gap-2">
                      <Pressable
                        onPress={() => handleEditProperty(property)}
                        className="h-9 w-9 items-center justify-center rounded-xl bg-white/[0.07] active:opacity-70"
                      >
                        <Ionicons
                          name="create-outline"
                          size={18}
                          color={colors.lime}
                        />
                      </Pressable>
                      <Pressable
                        onPress={() => handleDeleteProperty(property)}
                        className="justify-center items-center w-9 h-9 rounded-xl bg-red-500/20 active:opacity-70"
                      >
                        <Ionicons
                          name="trash-outline"
                          size={18}
                          color="#f87171"
                        />
                      </Pressable>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          )}
        </View>

        {/* App Settings */}
        <View className="mt-6">
          <Text className="mb-3 text-sm font-bold tracking-wider uppercase text-slate-400">
            App Settings
          </Text>
          <Card>
            <PressableCard onPress={() => {}} className="mb-3" tone="default">
              <View className="flex-row justify-between items-center">
                <View className="flex-row gap-3 items-center">
                  <Ionicons name="notifications" size={20} color="#fff" />
                  <Text className="text-base text-white">Notifications</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.muted}
                />
              </View>
            </PressableCard>
          </Card>
        </View>

        {/* Support */}
        <View className="mt-6">
          <Text className="mb-3 text-sm font-bold tracking-wider uppercase text-slate-400">
            Support
          </Text>
          <Card>
            <PressableCard
              onPress={() => Linking.openURL('mailto:support@exteriorpro.com')}
              className="mb-3"
              tone="default"
            >
              <View className="flex-row justify-between items-center">
                <View className="flex-row gap-3 items-center">
                  <Ionicons name="mail" size={20} color="#fff" />
                  <Text className="text-base text-white">Contact Support</Text>
                </View>
                <Ionicons name="open-outline" size={20} color={colors.muted} />
              </View>
            </PressableCard>
            <View className="flex-row justify-between items-center px-5">
              <Text className="text-sm text-slate-400">App Version</Text>
              <Text className="text-sm text-slate-300">{appVersion}</Text>
            </View>
          </Card>
        </View>

        {/* Sign Out */}
        <View className="mt-6">
          <PrimaryButton
            label="Sign Out"
            icon="log-out"
            onPress={handleSignOut}
            variant="danger"
          />
        </View>
      </ScrollView>

      <PropertyFormModal
        visible={showPropertyModal}
        property={editingProperty}
        onClose={() => {
          setShowPropertyModal(false);
          setEditingProperty(null);
        }}
        onSuccess={() => {
          setShowPropertyModal(false);
          setEditingProperty(null);
          queryClient.invalidateQueries({ queryKey: ['properties'] });
        }}
      />
    </Screen>
  );
}

function PropertyFormModal({
  visible,
  property,
  onClose,
  onSuccess,
}: {
  visible: boolean;
  property: PropertyFormData | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState<PropertyFormData>(
    property || {
      address: '',
      city: '',
      state: '',
      zip: '',
      accessNotes: '',
    },
  );

  const createProperty = useMutation({
    mutationFn: (input: {
      address: string;
      city: string;
      state: string;
      zip: string;
      accessNotes?: string;
    }) => trpc.property.create.mutate(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      Alert.alert('Success', 'Property added successfully');
      onSuccess();
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message);
    },
  });

  const updateProperty = useMutation({
    mutationFn: (input: {
      id: string;
      address: string;
      city: string;
      state: string;
      zip: string;
      accessNotes?: string;
    }) => trpc.property.update.mutate(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      Alert.alert('Success', 'Property updated successfully');
      onSuccess();
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message);
    },
  });

  const handleSubmit = () => {
    if (
      !formData.address ||
      !formData.city ||
      !formData.state ||
      !formData.zip
    ) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (property?.id) {
      updateProperty.mutate({
        id: property.id,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        accessNotes: formData.accessNotes || undefined,
      });
    } else {
      createProperty.mutate({
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        accessNotes: formData.accessNotes || undefined,
      });
    }
  };

  // Reset form when property changes
  useState(() => {
    if (property) {
      setFormData(property);
    }
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View className="flex-1 bg-brand-night">
        <ScrollView className="flex-1 px-5" contentContainerClassName="pb-20">
          <View className="mt-12">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-bold text-white">
                {property?.id ? 'Edit Property' : 'Add Property'}
              </Text>
              <Pressable onPress={onClose} className="active:opacity-70">
                <Ionicons name="close" size={28} color={colors.muted} />
              </Pressable>
            </View>

            <Card>
              <View className="gap-4">
                <View>
                  <Text className="mb-2 text-sm font-semibold text-slate-400">
                    Street Address *
                  </Text>
                  <TextInput
                    value={formData.address}
                    onChangeText={(text) =>
                      setFormData({ ...formData, address: text })
                    }
                    placeholder="123 Main St"
                    placeholderTextColor="#64748b"
                    className="px-4 py-3 font-sans text-base text-white rounded-xl border border-line bg-surface-sunken"
                  />
                </View>

                <View>
                  <Text className="mb-2 text-sm font-semibold text-slate-400">
                    City *
                  </Text>
                  <TextInput
                    value={formData.city}
                    onChangeText={(text) =>
                      setFormData({ ...formData, city: text })
                    }
                    placeholder="Portland"
                    placeholderTextColor="#64748b"
                    className="px-4 py-3 font-sans text-base text-white rounded-xl border border-line bg-surface-sunken"
                  />
                </View>

                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Text className="mb-2 text-sm font-semibold text-slate-400">
                      State *
                    </Text>
                    <TextInput
                      value={formData.state}
                      onChangeText={(text) =>
                        setFormData({ ...formData, state: text })
                      }
                      placeholder="OR"
                      placeholderTextColor="#64748b"
                      maxLength={2}
                      autoCapitalize="characters"
                      className="px-4 py-3 font-sans text-base text-white rounded-xl border border-line bg-surface-sunken"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="mb-2 text-sm font-semibold text-slate-400">
                      ZIP Code *
                    </Text>
                    <TextInput
                      value={formData.zip}
                      onChangeText={(text) =>
                        setFormData({ ...formData, zip: text })
                      }
                      placeholder="97201"
                      placeholderTextColor="#64748b"
                      keyboardType="number-pad"
                      maxLength={5}
                      className="px-4 py-3 font-sans text-base text-white rounded-xl border border-line bg-surface-sunken"
                    />
                  </View>
                </View>

                <View>
                  <Text className="mb-2 text-sm font-semibold text-slate-400">
                    Access Notes (Optional)
                  </Text>
                  <TextInput
                    value={formData.accessNotes}
                    onChangeText={(text) =>
                      setFormData({ ...formData, accessNotes: text })
                    }
                    placeholder="Gate code, parking instructions, etc."
                    placeholderTextColor="#64748b"
                    multiline
                    numberOfLines={3}
                    className="min-h-[80px] rounded-xl border border-line bg-surface-sunken p-3 font-sans text-base text-white"
                    textAlignVertical="top"
                  />
                </View>
              </View>
            </Card>

            <View className="gap-3 mt-6">
              <PrimaryButton
                label={property?.id ? 'Save Changes' : 'Add Property'}
                icon="checkmark-circle"
                onPress={handleSubmit}
                loading={
                  createProperty.status === 'pending' ||
                  updateProperty.status === 'pending'
                }
              />
              <PrimaryButton
                label="Cancel"
                icon="close"
                onPress={onClose}
                variant="secondary"
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

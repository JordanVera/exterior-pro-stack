import { useState } from 'react';
import {
  View,
  ScrollView,
  Alert,
  Text,
  TextInput,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { trpc } from '@/lib/trpc';
import { Screen } from '@/components/Screen';
import { ScreenHeader, Card } from '@/components/ui';
import { PrimaryButton } from '@/components/PrimaryButton';
import { RatingSummary } from '@/components/StarRating';
import { ReviewList } from '@/components/ReviewList';
import { colors } from '@/lib/theme';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const isProvider = user?.role === 'PROVIDER';
  const isCrew = user?.role === 'CREW';

  const profileQuery = useQuery({
    queryKey: ['provider-profile'],
    queryFn: () => trpc.provider.getProfile.query(),
    enabled: isProvider,
  });

  const handleEditProfile = () => {
    if (isProvider && user?.providerProfile) {
      setName(user.providerProfile.businessName);
    } else if (user?.crewMember) {
      setName(user.crewMember.name);
    }
    setEditing(true);
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    try {
      setSaving(true);

      if (isProvider) {
        await trpc.provider.update.mutate({ businessName: name });
      } else if (isCrew && user?.crewMember) {
        await trpc.crew.updateMember.mutate({
          memberId: user.crewMember.id,
          name,
        });
      }

      Alert.alert('Success', 'Profile updated successfully');
      setEditing(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

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

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Coming Soon',
              'Account deletion will be available soon. Please contact support for assistance.',
            );
          },
        },
      ],
    );
  };

  return (
    <Screen>
      <ScrollView
        className="flex-1 px-5 pt-2"
        contentContainerClassName="pb-20"
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader eyebrow="Exterior Pro" title="Settings" />

        {/* Profile Section */}
        <View className="mt-6 mb-6">
          <Text className="mb-3 text-xs font-semibold tracking-wide uppercase text-slate-400">
            Profile
          </Text>

          {editing ? (
            <Card>
              <Text className="mb-2 text-sm font-medium text-white">
                {isProvider ? 'Business Name' : 'Name'}
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={
                  isProvider ? 'Enter business name' : 'Enter your name'
                }
                placeholderTextColor={colors.muted}
                autoFocus
                className="px-4 py-3 mb-4 text-white rounded-xl border border-line bg-surface-raised"
              />
              <View className="flex-row gap-3">
                <PrimaryButton
                  label={saving ? 'Saving...' : 'Save'}
                  onPress={handleSaveProfile}
                  disabled={saving}
                  variant="primary"
                />
                <PrimaryButton
                  label="Cancel"
                  onPress={() => setEditing(false)}
                  disabled={saving}
                  variant="secondary"
                />
              </View>
            </Card>
          ) : (
            <Card>
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <View className="flex-row gap-2 items-center mb-1">
                    <Ionicons
                      name="person-outline"
                      size={16}
                      color={colors.muted}
                    />
                    <Text className="text-sm font-medium text-slate-400">
                      {isProvider
                        ? 'Business'
                        : isCrew
                          ? 'Crew Member'
                          : 'User'}
                    </Text>
                  </View>
                  <Text className="text-base font-semibold text-white">
                    {isProvider && user?.providerProfile?.businessName}
                    {isCrew && user?.crewMember?.name}
                    {!isProvider && !isCrew && 'Not set'}
                  </Text>
                  <Text className="mt-1 text-sm text-slate-400">
                    {user?.email}
                  </Text>
                </View>
                <Pressable
                  onPress={handleEditProfile}
                  className="ml-2 active:opacity-70"
                >
                  <Text className="text-sm font-medium text-brand-lime">
                    Edit
                  </Text>
                </Pressable>
              </View>
            </Card>
          )}
        </View>

        {isProvider ? (
          <View className="mb-6">
            <Text className="mb-3 text-xs font-semibold tracking-wide uppercase text-slate-400">
              Reviews
            </Text>
            <Card className="mb-3">
              <RatingSummary
                average={profileQuery.data?.rating.average}
                count={profileQuery.data?.rating.count}
              />
              <Text className="mt-1 text-sm text-slate-400">
                From completed jobs
              </Text>
            </Card>
            <ReviewList
              reviews={profileQuery.data?.reviews ?? []}
              empty="Reviews from customers will show up here."
            />
          </View>
        ) : null}

        {/* Crew Info (for crew members) */}
        {isCrew && user?.crewMember?.crew && (
          <View className="mb-6">
            <Text className="mb-3 text-xs font-semibold tracking-wide uppercase text-slate-400">
              Crew
            </Text>
            <Card>
              <Text className="mb-1 text-base font-semibold text-white">
                {user.crewMember.crew.name}
              </Text>
              <Text className="text-sm text-slate-400">
                {user.crewMember.crew.businessName}
              </Text>
              <Text className="mt-2 text-xs font-semibold tracking-wide uppercase text-slate-400">
                Role: {user.crewMember.role}
              </Text>
            </Card>
          </View>
        )}

        {/* Crews Management (for providers) */}
        {isProvider && (
          <View className="mb-6">
            <Text className="mb-3 text-xs font-semibold tracking-wide uppercase text-slate-400">
              Crews
            </Text>
            <Card className="overflow-hidden p-0">
              <Pressable
                className="flex-row justify-between items-center px-5 py-4 active:opacity-70"
                onPress={() => router.push('/crews')}
              >
                <View className="flex-row gap-3 items-center">
                  <Ionicons name="people-outline" size={20} color="#fff" />
                  <Text className="text-base text-white">Manage Crews</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.muted}
                />
              </Pressable>
            </Card>
          </View>
        )}

        {/* Notifications */}
        <View className="mb-6">
          <Text className="mb-3 text-xs font-semibold tracking-wide uppercase text-slate-400">
            Notifications
          </Text>
          <Card className="overflow-hidden p-0">
            <Pressable
              className="flex-row justify-between items-center px-5 py-4 active:opacity-70"
              onPress={() => {
                Alert.alert(
                  'Push Notifications',
                  'Push notifications are enabled. You will receive updates about jobs and schedule changes.',
                  [{ text: 'OK' }],
                );
              }}
            >
              <View className="flex-row gap-3 items-center">
                <Ionicons name="notifications-outline" size={20} color="#fff" />
                <Text className="text-base text-white">Push Notifications</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.muted} />
            </Pressable>
          </Card>
        </View>

        {/* About */}
        <View className="mb-6">
          <Text className="mb-3 text-xs font-semibold tracking-wide uppercase text-slate-400">
            About
          </Text>
          <Card className="overflow-hidden p-0">
            <Pressable
              className="flex-row justify-between items-center px-5 py-4 border-b border-line active:opacity-70"
              onPress={() => {
                Alert.alert(
                  'Version',
                  'Exterior Pro v1.0.0\n\nField companion app for providers and crew members.',
                  [{ text: 'OK' }],
                );
              }}
            >
              <View className="flex-row gap-3 items-center">
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color="#fff"
                />
                <Text className="text-base text-white">App Version</Text>
              </View>
              <Text className="text-sm text-slate-400">1.0.0</Text>
            </Pressable>
            <Pressable
              className="flex-row justify-between items-center px-5 py-4 active:opacity-70"
              onPress={() => {
                Alert.alert(
                  'Support',
                  'Need help? Contact us:\n\nsupport@exteriorpro.com',
                  [{ text: 'OK' }],
                );
              }}
            >
              <View className="flex-row gap-3 items-center">
                <Ionicons name="help-circle-outline" size={20} color="#fff" />
                <Text className="text-base text-white">Support</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.muted} />
            </Pressable>
          </Card>
        </View>

        {/* Account Actions */}
        <View className="mb-6">
          <Text className="mb-3 text-xs font-semibold tracking-wide uppercase text-slate-400">
            Account
          </Text>
          <Card className="overflow-hidden p-0">
            <Pressable
              className="flex-row justify-between items-center px-5 py-4 border-b border-line active:opacity-70"
              onPress={handleSignOut}
            >
              <View className="flex-row gap-3 items-center">
                <Ionicons name="log-out-outline" size={20} color="#fff" />
                <Text className="text-base text-white">Sign Out</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.muted} />
            </Pressable>
            <Pressable
              className="flex-row justify-between items-center px-5 py-4 active:opacity-70"
              onPress={handleDeleteAccount}
            >
              <View className="flex-row gap-3 items-center">
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
                <Text className="text-base" style={{ color: '#ef4444' }}>
                  Delete Account
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.muted} />
            </Pressable>
          </Card>
        </View>
      </ScrollView>
    </Screen>
  );
}

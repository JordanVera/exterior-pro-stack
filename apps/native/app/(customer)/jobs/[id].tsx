import { useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc';
import { queryClient } from '@/lib/query';
import { LoadingScreen, Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { PrimaryButton } from '@/components/PrimaryButton';
import { StatusBadge } from '@/components/StatusBadge';
import { BidCard } from '@/components/customer/BidCard';
import { Image, Modal } from 'react-native';
import { colors } from '@/lib/theme';
import { formatAddress, serviceIcon } from '@/lib/utils';

function PhotoGallery({
  photos,
}: {
  photos: Array<{ id: string; url: string; kind: string }>;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const beforePhotos = photos.filter((p) => p.kind === 'BEFORE');
  const afterPhotos = photos.filter((p) => p.kind === 'AFTER');

  const renderSection = (title: string, sectionPhotos: typeof photos) => {
    if (sectionPhotos.length === 0) return null;
    return (
      <View className="mb-4">
        <Text className="mb-2 text-sm font-semibold text-slate-400">
          {title}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            {sectionPhotos.map((photo) => (
              <Pressable key={photo.id} onPress={() => setPreview(photo.url)}>
                <Image
                  source={{ uri: photo.url }}
                  className="rounded-2xl bg-surface-raised"
                  style={{ width: 120, height: 120 }}
                  resizeMode="cover"
                />
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <>
      <View>
        {renderSection('Before', beforePhotos)}
        {renderSection('After', afterPhotos)}
      </View>
      <Modal visible={Boolean(preview)} animationType="fade" transparent>
        <Pressable
          className="flex-1 justify-center items-center bg-black/90"
          onPress={() => setPreview(null)}
        >
          {preview ? (
            <Image
              source={{ uri: preview }}
              style={{ width: '100%', height: '80%' }}
              resizeMode="contain"
            />
          ) : null}
        </Pressable>
      </Modal>
    </>
  );
}

export default function CustomerJobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [acceptingBidId, setAcceptingBidId] = useState<string | null>(null);
  const [decliningBidId, setDecliningBidId] = useState<string | null>(null);

  const utils = trpc.useUtils();
  const {
    data: job,
    isLoading,
    refetch,
  } = trpc.job.getForCustomer.useQuery({ id: id! }, { enabled: !!id });
  const { data: bids = [] } = trpc.bid.listForJob.useQuery(
    { jobId: id! },
    { enabled: !!id },
  );

  const acceptBid = trpc.bid.accept.useMutation({
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        Linking.openURL(data.checkoutUrl);
      }
      utils.job.getForCustomer.invalidate({ id: id! });
      utils.bid.listForJob.invalidate({ jobId: id! });
      utils.job.listForCustomer.invalidate();
      setAcceptingBidId(null);
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
      setAcceptingBidId(null);
    },
  });

  const declineBid = trpc.bid.decline.useMutation({
    onSuccess: () => {
      utils.bid.listForJob.invalidate({ jobId: id! });
      setDecliningBidId(null);
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
      setDecliningBidId(null);
    },
  });

  const cancelJob = trpc.job.cancelForCustomer.useMutation({
    onSuccess: () => {
      Alert.alert('Success', 'Job cancelled successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
      utils.job.listForCustomer.invalidate();
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleAcceptBid = (bidId: string) => {
    Alert.alert(
      'Accept Bid',
      'You will be redirected to checkout to complete payment.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept & Pay',
          onPress: () => {
            setAcceptingBidId(bidId);
            acceptBid.mutate(bidId);
          },
        },
      ],
    );
  };

  const handleDeclineBid = (bidId: string) => {
    Alert.alert('Decline Bid', 'Are you sure you want to decline this bid?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Decline',
        style: 'destructive',
        onPress: () => {
          setDecliningBidId(bidId);
          declineBid.mutate(bidId);
        },
      },
    ]);
  };

  const handleCancelJob = () => {
    Alert.alert(
      'Cancel Job',
      'Are you sure you want to cancel this job request? All pending bids will be declined.',
      [
        { text: 'Keep Job', style: 'cancel' },
        {
          text: 'Cancel Job',
          style: 'destructive',
          onPress: () => cancelJob.mutate(),
        },
      ],
    );
  };

  const handleCallProvider = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  if (jobQuery.isLoading || !job) return <LoadingScreen />;

  const pendingBids = bids.filter((b: any) => b.status === 'PENDING');
  const acceptedBid = bids.find((b: any) => b.status === 'ACCEPTED');
  const scheduledDate = job.scheduledDate
    ? new Date(job.scheduledDate).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <Screen>
      <ScrollView
        className="flex-1 px-5"
        contentContainerClassName="pb-20"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Pressable
          onPress={() => router.back()}
          className="mb-4 active:opacity-70"
        >
          <View className="flex-row gap-2 items-center">
            <Ionicons name="arrow-back" size={22} color={colors.lime} />
            <Text className="text-base font-semibold text-brand-lime">
              Back to jobs
            </Text>
          </View>
        </Pressable>

        <Card>
          <View className="flex-row gap-3 justify-between items-start mb-3">
            <View className="flex-row flex-1 gap-3 items-center">
              <View className="h-12 w-12 items-center justify-center rounded-xl bg-white/[0.07]">
                <Ionicons
                  name={serviceIcon(job.service.name)}
                  size={24}
                  color={colors.lime}
                />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-white">
                  {job.service.name}
                </Text>
                <Text className="mt-0.5 text-sm text-slate-400">
                  {job.service.category.name}
                </Text>
              </View>
            </View>
            <StatusBadge status={job.status} />
          </View>

          <View className="gap-2">
            <View className="flex-row gap-2 items-center">
              <Ionicons name="location" size={16} color={colors.muted} />
              <Text className="flex-1 text-sm text-slate-300">
                {formatAddress(job.property)}
              </Text>
            </View>
            <View className="flex-row gap-2 items-center">
              <Ionicons name="calendar" size={16} color={colors.muted} />
              <Text className="text-sm text-slate-300">
                Requested on{' '}
                {new Date(job.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </View>

          {job.customerNotes ? (
            <View className="p-3 mt-3 rounded-xl border border-line bg-surface-sunken">
              <Text className="mb-1 text-xs font-semibold tracking-wider uppercase text-slate-400">
                Your notes
              </Text>
              <Text className="text-sm leading-5 text-slate-300">
                {job.customerNotes}
              </Text>
            </View>
          ) : null}
        </Card>

        {job.status === 'OPEN' && pendingBids.length > 0 ? (
          <View className="mt-6">
            <Text className="mb-3 text-sm font-bold tracking-wider uppercase text-slate-400">
              Bids ({pendingBids.length})
            </Text>
            {pendingBids.map((bid: any) => (
              <BidCard
                key={bid.id}
                bid={bid}
                onAccept={() => handleAcceptBid(bid.id)}
                onDecline={() => handleDeclineBid(bid.id)}
                loading={acceptingBidId === bid.id || decliningBidId === bid.id}
              />
            ))}
          </View>
        ) : job.status === 'OPEN' ? (
          <Card className="mt-6">
            <View className="items-center py-2">
              <Ionicons name="time-outline" size={40} color={colors.muted} />
              <Text className="mt-2 text-base font-semibold text-white">
                Waiting for bids
              </Text>
              <Text className="mt-1 text-sm text-center text-slate-400">
                Providers will submit their bids soon
              </Text>
            </View>
          </Card>
        ) : null}

        {acceptedBid ? (
          <Card className="mt-6">
            <Text className="mb-3 text-sm font-bold tracking-wider uppercase text-slate-400">
              Accepted Bid
            </Text>
            <View className="flex-row gap-3 justify-between items-start">
              <View className="flex-1">
                <Text className="text-lg font-bold text-white">
                  {acceptedBid.provider.businessName}
                </Text>
                <Text className="mt-0.5 text-sm text-slate-400">
                  ${(acceptedBid.priceCents / 100).toFixed(2)}
                </Text>
              </View>
              <PrimaryButton
                label="Call"
                icon="call"
                onPress={() => handleCallProvider(acceptedBid.provider.phone)}
                variant="secondary"
              />
            </View>
          </Card>
        ) : null}

        {scheduledDate && job.scheduledTime ? (
          <Card className="mt-6">
            <Text className="mb-3 text-sm font-bold tracking-wider uppercase text-slate-400">
              Schedule
            </Text>
            <View className="flex-row gap-3 items-center">
              <View className="justify-center items-center w-12 h-12 rounded-xl bg-blue-500/20">
                <Ionicons name="calendar" size={24} color="#60a5fa" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-white">
                  {scheduledDate}
                </Text>
                <Text className="mt-0.5 text-sm text-slate-400">
                  {job.scheduledTime}
                </Text>
              </View>
            </View>
            {job.assignments && job.assignments.length > 0 ? (
              <View className="p-3 mt-3 rounded-xl border border-line bg-surface-sunken">
                <Text className="mb-1 text-xs font-semibold tracking-wider uppercase text-slate-400">
                  Crew assigned
                </Text>
                <Text className="text-sm text-slate-300">
                  {job.assignments[0].crew.name}
                </Text>
              </View>
            ) : null}
          </Card>
        ) : null}

        {job.payments && job.payments.length > 0 ? (
          <Card className="mt-6">
            <Text className="mb-3 text-sm font-bold tracking-wider uppercase text-slate-400">
              Payment
            </Text>
            <View className="flex-row gap-3 justify-between items-start">
              <View className="flex-1">
                <Text className="text-2xl font-bold text-brand-lime">
                  ${(job.payments[0].amountCents / 100).toFixed(2)}
                </Text>
                <Text className="mt-0.5 text-sm text-slate-400">
                  {job.payments[0].status === 'SUCCEEDED'
                    ? 'Paid'
                    : job.payments[0].status}
                </Text>
              </View>
              {job.payments[0].receiptUrl ? (
                <PrimaryButton
                  label="Receipt"
                  icon="receipt-outline"
                  onPress={() => Linking.openURL(job.payments[0].receiptUrl!)}
                  variant="secondary"
                />
              ) : null}
            </View>
          </Card>
        ) : null}

        {job.photos && job.photos.length > 0 ? (
          <View className="mt-6">
            <Text className="mb-3 text-sm font-bold tracking-wider uppercase text-slate-400">
              Photos
            </Text>
            <JobPhotos photos={job.photos} />
          </View>
        ) : null}

        {job.status === 'OPEN' ? (
          <View className="mt-6">
            <PrimaryButton
              label="Cancel request"
              icon="close-circle"
              onPress={handleCancelJob}
              variant="danger"
              loading={cancelJob.status === 'pending'}
            />
          </View>
        ) : null}

        {job.status === 'COMPLETED' ? (
          <View className="mt-6">
            <PrimaryButton
              label="Book again"
              icon="repeat"
              onPress={() =>
                router.push({
                  pathname: '/jobs/new',
                  params: {
                    serviceId: job.service.id,
                    propertyId: job.property.id,
                  },
                })
              }
            />
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

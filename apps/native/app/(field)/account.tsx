import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/lib/auth';
import { colors } from '@/lib/theme';
import { initialsFor } from '@/lib/utils';
import { PrimaryButton } from '@/components/PrimaryButton';
import { EmptyState, Screen } from '@/components/Screen';
import { Card, ScreenHeader, SectionPanel } from '@/components/ui';

export default function AccountScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const isCrew = user?.role === 'CREW';

  const crewsQuery = useQuery({
    queryKey: ['crews'],
    queryFn: () => trpc.crew.list.query(),
    enabled: !isCrew,
  });

  const displayName =
    (isCrew ? user?.crewMember?.name : user?.providerProfile?.businessName) ??
    'Your account';
  const crews = crewsQuery.data ?? [];

  return (
    <Screen>
      <ScrollView
        className="flex-1 px-5 pt-2"
        contentContainerClassName="pb-10 grow"
      >
        <ScreenHeader eyebrow="Exterior Pro" title="Account" />

        <Card className="mt-6">
          <View className="flex-row gap-4 items-center">
            <View className="justify-center items-center w-16 h-16 rounded-2xl bg-brand-lime">
              <Text className="text-xl font-bold text-brand-ink">
                {initialsFor(displayName)}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-xs font-semibold tracking-wide uppercase text-brand-lime">
                {isCrew ? 'Crew member' : 'Provider'}
              </Text>
              <Text className="mt-1 text-2xl font-bold leading-7 text-white">
                {displayName}
              </Text>
            </View>
          </View>

          <View className="gap-3 pt-4 mt-5 border-t border-line">
            {isCrew && user?.crewMember ? (
              <Row
                icon="people-outline"
                label="Crew"
                value={
                  user.crewMember.crew.businessName
                    ? `${user.crewMember.crew.name} · ${user.crewMember.crew.businessName}`
                    : user.crewMember.crew.name
                }
              />
            ) : null}
            <Row
              icon="call-outline"
              label="Phone"
              value={user?.phone ?? 'Not on file'}
            />
          </View>
        </Card>

        {!isCrew ? (
          <View className="mt-8">
            <SectionPanel title="Your crews" count={crews.length}>
              {crews.length === 0 ? (
                <EmptyState
                  icon="people-outline"
                  title="No crews yet"
                  body="Create crews on the web portal, then assign them to jobs from here."
                />
              ) : (
                crews.map((crew) => (
                  <Card key={crew.id} className="mb-3">
                    <View className="flex-row gap-3 items-center">
                      <View className="h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.07]">
                        <Ionicons name="people" size={20} color={colors.lime} />
                      </View>
                      <View className="flex-1">
                        <Text className="font-semibold text-[17px] text-white">
                          {crew.name}
                        </Text>
                        <Text className="text-sm text-slate-400">
                          {crew.members.length === 0
                            ? 'No members yet'
                            : crew.members
                                .map((member) => member.name)
                                .join(', ')}
                        </Text>
                      </View>
                    </View>
                  </Card>
                ))
              )}
            </SectionPanel>
          </View>
        ) : null}

        <View className="pt-10 mt-auto">
          <PrimaryButton
            label="Sign out"
            variant="danger"
            icon="log-out-outline"
            onPress={async () => {
              await signOut();
              router.replace('/login');
            }}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row gap-3 items-center">
      <Ionicons name={icon} size={18} color={colors.muted} />
      <Text className="text-sm text-slate-400">{label}</Text>
      <Text
        className="flex-1 text-right text-[15px] text-white"
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

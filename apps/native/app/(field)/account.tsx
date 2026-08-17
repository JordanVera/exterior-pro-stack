import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/lib/auth";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";

export default function AccountScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const isCrew = user?.role === "CREW";

  return (
    <Screen>
      <View className="flex-1 px-5 pt-2">
        <Text className="text-3xl font-bold text-white">Account</Text>
        <View className="mt-6 rounded-2xl border border-white/10 bg-navy-800 p-5">
          <Text className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {isCrew ? "Crew member" : "Provider"}
          </Text>
          <Text className="mt-2 text-2xl font-bold text-white">
            {isCrew
              ? user?.crewMember?.name
              : user?.providerProfile?.businessName}
          </Text>
          {isCrew && user?.crewMember ? (
            <Text className="mt-1 text-base text-slate-300">
              {user.crewMember.crew.name}
              {user.crewMember.crew.businessName
                ? ` · ${user.crewMember.crew.businessName}`
                : ""}
            </Text>
          ) : null}
          <Text className="mt-3 text-base text-slate-400">{user?.phone}</Text>
        </View>

        <View className="mt-auto pb-6">
          <PrimaryButton
            label="Sign out"
            variant="danger"
            onPress={async () => {
              await signOut();
              router.replace("/login");
            }}
          />
        </View>
      </View>
    </Screen>
  );
}

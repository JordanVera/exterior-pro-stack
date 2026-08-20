import { Redirect } from "expo-router";
import { useAuth } from "@/lib/auth";
import { LoadingScreen } from "@/components/Screen";

export default function Index() {
  const { isReady, user, isFieldUser } = useAuth();

  if (!isReady) {
    return <LoadingScreen />;
  }

  // Not authenticated - go to login
  if (!user) {
    return <Redirect href="/login" />;
  }

  // Route based on role
  if (user.role === 'CUSTOMER') {
    return <Redirect href="/home" />;
  }

  if (isFieldUser) {
    return <Redirect href="/today" />;
  }

  // Fallback to login for unknown roles
  return <Redirect href="/login" />;
}

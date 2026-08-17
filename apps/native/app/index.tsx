import { Redirect } from "expo-router";
import { useAuth } from "@/lib/auth";
import { LoadingScreen } from "@/components/Screen";

export default function Index() {
  const { isReady, isFieldUser } = useAuth();

  if (!isReady) {
    return <LoadingScreen />;
  }

  if (!isFieldUser) {
    return <Redirect href="/login" />;
  }

  return <Redirect href="/(field)" />;
}

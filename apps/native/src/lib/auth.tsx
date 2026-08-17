import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as SecureStore from "expo-secure-store";
import { queryClient } from "./query";
import { setAuthToken, trpc } from "./trpc";
import type { Me } from "./types";

const TOKEN_KEY = "auth-token";

type AuthContextValue = {
  token: string | null;
  user: Me | null;
  isReady: boolean;
  isFieldUser: boolean;
  signIn: (token: string) => Promise<Me>;
  signOut: () => Promise<void>;
  refresh: () => Promise<Me | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadMe(): Promise<Me> {
  return trpc.auth.me.query();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<Me | null>(null);
  const [isReady, setIsReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const me = await loadMe();
      setUser(me);
      return me;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await SecureStore.getItemAsync(TOKEN_KEY);
      if (cancelled) return;
      if (stored) {
        setAuthToken(stored);
        setToken(stored);
        try {
          const me = await loadMe();
          if (!cancelled) setUser(me);
        } catch {
          await SecureStore.deleteItemAsync(TOKEN_KEY);
          setAuthToken(null);
          if (!cancelled) {
            setToken(null);
            setUser(null);
          }
        }
      }
      if (!cancelled) setIsReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (nextToken: string) => {
    await SecureStore.setItemAsync(TOKEN_KEY, nextToken);
    setAuthToken(nextToken);
    setToken(nextToken);
    const me = await loadMe();
    setUser(me);
    return me;
  }, []);

  const signOut = useCallback(async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setAuthToken(null);
    setToken(null);
    setUser(null);
    queryClient.clear();
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      isReady,
      isFieldUser: user?.role === "PROVIDER" || user?.role === "CREW",
      signIn,
      signOut,
      refresh,
    }),
    [token, user, isReady, signIn, signOut, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

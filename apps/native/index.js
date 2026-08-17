import "@expo/metro-runtime";
import { renderRootComponent } from "expo-router/build/renderRootComponent";
import { ExpoRoot } from "expo-router";

// Explicit app context so Expo Router does not rely on EXPO_ROUTER_APP_ROOT
// being inlined through a hoisted babel-preset-expo in this monorepo.
export function App() {
  const ctx = require.context("./app");
  return <ExpoRoot context={ctx} />;
}

renderRootComponent(App);

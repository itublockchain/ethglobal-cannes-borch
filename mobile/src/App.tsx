import "react-native-get-random-values";
import * as React from "react";
import { Assets as NavigationAssets } from "@react-navigation/elements";
import { Asset } from "expo-asset";
import * as SplashScreen from "expo-splash-screen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import {
  Inter_900Black,
  Inter_800ExtraBold,
  Inter_700Bold,
  Inter_600SemiBold,
  Inter_500Medium,
  Inter_400Regular,
  Inter_300Light,
  Inter_200ExtraLight,
  Inter_100Thin,
} from "@expo-google-fonts/inter";

import { dynamicClient } from "@/lib/dynamic";

import RootStack from "./navigation";
import { NavigationContainer } from "@react-navigation/native";

const queryClient = new QueryClient();

Asset.loadAsync([
  ...NavigationAssets,
  require("./assets/newspaper.png"),
  require("./assets/bell.png"),
]);

SplashScreen.preventAutoHideAsync();

export function App() {
  const [onDynamicReady, setOnDynamicReady] = React.useState(false);
  const [onNavigationReady, setOnNavigationReady] = React.useState(false);

  dynamicClient.sdk.on("loadedChanged", (loaded) => {
    if (loaded) {
      setOnDynamicReady(true);
    }
  });

  React.useEffect(() => {
    if (onDynamicReady && onNavigationReady) {
      SplashScreen.hideAsync();
    }
  }, [onDynamicReady, onNavigationReady]);

  let [fontsLoaded] = useFonts({
    Inter_900Black,
    Inter_800ExtraBold,
    Inter_700Bold,
    Inter_600SemiBold,
    Inter_500Medium,
    Inter_400Regular,
    Inter_300Light,
    Inter_200ExtraLight,
    Inter_100Thin,
  });

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer
        linking={{
          enabled: true,
          prefixes: ["facade://"],
        }}
        onReady={() => {
          setOnNavigationReady(true);
        }}
      >
        <dynamicClient.reactNative.WebView />
        <RootStack />
      </NavigationContainer>
    </QueryClientProvider>
  );
}

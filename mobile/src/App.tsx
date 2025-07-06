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
import { createContext } from "react";

export const ClientContext = createContext({
  publicOasisClient: null,
  walletOasisClient: null,
  publicBaseClient: null,
  walletBaseClient: null,
});

import { dynamicClient, initializeClients, useDynamic } from "@/lib/dynamic";

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

  const [publicOasisClient, setPublicOasisClient] = React.useState<any>(null);
  const [walletOasisClient, setWalletOasisClient] = React.useState<any>(null);
  const [publicBaseClient, setPublicBaseClient] = React.useState<any>(null);
  const [walletBaseClient, setWalletBaseClient] = React.useState<any>(null);

  const { wallets } = useDynamic();

  dynamicClient.sdk.on("loadedChanged", (loaded) => {
    if (loaded) {
      setOnDynamicReady(true);
      initializeClients(
        setPublicOasisClient,
        setWalletOasisClient,
        setPublicBaseClient,
        setWalletBaseClient,
        wallets.primary
      ).catch((error) => {
        console.error("Error initializing clients:", error);
      });
    }
  });

  React.useEffect(() => {
    if (publicBaseClient) {
    }
  }, [
    publicOasisClient,
    walletOasisClient,
    publicBaseClient,
    walletBaseClient,
  ]);

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
      <ClientContext.Provider
        value={{
          publicOasisClient,
          walletOasisClient,
          publicBaseClient,
          walletBaseClient,
        }}
      >
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
      </ClientContext.Provider>
    </QueryClientProvider>
  );
}

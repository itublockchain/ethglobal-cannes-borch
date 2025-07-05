import { createClient } from "@dynamic-labs/client";
import { ReactNativeExtension } from "@dynamic-labs/react-native-extension";
import { ViemExtension } from "@dynamic-labs/viem-extension";
import { ZeroDevExtension } from "@dynamic-labs/zerodev-extension";
import { useReactiveClient } from "@dynamic-labs/react-hooks";

export const dynamicClient = createClient({
  environmentId: "c775bec1-e8e3-476e-8082-bf5467e67307",

  // Optional:
  appLogoUrl: "https://demo.dynamic.xyz/favicon-32x32.png",
  appName: "Facade Finance",
})
  .extend(ReactNativeExtension())
  .extend(ViemExtension())
  .extend(ZeroDevExtension());

export const useDynamic = () => useReactiveClient(dynamicClient);

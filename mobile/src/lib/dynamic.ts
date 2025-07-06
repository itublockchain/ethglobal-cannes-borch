import { createClient } from "@dynamic-labs/client";
import { ReactNativeExtension } from "@dynamic-labs/react-native-extension";
import { ViemExtension } from "@dynamic-labs/viem-extension";
import { ZeroDevExtension } from "@dynamic-labs/zerodev-extension";
import { useReactiveClient } from "@dynamic-labs/react-hooks";
import { baseSepolia, oasisTestnet } from "viem/chains";
import {
  defineChain,
  http,
  createPublicClient,
  createWalletClient,
} from "viem";
import {
  sapphireHttpTransport,
  sapphireTestnet,
  wrapWalletClient,
} from "./oasis-viem";
import { set } from "lodash";

// const sapphireTestnet = defineChain({
//   id: 23295,
//   name: "Oasis Sapphire Testnet",
//   network: "sapphire-testnet",
//   nativeCurrency: {
//     name: "Sapphire Test Token",
//     symbol: "TEST",
//     decimals: 18,
//   },
//   rpcUrls: {
//     default: {
//       http: ["https://testnet.sapphire.oasis.io"],
//     },
//     public: {
//       http: ["https://testnet.sapphire.oasis.io"],
//     },
//   },
//   blockExplorers: {
//     default: {
//       name: "Oasis Explorer",
//       url: "https://explorer.oasis.io/testnet/sapphire",
//     },
//   },
//   testnet: true,
// });

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

export const initializeClients = async (
  setPublicOasisClient,
  setWalletOasisClient,
  setPublicBaseClient,
  setWalletBaseClient,
  primaryWallet
) => {
  const opc = createPublicClient({
    chain: sapphireTestnet,
    transport: sapphireHttpTransport(),
  });
  setPublicOasisClient(opc);
  //console.log("Oasis Public Client:", opc);

  const owc = await createWalletClient({
    account: primaryWallet.address,
    transport: sapphireHttpTransport(),
    chain: sapphireTestnet,
    ...wrapWalletClient(
      dynamicClient.viem.createWalletClient({
        wallet: primaryWallet,
      })
    ),
  });
  setWalletOasisClient(owc);

  const bpc = dynamicClient.viem.createPublicClient({
    chain: baseSepolia,
  });
  setPublicBaseClient(bpc);
  //console.log("Base Public Client:", bpc);

  const bwc = dynamicClient.viem
    .createWalletClient({
      chain: baseSepolia,
      wallet: primaryWallet,
    })
    .then((bwc) => {
      setWalletBaseClient(bwc);
      //console.log("Base Wallet Client:", bwc);
    })
    .catch((error) => {
      console.error("Error creating Base Wallet Client:", error);
    });
};

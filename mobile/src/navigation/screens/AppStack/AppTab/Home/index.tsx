import { SafeAreaView, Text, Button } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppStackParamList } from "@/navigation/screens/AppStack";
// import { createSiweMessage, generateSiweNonce } from "viem/siwe";
// import { hexToCompactSignature, compactSignatureToSignature } from "viem";
// import { sapphireTestnet } from "viem/chains";

import { useDynamic } from "@/lib/dynamic";
import { useNavigation } from "@react-navigation/native";

import { dynamicClient } from "@/lib/dynamic";

console.log(dynamicClient.wallets.primary?.address);

// async function Read() {
//   const mesg = createSiweMessage({
//     domain: "example.com",
//     address: "0xE3B3890C944688b7a259d9201b21E019a0C09EFd",
//     statement: "Sign in to the app",
//     uri: "https://example.com",
//     version: "1",
//     chainId: 0x5aff,
//     nonce: generateSiweNonce(),
//   });

//   console.log(mesg);

//   const wc = await dynamicClient.viem.createWalletClient({
//     wallet: dynamicClient.wallets.primary!,
//     chain: sapphireTestnet, // Goerli testnet
//   });

//   wc.signMessage({
//     message: mesg,
//   })
//     .then(async (signature) => {
//       console.log("Signature:", signature);
//       console.log(typeof signature);
//       // 1) Compact yapıyı parçala
//       const compact = hexToCompactSignature(signature); // { r, yParityAndS }
//       /*                                                                                                                                               │
//        * compactSignatureToSignature, r + s + yParity döndürür               │
//        */
//       const { r, s, yParity } = compactSignatureToSignature(compact); // yParity: 0 | 1

//       // 2) Kontratın istediği v = 27 / 28
//       const v = 27n + BigInt(yParity!);

//       await wc.writeContract({
//         address: "0x1902d35434889E81D1c9b9582dCce161f9DDDf15",
//         abi: [
//           "function login(string message, tuple(bytes32 r, bytes32 s, uint256 v) signature) external returns (bytes)",
//         ],
//         functionName: "login",
//         args: [
//           mesg,
//           { r, s, v }, // veya [r, s, v]  – ABI’ye göre
//         ],
//       });
//     })
//     .catch((error) => {
//       console.error("Error signing message:", error);
//     });
// }

type Props = {};

const HomeScreen = (props: Props) => {
  const { auth } = useDynamic();
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  return (
    <SafeAreaView>
      <Text>HomeScreen</Text>
      <Button
        title="Logout"
        onPress={() => {
          auth.logout();
        }}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;

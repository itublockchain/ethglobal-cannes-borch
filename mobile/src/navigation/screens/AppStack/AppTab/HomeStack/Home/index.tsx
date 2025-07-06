import {
  SafeAreaView,
  Button,
  View,
  StyleSheet,
  Image,
  Pressable,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppStackParamList } from "@/navigation/screens/AppStack";
// import { createSiweMessage, generateSiweNonce } from "viem/siwe";
// import { hexToCompactSignature, compactSignatureToSignature } from "viem";
// import { sapphireTestnet } from "viem/chains";
import { useContext } from "react";

import { Text } from "@/components/ui";

import { getWidth, getHeight } from "@/constants/Spaces";

import { useDynamic } from "@/lib/dynamic";
import { useNavigation } from "@react-navigation/native";

import { dynamicClient } from "@/lib/dynamic";
import { Colors } from "@/constants";
import Fonts from "@/constants/Fonts";

import USDC from "@/assets/USDC.png";
import { ClientContext } from "@/App";
import { useQuery } from "@tanstack/react-query";

import { SAPPHIRE_ABI } from "@/constants/ABI";

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
  const { wallets } = useDynamic();
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  const clients = useContext(ClientContext);
  console.log(clients);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["groups"],
    enabled: !!wallets.primary?.address && !!clients.publicOasisClient, // null/undefined kontrolü
    queryFn: async () => {
      if (!clients.publicOasisClient) throw new Error("No client yet");

      return clients.publicOasisClient.readContract({
        address: "0x02bFB5e056959eDc778dB30A1e4528fcB3eA8eBd",
        abi: SAPPHIRE_ABI,
        functionName: "getMyGroups",
        args: ["0x5e3aCEe942a432e114F01DCcCD06c904a859eDB1"],
      });
    },
  });

  console.log("Groups Data:", data);
  console.log("Is Loading:", isLoading);
  console.log("Is Error:", isError);
  console.log("Error:", error);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header_container}>
        <View style={styles.header_inner_container}>
          <Image
            source={{
              uri: "https://avatar.iran.liara.run/public",
            }}
            style={{ width: 44, height: 44 }}
          />
          <View style={styles.header_title_container}>
            <Text style={styles.header_upper_title}>Good Morning,</Text>
            <Text style={styles.header_bottom_title}>
              feyyazcigim.borch.eth
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.balance_card_container}>
        <View style={styles.card}>
          <View style={styles.card_currency_container}>
            <View style={styles.card_currency_inner_container}>
              <Image source={USDC} style={{ width: 14, height: 14 }} />
              <Text style={styles.card_currency_text}>USDC</Text>
            </View>
          </View>
          <View style={styles.balance_container}>
            <Text style={styles.card_currency_title}>Available Balance</Text>
            <Text style={styles.card_currency_balance}>$ 0</Text>
          </View>
          <View style={styles.card_currency_container}>
            <View style={styles.card_currency_inner_container}>
              <Text style={styles.card_currency_text}>
                Total Debt <Text style={styles.red}>$50</Text>
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.groups_container_addon_container}>
        <View style={styles.groups_container_addon_line} />
      </View>
      <View style={styles.groups_container}>
        <View>
          <Text style={styles.section_title}>Groups</Text>
        </View>
        {data && data.length > 0 ? (
          data.map((el, _i) => {
            return (
              <Pressable
                style={styles.group_card_container}
                onPress={() =>
                  //@ts-ignore
                  navigation.navigate("Group", {
                    data: el,
                  })
                }
                key={_i}
              >
                <View style={styles.group_card_container_left} key={_i}>
                  <Image
                    source={{
                      uri: "https://avatar.iran.liara.run/public",
                    }}
                    style={styles.group_card_container_image}
                  />
                  <View style={styles.group_card_information_container}>
                    <Text style={styles.group_card_information_name}>
                      {el.name || "Group Name"}
                    </Text>
                    <Text style={styles.group_card_information_creator}>
                      {`${el.creator.slice(0, 6)}...${el.creator.slice(
                        el.creator.length - 4,
                        el.creator.lengt
                      )}` || "creator.borch.eth"}
                    </Text>
                  </View>
                </View>
                <View style={styles.group_card_container_right}>
                  <Text style={styles.group_card_information_name}>
                    $
                    {el.transactions
                      .reduce((acc, a) => {
                        // share değerini Number’a çeviriyoruz
                        return acc + Number(a.totalAmount);
                      }, 0)
                      .toFixed(2)}
                  </Text>
                  <Text style={[styles.group_card_information_creator]}>
                    Total
                  </Text>
                </View>
              </Pressable>
            );
          })
        ) : (
          <Text> No Gtoup Found!</Text>
        )}
      </View>
      {/* <Text>HomeScreen</Text>
      <Button
        title="Logout"
        onPress={() => {
          auth.logout();
        }}
      />
      <Button
        title="Register ENS"
        onPress={() => {
          navigation.navigate("RegisterENS");
        }}
      /> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.SURFACE_LIGHT,
  },
  header_container: {
    paddingVertical: getHeight(12),
    paddingHorizontal: getWidth(20),
  },
  header_inner_container: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  header_title_container: {
    gap: 2,
  },
  header_upper_title: {
    ...Fonts.xsRegular,
    color: Colors.GRAY_500,
  },
  header_bottom_title: {
    ...Fonts.mdSemibold,
    color: Colors.GRAY_900,
  },
  balance_card_container: {
    paddingVertical: getHeight(8),
    paddingHorizontal: getWidth(20),
  },
  card: {
    backgroundColor: Colors.GRAY_900,
    borderRadius: 30,
    padding: 12,
  },
  card_currency_container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  card_currency_inner_container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 40,
    borderColor: Colors.GRAY_500,
    backgroundColor: Colors.GRAY_800,
    gap: 6,
    padding: 8,
  },
  card_currency_text: {
    ...Fonts.xsSemibold,
    color: Colors.WHITE,
  },
  balance_container: {
    marginVertical: getHeight(24),
    marginLeft: getWidth(4),
  },
  card_currency_title: {
    ...Fonts.smallMedium,
    color: Colors.GRAY_400,
    marginBottom: 8,
  },
  card_currency_balance: {
    ...Fonts.mdMedium,
    fontSize: 36,
    color: Colors.WHITE,
  },
  groups_container_addon_container: {
    marginTop: getHeight(8),
    backgroundColor: Colors.WHITE,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    height: 21,
    justifyContent: "center",
    alignItems: "center",
  },
  groups_container_addon_line: {
    width: getWidth(66),
    height: 5,
    borderRadius: 100,
    backgroundColor: Colors.GRAY_200,
  },
  groups_container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    paddingVertical: getHeight(8),
    paddingHorizontal: getWidth(20),
  },
  section_title: {
    ...Fonts.smallMedium,
    color: Colors.GRAY_900,
    marginBottom: 8,
  },
  group_card_container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginVertical: 8,
  },
  group_card_container_left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  group_card_container_image: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  group_card_information_container: {
    gap: 4,
  },
  group_card_information_name: {
    ...Fonts.mdSemibold,
    color: Colors.GRAY_900,
  },
  group_card_information_creator: {
    ...Fonts.xsMedium,
    color: Colors.GRAY_500,
  },
  group_card_container_right: {
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 4,
  },
  red: {
    color: Colors.ERROR_500,
  },
});

export default HomeScreen;

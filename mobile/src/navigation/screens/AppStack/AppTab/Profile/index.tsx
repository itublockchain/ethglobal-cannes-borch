// /src/navigation/screens/AppStack/AppTab/Profile/index.tsx
import {
  SafeAreaView,
  View,
  StyleSheet,
  Image,
  Pressable,
  Linking,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Text } from "@/components/ui";
import { AppStackParamList } from "@/navigation/screens/AppStack";

import { getWidth, getHeight } from "@/constants/Spaces";
import { Colors } from "@/constants";
import Fonts from "@/constants/Fonts";
import { dynamicClient } from "@/lib/dynamic";

type Props = {};

const ens = "feyyazcigim.borch.eth";
const evm = "0x43656Cc02532bDE187F8b9bde5b6ed3D8b74AB71";

const ProfileScreen = (props: Props) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  const copyToClipboard = async (value: string) => {
    await navigator.clipboard.writeText(value);
  };

  const openEtherscan = () => {
    Linking.openURL(`https://etherscan.io/address/${evm}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable
          style={styles.backBtn}
          //@ts-ignore
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {/* PROFILE CARD */}
      <View style={styles.card}>
        <Image
          source={{ uri: "https://avatar.iran.liara.run/public" }}
          style={styles.avatar}
        />
        <Text style={styles.ens}>{ens}</Text>
        <Pressable style={styles.addressRow} onPress={openEtherscan}>
          <Text style={styles.address}>
            {`${evm.slice(0, 6)}...${evm.slice(-4)}`}
          </Text>
          <Pressable onPress={() => copyToClipboard(evm)}>
            <Text style={styles.copyIcon}>📋</Text>
          </Pressable>
        </Pressable>
      </View>

      {/* SETTINGS / ACTIONS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>General</Text>

        <Pressable style={styles.item}>
          <Text style={styles.itemText}>Edit Profile</Text>
        </Pressable>

        <Pressable style={styles.item}>
          <Text style={styles.itemText}>Security &amp; Privacy</Text>
        </Pressable>

        <Pressable style={styles.item}>
          <Text style={styles.itemText}>Notifications</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Other</Text>

        <Pressable style={styles.item}>
          <Text style={styles.itemText}>Help &amp; Support</Text>
        </Pressable>

        <Pressable
          style={styles.item}
          onPress={async () => dynamicClient.auth.logout()}
        >
          <Text style={styles.itemTextRed}>Log Out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.SURFACE_LIGHT,
  },
  /** HEADER **/
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: getHeight(12),
    paddingHorizontal: getWidth(20),
  },
  backBtn: {
    padding: 4,
  },
  backIcon: {
    fontSize: 20,
    color: Colors.GRAY_900,
  },
  headerTitle: {
    ...Fonts.mdSemibold,
    color: Colors.GRAY_900,
  },
  /** CARD **/
  card: {
    backgroundColor: Colors.WHITE,
    borderRadius: 30,
    paddingVertical: getHeight(32),
    alignItems: "center",
    marginHorizontal: getWidth(20),
    shadowColor: Colors.GRAY_800,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 16,
  },
  ens: {
    ...Fonts.mdSemibold,
    color: Colors.GRAY_900,
    marginBottom: 8,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  address: {
    ...Fonts.xsMedium,
    color: Colors.GRAY_500,
  },
  copyIcon: {
    fontSize: 16,
    color: Colors.GRAY_500,
  },
  /** SECTIONS **/
  section: {
    marginTop: getHeight(32),
    paddingHorizontal: getWidth(20),
    gap: 12,
  },
  sectionTitle: {
    ...Fonts.smallMedium,
    color: Colors.GRAY_900,
  },
  item: {
    backgroundColor: Colors.WHITE,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 20,
    justifyContent: "center",
  },
  itemText: {
    ...Fonts.xsMedium,
    color: Colors.GRAY_900,
  },
  itemTextRed: {
    ...Fonts.xsMedium,
    color: Colors.ERROR_500,
  },
});

export default ProfileScreen;

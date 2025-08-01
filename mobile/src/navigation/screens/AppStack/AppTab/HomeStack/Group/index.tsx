import React from "react";
import {
  SafeAreaView,
  View,
  StyleSheet,
  Image,
  Pressable,
  FlatList,
  Text as RNText,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppStackParamList } from "@/navigation/screens/AppStack";
import { Text } from "@/components/ui";
import { getWidth, getHeight } from "@/constants/Spaces";
import { useDynamic } from "@/lib/dynamic";
import { useNavigation } from "@react-navigation/native";
import { dynamicClient } from "@/lib/dynamic";
import { Colors } from "@/constants";
import Fonts from "@/constants/Fonts";

import LEFT from "@/assets/left.png";
import VISA from "@/assets/VISA.png";
import CARD from "@/assets/cardbg.png";
import PLUS from "@/assets/plus.png";
import EYE from "@/assets/eye.png";
import EYE_OFF from "@/assets/eye-off.png";

const transactions = [
  {
    id: "1",
    place: "Coffee Shop",
    date: "2025-07-01",
    amount: 4.5,
  },
  {
    id: "2",
    place: "Grocery Store",
    date: "2025-07-03",
    amount: 76.2,
  },
  {
    id: "3",
    place: "Online Subscription",
    date: "2025-07-04",
    amount: 9.99,
  },
  {
    id: "4",
    place: "Coffee Shop",
    date: "2025-07-01",
    amount: 4.5,
  },
  {
    id: "5",
    place: "Grocery Store",
    date: "2025-07-03",
    amount: 76.2,
  },
  {
    id: "6",
    place: "Online Subscription",
    date: "2025-07-04",
    amount: 9.99,
  },
  {
    id: "7",
    place: "Grocery Store",
    date: "2025-07-03",
    amount: 76.2,
  },
  {
    id: "8",
    place: "Online Subscription",
    date: "2025-07-04",
    amount: 9.99,
  },
];

type Props = {};

const Group = ({ route }) => {
  const { auth } = useDynamic();
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  const { wallets } = useDynamic();

  const [reveal, setReveal] = React.useState(false);

  const { data } = route.params || {};

  const maskedNumber = "**** **** **** ****";
  const maskedDate = "**/**";
  const maskedCvc = "***";
  const maskedName = "************";

  console.log(data.transactions);

  const renderTransaction = ({ item }) => (
    <Pressable
      style={styles.transaction_card}
      onPress={() => {
        //@ts-ignore
        navigation.navigate("Split", {
          item: item || [],
        });
      }}
    >
      <View style={styles.transaction_details}>
        <Text style={styles.transaction_place}>{item.description}</Text>
        <Text style={styles.transaction_date}>
          {new Date(Number(item.timestamp)).getTime()}
        </Text>
      </View>
      <RNText style={styles.transaction_amount}>
        $ {Number(item.totalAmount).toFixed(2)}
      </RNText>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header_container}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Image source={LEFT} style={styles.backIcon} />
        </Pressable>
        <View style={styles.header_inner_container}>
          <Image
            source={{ uri: "https://avatar.iran.liara.run/public" }}
            style={styles.avatar}
          />
          <View style={styles.header_title_container}>
            <Text style={styles.header_bottom_title}>{data.name}</Text>
          </View>
        </View>
      </View>

      {/* Balance Card */}
      <View style={styles.credit_card_container}>
        <Image
          source={CARD}
          style={{
            width: getWidth(335),
            height: getHeight(214),
            resizeMode: "cover",
            position: "absolute",
            borderRadius: 30,
          }}
        />
        <View style={styles.credit_card_upper_container}>
          <View style={styles.card_upper_text_container}>
            <Text style={styles.credit_card_upper_text_label}>Balance</Text>
            <Text style={styles.credit_card_upper_text_value}>
              $ {Number(data.card.limit) * 10 ** -6 || "0.00"}
            </Text>
          </View>
          <Image
            source={VISA}
            style={{ width: 75, height: 24.3, resizeMode: "contain" }}
          />
        </View>
        <View style={styles.cerdit_card_number_container}>
          <Text style={styles.cerdit_card_number}>
            {`${data.card.cardNo.slice(0, 4)} ${data.card.cardNo.slice(
              4,
              8
            )} ${data.card.cardNo.slice(8, 12)} ${data.card.cardNo.slice(
              12,
              16
            )}` || "4444 4444 4444 4444"}
          </Text>
        </View>
        <View style={styles.cerdit_card_information_container}>
          <Text style={styles.cerdit_card_name}>{"YASIR KILINC"}</Text>
          <View style={styles.cerdit_card_date_cvc_container}>
            <Text style={styles.cerdit_card_date}>
              {data ? data.card.expireDate : "44/44"}
            </Text>
            <Text style={styles.cerdit_card_cvc}>
              {data ? data.card.cvv : "444"}
            </Text>
          </View>
        </View>
      </View>
      <Text style={styles.members_header}>Members</Text>
      <View style={styles.members_container}>
        <View style={styles.member}>
          <Image source={PLUS} style={styles.add_member_icon} />
          <Text>Add</Text>
        </View>
        <View style={styles.divider}></View>
        <View style={styles.member}>
          <Image
            source={{ uri: "https://avatar.iran.liara.run/public" }}
            style={styles.avatar}
          />
          <Text>exTypen</Text>
        </View>
        <View style={styles.member}>
          <Image
            source={{ uri: "https://avatar.iran.liara.run/public" }}
            style={styles.avatar}
          />
          <Text>feyyazcigim</Text>
        </View>
        <View style={styles.member}>
          <Image
            source={{ uri: "https://avatar.iran.liara.run/public" }}
            style={styles.avatar}
          />
          <Text>beril</Text>
        </View>
      </View>

      {/* Transactions Section */}
      <View style={styles.transactions_container}>
        <Text style={styles.section_title}>Transactions</Text>
        <FlatList
          data={data.transactions || transactions}
          keyExtractor={(item) => item.id}
          renderItem={renderTransaction}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.SURFACE_LIGHT,
  },
  header_container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: getHeight(12),
    paddingHorizontal: getWidth(20),
  },
  backButton: {
    position: "absolute",
    left: getWidth(20),
    padding: 8,
  },
  backIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  header_inner_container: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
  credit_card_container: {
    width: getWidth(335),
    height: getHeight(214),
    marginHorizontal: getWidth(20),
    marginBottom: getHeight(16),
    borderRadius: 30,
    padding: 20,
    justifyContent: "space-between",
  },
  credit_card_upper_container: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  card_upper_text_container: {
    gap: 4,
  },
  credit_card_upper_text_label: {
    ...Fonts.smallRegular,
    color: Colors.WHITE,
  },
  credit_card_upper_text_value: {
    fontSize: 30,
    ...Fonts.semibold,
    color: Colors.WHITE,
  },
  cerdit_card_number: {
    ...Fonts.xlMedium,
    color: Colors.WHITE,
  },
  cerdit_card_information_container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  cerdit_card_name: {
    ...Fonts.smallRegular,
    color: Colors.WHITE,
  },
  cerdit_card_date_cvc_container: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-end",
  },
  cerdit_card_cvc: {
    ...Fonts.smallRegular,
    color: Colors.WHITE,
  },
  cerdit_card_date: {
    ...Fonts.smallRegular,
    color: Colors.WHITE,
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
  currency_icon: { width: 14, height: 14 },
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
  red: {
    color: Colors.ERROR_500,
  },
  members_header: {
    ...Fonts.mdSemibold,
    color: Colors.GRAY_900,
    marginLeft: getWidth(20),
    marginBottom: getHeight(8),
  },
  add_member_icon: {
    width: 44,
    height: 44,
    tintColor: Colors.GRAY_500,
  },
  members_container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
    paddingVertical: getHeight(8),
    paddingHorizontal: getWidth(20),
  },
  add_member: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  divider: {
    width: 2,
    height: getHeight(50),
    backgroundColor: Colors.GRAY_200,
  },
  member: {
    alignItems: "center",
    gap: 8,
  },
  transactions_container: {
    flex: 1,
    backgroundColor: Colors.SURFACE_LIGHT,
    paddingVertical: getHeight(8),
    paddingHorizontal: getWidth(20),
  },
  section_title: {
    ...Fonts.mdSemibold,
    color: Colors.GRAY_900,
    marginBottom: 8,
  },
  transaction_card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  transaction_details: {
    gap: 4,
  },
  transaction_place: {
    ...Fonts.mdSemibold,
    color: Colors.GRAY_900,
  },
  transaction_date: {
    ...Fonts.xsMedium,
    color: Colors.GRAY_500,
  },
  transaction_amount: {
    ...Fonts.mdSemibold,
    color: Colors.GRAY_900,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.GRAY_200,
  },
  eye_button: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 6,
  },
});

export default Group;

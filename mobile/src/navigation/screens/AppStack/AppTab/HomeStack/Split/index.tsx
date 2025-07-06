import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  TextInput,
  SafeAreaView,
} from "react-native";
import Checkbox from "expo-checkbox";
import { Text } from "@/components/ui";
import { getWidth, getHeight } from "@/constants/Spaces";
import { Colors } from "@/constants";
import Fonts from "@/constants/Fonts";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppStackParamList } from "@/navigation/screens/AppStack";

import LEFT from "@/assets/left.png";

// Route'dan gelen veri tipi
interface ShareData {
  amount: bigint;
  user: string;
}

interface RouteItem {
  description: string;
  paidBy: string;
  shares: ShareData[];
  timestamp: bigint;
  totalAmount: bigint;
  transactionId: bigint;
}

type Person = {
  id: string;
  name: string;
  included: boolean;
  shareInput: string;
};

type SplitProps = {
  route: {
    params: {
      item: RouteItem;
    };
  };
};

// Utility: normalize string to float
const normalizeNumber = (v: string) => v.replace(/,/g, ".");
const toFloat = (v: string) => parseFloat(normalizeNumber(v)) || 0;

// Utility: mask address to first 4 and last 4 characters
const maskAddress = (addr: string) => {
  const start = addr.slice(0, 4);
  const end = addr.slice(-4);
  return `${start}...${end}`;
};

const Split: React.FC<SplitProps> = ({ route }) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { item } = route.params;

  // Toplam tutarı BigInt'ten number'a çevir ve 2 ondalık
  const expense = {
    title: item.description,
    amount: Number(item.totalAmount),
  };

  // Başlangıç payları (maskelenmiş adres isimleri)
  const initialPeople: Person[] = item.shares.map((s) => ({
    id: s.user,
    name: maskAddress(s.user),
    included: true,
    shareInput: Number(s.amount).toFixed(2),
  }));

  const [people, setPeople] = useState<Person[]>(initialPeople);
  const [leftover, setLeftover] = useState<number>(() => {
    const allocated = initialPeople.reduce(
      (sum, p) => sum + toFloat(p.shareInput),
      0
    );
    return parseFloat((expense.amount - allocated).toFixed(2));
  });

  // Kalan miktarı hesapla
  useEffect(() => {
    const allocated = people.reduce(
      (sum, p) => sum + (p.included ? toFloat(p.shareInput) : 0),
      0
    );
    setLeftover(parseFloat((expense.amount - allocated).toFixed(2)));
  }, [people, expense.amount]);

  // Checkbox toggle
  const toggleInclude = (id: string, value?: boolean) => {
    setPeople((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, included: value ?? !p.included, shareInput: "0.00" }
          : p
      )
    );
  };

  // Share input güncelle
  const updateShare = (id: string, value: string) => {
    let cleaned = value.replace(/[^0-9.,]/g, "");
    cleaned = normalizeNumber(cleaned);
    const firstDot = cleaned.indexOf(".");
    if (firstDot !== -1) {
      cleaned =
        cleaned.slice(0, firstDot + 1) +
        cleaned.slice(firstDot + 1).replace(/\./g, "");
    }
    const numeric = parseFloat(cleaned) || 0;

    setPeople((prev) => {
      const othersSum = prev.reduce(
        (sum, p) =>
          p.id === id ? sum : sum + (p.included ? toFloat(p.shareInput) : 0),
        0
      );
      const maxAllowed = Math.max(0, expense.amount - othersSum);
      const finalStr = numeric > maxAllowed ? maxAllowed.toFixed(2) : cleaned;
      return prev.map((p) =>
        p.id === id ? { ...p, shareInput: finalStr } : p
      );
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={navigation.goBack} style={styles.backButton}>
          <Image source={LEFT} style={styles.backIcon} />
        </Pressable>
        <Text style={styles.headerTitle}>Split</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{expense.title}</Text>
        <Text style={styles.amount}>Total: $ {expense.amount.toFixed(2)}</Text>

        {people.map((person) => (
          <View key={person.id} style={styles.row}>
            <Pressable
              style={styles.leftArea}
              onPress={() => toggleInclude(person.id)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Checkbox
                value={person.included}
                onValueChange={(val) => toggleInclude(person.id, val)}
                color={person.included ? Colors.PRIMARY_500 : Colors.GRAY_200}
                style={styles.checkbox}
              />
              <Text style={[styles.name, !person.included && { opacity: 0.5 }]}>
                {person.name}
              </Text>
            </Pressable>

            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              editable={person.included}
              value={person.shareInput}
              onChangeText={(v) => updateShare(person.id, v)}
              placeholder="0.00"
              placeholderTextColor={Colors.GRAY_400}
            />
          </View>
        ))}

        <Text style={styles.info}>
          Leftover to assign: $ {leftover.toFixed(2)}
        </Text>

        <Pressable
          style={[
            styles.confirmButton,
            (leftover !== 0 || people.every((p) => !p.included)) &&
              styles.confirmButtonDisabled,
          ]}
          onPress={() => console.log("Splitting expense...")}
          disabled={leftover !== 0 || people.every((p) => !p.included)}
        >
          <Text style={[Fonts.mdMedium, styles.confirmButtonText]}>
            Split Expense
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.SURFACE_LIGHT },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: getHeight(56),
  },
  backButton: { position: "absolute", left: getWidth(16), padding: 8 },
  backIcon: { width: 24, height: 24, resizeMode: "contain" },
  headerTitle: { ...Fonts.mdSemibold, color: Colors.GRAY_900, fontSize: 18 },

  scrollContent: {
    paddingHorizontal: getWidth(20),
    paddingBottom: getHeight(40),
  },
  title: {
    ...Fonts.xxxlSemibold,
    color: Colors.GRAY_900,
    marginTop: getHeight(16),
  },
  amount: {
    ...Fonts.xlLight,
    color: Colors.GRAY_500,
    marginBottom: getHeight(16),
    paddingBottom: getHeight(16),
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: getHeight(12),
  },
  leftArea: { flexDirection: "row", alignItems: "center", flex: 1 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    marginRight: getWidth(12),
  },
  name: { ...Fonts.mdMedium, color: Colors.GRAY_900 },

  input: {
    width: 90,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: Colors.GRAY_200,
    borderRadius: 8,
    textAlign: "right",
    ...Fonts.mdMedium,
    color: Colors.GRAY_900,
  },

  info: {
    ...Fonts.smallRegular,
    color: Colors.GRAY_500,
    textAlign: "center",
    marginTop: getHeight(12),
  },

  confirmButton: {
    backgroundColor: Colors.PRIMARY_300,
    borderRadius: 40,
    paddingVertical: 14,
    marginTop: getHeight(24),
    alignItems: "center",
  },
  confirmButtonDisabled: {
    backgroundColor: Colors.GRAY_400,
  },
  confirmButtonText: {
    color: Colors.GRAY_900,
    ...Fonts.mdSemibold,
  },
});

export default Split;

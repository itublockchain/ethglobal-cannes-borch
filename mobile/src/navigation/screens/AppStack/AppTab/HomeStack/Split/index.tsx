import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  TextInput,
  SafeAreaView,
  Button,
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

// Dummy data – replace later
const expense = { id: "e1", title: "Dinner Bill", amount: 120 };
const participantsData = [
  { id: "1", name: "alice.bch.eth" },
  { id: "2", name: "bob.bch.eth" },
  { id: "3", name: "charlie.bch.eth" },
  { id: "4", name: "You" },
];

type Person = {
  id: string;
  name: string;
  included: boolean;
  shareInput: string; // raw string
};

const normalizeNumber = (v: string) => v.replace(",", ".");
const toFloat = (v: string) => parseFloat(normalizeNumber(v)) || 0;

const Split: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  const [people, setPeople] = useState<Person[]>(() =>
    participantsData.map((p) => ({ ...p, included: true, shareInput: "0" }))
  );
  const [leftover, setLeftover] = useState(expense.amount);

  /** Equal split on mount */
  useEffect(() => handleEqualSplit(), []);

  /** Re-calc leftover whenever inputs change */
  useEffect(() => {
    const allocated = people.reduce(
      (sum, p) => sum + (p.included ? toFloat(p.shareInput) : 0),
      0
    );
    setLeftover(Number((expense.amount - allocated).toFixed(2)));
  }, [people]);

  /** Toggle checkbox */
  const toggleInclude = (id: string, value?: boolean) => {
    setPeople((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, included: value ?? !p.included, shareInput: "0" }
          : p
      )
    );
  };

  /** Handle per-person input */
  const updateShare = (id: string, value: string) => {
    // 1. Keep only digits + separators
    let cleaned = value.replace(/[^0-9.,]/g, "");

    // 2. Convert ,→. and remove extra dots
    cleaned = cleaned.replace(",", ".");
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

      // Clamp only if exceeds
      const finalStr = numeric > maxAllowed ? maxAllowed.toString() : cleaned;

      return prev.map((p) =>
        p.id === id ? { ...p, shareInput: finalStr } : p
      );
    });
  };

  /** Equal split helper */
  const handleEqualSplit = () => {
    const included = people.filter((p) => p.included);
    const per = included.length ? expense.amount / included.length : 0;
    const formatted = per.toFixed(2);

    setPeople((prev) =>
      prev.map((p) => (p.included ? { ...p, shareInput: formatted } : p))
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
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
            {/* Checkbox + Name (larger tap area) */}
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

            {/* Amount input */}
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

        {/* Equal split button */}
        <Pressable style={styles.equalBtn} onPress={handleEqualSplit}>
          <Text style={styles.equalBtnText}>Equal Split</Text>
        </Pressable>

        {/* Leftover info */}
        <Text style={styles.info}>
          Leftover to assign: $ {leftover.toFixed(2)}
        </Text>

        <Pressable
          style={[
            styles.confirmButton,
            leftover !== 0 || people.every((p) => !p.included)
              ? styles.confirmButtonDisabled
              : {},
          ]}
          onPress={() => console.log("Creating your group...")}
          disabled={leftover !== 0 || people.every((p) => !p.included)}
        >
          <Text style={[Fonts.mdMedium, styles.confirmButtonText]}>
            Create Group
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

  /* Row styles */
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

  /* Input */
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

  /* Equal button */
  equalBtn: {
    marginTop: getHeight(24),
    backgroundColor: Colors.SURFACE_LIGHT,
    borderRadius: 30,
    paddingVertical: getHeight(12),
    alignItems: "center",
  },
  equalBtnText: { ...Fonts.mdSemibold, color: Colors.WHITE },

  /* Info */
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

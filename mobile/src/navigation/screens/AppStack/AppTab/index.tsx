import React from "react";
import {
  View,
  Pressable,
  Image,
  Text,
  StyleSheet,
  Platform,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// BlurView (Expo)
import { BlurView } from "expo-blur";
// Haptic
import * as Haptics from "expo-haptics";

// Screens
import HomeStack from "./HomeStack";
import CreateGroup from "./CreateGroup";
import Profile from "./Profile";

// Icons
import HOME from "@/assets/home.png";
import USER from "@/assets/user.png";
import PLUS from "@/assets/plus.png";

const Tab = createBottomTabNavigator();

const CustomTabBar = ({ state, navigation }) => {
  return (
    <View style={styles.container}>
      {/* Blur arka plan */}
      <BlurView intensity={4} tint="light" style={StyleSheet.absoluteFill} />

      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const commonProps = {
            onPress,
            onPressIn: () => Haptics.impactAsync(),
            hitSlop: { top: 12, bottom: 12, left: 12, right: 12 },
          };

          const icon =
            route.name === "HomeStack"
              ? HOME
              : route.name === "CreateGroup"
              ? PLUS
              : USER;

          // Ortadaki artı butonu
          if (route.name === "CreateGroup") {
            return (
              <Pressable
                key={route.key}
                style={styles.centerButtonContainer}
                {...commonProps}
              >
                <View style={styles.centerButton}>
                  <Image source={icon} style={styles.centerIcon} />
                </View>
              </Pressable>
            );
          }

          // Diğer sekmeler (Home, Profile)
          return (
            <Pressable
              key={route.key}
              style={styles.tabButton}
              {...commonProps}
            >
              <Image
                source={icon}
                style={[
                  styles.icon,
                  { tintColor: isFocused ? "#ACDC79" : "#fff" },
                ]}
              />
              <Text
                style={[
                  styles.label,
                  { color: isFocused ? "#ACDC79" : "#fff" },
                ]}
              >
                {route.name === "HomeStack" ? "Home" : "Profile"}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

export default function AppTab() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="HomeStack" component={HomeStack} />
      <Tab.Screen name="CreateGroup" component={CreateGroup} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    // Android’da blur desteklenmezse yarı şeffaf arka plan
    backgroundColor:
      Platform.OS === "android" ? "rgba(16,24,40,0.8)" : "transparent",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#101828",
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 24,
    borderRadius: 50,
    paddingVertical: 14,
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
  },
  tabButton: {
    alignItems: "center",
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  label: {
    fontSize: 12,
    marginTop: 4,
  },
  centerButtonContainer: {
    marginHorizontal: -45,
  },
  centerButton: {
    width: 48,
    height: 48,
    borderRadius: 30,
    backgroundColor: "#ACDC79",
    justifyContent: "center",
    alignItems: "center",
  },
  centerIcon: {
    width: 24,
    height: 24,
    tintColor: "#101828",
    resizeMode: "contain",
  },
});

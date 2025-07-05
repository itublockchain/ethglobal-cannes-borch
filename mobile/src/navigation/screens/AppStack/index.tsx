import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Screens
import AppTab from "./AppTab";
import RegisterENS from "./RegisterENS";

const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AppTab" component={AppTab} />
      <Stack.Screen name="RegisterENS" component={RegisterENS} />
    </Stack.Navigator>
  );
}

export type AppStackParamList = {
  AppTab: undefined;
  RegisterENS: undefined;
};

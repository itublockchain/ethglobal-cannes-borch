import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Screens
import AppTab from "./AppTab";

const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AppTab" component={AppTab} />
    </Stack.Navigator>
  );
}

export type AppStackParamList = {
  AppTab: undefined;
};

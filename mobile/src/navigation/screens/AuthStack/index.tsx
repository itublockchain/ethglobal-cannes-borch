import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Screens
import Auth from "./Auth";

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AuthScreen" component={Auth} />
    </Stack.Navigator>
  );
}

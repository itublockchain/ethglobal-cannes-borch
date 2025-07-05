import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useDynamic } from "@/lib/dynamic";

// Stacks and Screens
import AuthStack from "./screens/AuthStack";
import AppStack from "./screens/AppStack";
import { NotFound } from "./screens/NotFound";

const Stack = createNativeStackNavigator();

const RootStack = () => {
  const { auth } = useDynamic();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {auth.authenticatedUser ? (
        <Stack.Screen name="App" component={AppStack} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
      <Stack.Screen name="NotFound" component={NotFound} />
    </Stack.Navigator>
  );
};

export default RootStack;

import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Screens
import Home from "./Home";
import Group from "./Group";
import Split from "./Split";

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Home"
    >
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen
        name="Split"
        //@ts-ignore
        component={Split} // Replace with actual Split screen component
        initialParams={{ groupId: undefined }} // Adjust as needed
      />
      <Stack.Screen
        name="Group"
        //@ts-ignore
        component={Group} // Replace with actual Group screen component
        initialParams={{ groupId: undefined }} // Adjust as needed
      />
    </Stack.Navigator>
  );
}

export type AppStackParamList = {
  Home: undefined;
  Split: { groupId?: string }; // Optional groupId parameter
  Group: { groupId?: string }; // Optional groupId parameter
};

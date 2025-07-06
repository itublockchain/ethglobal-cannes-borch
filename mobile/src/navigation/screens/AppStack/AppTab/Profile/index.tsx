import { View, Button } from "react-native";
import { Text } from "@/components/ui";

import { dynamicClient } from "@/lib/dynamic";

type Props = {};

const Profile = (props: Props) => {
  return (
    <View>
      <Text>Profile</Text>
      <Button
        title="Logout"
        onPress={async () => {
          // Navigate to Home or any other screen
        }}
      />
      <Button
        title="Logout"
        onPress={async () => {
          // Navigate to Home or any other screen
          await dynamicClient.auth.logout();
        }}
      />
      <Button
        title="Export"
        onPress={async () => {
          // Show the authentication UI
          await dynamicClient.ui.auth.show();
        }}
      />
    </View>
  );
};

export default Profile;

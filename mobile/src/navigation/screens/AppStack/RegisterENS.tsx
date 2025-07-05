import {
  SafeAreaView,
  View,
  StyleSheet,
  TextInput,
  Pressable,
} from "react-native";

import { Text } from "@/components/ui";
import { Fonts } from "@/constants/Fonts";
import { Colors } from "@/constants";
import { getHeight, getWidth } from "@/constants/Spaces";

function RegisterENS() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header_container}>
        <Text style={[Fonts.xxlBlack, styles.header_title]}>Register ENS</Text>
        <Text style={[Fonts.mdRegular, styles.header_description]}>
          Register your ENS domain to enhance your Web3 identity.
        </Text>
      </View>
      <View style={styles.content_container}>
        <View>
          <Text style={[Fonts.smallMedium, styles.input_label]}>
            Choose an ENS domain <Text style={styles.red}>*</Text>
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter nickname or domain"
            placeholderTextColor={Colors.GRAY_500}
            autoCapitalize="none"
          />
          <Pressable
            style={styles.send_button}
            onPress={() => {
              // Handle domain registration logic here
              console.log("Registering ENS domain...");
            }}
          >
            <Text style={[Fonts.mdMedium, styles.send_button_text]}>
              Register Domain
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  header_container: {
    marginVertical: getHeight(12),
    paddingVertical: getHeight(12),
    paddingHorizontal: getWidth(20),
  },
  header_title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#212529",
  },
  header_description: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#6c757d",
    marginTop: getHeight(8),
  },
  content_container: {
    paddingVertical: getHeight(24),
    paddingHorizontal: getWidth(20),
  },
  input_label: {
    color: Colors.GRAY_500,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.GRAY_200,
    borderRadius: 12,
    padding: 14,
    marginTop: getHeight(4),
    ...Fonts.mdRegular,
  },
  send_button: {
    backgroundColor: Colors.PRIMARY_300,
    borderRadius: 40,
    paddingVertical: 14,
    marginTop: getHeight(24),
    alignItems: "center",
  },
  send_button_text: {
    color: Colors.GRAY_900,
    ...Fonts.mdSemibold,
  },

  red: {
    color: Colors.ERROR_500,
  },
});

export default RegisterENS;

import { useEffect } from "react";
import { SafeAreaView, View, StyleSheet, Image, Pressable } from "react-native";
import { Text } from "@/components/ui";
import { dynamicClient } from "@/lib/dynamic";
import { Fonts } from "@/constants/Fonts";
import { Colors, Spaces } from "@/constants";
import { getWidth } from "@/constants/Spaces";

import GOOGLE from "@/assets/google.png";
import ENTRY from "@/assets/entry.png";

type Props = {};

const Auth = (props: Props) => {
  useEffect(() => {
    //dynamicClient.ui.auth.show();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.top_container}>
        <View style={styles.title_container}>
          <Text style={[Fonts.xxxlBlack, styles.title]}>
            TAILOR YOU FINANCE
          </Text>
          <Text style={[Fonts.xxxlBlack, styles.title]}>WITH SABIPAY</Text>
        </View>
        <Image
          source={ENTRY}
          style={{
            width: Spaces.getWidth() - 48,
            height: 448,
            marginTop: 32,
            zIndex: -1,
            borderRadius: 30,
          }}
        />
        <Text style={[Fonts.lgRegular, styles.desc]}>
          Craft a unique financial journey! Share details to unlock personalized
          features with Sabipay!
        </Text>
      </View>
      <Pressable
        style={styles.google_button_container}
        onPress={() => dynamicClient.ui.auth.show()}
      >
        <View style={styles.google_button}>
          <Image
            source={GOOGLE}
            style={{
              width: 20,
              height: 20,
            }}
          />
          <Text style={styles.google_button_text}>Sign in with Google</Text>
        </View>
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: Colors.SURFACE_LIGHT,
  },
  top_container: {
    flex: 1,
    alignItems: "center",
  },
  title_container: {
    alignItems: "center",
    marginTop: 54,
  },
  title: {
    lineHeight: 38,
    color: Colors.GRAY_900,
  },
  desc: {
    marginHorizontal: 20,
    color: Colors.WHITE,
    textAlign: "center",
    marginVertical: 16,
  },
  google_button_container: {
    backgroundColor: Colors.GRAY_900,
    borderRadius: 30,
  },
  google_button: {
    flexDirection: "row",
    width: getWidth(328),
    paddingVertical: 16,
    justifyContent: "center",
    gap: 12,
  },
  google_button_text: {
    fontFamily: Fonts.bold.fontFamily,
    fontSize: 16,
    color: Colors.WHITE,
  },
});

export default Auth;

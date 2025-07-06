import React, { useState, useEffect, useContext } from "react";
import {
  SafeAreaView,
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

import { Text } from "@/components/ui";
import { Fonts } from "@/constants/Fonts";
import { Colors } from "@/constants";
import { getHeight, getWidth } from "@/constants/Spaces";
import { ClientContext } from "@/App";
import { SAPPHIRE_ABI } from "@/constants/ABI";
import { useDynamic } from "@/lib/dynamic";

function CreateGroup() {
  const [image, setImage] = useState<string | null>(null);
  const clients = useContext(ClientContext);
  const { wallets } = useDynamic();

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header_container}>
        <Text style={[Fonts.xxlBlack, styles.header_title]}>Create Group</Text>
        <Text style={[Fonts.mdRegular, styles.header_description]}>
          Select an image and find a super cool group name for your new group.
        </Text>
      </View>

      <View style={styles.content_container}>
        <View style={styles.content_container_row}>
          <Pressable onPress={pickImage} style={styles.avatar_container}>
            {image ? (
              <Image source={{ uri: image }} style={styles.avatar_image} />
            ) : (
              <View style={styles.avatar_placeholder}>
                <Text style={[Fonts.smallRegular, styles.placeholder_text]}>
                  +
                </Text>
              </View>
            )}
          </Pressable>

          <View style={styles.content_container_row_input_container}>
            <Text style={[Fonts.smallMedium, styles.input_label]}>
              Group Name <Text style={styles.red}>*</Text>
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter group name"
              placeholderTextColor={Colors.GRAY_500}
              autoCapitalize="none"
            />
          </View>
        </View>

        <Pressable
          style={styles.send_button}
          onPress={async () => {
            console.log("Creating group...");
            clients.walletOasisClient
              .writeContract({
                address: "0x71Cfe1f469af5Dd78f134e486502b594A6231C51",
                abi: SAPPHIRE_ABI,
                functionName: "createGroup",
                args: [[wallets.primary!.address], "Group Name"],
              })
              .then((res) => {
                Alert.alert("Success", "Group created successfully!");
                console.log(res);
              })
              .catch((error) => {
                console.error(error);
                Alert.alert("Error", "Failed to create group.");
              });
          }}
        >
          <Text style={[Fonts.mdMedium, styles.send_button_text]}>
            Create Group
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const AVATAR_SIZE = getWidth(80);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.SURFACE_LIGHT,
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
  content_container_row: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar_container: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.GRAY_200,
  },
  avatar_placeholder: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  placeholder_text: {
    fontSize: 32,
    color: Colors.GRAY_400,
  },
  avatar_image: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
  },
  content_container_row_input_container: {
    flex: 1,
    marginLeft: getWidth(12),
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

export default CreateGroup;

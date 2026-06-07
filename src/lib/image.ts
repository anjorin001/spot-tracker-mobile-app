import * as ImagePicker from "expo-image-picker";

export async function pickImage(): Promise<string | undefined> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.7,
  });
  if (!result.canceled) return result.assets[0].uri;
  return undefined;
}

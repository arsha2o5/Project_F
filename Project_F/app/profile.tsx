import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View, Image, Alert, ScrollView, DeviceEventEmitter } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import {sendPictureToServer} from './utils/aiPetGeneration'

type GeneratedPetImages = {
  neutral: string;
  happy: string;
  sad: string;
};

export default function ProfileScreen() {
  const [image, setImage] = useState<string|null>(null)
  const [generatedPet, setGeneratedPet] = useState<GeneratedPetImages | null>(null)

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library.
    // Manually request permissions for videos on iOS when `allowsEditing` is set to `false`
    // and `videoExportPreset` is `'Passthrough'` (the default), ideally before launching the picker
    // so the app users aren't surprised by a system dialog after picking a video.
    // See "Invoke permissions for videos" sub section for more details.
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if(!permissionResult.granted){
      Alert.alert('Permission required', 'Permission to access the media library is required.')
      return
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      aspect: [4,3],
      quality: 1,
    })

    if(!result.canceled){
      setImage(result.assets[0].uri)
    }
  }
  const handleGeneratePet = async () => {
    if (!image) return;
    console.log("handleGeneratePet reached");
    
    
    try {
      const petStateImages = await sendPictureToServer(image);

      if (!petStateImages?.neutral || !petStateImages?.happy || !petStateImages?.sad) {
        throw new Error("No pet images were returned.");
      }

      setGeneratedPet(petStateImages);
    } catch (e) {
        console.error(e);
    }
};

  const handleSavePet = async () => {
    if (!generatedPet?.neutral || !generatedPet?.happy || !generatedPet?.sad) {
      Alert.alert("Missing pet images", "Generate pet images before saving.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        Alert.alert("Login required", "Please sign in again to save your pet.");
        return;
      }
      console.log("reached fetch in save pet");
      
      const response = await fetch("http://ec2-18-144-66-250.us-west-1.compute.amazonaws.com:5000/pet/save", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          neutral: generatedPet.neutral,
          happy: generatedPet.happy,
          sad: generatedPet.sad,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to save pet");
      }

      DeviceEventEmitter.emit("petSaved");
      Alert.alert("Saved", "Your pet has been saved.");
    } catch (error) {
      console.error(error);
      Alert.alert("Save failed", "Unable to save your pet right now.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.screen}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Pet owner details will live here.</Text>
        <View style={styles.container}>
          <View style={styles.previewSection}>
            <Pressable style={styles.pickButton} onPress={pickImage}>
              <Text style={styles.pickButtonText}>Pick an image from camera roll</Text>
            </Pressable>

            <View style={styles.imageBox}>
              {image ? (
                <Image source={{ uri: image }} style={styles.image} />
              ) : (
                <Text style={styles.placeholderText}>No image selected</Text>
              )}
            </View>

            <Pressable style={styles.button} onPress={handleGeneratePet}>
              <Text style={styles.buttonText}>GENERATE PET</Text>
            </Pressable>
          </View>

          <View style={styles.generatedImages}>
            <View style={styles.generatedImageBox}>
              {generatedPet?.sad ? (
                <Image source={{ uri: generatedPet.sad }} style={styles.generatedImage} />
              ) : (
                <Text style={styles.placeholderText}>Sad pet</Text>
              )}
            </View>
            <View style={styles.generatedImageBox}>
              {generatedPet?.neutral ? (
                <Image source={{ uri: generatedPet.neutral }} style={styles.generatedImage} />
              ) : (
                <Text style={styles.placeholderText}>Neutral pet</Text>
              )}
            </View>
            <View style={styles.generatedImageBox}>
              {generatedPet?.happy ? (
                <Image source={{ uri: generatedPet.happy }} style={styles.generatedImage} />
              ) : (
                <Text style={styles.placeholderText}>Happy pet</Text>
              )}
            </View>
          </View>

          <Pressable style={styles.saveButton} onPress={handleSavePet}>
            <Text style={styles.saveButtonText}>SAVE PET</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    backgroundColor: "#f8f2e7",
    paddingBottom: 32,
  },
  screen: {
    flexGrow: 1,
    // position: "relative",
    padding: 24,
    paddingTop: 120,
    backgroundColor: "#f8f2e7",
  },
  button: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: "rgba(244, 231, 130, 0.86)",
  },
  buttonText: {
    fontWeight: "800",
    color: "#784739",
  },
  pickButton: {
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: "#e7dccf",
  },
  pickButtonText: {
    fontWeight: "700",
    color: "#263033",
  },
  saveButton: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: "#784739",
  },
  saveButtonText: {
    fontWeight: "800",
    color: "#fff",
  },
  backButton: {
    position: "absolute",
    top: 56,
    left: 24,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.7)",
    zIndex: 10000,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#263033",
  },
  title: {
    fontSize: 34,
    fontWeight: "900",
    color: "#263033",
  },
  subtitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "700",
    color: "#667174",
  },
  container: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  previewSection: {
    width: "100%",
    alignItems: "center",
    marginTop: 16,
  },
  imageBox: {
    width: 220,
    height: 220,
    borderRadius: 20,
    backgroundColor: "#d9d9d9",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  placeholderText: {
    color: "#5f6368",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  generatedImages: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 16,
  },
  generatedImageBox: {
    width: 110,
    height: 110,
    borderRadius: 20,
    backgroundColor: "#d9d9d9",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 10,
  },
  generatedImage: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
});

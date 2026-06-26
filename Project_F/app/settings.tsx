import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";


const logout = async () => {
  // Remove all user-specific keys so a different account starts fresh
  const keysToRemove = [
    "auth_token",
    "pet_stats",
    "userId",
  ];

  try {
    await AsyncStorage.multiRemove(keysToRemove);
  } catch (err) {
    console.warn("Failed to clear some AsyncStorage keys on logout:", err);
  }

  router.replace("/auth/loginScreen");  
};
  
export default function SettingsScreen() {
  return (
    <View style={styles.screen}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Back</Text>
      </Pressable>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>App preferences will live here.</Text>
      <Pressable style={styles.logOutButton} onPress={logout}>
        <Text style={styles.logOutButtonText}>Log Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#eef7f8",
  },
  backButton: {
    position: "absolute",
    top: 56,
    left: 24,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.7)",
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
  logOutButton: {
    marginTop: 24,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  logOutButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#263033",
  },
});

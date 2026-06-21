import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function ProfileScreen() {
  return (
    <View style={styles.screen}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Back</Text>
      </Pressable>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Pet owner details will live here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f8f2e7",
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
});

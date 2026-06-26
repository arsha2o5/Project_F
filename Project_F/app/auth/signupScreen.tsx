import React, {useState} from "react";
import {
	View,
	Text,
	TextInput,
	Pressable,
	StyleSheet,
	Alert,
	KeyboardAvoidingView,
	Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {router, Stack} from "expo-router";

export default function SignUpScreen() {
	const [displayName, setDisplayName] = useState("");
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirm, setConfirm] = useState("");

	const handleSignUp = async () => {
        if (
            !displayName.trim() ||
            !username.trim() ||
            !email.trim() ||
            !password
        ) {
            Alert.alert(
                "Missing Fields",
                "Please fill out all fields."
            );
            return;
        }
        if (password !== confirm) {
            Alert.alert(
                "Password Mismatch",
                "Passwords do not match."
            );
            return;
        }
        try {
		const response = await fetch(
            "http://192.168.1.78:5000/user",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ display_name: displayName, username, email, password }),
            }
        );
        
        const data = await response.json();
        if (!response.ok) {
            console.log("Sign Up Failed:", data.error);
            Alert.alert("Sign Up Failed", data.error || "An error occurred during sign up.");
            return;
	    };
        console.log("Response status:", response.status);
        console.log("Response data:", data);
        Alert.alert(
            "Success", "Your account has been created. Please log in.", 
            [{ text: "OK", 
            onPress: () => router.replace("/auth/loginScreen")}]);

        }catch (error) {
            Alert.alert("Error", "An unexpected error occurred. Please try again later.");
        }
    }

	return (
		<>
		<Stack.Screen options={{ gestureEnabled: false }} />
		<KeyboardAvoidingView
			style={styles.container}
			behavior={Platform.OS === "ios" ? "padding" : undefined}
		>
			<View style={styles.box}>
				<Text style={styles.title}>Sign Up</Text>

				<TextInput
					placeholder="Display Name"
					value={displayName}
					onChangeText={setDisplayName}
					style={styles.input}
				/>

				<TextInput
					placeholder="Username"
					value={username}
					onChangeText={setUsername}
					autoCapitalize="none"
					style={styles.input}
				/>

				<TextInput
					placeholder="Email"
					value={email}
					onChangeText={setEmail}
					keyboardType="email-address"
					autoCapitalize="none"
					style={styles.input}
				/>

				<TextInput
					placeholder="Password"
					value={password}
					onChangeText={setPassword}
					secureTextEntry
					style={styles.input}
				/>

				<TextInput
					placeholder="Confirm Password"
					value={confirm}
					onChangeText={setConfirm}
					secureTextEntry
					style={styles.input}
				/>

				<Pressable style={styles.button} onPress={handleSignUp}>
					<Text style={styles.buttonText}>Create account</Text>
				</Pressable>

				<Text style={styles.smallText}>
					Already have an account?{' '}
					<Text style={styles.link} onPress={() => router.push('/auth/loginScreen')}>
						Log in
					</Text>
				</Text>
			</View>
		</KeyboardAvoidingView>
		</>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
	box: { width: '90%', maxWidth: 420, padding: 20, borderRadius: 12 },
	title: { fontSize: 28, fontWeight: '600', marginBottom: 12 },
	input: {
		borderWidth: 1,
		borderColor: '#ddd',
		padding: 12,
		borderRadius: 8,
		marginBottom: 10,
	},
	button: {
		backgroundColor: '#4A90E2',
		padding: 12,
		borderRadius: 8,
		alignItems: 'center',
		marginTop: 8,
	},
	buttonText: { color: '#fff', fontWeight: '600' },
	smallText: { marginTop: 12, color: '#444' },
	link: { color: '#4A90E2', fontWeight: '600' },
});

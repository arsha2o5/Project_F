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
import { loadServerWellness } from "../../lib/petstats";


export default function LoginScreen() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const handleLogin = async () => {
		const response = await fetch(
        "http://192.168.1.78:5000/auth/login",
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        }
        );
        const data = await response.json();
        if (response.ok) {

            await AsyncStorage.setItem(
                "auth_token",
                data.token
            );

            await AsyncStorage.setItem(
                "userId",
                data.userId.toString()
            );
            
            await loadServerWellness();

            router.replace("/habitat");
        } else {
            Alert.alert(
                "Login Failed",
                data.error
            );
        }
	};

	return (
		<>
		<Stack.Screen options={{ gestureEnabled: false }} />
		<KeyboardAvoidingView
			style={styles.container}
			behavior={Platform.OS === "ios" ? "padding" : undefined}
		>
			<View style={styles.box}>
				<Text style={styles.title}>Log In</Text>

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

				<Pressable style={styles.button} onPress={handleLogin}>
					<Text style={styles.buttonText}>Log In</Text>
				</Pressable>

				<Text style={styles.smallText}>
					Don't have an account?{' '}
					<Text style={styles.link} onPress={() => router.push('/auth/signupScreen')}>
						Sign up
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


import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, Alert, } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export default function LoginScreen({ navigation }: any) {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!username.trim()) {
            newErrors.username = 'Gebruikersnaam is verplicht.';
        }
        if (!password) {
            newErrors.password = 'Wachtwoord is verplicht.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validate()) return;

        setLoading(true);

        try {
            const stored = await SecureStore.getItemAsync('user_credentials');

            if (!stored) {
                Alert.alert('Geen account', 'Er is nog geen account aangemaakt op dit toestel.');
                return;
            }

            const { username: storedUsername, password: storedPassword } =
                JSON.parse(stored);

            if (
                username.trim() !== storedUsername ||
                password !== storedPassword
            ) {
                setErrors({ password: 'Gebruikersnaam of wachtwoord is onjuist.' });
                return;
            }

            await SecureStore.setItemAsync('user_session', storedUsername);

            navigation.replace('Home');

        } catch (error) {
            Alert.alert('Fout', 'Er is iets misgegaan. Probeer opnieuw.');
            console.log('Login error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.wrapper}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.container}>

                <Text style={styles.emoji}></Text>
                <Text style={styles.title}>Wa make?</Text>
                <Text style={styles.subtitle}>Welkom terug!</Text>

                <TextInput
                    style={[styles.input, errors.username && styles.inputError]}
                    placeholder="Gebruikersnaam"
                    value={username}
                    onChangeText={(text) => {
                        setUsername(text);
                        setErrors((e) => ({ ...e, username: '' }));
                    }}
                    autoCapitalize="none"
                />
                {errors.username ? (
                    <Text style={styles.errorText}>{errors.username}</Text>
                ) : null}

                <TextInput
                    style={[styles.input, errors.password && styles.inputError]}
                    placeholder="Wachtwoord"
                    value={password}
                    onChangeText={(text) => {
                        setPassword(text);
                        setErrors((e) => ({ ...e, password: '' }));
                    }}
                    secureTextEntry
                />
                {errors.password ? (
                    <Text style={styles.errorText}>{errors.password}</Text>
                ) : null}

                <Pressable
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? 'Bezig...' : 'Inloggen'}
                    </Text>
                </Pressable>

                <Pressable
                    style={styles.linkButton}
                    onPress={() => navigation.navigate('Register')}
                >
                    <Text style={styles.linkText}>
                        Nog geen account?{' '}
                        <Text style={styles.linkTextBold}>Registreren</Text>
                    </Text>
                </Pressable>

            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({

    wrapper: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },

    container: {
        flex: 1,
        padding: 30,
        justifyContent: 'center',
    },

    emoji: {
        fontSize: 48,
        textAlign: 'center',
        marginBottom: 8,
    },

    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 4,
    },

    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 32,
    },

    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        marginBottom: 4,
    },

    inputError: {
        borderColor: '#ff4d4d',
    },

    errorText: {
        color: '#ff4d4d',
        fontSize: 13,
        marginBottom: 10,
        marginLeft: 4,
    },

    button: {
        backgroundColor: '#2196F3',
        padding: 18,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },

    buttonDisabled: {
        backgroundColor: '#90caf9',
    },

    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },

    linkButton: {
        marginTop: 20,
        alignItems: 'center',
    },

    linkText: {
        fontSize: 15,
        color: '#666',
    },

    linkTextBold: {
        color: '#2196F3',
        fontWeight: 'bold',
    },

});

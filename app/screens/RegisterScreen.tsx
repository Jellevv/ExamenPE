import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, Alert, } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export default function RegisterScreen({ navigation }: any) {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!username.trim()) {
            newErrors.username = 'Gebruikersnaam is verplicht.';
        } else if (username.trim().length < 3) {
            newErrors.username = 'Gebruikersnaam moet minstens 3 tekens zijn.';
        }

        if (!password) {
            newErrors.password = 'Wachtwoord is verplicht.';
        } else if (password.length < 6) {
            newErrors.password = 'Wachtwoord moet minstens 6 tekens zijn.';
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Bevestig je wachtwoord.';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Wachtwoorden komen niet overeen.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (!validate()) return;

        setLoading(true);

        try {
            const existing = await SecureStore.getItemAsync('user_credentials');

            if (existing) {
                Alert.alert(
                    'Account bestaat al',
                    'Er is al een account op dit toestel. Log in met je bestaande account.',
                    [
                        {
                            text: 'Inloggen',
                            onPress: () => navigation.navigate('Login'),
                        },
                        { text: 'Annuleer', style: 'cancel' },
                    ]
                );
                return;
            }

            await SecureStore.setItemAsync(
                'user_credentials',
                JSON.stringify({ username: username.trim(), password })
            );

            await SecureStore.setItemAsync('user_session', username.trim());

            navigation.replace('Home');

        } catch (error) {
            Alert.alert('Fout', 'Er is iets misgegaan. Probeer opnieuw.');
            console.log('Register error:', error);
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
                <Text style={styles.subtitle}>Maak een account aan</Text>

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

                <TextInput
                    style={[styles.input, errors.confirmPassword && styles.inputError]}
                    placeholder="Bevestig wachtwoord"
                    value={confirmPassword}
                    onChangeText={(text) => {
                        setConfirmPassword(text);
                        setErrors((e) => ({ ...e, confirmPassword: '' }));
                    }}
                    secureTextEntry
                />
                {errors.confirmPassword ? (
                    <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                ) : null}

                <Pressable
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleRegister}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? 'Bezig...' : 'Registreren'}
                    </Text>
                </Pressable>

                <Pressable
                    style={styles.linkButton}
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text style={styles.linkText}>
                        Al een account?{' '}
                        <Text style={styles.linkTextBold}>Inloggen</Text>
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

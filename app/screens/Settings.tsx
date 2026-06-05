import React, { useContext, useMemo, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { ItemContext } from '../context/ItemContext';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';

export default function Settings() {
    const { items } = useContext(ItemContext);

    const [username, setUsername] = useState<string | null>(null);

    useEffect(() => {
        const loadUser = async () => {
            const session = await SecureStore.getItemAsync('user_session');
            setUsername(session ?? 'Onbekende gebruiker');
        };

        loadUser();
    }, []);

    const stats = useMemo(() => {

        let green = 0;
        let yellow = 0;
        let red = 0;

        const getStatus = (expiryDate?: string) => {
            if (!expiryDate) return 'green';

            const diffDays =
                (new Date(expiryDate).getTime() - Date.now()) /
                (1000 * 60 * 60 * 24);

            if (diffDays < 0) return 'red';
            if (diffDays <= 7) return 'yellow';
            return 'green';
        };

        items.forEach((item: any) => {
            const status = getStatus(item.expiryDate);

            if (status === 'green') green++;
            if (status === 'yellow') yellow++;
            if (status === 'red') red++;
        });

        return { green, yellow, red, total: items.length };

    }, [items]);

    const netInfo = NetInfo.useNetInfo();
    const isOnline = netInfo.isConnected;

    const navigation = useNavigation<any>();

    const handleLogout = async () => {
        await SecureStore.deleteItemAsync('user_session');
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
    };

    return (
        <View style={styles.container}>

            <Text style={styles.title}>Settings</Text>

            <View style={styles.card}>
                <Text style={styles.label}>Gebruiker</Text>
                <Text>{username}</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>Statistieken</Text>

                <Text style={styles.value}>Totaal: {stats.total}</Text>
                <Text style={styles.value}>🟢 Nog goed: {stats.green}</Text>
                <Text style={styles.value}>🟠 Vervalt binnen 7 dagen: {stats.yellow}</Text>
                <Text style={styles.value}>🔴 Vervallen: {stats.red}</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>Verbinding</Text>

                <Text style={[
                    styles.value,
                    { color: isOnline ? 'green' : 'red' }
                ]}>
                    {isOnline ? 'Online' : 'Offline'}
                </Text>
            </View>

            <Pressable style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>
                    Logout
                </Text>
            </Pressable>

        </View>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },

    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },

    card: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ddd',
    },

    label: {
        fontSize: 14,
        color: '#888',
        marginBottom: 5,
        textTransform: 'uppercase',
    },

    value: {
        fontSize: 16,
        marginBottom: 3,
    },

    logoutButton: {
        marginTop: 20,
        backgroundColor: '#ff4d4d',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },

    logoutText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

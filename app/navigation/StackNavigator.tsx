import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store';

import DrawerNavigator from './DrawerNavigator';
import Home from '../screens/Home';
import ItemDetail from '../screens/ItemDetail';
import RegisterScreen from '../screens/RegisterScreen';
import LoginScreen from '../screens/LoginScreen';

const Stack = createNativeStackNavigator();

export default function StackNavigator() {

    const [initialRoute, setInitialRoute] = useState<string | null>(null);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const credentials = await SecureStore.getItemAsync('user_credentials');
            const session = await SecureStore.getItemAsync('user_session');

            if (!credentials) {
                setInitialRoute('Register');
            } else if (!session) {
                setInitialRoute('Login');
            } else {
                setInitialRoute('Home');
            }

        } catch (error) {
            console.log('Auth check error:', error);
            setInitialRoute('Register');
        }
    };

    if (!initialRoute) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2196F3" />
            </View>
        );
    }

    return (
        <Stack.Navigator
            initialRouteName={initialRoute}
            screenOptions={{ headerShown: false }}
        >
            {/* Auth screens */}
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />

            {/* App screens */}
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="MainDrawer" component={DrawerNavigator} />
            <Stack.Screen
                name="ItemDetail"
                component={ItemDetail}
                options={{ headerShown: true, title: 'Item detail' }}
            />
        </Stack.Navigator>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

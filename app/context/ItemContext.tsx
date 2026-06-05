import React, { createContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export const ItemContext = createContext<any>(null);

export function ItemProvider({ children }: any) {

    const [items, setItems] = useState<any[]>([]);
    const [storageKey, setStorageKey] = useState<string | null>(null);

    const notificationListener = useRef<any>(null);
    const responseListener = useRef<any>(null);

    useEffect(() => {

        initUser();

        requestNotificationPermission();

        responseListener.current =
            Notifications.addNotificationResponseReceivedListener(response => {
                console.log('Notification tapped:', response);
            });

        return () => {

            notificationListener.current?.remove();
            responseListener.current?.remove();

        };

    }, []);

    useEffect(() => {
        if (storageKey) {
            loadItems();
        }
    }, [storageKey]);

    useEffect(() => {
        if (storageKey) {
            saveItems();
        }
    }, [items]);

    const initUser = async () => {

        try {

            const session =
                await SecureStore.getItemAsync('user_session');

            const username = session ?? 'default';

            setStorageKey(`freezer_items_${username}`);

        } catch (error) {

            console.log('initUser error:', error);

            setStorageKey('freezer_items_default');

        }
    };

    const requestNotificationPermission = async () => {

        const { status: existingStatus } =
            await Notifications.getPermissionsAsync();

        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {

            const { status } =
                await Notifications.requestPermissionsAsync();

            finalStatus = status;

        }

        if (finalStatus !== 'granted') {

            console.log('Notification permission not granted');

        }
    };

    const scheduleExpiryNotification = async (item: any) => {

        if (!item.expiryDate) return;

        const expiry = new Date(item.expiryDate);

        const now = new Date();

        const diffDays =
            (expiry.getTime() - now.getTime()) /
            (1000 * 60 * 60 * 24);

        if (diffDays <= 0) return;

        const sevenDaysBefore = new Date(expiry);

        sevenDaysBefore.setDate(
            sevenDaysBefore.getDate() - 7
        );

        const triggerDate =
            sevenDaysBefore > now
                ? sevenDaysBefore
                : new Date(now.getTime() + 5000);

        try {

            await Notifications.scheduleNotificationAsync({

                content: {
                    title: '❄️ Item vervalt binnenkort!',
                    body:
                        `"${item.name}" vervalt op ` +
                        expiry.toLocaleDateString('nl-BE'),
                    data: {
                        itemId: item.id
                    },
                },

                trigger: {
                    type:
                        Notifications.SchedulableTriggerInputTypes.DATE,
                    date: triggerDate,
                },

            });

        } catch (error) {

            console.log(
                'Error scheduling notification:',
                error
            );

        }
    };

    const cancelExpiryNotification = async (itemId: string) => {

        try {

            const notifications =
                await Notifications.getAllScheduledNotificationsAsync();

            const matching = notifications.find(
                notif =>
                    notif.content.data?.itemId === itemId
            );

            if (matching) {

                await Notifications.cancelScheduledNotificationAsync(
                    matching.identifier
                );

            }

        } catch (error) {

            console.log(
                'Error cancelling notification:',
                error
            );

        }
    };

    const loadItems = async () => {

        try {

            const savedItems =
                await AsyncStorage.getItem(storageKey!);

            if (savedItems) {

                setItems(JSON.parse(savedItems));

            }

        } catch (error) {

            console.log('Load error:', error);

        }
    };

    const saveItems = async () => {

        try {

            await AsyncStorage.setItem(
                storageKey!,
                JSON.stringify(items)
            );

        } catch (error) {

            console.log('Save error:', error);

        }
    };

    const addItem = async (newItem: any) => {

        await cancelExpiryNotification(newItem.id);

        setItems((prev) => [...prev, newItem]);

        await scheduleExpiryNotification(newItem);
    };

    const updateItem = async (updatedItem: any) => {

        await cancelExpiryNotification(updatedItem.id);

        setItems((prev) =>
            prev.map((item) =>
                item.id === updatedItem.id ? updatedItem : item
            )
        );

        await scheduleExpiryNotification(updatedItem);
    };

    const deleteItem = (id: string) => {

        cancelExpiryNotification(id);

        setItems(prev =>
            prev.filter(item => item.id !== id)
        );
    };

    return (

        <ItemContext.Provider
            value={{
                items,
                addItem,
                updateItem,
                deleteItem,
            }}
        >
            {children}
        </ItemContext.Provider>

    );
}

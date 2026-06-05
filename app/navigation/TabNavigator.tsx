import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import Inventory from '../screens/Inventory';
import AddItem from '../screens/AddItem';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    let iconName: any;

                    if (route.name === 'Overzicht') {
                        iconName = 'list-outline';
                    } else if (route.name === 'Toevoegen') {
                        iconName = 'add-circle-outline';
                    }

                    return (
                        <Ionicons
                            name={iconName}
                            size={size}
                            color={color}
                        />
                    );
                },
            })}
        >
            <Tab.Screen
                name="Overzicht"
                component={Inventory}
            />

            <Tab.Screen
                name="Toevoegen"
                component={AddItem}
            />
        </Tab.Navigator>
    );
}

import 'react-native-gesture-handler';

import React from 'react';
import { StatusBar } from 'expo-status-bar';

import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import StackNavigator from './app/navigation/StackNavigator';

import { ItemProvider } from './app/context/ItemContext';

export default function App() {
  return (
    <SafeAreaProvider>

      <ItemProvider>

        <NavigationContainer>
          <StackNavigator />
        </NavigationContainer>

      </ItemProvider>

      <StatusBar style="auto" />

    </SafeAreaProvider>
  );
}


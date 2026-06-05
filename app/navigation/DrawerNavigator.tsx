import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';

import TabNavigator from './TabNavigator';
import Settings from '../screens/Settings';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {

  return (

    <Drawer.Navigator>
      <Drawer.Screen name="InventoryTabs" component={TabNavigator} options={{ title: 'Inventaris' }} />
      <Drawer.Screen name="Settings" component={Settings} options={{ title: 'Instellingen' }} />
    </Drawer.Navigator>

  );
}

import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from '../screens/USer/HomeScreen';
import SettingsScreen from '../screens/User/SettingsScreen';
import UserProfileScreen from '../screens/User/UserProfileScreen';


const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: true, // agar top header chahiye
        drawerStyle: {
          backgroundColor: '#fff',
          width: 240,
        },
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Profile" component={UserProfileScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
    </Drawer.Navigator>
  );
}

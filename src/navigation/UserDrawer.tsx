import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import UserTabs from './UserTabs';
import ArticlesScreen from '../screens/User/ArticlesScreen';
import ReadingScreen from '../screens/User/ReadingScreen';
import Feather from 'react-native-vector-icons/Feather';

const Drawer = createDrawerNavigator();

const UserDrawer = () => {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: '#FF6A00',
        drawerLabelStyle: { fontWeight: '600' },
      }}
    >
      <Drawer.Screen
        name="Home"
        component={UserTabs}
        options={{
          drawerIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Articles"
        component={ArticlesScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Feather name="file-text" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Reading"
        component={ReadingScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Feather name="book-open" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

export default UserDrawer;

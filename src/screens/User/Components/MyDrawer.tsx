// MyDrawer.tsx
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import UserQuizScreen from '../../Admin/Quizzes/QuizListScreen';
import HomeScreen from '../HomeScreen';

// Drawer Param List (TypeScript)
export type DrawerParamList = {
  Home: undefined;
  Profile: undefined;
};

// Create Drawer
const Drawer = createDrawerNavigator<DrawerParamList>();

const MyDrawer: React.FC = () => {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: true, // ya false agar custom header chahiye
        drawerActiveTintColor: '#4F46E5',
        drawerLabelStyle: { fontSize: 16, fontWeight: '600' },
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Profile" component={UserQuizScreen} />
    </Drawer.Navigator>
  );
};

export default MyDrawer;

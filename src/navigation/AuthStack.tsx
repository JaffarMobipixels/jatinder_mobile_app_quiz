import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/User/LoginScreen';
import SignupScreen from '../screens/User/SignupScreen';
import PrayerScreen from '../screens/User/PrayerScreen';
import PrayerDetailScreen from '../screens/User/PrayerDetailScreen';
import HomeScreen from '../screens/User/HomeScreen';
import BookReaderScreen from '../screens/User/BookReaderScreen';

// ✅ Prayer type
export type Prayer = {
  id: string;
  title: { en: string; pa: string };
  content: { en: string; pa: string };
  audioUrl?: string;
};

// ✅ Stack Param List (FINAL & SAFE)
export type AuthStackParamList = {
  Home: undefined;
  Login: undefined;
  Signup: undefined;

  BookReader: {
    bookUrl: string;
    bookId: string;
    bookTitle?: string; // ✅ optional (important)
  };

  PrayerScreen: undefined;
  PrayerDetail: { prayer: Prayer; language: 'en' | 'pa' };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Signup" component={SignupScreen} />
    <Stack.Screen name="BookReader" component={BookReaderScreen} />
    <Stack.Screen name="PrayerScreen" component={PrayerScreen} />
    <Stack.Screen name="PrayerDetail" component={PrayerDetailScreen} />
  </Stack.Navigator>
);

export default AuthStack;

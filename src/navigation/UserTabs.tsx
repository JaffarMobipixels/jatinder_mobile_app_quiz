// UserDrawer.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, Share, Linking } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Feather from 'react-native-vector-icons/Feather';

import HomeScreen from '../screens/User/HomeScreen';
import QuizScreen from '../screens/User/QuizScreen';
import SettingsScreen from '../screens/User/SettingsScreen';

import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

/* ================= BOTTOM TABS ================= */
function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBarStyle,
        tabBarItemStyle: styles.tabItemStyle,
        tabBarIcon: ({ color, size }) => {
          let iconName = 'home';
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Quiz') iconName = 'file-text';
          else if (route.name === 'Settings') iconName = 'settings';

          return <Feather name={iconName} size={22} color={color} />;
        },
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 6,
          color: '#fff',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Quiz" component={QuizScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

/* ================= CUSTOM DRAWER ================= */
function CustomDrawerContent({ navigation }: any) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const currentUser = auth().currentUser;
    if (!currentUser) return;

    setEmail(currentUser.email || '');

    const userRef = database().ref(`users/${currentUser.uid}`);
    const listener = userRef.on('value', snapshot => {
      const data = snapshot.val();
      if (data) {
        setFirstName(data.firstName || '');
        setLastName(data.lastName || '');
        setProfileImage(data.profileImage || '');
      }
    });

    return () => userRef.off('value', listener);
  }, []);

  /* ================= Drawer Item Press Handlers ================= */
  const handleFAQ = () => Linking.openURL('https://example.com/faq');
  const handlePrivacyPolicy = () => Linking.openURL('https://example.com/privacy');
  const handleFavourites = () => navigation.navigate('Settings'); // replace with your Favourites screen
  const handleRateUs = () => Linking.openURL('market://details?id=com.yourapp');
  const handleShareApp = async () => {
    try {
      await Share.share({ message: 'Check out this amazing app: https://example.com/app' });
    } catch (error) {
      console.log('Share error:', error);
    }
  };
  const handleFeedback = () => Linking.openURL('mailto:support@example.com');
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await auth().signOut();
              navigation.replace('LoginScreen'); // make sure LoginScreen exists
            } catch (error) {
              console.log('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <DrawerContentScrollView contentContainerStyle={styles.drawerContainer}>
      {/* PROFILE CARD */}
      <View style={styles.profileCard}>
        <Image
          source={
            profileImage ? { uri: profileImage } : require('../assets/dummy_profile.png')
          }
          style={styles.profileImage}
        />
        <View>
          <Text style={styles.userName}>
            {firstName && lastName ? `${firstName} ${lastName}` : 'User'}
          </Text>
          <Text style={styles.userEmail}>{email || 'user@email.com'}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>GENERAL</Text>
      <DrawerItem icon="help-circle" label="FAQ" onPress={handleFAQ} />
      <DrawerItem icon="shield" label="Privacy Policy" onPress={handlePrivacyPolicy} />
      <DrawerItem icon="heart" label="Favourites" onPress={handleFavourites} />
      <DrawerItem icon="star" label="Rate Us" onPress={handleRateUs} />
      <DrawerItem icon="share-2" label="Share App" onPress={handleShareApp} />
      <DrawerItem icon="message-circle" label="Feedback" onPress={handleFeedback} />

      <Text style={styles.sectionTitle}>ACCOUNT</Text>
      <DrawerItem icon="log-out" label="Logout" danger onPress={handleLogout} />
    </DrawerContentScrollView>
  );
}

/* ================= DRAWER ITEM ================= */
function DrawerItem({ icon, label, danger, onPress }: any) {
  return (
    <TouchableOpacity style={styles.drawerTile} activeOpacity={0.85} onPress={onPress}>
      <View
        style={[
          styles.iconBox,
          { backgroundColor: danger ? '#FEE2E2' : '#1E3A8A' },
        ]}
      >
        <Feather
          name={icon}
          size={18}
          color={danger ? '#EF4444' : '#fff'}
        />
      </View>
      <Text style={[styles.drawerLabel, danger && { color: '#EF4444' }]}>{label}</Text>
    </TouchableOpacity>
  );
}

/* ================= MAIN DRAWER ================= */
export default function UserDrawer() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerStyle: { width: 290, backgroundColor: '#0A1F44' },
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="Tabs" component={Tabs} />
    </Drawer.Navigator>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  /* ---------- Bottom Tab ---------- */
  tabBarStyle: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    height: 70,
    borderRadius: 30,
    backgroundColor: '#1E3A8A',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 15,
  },
  tabItemStyle: {
    marginTop: 6,
  },

  /* ---------- Drawer ---------- */
  drawerContainer: {
    paddingVertical: 20,
    backgroundColor: '#0A1F44',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#1E3A8A',
    marginBottom: 25,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 8,
  },
  profileImage: { width: 64, height: 64, borderRadius: 32, marginRight: 14 },
  userName: { fontSize: 17, fontWeight: '700', color: '#fff', textShadowColor: 'rgba(0,0,0,0.25)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
  userEmail: { fontSize: 13, color: '#D1D5DB', marginTop: 2 },
  sectionTitle: { marginLeft: 22, marginBottom: 10, marginTop: 10, fontSize: 12, fontWeight: '700', color: '#9CA3AF', letterSpacing: 1 },
  drawerTile: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 12, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#1E3A8A', shadowColor: '#000', shadowOpacity: 0.25, shadowOffset: { width: 0, height: 6 }, shadowRadius: 12, elevation: 8 },
  iconBox: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  drawerLabel: { fontSize: 15, fontWeight: '600', color: '#fff', textShadowColor: 'rgba(0,0,0,0.25)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 1 },
});

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Switch, Alert, ActivityIndicator, StatusBar, Platform
} from 'react-native';
// useSafeAreaInsets ko import kiya
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
 
const SettingsItem = ({ title, onPress, isToggle = false, isEnabled = false, toggleHandler }: any) => (
  <TouchableOpacity
    style={styles.settingsItem}
    onPress={isToggle ? toggleHandler : onPress}
    activeOpacity={0.7}
  >
    <Text style={styles.itemTitle}>{title}</Text>
    {isToggle ? (
      <Switch
        trackColor={{ false: "#6BCBFF", true: "#FFB347" }}
        thumbColor="#fff"
        onValueChange={toggleHandler}
        value={isEnabled}
      />
    ) : (
      <Text style={styles.arrow}>›</Text>
    )}
  </TouchableOpacity>
);
 
const SettingsScreen: React.FC<any> = ({ navigation }) => {
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets(); // Notch ki height nikalne ke liye
 
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [totalScore, setTotalScore] = useState(0);
 
  useEffect(() => {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      Alert.alert("Error", "User not logged in");
      navigation.goBack();
      return;
    }
 
    const userRef = database().ref(`users/${currentUser.uid}`);
    const listener = userRef.on('value', snapshot => {
      const data = snapshot.val();
      if (data) {
        setFirstName(data.firstName || '');
        setLastName(data.lastName || '');
        setProfileImage(data.profileImage || '');
        setTotalScore(data.totalScore || 0);
      }
      setLoading(false);
    });
 
    return () => userRef.off('value', listener);
  }, []);
 
  const handleToggleNotifications = () => {
    setPushNotificationsEnabled(prev => !prev);
  };
 
  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await auth().signOut();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });
            } catch (error) {
              Alert.alert('Error', 'Unable to sign out.');
            }
          }
        },
      ],
      { cancelable: true }
    );
  };
 
  if (loading) {
    return (
      <View style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }
 
  return (
    <View style={styles.safeArea}>
      {/* StatusBar consistency */}
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
 
      {/* ---------- RESPONSIVE HEADER ---------- */}
      <View style={[
        styles.header,
        {
          paddingTop: insets.top + 10, // Notch + thori extra space
          paddingBottom: 15
        }
      ]}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
 
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <LinearGradient colors={['#4D96FF', '#1E3CFF']} style={styles.profileCard}>
          <Image
            source={profileImage ? { uri: profileImage } : require('../../assets/dummy_profile.png')}
            style={styles.profileImage}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.welcomeText}>Hello</Text>
            <Text style={styles.userName}>
              {firstName && lastName ? `${firstName} ${lastName}` : 'User'}
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('UserProfileScreen')}>
            <Text style={styles.editProfile}>Edit</Text>
          </TouchableOpacity>
        </LinearGradient>
 
        {/* Settings List */}
        <View style={styles.settingsList}>
          <SettingsItem title="User Profile" onPress={() => navigation.navigate('UserProfileScreen')} />
          <SettingsItem title="Change Password" onPress={() => navigation.navigate('ChangePasswordScreen')} />
          <SettingsItem title="FAQs" onPress={() => navigation.navigate('FaqsScreen')} />
          <SettingsItem
            title="Push Notifications"
            isToggle
            isEnabled={pushNotificationsEnabled}
            toggleHandler={handleToggleNotifications}
          />
          <SettingsItem title="Sign Out" onPress={handleSignOut} />
        </View>
      </ScrollView>
    </View>
  );
};
 
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0A1F44' },
  scrollContainer: { paddingHorizontal: 20, paddingBottom: 40 },
 
  header: {
    paddingHorizontal: 20,
    backgroundColor: '#0A1F44', // Background color same as screen
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: {width:1, height:1},
    textShadowRadius:2
  },
 
  profileCard: {
    flexDirection: 'row',height:'20%',  alignItems: 'center', borderRadius: 20, marginBottom: 25,
  },
  profileImage: { width: 60, height: 60, borderRadius: 30, marginRight: 15, marginLeft:20, backgroundColor: '#E0E0E0' },
  welcomeText: { fontSize: 14, color: '#FFF8DC' },
  userName: { fontSize: 22, fontWeight: '700',  color: '#fff', textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: {width:1,height:1}, textShadowRadius:2 },
  editProfile: { color: '#fff',  marginRight:15, fontSize: 14, fontWeight: '700', textDecorationLine: 'underline' },
 
  settingsList: { backgroundColor: '#ffffff11', borderRadius: 20, paddingVertical: 10, marginBottom: 25 },
  settingsItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#ffffff22' },
  itemTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  arrow: { fontSize: 22, color: '#fff' },
});
 
export default SettingsScreen;
 
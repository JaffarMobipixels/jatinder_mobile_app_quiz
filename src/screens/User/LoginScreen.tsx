// LoginScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import LinearGradient from 'react-native-linear-gradient';

import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async () => {
    if (!email || !password) {
      return Alert.alert('Error', 'Fill all fields');
    }

    setLoading(true);

    try {
      // ✅ ADMIN LOGIN
      if (email === 'Admin1' && password === 'admin123123') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'AppAdmin' }],
        });
        return;
      }

      // ✅ FIREBASE LOGIN
      const credential = await auth().signInWithEmailAndPassword(
        email.trim(),
        password
      );

      const uid = credential.user.uid;

      // ✅ CHECK USER STATUS IN DB
      const snap = await database().ref(`users/${uid}`).once('value');
      const user = snap.val();

      if (!user) {
        await auth().signOut();
        return Alert.alert('Error', 'User not found in database.');
      }

      switch (user.status) {
        case 'approved':
          navigation.reset({
            index: 0,
            routes: [{ name: 'UserTabs' }],
          });
          break;

        case 'pending':
          await auth().signOut();
          Alert.alert('Pending', 'Your account is still pending approval.');
          break;

        case 'rejected':
          await auth().signOut();
          Alert.alert('Rejected', 'Your account has been rejected.');
          break;

        default:
          await auth().signOut();
          Alert.alert('Error', 'Your account status is invalid.');
          break;
      }
    } catch (e: any) {
      console.log('LOGIN ERROR:', e);

      // ✅ HANDLE FIREBASE LOGIN ERRORS
      switch (e.code) {
        case 'auth/invalid-email':
          Alert.alert('Error', 'Invalid email address.');
          break;
        case 'auth/user-not-found':
          Alert.alert('Error', 'No user found with this email.');
          break;
        case 'auth/wrong-password':
          Alert.alert('Error', 'Incorrect password.');
          break;
        case 'auth/user-disabled':
          Alert.alert('Error', 'This user account has been disabled.');
          break;
        default:
          Alert.alert('Error', e.message || 'Something went wrong.');
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#0A1F44', '#1E3A8A', '#0F172A']}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAwareScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.headerText}>Welcome Back</Text>
            <Text style={styles.subheaderText}>Login to continue</Text>
          </View>

          {/* CARD */}
          <View style={styles.card}>
            {/* TABS */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={activeTab === 'login' ? styles.activeTab : styles.inactiveTab}
                onPress={() => setActiveTab('login')}
              >
                <Text style={styles.activeTabText}>Log In</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.inactiveTab}
                onPress={() => navigation.navigate('SignUpScreens')}
              >
                <Text style={styles.inactiveTabText}>Create Account</Text>
              </TouchableOpacity>
            </View>

            {/* EMAIL */}
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={setEmail}
            />

            {/* PASSWORD */}
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              placeholderTextColor="#94A3B8"
              value={password}
              onChangeText={setPassword}
            />

            {/* LOGIN BUTTON */}
            <TouchableOpacity onPress={handleEmailLogin}>
              <LinearGradient
                colors={['#2563EB', '#3B82F6']}
                style={styles.loginButton}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.loginButtonText}>Login</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  header: {
    padding: 25,
    paddingTop: 80,
    paddingBottom: 40,
  },
  headerText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  subheaderText: {
    fontSize: 14,
    color: '#CBD5E1',
    marginTop: 5,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 30,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 15,
    padding: 5,
    marginBottom: 25,
  },
  activeTab: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 10,
    elevation: 2,
  },
  inactiveTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  activeTabText: {
    fontWeight: 'bold',
    color: '#0F172A',
  },
  inactiveTabText: {
    color: '#64748B',
  },
  input: {
    height: 55,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    color: '#0F172A',
  },
  loginButton: {
    height: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
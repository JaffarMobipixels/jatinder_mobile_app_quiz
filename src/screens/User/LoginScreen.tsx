import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import LinearGradient from 'react-native-linear-gradient';
import auth from '@react-native-firebase/auth';

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [emailLoading, setEmailLoading] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);

  const handleEmailLogin = async () => {
    if (!email || !password) {
      return Alert.alert('Error', 'Please fill all fields');
    }

    // 🔐 Admin Login
    if (email === 'Admin1' && password === 'admin123123') {
      navigation.reset({
        index: 0,
        routes: [{ name: 'AppAdmin' }],
      });
      return;
    }

    setEmailLoading(true);
    try {
      const userCredential = await auth().signInWithEmailAndPassword(
        email.trim(),
        password
      );

      // ✅ Wait for auth to actually update
      if (userCredential.user) {
        // Navigation after login
        navigation.reset({
          index: 0,
          routes: [{ name: 'UserTabs' }],
        });
      }
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePhoneLogin = async () => {
    if (!phone) return Alert.alert('Error', 'Please enter phone number');
    setPhoneLoading(true);
    try {
      const confirmation = await auth().signInWithPhoneNumber(phone);
      navigation.navigate('OtpVerification', { confirmation });
    } catch (error: any) {
      Alert.alert('OTP Failed', error.message);
    } finally {
      setPhoneLoading(false);
    }
  };

  const goToSignUp = () => {
    setActiveTab('signup');
    navigation.navigate('Signup');
  };

  return (
    <LinearGradient
      colors={['#0A1F44', '#1E3A8A', '#0F172A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAwareScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerText}>Welcome Back</Text>
            <Text style={styles.subheaderText}>
              Login to continue your quiz journey
            </Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            {/* Tabs */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={activeTab === 'login' ? styles.activeTab : styles.inactiveTab}
                onPress={() => setActiveTab('login')}
              >
                <Text style={activeTab === 'login' ? styles.activeTabText : styles.inactiveTabText}>
                  Log In
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={activeTab === 'signup' ? styles.activeTab : styles.inactiveTab}
                onPress={goToSignUp}
              >
                <Text style={activeTab === 'signup' ? styles.activeTabText : styles.inactiveTabText}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            {/* Email */}
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            {/* Password */}
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#94A3B8"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {/* Email Login */}
            <TouchableOpacity
              onPress={handleEmailLogin}
              disabled={emailLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#2563EB', '#3B82F6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.loginButton}
              >
                {emailLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.loginButtonText}>Login</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.orText}>OR</Text>

            {/* Phone */}
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            {/* Phone OTP */}
            <TouchableOpacity
              onPress={handlePhoneLogin}
              disabled={phoneLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#0EA5E9', '#38BDF8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.loginButton}
              >
                {phoneLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.loginButtonText}>Login with OTP</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1, paddingBottom: 40 },

  header: { padding: 25, paddingTop: 100 },
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
    padding: 20,
  },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 15,
    padding: 5,
    marginBottom: 20,
  },
  activeTab: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 10,
  },
  inactiveTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  activeTabText: { fontWeight: 'bold', color: '#0F172A' },
  inactiveTabText: { color: '#64748B' },

  input: {
    height: 50,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    color: '#0F172A',
  },
  loginButton: {
    width: 260,
    height: 56,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 10,
    alignSelf: 'center',
    marginBottom: 15,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  orText: {
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 16,
    color: '#64748B',
  },
});

export default LoginScreen;

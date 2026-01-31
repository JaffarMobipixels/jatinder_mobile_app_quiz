import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import LinearGradient from 'react-native-linear-gradient';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';

const SignUpScreen = ({ navigation }: any) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const goToLogin = () => navigation.navigate('Login');

  const handleRegister = async () => {
    if (!firstName || !phone || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);

 try {
  const userCredential = await auth().createUserWithEmailAndPassword(
    email.trim(),
    password
  );

  const userId = userCredential.user.uid;

  // Realtime DB me user data save karna
  await database().ref('users/' + userId).set({
    firstName,
    lastName,
    phone,
    email,
    role: 'user',
    language: 'en',
    createdAt: database.ServerValue.TIMESTAMP, // Firebase server timestamp
  });

  // Navigation after success
  navigation.reset({
    index: 0,
    routes: [{ name: 'UserTabs' }],
  });

} catch (error: any) {
  Alert.alert('Signup Failed', error.message);
} finally {
  setLoading(false); // spinner stop hoga chahe success ho ya error
}

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
            <Text style={styles.headerText}>Create Your Account</Text>
            <Text style={styles.subheaderText}>
              Join and start learning with fun quizzes
            </Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            {/* Tabs */}
            <View style={styles.tabContainer}>
              <TouchableOpacity style={styles.inactiveTab} onPress={goToLogin}>
                <Text style={styles.inactiveTabText}>Log In</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.activeTab}>
                <Text style={styles.activeTabText}>Sign Up</Text>
              </TouchableOpacity>
            </View>

            {/* Names */}
            <View style={styles.nameRow}>
              <TextInput
                style={[styles.input, styles.nameInput]}
                placeholder="First Name"
                placeholderTextColor="#94A3B8"
                value={firstName}
                onChangeText={setFirstName}
              />
              <TextInput
                style={[styles.input, styles.nameInput]}
                placeholder="Last Name"
                placeholderTextColor="#94A3B8"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>

            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#94A3B8"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#94A3B8"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            {/* Register Button */}
            <TouchableOpacity onPress={handleRegister} disabled={loading}>
              <LinearGradient
                colors={['#2563EB', '#3B82F6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.registerButton}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.registerButtonText}>Create Account</Text>
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

  nameRow: { flexDirection: 'row', gap: 10 },
  nameInput: { flex: 1 },

  input: {
    height: 50,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    color: '#0F172A',
  },

  registerButton: {
  width: 260,          // consistent width
  height: 56,          // standard button height
  borderRadius: 40,

  justifyContent: 'center', // 👈 vertical center
  alignItems: 'center',     // 👈 horizontal center
  alignContent: 'center',
  alignSelf : 'center',
  shadowColor: '#3B82F6',
  shadowOpacity: 0.6,
  shadowOffset: { width: 0, height: 8 },
  shadowRadius: 12,
  elevation: 10,

  marginBottom: 15,
},

registerButtonText: {
  color: '#FFFFFF',
  fontSize: 18,
  fontWeight: '700',
},

});

export default SignUpScreen;

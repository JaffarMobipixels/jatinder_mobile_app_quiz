// SignUpScreen.tsx

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

  const [role, setRole] = useState<'teacher' | 'student' | 'guest'>('student');

  // =============================
  // REGISTER USER
  // =============================
  const handleRegister = async () => {
    if (!firstName || !phone || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // ✅ Firebase Auth Create
      const userCredential = await auth().createUserWithEmailAndPassword(
        email.trim(),
        password
      );

      const userId = userCredential.user.uid;

      const status = role === 'guest' ? 'approved' : 'pending';

      // ✅ Save User Data
      await database()
        .ref('users/' + userId)
        .set({
          firstName,
          lastName,
          phone,
          email,
          role,
          status,
          createdAt: database.ServerValue.TIMESTAMP,
        });

      // =====================
      // NAVIGATION
      // =====================
      if (status === 'pending') {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'PendingApprovalScreen',
              params: { userId },
            },
          ],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'UserTabs' }],
        });
      }
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // UI
  // =============================
  return (
    <LinearGradient colors={['#0A1F44', '#1E3A8A', '#0F172A']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAwareScrollView contentContainerStyle={{ padding: 20 }}>
          <Text style={styles.title}>Account</Text>

          {/* Role Selection */}
          <View style={styles.roleContainer}>
            {['teacher', 'student', 'guest'].map(r => (
              <TouchableOpacity
                key={r}
                onPress={() => setRole(r as 'teacher' | 'student' | 'guest')}
                style={[
                  styles.roleButton,
                  { backgroundColor: role === r ? '#2563EB' : '#E5E7EB' },
                ]}
              >
                <Text
                  style={{
                    color: role === r ? '#fff' : '#000',
                    fontWeight: role === r ? 'bold' : '500',
                    textTransform: 'capitalize',
                  }}
                >
                  {r}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* User Inputs */}
          <TextInput
            style={styles.input}
            placeholder="First Name"
            value={firstName}
            placeholderTextColor="#999999"
            onChangeText={setFirstName}
          />

          <TextInput
            style={styles.input}
            placeholder="Last Name"
            placeholderTextColor="#999999"
            value={lastName}
            onChangeText={setLastName}
          />

          <TextInput
            style={styles.input}
            placeholder="Phone"
            placeholderTextColor="#999999"
            value={phone}
            onChangeText={setPhone}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            autoCapitalize="none"
            value={email}
            placeholderTextColor="#999999"
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            placeholderTextColor="#999999"
            value={password}
            onChangeText={setPassword}
          />

          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            secureTextEntry
            placeholderTextColor="#999999"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          {/* Signup Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  roleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'space-around',
  },
  roleButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  input: {
    backgroundColor: '#fff',
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#2563EB',
    height: 55,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  btnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
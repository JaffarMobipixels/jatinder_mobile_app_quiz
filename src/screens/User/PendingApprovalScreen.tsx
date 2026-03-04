import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';

const PendingApprovalScreen = ({ route, navigation }: any) => {
  // Try to get userId from params or fallback to current logged-in user
  const userId = route?.params?.userId || auth().currentUser?.uid;

  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      Alert.alert('Error', 'User ID not found. Please login again.');
      navigation.reset({ index: 0, routes: [{ name: 'AuthStack' }] });
      return;
    }

    const ref = database().ref('users/' + userId + '/status');
    const listener = ref.on('value', snapshot => {
      if (snapshot.exists()) {
        const dbStatus = snapshot.val();
        setStatus(dbStatus);
        setLoading(false);

        if (dbStatus === 'approved') {
          navigation.reset({ index: 0, routes: [{ name: 'UserTabs' }] });
        } else if (dbStatus === 'rejected') {
          setLoading(false);
        }
      } else {
        setStatus('pending');
        setLoading(false);
      }
    });

    return () => ref.off('value', listener);
  }, [userId, navigation]);

  const handleSwitchAccount = async () => {
    try {
      await auth().signOut();
      navigation.reset({ index: 0, routes: [{ name: 'AuthStack' }] });
    } catch (err) {
      Alert.alert('Error', 'Failed to log out. Try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ marginTop: 10 }}>Checking approval status...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        {status === 'rejected' ? (
          <>
            <Text style={styles.text}>Admin ne aapka request reject kar diya hai.</Text>

            <TouchableOpacity
              onPress={handleSwitchAccount}
              style={[styles.button, { marginTop: 15 }]}
            >
              <Text style={styles.buttonText}>Login with another account</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.text}>Aapka account approval ke liye pending hai.</Text>

            <TouchableOpacity
              onPress={handleSwitchAccount}
              style={[styles.button, { marginTop: 15 }]}
            >
              <Text style={styles.buttonText}>Switch Account / Login</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  text: { fontSize: 18, textAlign: 'center', marginBottom: 20 },
  button: { padding: 12, backgroundColor: '#2563EB', borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: '600' },
});

export default PendingApprovalScreen;
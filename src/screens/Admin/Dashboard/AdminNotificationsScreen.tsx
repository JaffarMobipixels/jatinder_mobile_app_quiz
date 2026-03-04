import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import database from '@react-native-firebase/database';

interface Notification {
  id: string;
  userId: string;
  name: string;
  role: string;
  type: string;
  createdAt: number;
}

const AdminNotificationsScreen = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = database().ref('users'); // read from 'users'

    const listener = ref.on('value', snapshot => {
      const notifs: Notification[] = [];

      if (snapshot.exists()) {
        const data = snapshot.val();
        Object.keys(data).forEach(key => {
          const notif = data[key];

          // Only include users with pending status
          if (notif.status === 'pending') {
            notifs.push({
              id: key,
              userId: key,
              name: notif.firstName + ' ' + (notif.lastName || ''),
              role: notif.role,
              type: 'new_user_request', // for UI purposes
              createdAt: Number(notif.createdAt) || 0,
            });
          }
        });

        // Sort descending by createdAt
        notifs.sort((a, b) => b.createdAt - a.createdAt);
      }

      setNotifications(notifs);
      setLoading(false);
    });

    return () => ref.off('value', listener);
  }, []);

  const handleAction = (notif: Notification, action: 'approved' | 'rejected') => {
    Alert.alert(
      `Confirm ${action}`,
      `Are you sure you want to ${action} this request?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              // Update user status
              await database().ref('users/' + notif.userId).update({ status: action });

              // Remove from local list immediately
              setNotifications(prev => prev.filter(n => n.id !== notif.id));

              Alert.alert('Success', `User has been ${action}`);
            } catch (error) {
              Alert.alert('Error', 'Action failed');
              console.log('Error handling notification:', error);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ marginTop: 10 }}>Loading notifications...</Text>
      </View>
    );
  }

  if (notifications.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No new requests</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.role}>{item.role.toUpperCase()}</Text>
            <View style={styles.buttons}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#16A34A' }]}
                onPress={() => handleAction(item, 'approved')}
              >
                <Text style={styles.buttonText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#DC2626' }]}
                onPress={() => handleAction(item, 'rejected')}
              >
                <Text style={styles.buttonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { padding: 16, backgroundColor: '#F1F5F9', marginBottom: 12, borderRadius: 12 },
  name: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  role: { fontSize: 14, color: '#64748B', marginBottom: 8 },
  buttons: { flexDirection: 'row', justifyContent: 'space-between' },
  button: { flex: 1, padding: 10, borderRadius: 8, marginHorizontal: 4, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
});

export default AdminNotificationsScreen;
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import database from '@react-native-firebase/database';

const { width } = Dimensions.get('window');
const CARD_SIZE = width / 2 - 26;

interface TabItem {
  id: string;
  title: string;
  iconName: string;
  iconType: 'MCI' | 'Feather';
  navigateTo: string;
  colors: string[];
  order: number;
}

const HomeScreenAdmin = ({ navigation }: any) => {
  const [tabs, setTabs] = useState<TabItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0); // For red dot

  /* ================= FIREBASE: TABS ================= */
  useEffect(() => {
    const ref = database().ref('/adminTabs').orderByChild('order');

    const onValueChange = ref.on(
      'value',
      snapshot => {
        const fetchedTabs: TabItem[] = [];
        if (snapshot.exists()) {
          const data = snapshot.val();
          Object.keys(data).forEach(key => {
            fetchedTabs.push({
              id: key,
              ...data[key],
              colors: data[key].colors || ['#3A86FF', '#8E2DE2'],
            });
          });
        }
        setTabs(fetchedTabs);
        setLoading(false);
      },
      error => {
        console.error(error);
        setLoading(false);
        Alert.alert('Error', 'Database se data load nahi ho saka');
      },
    );

    return () => ref.off('value', onValueChange);
  }, []);

  /* ================= FIREBASE: NOTIFICATIONS RED DOT ================= */
  useEffect(() => {
    const notifRef = database().ref('/adminNotifications');

    const onNotifChange = notifRef.on('value', snapshot => {
      let count = 0;
      if (snapshot.exists()) {
        const data = snapshot.val();
        Object.keys(data).forEach(key => {
          // Show red dot for pending notifications
          if (data[key].status === 'pending') count += 1;
        });
      }
      setUnreadCount(count);
    });

    return () => notifRef.off('value', onNotifChange);
  }, []);

  /* ================= DELETE TAB ================= */
  const deleteTab = (id: string) => {
    Alert.alert(
      'Delete Tab',
      '',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await database().ref(`/adminTabs/${id}`).remove();
            } catch (e) {
              Alert.alert('Error', 'Tab delete nahi ho saka');
            }
          },
        },
      ],
    );
  };

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'LoginScreen' }],
            });
          },
        },
      ],
    );
  };

  /* ================= TAB CARD ================= */
  const TabCard = ({ item }: { item: TabItem }) => (
    <View style={styles.cardWrapper}>
      {/* DELETE ICON */}
      <TouchableOpacity
        style={styles.deleteIcon}
        onPress={() => deleteTab(item.id)}
        activeOpacity={0.7}
      >
        <FeatherIcon name="trash-2" size={18} color="#fff" />
      </TouchableOpacity>

      {/* MAIN CARD */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation.navigate(item.navigateTo)}
      >
        <LinearGradient colors={item.colors} style={styles.card}>
          <View style={styles.iconWrapper}>
            {item.iconType === 'MCI' ? (
              <MCI name={item.iconName} size={40} color="#fff" />
            ) : (
              <FeatherIcon name={item.iconName} size={40} color="#fff" />
            )}
          </View>
          <Text style={styles.cardTitle}>{item.title}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <LinearGradient colors={['#A1C4FD', '#C2E9FB']} style={{ flex: 1 }}>
        {/* HEADER */}
        <View style={styles.toolbar}>
          {/* LOGOUT ICON */}
          <TouchableOpacity style={styles.logoutIcon} onPress={handleLogout}>
            <FeatherIcon name="log-out" size={26} color="#fff" />
          </TouchableOpacity>

          {/* TITLE */}
          <Text style={styles.toolbarTitle}>Admin Dashboard</Text>

          {/* ADD TAB ICON */}
          <TouchableOpacity
            style={styles.addIcon}
            onPress={() => navigation.navigate('AddTabScreen')}
          >
            <FeatherIcon name="plus-circle" size={28} color="#fff" />
          </TouchableOpacity>

          {/* NOTIFICATIONS ICON */}
          <TouchableOpacity
            style={styles.notificationIcon}
            onPress={() => navigation.navigate('AdminNotificationsScreen')}
          >
            <FeatherIcon name="bell" size={28} color="#fff" />
            {unreadCount > 0 && <View style={styles.redDot} />}
          </TouchableOpacity>
        </View>

        {/* BODY */}
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#3A86FF" />
            <Text style={{ marginTop: 10, color: '#3A86FF' }}>
              Loading from Database...
            </Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.grid}>
              {tabs.length > 0 ? (
                tabs.map(tab => <TabCard key={tab.id} item={tab} />)
              ) : (
                <Text style={styles.emptyText}>
                  Database mein koi tabs nahi hain
                </Text>
              )}
            </View>
          </ScrollView>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

export default HomeScreenAdmin;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#3A86FF' },

  toolbar: {
    height: 70,
    backgroundColor: '#3A86FF',
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },

  toolbarTitle: {
    color: '#fff',
    fontSize: 22,
    right: 10,
    fontWeight: '900',
  },

  logoutIcon: {
    position: 'absolute',
    left: 20,
    bottom: 18,
  },

  addIcon: {
    position: 'absolute',
    right: 15,
    bottom: 18,
  },

  notificationIcon: {
    position: 'absolute',
    right: 55,
    bottom: 18,
  },

  redDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'red',
    borderWidth: 1,
    borderColor: '#fff',
  },

  container: {
    padding: 16,
    paddingTop: 20,
    paddingBottom: 30,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  cardWrapper: {
    width: CARD_SIZE,
    marginBottom: 20,
  },

  deleteIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 20,
    padding: 6,
  },

  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 14,
    borderWidth: 3,
    borderColor: '#fff',
  },

  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 3,
    borderColor: '#fff',
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
  },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyText: {
    width: '100%',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
});
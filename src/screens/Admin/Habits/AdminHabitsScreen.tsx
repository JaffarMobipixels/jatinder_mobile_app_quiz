import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import database from '@react-native-firebase/database';
import Svg, { Line, Circle, Text as SvgText } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const AdminHabitsScreen = ({ navigation }: any) => {
  const [users, setUsers] = useState<string[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [userHabits, setUserHabits] = useState<any[]>([]);
  const [loadingHabits, setLoadingHabits] = useState(false);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snapshot = await database().ref('/habits').once('value');
        const data = snapshot.val() || {};
        setUsers(Object.keys(data));
      } catch (error) {
        console.log('Error fetching users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  // Fetch selected user habits and open modal
  const openUserHabits = async (email: string) => {
    setSelectedEmail(email);
    setModalVisible(true);
    setLoadingHabits(true);

    try {
      const snapshot = await database().ref(`/habits/${email}`).once('value');
      const data = snapshot.val() || {};
      setUserHabits(Object.values(data));
    } catch (error) {
      console.log('Error fetching habits:', error);
      setUserHabits([]);
    } finally {
      setLoadingHabits(false);
    }
  };

  const getYValue = (result: string) => {
    if (result === 'yes') return 50;
    if (result === 'unclear') return 100;
    return 150;
  };

  const getLineColor = (result: string) => {
    if (result === 'yes') return '#4ade80'; // green
    if (result === 'unclear') return '#facc15'; // yellow
    return '#f87171'; // red
  };

  return (
    <LinearGradient
      colors={['#0f2027', '#203a43', '#2c5364']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />

      {/* HEADER WITH BACK BUTTON */}
      <LinearGradient
        colors={['#FF6B6B', '#FFD93D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🌟 Manage Habits 🌟</Text>
        <View style={{ width: 30 }} /> {/* placeholder to center title */}
      </LinearGradient>

      {/* USERS LIST */}
      <ScrollView contentContainerStyle={styles.content}>
        {loadingUsers ? (
          <ActivityIndicator size="large" color="#FFD93D" />
        ) : users.length === 0 ? (
          <Text style={styles.placeholder}>No users found</Text>
        ) : (
          users.map(email => (
            <TouchableOpacity
              key={email}
              style={styles.userCard}
              onPress={() => openUserHabits(email)}
            >
              <Text style={styles.userText}>{email.replace(/_/g, '.')}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* USER HABITS MODAL */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedEmail?.replace(/_/g, '.')}
            </Text>
            <ScrollView>
              {loadingHabits ? (
                <ActivityIndicator size="large" color="#FFD93D" />
              ) : userHabits.length === 0 ? (
                <Text style={styles.placeholder}>No habits found</Text>
              ) : (
                userHabits.map((habit, idx) => (
                  <LinearGradient
                    key={idx}
                    colors={['#3a3d40', '#181818']}
                    style={styles.habitCard}
                  >
                    <Text style={styles.habitName}>{habit.name}</Text>

                    {/* Custom Line Chart */}
                    <Svg width={width * 0.8} height={200} style={{ marginTop: 10 }}>
                      {/* Horizontal reference lines */}
                      <Line x1="0" y1="50" x2={width * 0.8} y2="50" stroke="#555" strokeWidth="1" />
                      <Line x1="0" y1="100" x2={width * 0.8} y2="100" stroke="#555" strokeWidth="1" />
                      <Line x1="0" y1="150" x2={width * 0.8} y2="150" stroke="#555" strokeWidth="1" />

                      {/* Connect lines */}
                      {habit.days.map((day: any, i: number) => {
                        if (i === 0) return null;
                        const prev = habit.days[i - 1];
                        const x1 = ((i - 1) / (habit.days.length - 1)) * (width * 0.8);
                        const y1 = getYValue(prev.result);
                        const x2 = (i / (habit.days.length - 1)) * (width * 0.8);
                        const y2 = getYValue(day.result);
                        return (
                          <Line
                            key={i}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke={getLineColor(day.result)}
                            strokeWidth="3"
                          />
                        );
                      })}

                      {/* Circles */}
                      {habit.days.map((day: any, i: number) => {
                        const x = (i / (habit.days.length - 1)) * (width * 0.8);
                        const y = getYValue(day.result);
                        return (
                          <Circle
                            key={i}
                            cx={x}
                            cy={y}
                            r="6"
                            fill={getLineColor(day.result)}
                            stroke="#fff"
                            strokeWidth="1.5"
                          />
                        );
                      })}

                      {/* Day labels */}
                      {habit.days.map((day: any, i: number) => {
                        const x = (i / (habit.days.length - 1)) * (width * 0.8);
                        return (
                          <SvgText
                            key={i}
                            x={x}
                            y={190}
                            fontSize="12"
                            fill="#FFD93D"
                            textAnchor="middle"
                          >
                            {day.day}
                          </SvgText>
                        );
                      })}
                    </Svg>
                  </LinearGradient>
                ))
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

export default AdminHabitsScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 110,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: 18,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 10,
  },
  backBtn: {
    width: 30,
  },
  backText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
    textAlign: 'center',
    flex: 1,
  },
  content: { flexGrow: 1, padding: 20 },
  placeholder: { marginTop: 40, fontSize: 15, color: '#bbb', textAlign: 'center' },
  userCard: {
    backgroundColor: '#1E1E2F',
    padding: 16,
    borderRadius: 16,
    marginVertical: 8,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
  },
  userText: { fontSize: 16, fontWeight: '700', color: '#FFD93D' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    height: height * 0.8,
    backgroundColor: '#1A1A2E',
    borderRadius: 20,
    padding: 15,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 10, textAlign: 'center', color: '#FFD93D' },
  habitCard: {
    backgroundColor: '#2C2C54',
    padding: 12,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  habitName: { fontSize: 16, fontWeight: '700', marginBottom: 5, color: '#fff' },
  closeBtn: {
    backgroundColor: '#FF6B6B',
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
    elevation: 6,
  },
  closeText: { color: '#fff', textAlign: 'center', fontWeight: '700', fontSize: 16 },
});

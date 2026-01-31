// HabitsScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import database from '@react-native-firebase/database';

const weekData = [
  { day: 'Mon', date: '30 Dec' },
  { day: 'Tue', date: '31 Dec' },
  { day: 'Wed', date: '1 Jan' },
  { day: 'Thu', date: '2 Jan' },
  { day: 'Fri', date: '3 Jan' },
  { day: 'Sat', date: '4 Jan' },
  { day: 'Sun', date: '5 Jan' },
];

const userEmailKey = 'qas12@gmail_com';

const HabitsScreen = () => {
  const navigation = useNavigation<any>();
  const [habits, setHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = database().ref(`habits/${userEmailKey}`);
    const listener = ref.on('value', snapshot => {
      const data = snapshot.val();
      if (data) {
        const habitArray = Object.values(data).map((item: any) => ({
          id: item.id,
          name: item.name,
          question: item.question,
          createdAt: item.createdAt,
          days: item.days || [],
        }));
        setHabits(habitArray.reverse());
      } else {
        setHabits([]);
      }
      setLoading(false);
    });

    return () => ref.off('value', listener);
  }, []);

  const getTasksForDay = (dayShort: string) => {
    return habits.filter(habit =>
      habit.days.some((d: any) => d.day === dayShort)
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Screen Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <FeatherIcon name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Habits Tracker</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CreateHabit')}>
          <FeatherIcon name="plus" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Week Row */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.weekRow}>
        {weekData.map((item, index) => {
          const tasks = getTasksForDay(item.day);
          return (
            <View key={index} style={styles.weekCard}>
              <Text style={styles.weekDay}>{item.day}</Text>
              <Text style={styles.weekDate}>{item.date}</Text>

              {loading ? (
                <ActivityIndicator size="small" color="#2563EB" style={{ marginTop: 10 }} />
              ) : tasks.length === 0 ? (
                <Text style={styles.noTaskText}>No tasks</Text>
              ) : (
                tasks.map(task => (
                  <TouchableOpacity
                    key={task.id}
                    style={styles.taskCard}
                    onPress={() => navigation.navigate('HabitDetail', { habitId: task.id })}
                  >
                    <Text style={styles.taskName}>{task.name}</Text>
                    <Text style={styles.taskQuestion}>{task.question}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HabitsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1F44' },

  header: {
    height: 90,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: 18,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    backgroundColor: '#1E3A8A',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
    marginBottom: 20,
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  weekRow: { paddingVertical: 18, paddingHorizontal: 14 },
  weekCard: {
    minWidth: 140,
    height: 400,
    marginRight: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#1E40AF',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  weekDay: { fontSize: 14, fontWeight: '700', color: '#fff' },
  weekDate: { marginTop: 4, fontSize: 12, color: '#D1D5DB' },
  noTaskText: { fontSize: 12, color: '#B0C4DE', marginTop: 6, fontStyle: 'italic' },

  taskCard: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    padding: 6,
    marginTop: 6,
  },
  taskName: { fontSize: 14, fontWeight: '700', color: '#fff' },
  taskQuestion: { fontSize: 12, color: '#D1D5DB', marginTop: 2 },
});

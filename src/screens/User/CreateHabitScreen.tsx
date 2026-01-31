// CreateHabitScreen.tsx (3D Modern with Back Button)
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import notifee, { AndroidImportance, TriggerType, EventType } from '@notifee/react-native';
import database from '@react-native-firebase/database';
import { getAuth } from '@react-native-firebase/auth';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getNextDayDate = (day: string, time: Date) => {
  const dayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const now = new Date();
  const result = new Date(now);
  result.setHours(time.getHours());
  result.setMinutes(time.getMinutes());
  result.setSeconds(0);
  const targetDay = dayMap[day];
  let diff = (targetDay - now.getDay() + 7) % 7;
  if (diff === 0 && result <= now) diff = 7;
  result.setDate(now.getDate() + diff);
  return result;
};

const CreateHabitScreen = () => {
  const navigation = useNavigation<any>();
  const [habitName, setHabitName] = useState('');
  const [habitQuestion, setHabitQuestion] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [dayTimes, setDayTimes] = useState<Record<string, Date>>({});
  const [showPickerDay, setShowPickerDay] = useState<string | null>(null);

  useEffect(() => {
    const requestPermission = async () => {
      if (Platform.OS === 'android') {
        await notifee.requestPermission();
        await notifee.createChannel({
          id: 'default',
          name: 'Habit Reminders',
          importance: AndroidImportance.HIGH,
        });
      }
    };
    requestPermission();

    const unsubscribe = notifee.onForegroundEvent(async ({ type, detail }) => {
      if (type === EventType.ACTION_PRESS) {
        const habitId = detail.notification?.data?.habitId;
        const dayIndex = detail.notification?.data?.dayIndex;
        const actionId = detail.pressAction?.id;
        if (habitId && dayIndex != null && actionId === 'YES') {
          await database().ref(`/habits/${habitId}/days/${dayIndex}`).update({ result: 'yes' });
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(prev => prev.filter(d => d !== day));
      const updated = { ...dayTimes };
      delete updated[day];
      setDayTimes(updated);
    } else {
      setSelectedDays(prev => [...prev, day]);
      setShowPickerDay(day);
    }
  };

  const scheduleNotification = async (habitId: string, dayIndex: number, title: string, body: string, date: Date) => {
    await notifee.createTriggerNotification(
      {
        title,
        body,
        android: {
          channelId: 'default',
          pressAction: { id: 'DEFAULT' },
          actions: [{ title: 'Yes', pressAction: { id: 'YES' } }],
        },
        data: { habitId, dayIndex: String(dayIndex) },
      },
      { type: TriggerType.TIMESTAMP, timestamp: date.getTime() }
    );

    setTimeout(async () => {
      const snapshot = await database().ref(`/habits/${habitId}/days/${dayIndex}`).once('value');
      const dayData = snapshot.val();
      if (dayData?.result === 'unclear') {
        await database().ref(`/habits/${habitId}/days/${dayIndex}`).update({ result: 'no' });
      }
    }, date.getTime() - new Date().getTime() + 1000);
  };

  const saveHabit = async () => {
    if (!habitName || selectedDays.length === 0) {
      Alert.alert('Error', 'Please enter habit name and select days');
      return;
    }

    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'User not logged in');
        return;
      }

      const userEmail = currentUser.email?.replace(/\./g, '_');
      const habitRef = database().ref(`/habits/${userEmail}`).push(); 
      const habitId = habitRef.key;

      const daysData = selectedDays.map((day, index) => ({
        day,
        time: dayTimes[day] ? dayTimes[day].toISOString() : null,
        result: 'unclear',
      }));

      const habitData = {
        id: habitId,
        name: habitName,
        question: habitQuestion || 'Habit Reminder',
        days: daysData,
        createdAt: new Date().toISOString(),
      };

      await habitRef.set(habitData);

      for (let i = 0; i < selectedDays.length; i++) {
        const day = selectedDays[i];
        const time = dayTimes[day];
        if (!time) continue;
        const triggerDate = getNextDayDate(day, time);
        await scheduleNotification(habitId!, i, habitName, habitQuestion || 'Habit Reminder', triggerDate);
      }

      Alert.alert('Success ✅', 'Habit saved and notifications scheduled!');
      setHabitName('');
      setHabitQuestion('');
      setSelectedDays([]);
      setDayTimes({});
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to save habit. Please try again.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <FeatherIcon name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Habit</Text>
        <View style={{ width: 40 }} /> {/* placeholder for spacing */}
      </View>

      {/* Inputs */}
      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Habit Name"
          value={habitName}
          onChangeText={setHabitName}
        />
        <TextInput
          style={styles.input}
          placeholder="Habit Question (optional)"
          value={habitQuestion}
          onChangeText={setHabitQuestion}
        />
      </View>

      {/* Day Selector */}
      <Text style={styles.subHeading}>Select Days</Text>
      <View style={styles.daysRow}>
        {DAYS.map(day => (
          <TouchableOpacity
            key={day}
            style={[styles.dayButton, selectedDays.includes(day) && styles.daySelected]}
            onPress={() => toggleDay(day)}
          >
            <Text style={[styles.dayText, selectedDays.includes(day) && styles.dayTextSelected]}>{day}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {showPickerDay && (
        <DateTimePicker
          value={dayTimes[showPickerDay] || new Date()}
          mode="time"
          is24Hour={false}
          display="spinner"
          onChange={(_, selectedDate) => {
            if (selectedDate) setDayTimes(prev => ({ ...prev, [showPickerDay]: selectedDate }));
            setShowPickerDay(null);
          }}
        />
      )}

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={saveHabit}>
        <Text style={styles.saveText}>Save Habit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CreateHabitScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F0F4FF',
    flexGrow: 1,
  },

  /* Header */
  header: {
    marginBottom: 20,
    marginTop: 30,
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#667EEA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    backgroundColor: '#F9F9F9',
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },

  subHeading: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },

  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 30,
  },

  dayButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#AAA',
    margin: 4,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  daySelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  dayTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },

  saveButton: {
    backgroundColor: '#1F3C88',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

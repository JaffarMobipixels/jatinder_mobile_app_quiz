import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';

type Task = {
  id: string;
  title: string;
  typeCheckbox?: boolean;
  typeNumber?: boolean;
  checkbox?: boolean;
  number?: string;
};

const TaskDetailScreen = () => {
  const route = useRoute<any>();
  const { day, week } = route.params;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth().currentUser;
    if (!user?.email) return;

    const emailKey = user.email.replace(/\./g, '_').replace(/@/g, '_');
    const ref = database().ref(`userSelectedQuestions/${emailKey}`);
    const listener = ref.on('value', (snap) => {
      const selectedQuestions = snap.val() || {};
      const taskList: Task[] = Object.keys(selectedQuestions).map((key) => ({
        id: selectedQuestions[key].id,
        title: selectedQuestions[key].title,
        typeCheckbox: selectedQuestions[key].typeCheckbox ?? false,
        typeNumber: selectedQuestions[key].typeNumber ?? false,
        checkbox: selectedQuestions[key].checkbox ?? false,
        number: selectedQuestions[key].number ?? '',
      }));
      setTasks(taskList);
      setLoading(false);
    });

    return () => ref.off('value', listener);
  }, [day, week]);

  const toggleCheckbox = (task: Task) => {
    const user = auth().currentUser;
    if (!user?.email) return;
    const emailKey = user.email.replace(/\./g, '_').replace(/@/g, '_');
    const taskRef = database().ref(`userSelectedQuestions/${emailKey}/${task.id}`);
    const newValue = !task.checkbox;

    taskRef.update({ checkbox: newValue });
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, checkbox: newValue } : t))
    );
  };

  const updateNumber = (task: Task, value: string) => {
    const user = auth().currentUser;
    if (!user?.email) return;
    const emailKey = user.email.replace(/\./g, '_').replace(/@/g, '_');

    database().ref(`userSelectedQuestions/${emailKey}/${task.id}`).update({ number: value });
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, number: value } : t))
    );
  };

  const handleSubmit = () => {
    Alert.alert('Success', 'Tasks submitted successfully!');
    // You can do additional submit logic here if needed
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 50 }} />
      </SafeAreaView>
    );
  }

  if (tasks.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.noTasksText}>No tasks for today!</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Daily Routine - {day}</Text>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {tasks.map((task, index) => (
          <View key={task.id} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.number}>{index + 1}.</Text>

              {task.typeCheckbox && (
                <TouchableOpacity
                  onPress={() => toggleCheckbox(task)}
                  style={[styles.checkboxContainer, task.checkbox && styles.checkboxChecked]}
                >
                  {task.checkbox && <View style={styles.innerTick} />}
                </TouchableOpacity>
              )}

              <Text style={styles.name}>{task.title}</Text>

              {task.typeNumber && (
                <TextInput
                  placeholder="Time / Count"
                  style={styles.input}
                  keyboardType="numeric"
                  value={task.number}
                  onChangeText={(text) => updateNumber(task, text.replace(/[^0-9]/g, ''))}
                />
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitText}>Submit</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default TaskDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1F44', padding: 16 },
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  noTasksText: { color: '#fff', fontSize: 16, textAlign: 'center', marginTop: 50 },
  card: { backgroundColor: '#1E40AF', padding: 14, borderRadius: 12, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center' },

  number: { color: '#FFD700', fontWeight: '700', fontSize: 16, marginRight: 10 },
  name: { color: '#fff', fontWeight: '700', fontSize: 16, flex: 1, marginRight: 10 },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 8, width: 80, textAlign: 'center' },

  checkboxContainer: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: '#1E40AF',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 5,
  },
  checkboxChecked: {
    backgroundColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 6,
  },
  innerTick: {
    width: 10,
    height: 5,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#0A1F44',
    transform: [{ rotate: '-45deg' }],
  },

  submitBtn: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#FFD700',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitText: { color: '#0A1F44', fontWeight: 'bold', fontSize: 16 },
});
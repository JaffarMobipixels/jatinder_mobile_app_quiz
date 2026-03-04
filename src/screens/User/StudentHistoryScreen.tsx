import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';

const weekDays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const StudentHistoryScreen = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [studentHistory, setStudentHistory] = useState<{ [week: string]: any }>({});

  const teacherUID = auth().currentUser?.uid;

  useEffect(() => {
    if (!teacherUID) return;

    const ref = database().ref(`teacherNotifications/${teacherUID}`);
    ref.once('value').then(snapshot => {
      const data = snapshot.val() || {};
      const studentMap: { [uid: string]: string } = {};
      Object.values(data).forEach((notif: any) => {
        if (notif.studentUID && notif.studentName) {
          studentMap[notif.studentUID] = notif.studentName;
        }
      });
      const studentArray = Object.keys(studentMap).map(uid => ({ uid, name: studentMap[uid] }));
      setStudents(studentArray);
      setLoading(false);
    });
  }, [teacherUID]);

  const fetchStudentHistory = (studentUID: string) => {
    setSelectedStudent(students.find(s => s.uid === studentUID));
    setLoading(true);

    database()
      .ref(`users/${studentUID}/email`)
      .once('value')
      .then(emailSnap => {
        const email = emailSnap.val() as string;
        const emailKey = email.replace(/\./g, '_').replace(/@/g, '_');

        database()
          .ref(`habitsProgress/${emailKey}`)
          .once('value')
          .then(snap => {
            const data = snap.val() || {};

            // Only pick week-based keys (week1, week2, etc.)
            const weekData: { [week: string]: any } = {};
            Object.keys(data).forEach(key => {
              if (key.toLowerCase().startsWith('week')) {
                weekData[key] = data[key];
              }
            });

            setStudentHistory(weekData);
            setLoading(false);
          });
      });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 50 }} />
      </SafeAreaView>
    );
  }

  if (!selectedStudent) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.title}>Students History</Text>
        <FlatList
          data={students}
          keyExtractor={item => item.uid}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.studentCard} onPress={() => fetchStudentHistory(item.uid)}>
              <Text style={styles.studentName}>{item.name}</Text>
              <FeatherIcon name="chevron-right" size={20} color="#0A1F44" />
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No students found</Text>}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSelectedStudent(null)}>
          <FeatherIcon name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{selectedStudent.name} - History</Text>
      </View>

      <ScrollView style={{ padding: 12 }}>
        {Object.keys(studentHistory).map(weekKey => (
          <View key={weekKey} style={{ marginBottom: 16 }}>
            <Text style={styles.weekTitle}>{weekKey.toUpperCase()}</Text>

            {weekDays.map(day => {
              const dayData = studentHistory[weekKey]?.[day];
              if (!dayData) return null;

              return (
                <View key={day} style={{ marginBottom: 12 }}>
                  <Text style={styles.dayTitle}>{day}</Text>
                  {Object.keys(dayData).map(taskName => (
                    <Text key={taskName} style={styles.taskValue}>
                      {taskName}: {dayData[taskName].toString()}
                    </Text>
                  ))}
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default StudentHistoryScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E5E7EB' },
  title: { fontSize: 2, fontWeight: '700', margin: 16, color: '#0A1F44' },
  studentCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, marginHorizontal: 16, marginVertical: 6, backgroundColor: '#fff', borderRadius: 8, elevation: 3 },
  studentName: { fontSize: 16, fontWeight: '700', color: '#0A1F44' },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2563EB', padding: 14 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginLeft: 12 },
  weekTitle: { fontSize: 18, fontWeight: '700', color: '#2563EB', marginBottom: 6 },
  dayTitle: { fontSize: 16, fontWeight: '700', color: '#0A1F44', marginTop: 4 },
  taskValue: { fontSize: 14, color: '#0A1F44', marginLeft: 12, marginTop: 2 },
});
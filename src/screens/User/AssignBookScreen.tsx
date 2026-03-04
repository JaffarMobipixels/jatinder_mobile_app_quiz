import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';

type BookType = {
  id: string;
  title: string;
  author: string;
  pdfUrl: string;
  totalPages?: number;
};

type StudentType = {
  uid: string;
  name: string;
  email: string;
  progress?: number; // Add progress field
};

const AssignBookScreen = ({ route }: any) => {
  const { book } = route.params as { book: BookType };

  const [students, setStudents] = useState<StudentType[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [timeGiven, setTimeGiven] = useState('');
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  /* ================= LOAD STUDENTS & PROGRESS ================= */
  useEffect(() => {
    const loadStudents = async () => {
      try {
        // Load approved students
        const snap = await database()
          .ref('users')
          .orderByChild('status')
          .equalTo('approved')
          .once('value');

        const data = snap.val() || {};

        const list: StudentType[] = Object.keys(data)
          .filter(uid => data[uid].role === 'student')
          .map(uid => ({
            uid,
            name: `${data[uid].firstName || ''} ${data[uid].lastName || ''}`.trim() || 'No Name',
            email: data[uid].email || '',
            progress: 0, // default 0
          }));

        // Fetch progress for this book
        const progressSnap = await database()
          .ref('StudentProgressTab')
          .once('value');

        const progressData = progressSnap.val() || {};

        // Map progress to students
        const studentsWithProgress = list.map(student => {
          const prog = progressData[student.uid]?.[book.id]?.progress ?? 0;
          return { ...student, progress: prog };
        });

        setStudents(studentsWithProgress);
      } catch (e) {
        console.log(e);
        Alert.alert('Error loading students');
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, [book.id]);

  /* ================= SELECT STUDENT ================= */
  const toggleStudent = (uid: string) => {
    setSelectedStudents(prev =>
      prev.includes(uid)
        ? prev.filter(id => id !== uid)
        : [...prev, uid]
    );
  };

  /* ================= CALIFORNIA TIME ================= */
  const getCaliforniaTime = () => {
    return new Date().toLocaleString('en-US', {
      timeZone: 'America/Los_Angeles',
    });
  };

  /* ================= ASSIGN BOOK ================= */
  const assignBook = async () => {
    if (selectedStudents.length === 0) return Alert.alert('Select students');
    if (!timeGiven) return Alert.alert('Enter reading time');

    setAssigning(true);

    try {
      const teacherId = auth().currentUser?.uid || 'teacher';

      for (const uid of selectedStudents) {
        const student = students.find(s => s.uid === uid);

        await database()
          .ref(`StudentProgressTab/${uid}/${book.id}`)
          .set({
            studentName: student?.name,
            bookName: book.title,
            totalPages: book.totalPages || 50,
            timeGivenCalifornia: timeGiven,
            dateGiven: getCaliforniaTime(),
            progress: student?.progress ?? 0, // keep existing progress if any
            readingInTime: false,
            assignedBy: teacherId,
          });
      }

      Alert.alert('Success', 'Book Assigned Successfully');

      // Update students locally to reflect assigned status
      setStudents(prev =>
        prev.map(s =>
          selectedStudents.includes(s.uid)
            ? { ...s } // progress is already there
            : s
        )
      );

      setSelectedStudents([]);
      setTimeGiven('');
    } catch (e) {
      console.log(e);
      Alert.alert('Assignment failed');
    }

    setAssigning(false);
  };

  if (loading)
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Assign "{book.title}"</Text>

      {/* TIME INPUT */}
      <TextInput
        placeholder="Reading Time (minutes)"
        placeholderTextColor="#aaa"
        value={timeGiven}
        onChangeText={setTimeGiven}
        keyboardType="numeric"
        style={styles.input}
      />

      <FlatList
        data={students}
        keyExtractor={item => item.uid}
        renderItem={({ item }) => {
          const selected = selectedStudents.includes(item.uid);
          const assigned = item.progress !== undefined;

          return (
            <TouchableOpacity
              onPress={() => toggleStudent(item.uid)}
              style={[
                styles.studentCard,
                assigned && styles.assignedCard, // highlight assigned
                selected && styles.selectedCard, // selected override
              ]}
            >
              <Text style={styles.studentName}>{item.name}</Text>
              <Text style={styles.studentEmail}>{item.email}</Text>
              <Text style={styles.progressText}>
                {item.progress ?? 0}% read
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* ASSIGN BUTTON */}
      <TouchableOpacity
        style={styles.assignBtn}
        onPress={assignBook}
        disabled={assigning}
      >
        <Text style={styles.assignText}>Assign To Selected Students</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AssignBookScreen;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#0A1F44',
  },

  header: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 15,
  },

  input: {
    backgroundColor: '#1E3A8A',
    padding: 12,
    borderRadius: 12,
    color: '#fff',
    marginBottom: 15,
  },

  studentCard: {
    backgroundColor: '#1E3A8A',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },

  assignedCard: {
    backgroundColor: '#14386B', // dark highlight for assigned
  },

  selectedCard: {
    backgroundColor: '#FFD700',
  },

  studentName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },

  studentEmail: {
    fontSize: 12,
    color: '#ddd',
  },

  progressText: {
    fontSize: 12,
    color: '#FFD700',
    marginTop: 4,
  },

  assignBtn: {
    backgroundColor: '#FFD700',
    padding: 15,
    borderRadius: 14,
    marginTop: 10,
    alignItems: 'center',
  },

  assignText: {
    fontWeight: '700',
    color: '#000',
  },

  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
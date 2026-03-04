import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';

export default function TeacherStudentRecordsScreen() {
  const navigation = useNavigation<any>();
  const user = auth().currentUser;
  const teacherId = user?.uid || '';

  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const snap = await database().ref('studentsTeachers').once('value');
        const data = snap.val() || {};
        const assignedStudents: any[] = [];

        for (const studentId in data) {
          if (data[studentId][teacherId]) {
            const studentSnap = await database().ref(`users/${studentId}`).once('value');
            const studentData = studentSnap.val();
            if (studentData) {
              assignedStudents.push({ id: studentId, ...studentData });
            }
          }
        }
        setStudents(assignedStudents);
        setLoading(false);
      } catch (e) {
        console.log(e);
        setLoading(false);
      }
    };
    loadStudents();
  }, [teacherId]);

  const viewStudentRecords = (student: any) => {
    navigation.navigate('StudentPreviousRecordsScreen', { 
      studentId: student.id, 
      studentName: `${student.firstName} ${student.lastName}` 
    });
  };

  if (loading) {
    return (
      <View style={[styles.safeArea, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* --- CUSTOM HEADER --- */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerBtn} 
          onPress={() => navigation.goBack()}
        >
          {/* Custom Back Arrow using Text */}
          <Text style={{ color: '#fff', fontSize: 24, fontWeight: '300' }}>{"<"}</Text>
        </TouchableOpacity>
        
        <Text style={styles.logo}>Students List</Text>
        
        <View style={{ width: 45 }} /> 
      </View>

      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>Manage Records</Text>
        <Text style={styles.cardSubtitle}>Select a student to view history</Text>
      </View>

      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.cardWrapper} 
            onPress={() => viewStudentRecords(item)}
            activeOpacity={0.8}
          >
            <View style={styles.featureCard}>
              {/* Profile Initial Circle */}
              <View style={styles.cardIconContainer}>
                <Text style={styles.initialText}>
                  {item.firstName?.charAt(0).toUpperCase()}
                </Text>
              </View>

              {/* Info Section */}
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>{item.firstName} {item.lastName}</Text>
                <Text style={styles.cardSubtitle}>View Academic Progress</Text>
              </View>

              {/* Custom Forward Arrow */}
              <View style={styles.arrowContainer}>
                <Text style={{ color: '#ffffff50', fontSize: 20 }}>{">"}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={[styles.cardSubtitle, { textAlign: 'center', marginTop: 40 }]}>
            No students found.
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0A1F44' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerBtn: { 
    width: 45,
    height: 45,
    backgroundColor: '#ffffff10',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: { fontSize: 20, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
  
  welcomeContainer: { paddingHorizontal: 24, marginBottom: 20, marginTop: 10 },
  welcomeText: { fontSize: 28, fontWeight: '800', color: '#fff' },

  cardWrapper: { marginBottom: 15 },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#ffffff10',
    backgroundColor: '#ffffff05',
  },
  cardIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  initialText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  cardTextContainer: { flex: 1, marginLeft: 15 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },
  cardSubtitle: { fontSize: 13, color: '#ffffff70', marginTop: 2 },
  arrowContainer: { marginLeft: 10 },
});
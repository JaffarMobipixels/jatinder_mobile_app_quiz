import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import database from '@react-native-firebase/database';
import { RouteProp } from '@react-navigation/native';
import { AdminStackParamList } from '../Dashboard/AppAdmin';
import LinearGradient from 'react-native-linear-gradient';

type Props = {
  route: RouteProp<AdminStackParamList, 'TeacherBookProgress'>;
};

type StudentProgress = {
  id: string;
  name: string;
  progress: number; // 0 to 100
  currentPage: number;
  totalPages: number;
};

const TeacherBookProgressScreen: React.FC<Props> = ({ route }) => {
  const { ebookId } = route.params;
  const [studentsProgress, setStudentsProgress] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      setLoading(true);
      try {
        // 1️⃣ Get all users progress
        const progressSnapshot = await database().ref('UserProgress').once('value');
        const progressData = progressSnapshot.val() || {};

        const progressArray: StudentProgress[] = [];

        for (let userId of Object.keys(progressData)) {
          const userAssignments = progressData[userId];

          for (let assignmentId of Object.keys(userAssignments)) {
            const assignment = userAssignments[assignmentId];

            // Check if this is the ebook we want
            if (assignmentId !== ebookId) continue;

            // 2️⃣ Get user info from users node
            const userSnapshot = await database().ref(`users/${userId}`).once('value');
            const userData = userSnapshot.val();

            if (!userData) continue;

            const userName = userData.firstName || 'Unnamed Student';

            progressArray.push({
              id: userId,
              name: userName,
              progress: assignment.progressPercent || 0,
              currentPage: assignment.currentPage || 0,
              totalPages: assignment.totalPages || 0,
            });
          }
        }

        setStudentsProgress(progressArray);
      } catch (err) {
        console.log('Error fetching progress:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [ebookId]);

  const renderStudent = ({ item }: { item: StudentProgress }) => {
    const progressPercentage = Math.min(item.progress, 100);

    return (
      <View style={styles.studentCard}>
        <Text style={styles.studentName}>{item.name}</Text>
        <Text style={styles.progressText}>
          Page {item.currentPage} / {item.totalPages}
        </Text>

        {/* Progress Bar */}
        <View style={styles.progressBarBackground}>
          <LinearGradient
            colors={['#FFA726', '#FFB347']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressBarFill, { width: `${progressPercentage}%` }]}
          />
        </View>
        <Text style={styles.progressText}>{progressPercentage}% completed</Text>
      </View>
    );
  };

  if (loading)
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#FFB347" />
      </View>
    );

  if (studentsProgress.length === 0)
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.noDataText}>No students assigned to this book.</Text>
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={studentsProgress}
        renderItem={renderStudent}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default TeacherBookProgressScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#555',
  },
  studentCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  progressBarBackground: {
    width: '100%',
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
    marginVertical: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 12,
    color: '#555',
    fontWeight: '600',
  },
});
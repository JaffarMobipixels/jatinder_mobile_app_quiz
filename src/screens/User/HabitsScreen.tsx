// HabitsScreen.tsx
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  Modal,
  FlatList,
  TextInput,
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';

const getTodayKey = () => new Date().toISOString().split('T')[0];

export default function HabitsScreen() {
  const navigation = useNavigation<any>();

  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<any>({});
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);

  const [teachers, setTeachers] = useState<any[]>([]);
  const [teacherModal, setTeacherModal] = useState(false);
  const [userRole, setUserRole] = useState<'student' | 'teacher' | null>(null);

  const todayKey = getTodayKey();
  const user = auth().currentUser;
  const userKey = user?.uid || '';
  const timerRef = useRef<number | null>(null);

  /* ================= LOAD USER ROLE ================= */
  useEffect(() => {
    if (!userKey) return;
    database()
      .ref(`users/${userKey}`)
      .once('value')
      .then((snap) => {
        const data = snap.val() || {};
        setUserRole(data.role);
      });
  }, [userKey]);

  /* ================= LOAD QUESTIONS ================= */
  useEffect(() => {
    database()
      .ref('habitsProgress/questions')
      .once('value')
      .then((snap) => {
        const data = snap.val() || {};
        setQuestions(
          Object.keys(data).map((k) => ({
            id: k,
            ...data[k],
          }))
        );
      });
  }, []);

  /* ================= LOAD TODAY ANSWERS ================= */
  useEffect(() => {
    if (!userKey) return;
    const ref = database().ref(`habitsProgress/${userKey}/${todayKey}`);
    ref.on('value', (snap) => {
      const data = snap.val() || {};
      setAnswers(data.answers || {});
      setPoints(data.points || 0);
      setLocked(data.locked || false);
      setLoading(false);
    });
    return () => ref.off();
  }, [userKey]);

  /* ================= LOAD TEACHERS ================= */
  useEffect(() => {
    if (userRole !== 'student') return;
    database()
      .ref('users')
      .once('value')
      .then((snap) => {
        const data = snap.val() || {};
        const list = Object.keys(data)
          .map((k) => ({ id: k, ...data[k] }))
          .filter((u) => u.role === 'teacher');
        setTeachers(list);
      });
  }, [userRole]);

  /* ================= DAILY LOCK & AUTO-RESET ================= */
  useEffect(() => {
    if (!userKey || userRole !== 'student') return;

    const habitsRef = database().ref(`habitsProgress/${userKey}`);
    const previousRecordsRef = database().ref(`previousRecords/${userKey}`);
    const teacherNotifRef = database().ref('notifications');

    const lockToday = async () => {
      const snap = await habitsRef.child(todayKey).once('value');
      const data = snap.val() || {};

      if (!data.locked) {
        const recordData = {
          answers: data.answers || {},
          points: data.points || 0,
          locked: true,
          savedAt: new Date().toISOString(),
        };

        // Save today's data
        await habitsRef.child(todayKey).update(recordData);
        await previousRecordsRef.child(todayKey).set(recordData);

        // Notify assigned teachers
        const teacherSnap = await database().ref(`studentsTeachers/${userKey}`).once('value');
        const assignedTeachers = teacherSnap.val() || {};

        for (const teacherId in assignedTeachers) {
          await database().ref(`teacherRecords/${teacherId}/${userKey}/${todayKey}`).set(recordData);
          await teacherNotifRef.child(teacherId).transaction((curr) => (curr || 0) + 1);
        }

        setLocked(true);
        setAnswers({});
        setPoints(0);
      }
    };

    const now = new Date();
    const nextMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0, 0, 0, 0
    );
    const msUntilMidnight = nextMidnight.getTime() - now.getTime();

    const timeoutId = setTimeout(() => {
      lockToday();
      setInterval(lockToday, 24 * 60 * 60 * 1000); // Repeat daily
    }, msUntilMidnight);

    // Clear last month
    const currentMonth = now.getMonth();
    habitsRef.once('value').then((snap) => {
      const allDays = snap.val() || {};
      Object.keys(allDays).forEach((dayKey) => {
        const [year, month] = dayKey.split('-').map(Number);
        if (month - 1 !== currentMonth) {
          habitsRef.child(dayKey).remove();
          previousRecordsRef.child(dayKey).remove();
        }
      });
    });

    return () => clearTimeout(timeoutId);
  }, [userKey, userRole]);

  /* ================= LOCK & SAVE ANSWERS ================= */
  const lockTodayAnswers = async () => {
    if (locked) return;

    try {
      const todayRef = database().ref(`habitsProgress/${userKey}/${todayKey}`);
      const snap = await todayRef.once('value');
      const data = snap.val() || { answers };

      const recordData = { ...data, locked: true, savedAt: new Date().toISOString() };
      await database().ref(`previousRecords/${userKey}/${todayKey}`).set(recordData);

      const teacherSnap = await database().ref(`studentsTeachers/${userKey}`).once('value');
      const assignedTeachers = teacherSnap.val() || {};
      for (const teacherId in assignedTeachers) {
        await database().ref(`teacherRecords/${teacherId}/${userKey}/${todayKey}`).set(recordData);
        await database().ref(`notifications/${teacherId}`).transaction((curr) => (curr || 0) + 1);
      }

      await todayRef.update({ locked: true });
      setLocked(true);
      Alert.alert('Submitted ✅', 'Your daily tasks are locked for today.');

    } catch (e) {
      console.log(e);
    }
  };

  /* ================= ADD TEACHER ================= */
  const addTeacher = (teacherId: string) => {
    database().ref(`studentsTeachers/${userKey}/${teacherId}`).set(true);
    Alert.alert('Teacher Added ✅');
    setTeacherModal(false);
    const notifRef = database().ref(`notifications/${teacherId}`);
    notifRef.transaction((curr) => (curr || 0) + 1);
  };

  /* ================= CALCULATE POINTS ================= */
  const calculatePoints = (updatedAnswers: any) => {
    let answeredCount = 0;
    Object.values(updatedAnswers).forEach((ans: any) => {
      if (ans?.done === true || (ans?.value && ans.value !== '')) {
        answeredCount++;
      }
    });
    const totalPoints = answeredCount * 10;
    setPoints(totalPoints);
    database()
      .ref(`habitsProgress/${userKey}/${todayKey}`)
      .update({ points: totalPoints });
  };

  /* ================= UPDATED INPUT LOGIC ================= */
  const updateAnswer = (taskId: string, field: 'done' | 'value', val: any) => {
    if (locked) {
      Alert.alert('Locked', 'Answers Locked');
      return;
    }

    const updated = {
      ...answers,
      [taskId]: {
        ...(answers[taskId] || {}),
        [field]: val,
      },
    };

    setAnswers(updated);
    database()
      .ref(`habitsProgress/${userKey}/${todayKey}`)
      .update({ answers: updated, locked: false });

    calculatePoints(updated);
  };

  if (loading) return (
    <View style={[styles.container, { justifyContent: 'center' }]}>
      <ActivityIndicator size="large" color="#3B82F6" />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* --- HEADER --- */}
      <View style={[styles.headerContainer, userRole === 'teacher' && styles.teacherHeader]}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButtonPill} onPress={() => navigation.goBack()}>
            <FeatherIcon name="chevron-left" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.roleTag}>{userRole === 'student' ? 'STUDENT PORTAL' : 'TEACHER DASHBOARD'}</Text>
            <Text style={styles.mainTitle}>Daily Questions</Text>
          </View>
          {userRole === 'student' && (
            <View style={{ flexDirection: 'row' }}>
              <View style={[styles.timerBadge, { marginLeft: 8 }]}>
                <FeatherIcon name="award" size={14} color="#FFD700" />
                <Text style={styles.timerText}>{points} pts</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.actionRow}>
          {userRole === 'student' ? (
            <>
              <TouchableOpacity style={styles.pillBtn} onPress={() => setTeacherModal(true)}>
                <FeatherIcon name="user-plus" size={16} color="#fff" />
                <Text style={styles.pillBtnText}>Add Teacher</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.pillBtn, { backgroundColor: '#ffffff20' }]}
                onPress={() => navigation.navigate('PreviousRecordScreen')}
              >
                <FeatherIcon name="list" size={16} color="#fff" />
                <Text style={styles.pillBtnText}>History</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.teacherActionBtn}
              onPress={() => navigation.navigate('TeacherStudentRecordsScreen')}
            >
              <FeatherIcon name="users" size={18} color="#0A1F44" />
              <Text style={styles.teacherActionBtnText}>View Students Records</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* --- CONTENT --- */}
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {locked && (
          <View style={styles.lockBanner}>
            <FeatherIcon name="lock" size={16} color="#FFD700" />
            <Text style={styles.lockText}>Tasks are locked for today</Text>
          </View>
        )}

        <View style={{ paddingHorizontal: 20, marginTop: 15 }}>
          {questions.map((q, i) => {
            const answerObj = answers[q.id] || {};
            const done = answerObj.done || false;
            const value = answerObj.value || '';

            return (
              <View key={q.id} style={[styles.taskCard, done && styles.taskDone]}>
                <View style={styles.taskHeaderRow}>
                  <View style={styles.taskIndexContainer}>
                    <Text style={styles.taskIndex}>{i + 1}</Text>
                  </View>
                  <Text style={[styles.taskTitle, done && styles.taskTitleDone]}>{q.title}</Text>
                  
                  {q.hasCheckbox && (
                    <TouchableOpacity 
                      onPress={() => updateAnswer(q.id, 'done', !done)}
                      style={[styles.checkCircle, done && styles.checkCircleDone]}
                    >
                      {done && <FeatherIcon name="check" size={16} color="#fff" />}
                    </TouchableOpacity>
                  )}
                </View>

                {q.hasNumberField && (
                  <View style={styles.numberInputContainer}>
                    <Text style={styles.numberLabel}>{q.numberLabel}</Text>
                    <TextInput
                      style={styles.numberInput}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#ffffff40"
                      value={String(value)}
                      editable={!locked}
                      onChangeText={(val) => updateAnswer(q.id, 'value', val)}
                    />
                  </View>
                )}
              </View>
            );
          })}

          {/* --- SUBMIT BUTTON --- */}
          {!locked && (
            <TouchableOpacity style={styles.submitBtn} onPress={lockTodayAnswers}>
              <Text style={styles.submitBtnText}>Submit</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* --- TEACHER MODAL --- */}
      <Modal visible={teacherModal} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Your Teacher</Text>
            <TouchableOpacity onPress={() => setTeacherModal(false)} style={styles.closeBtn}>
              <FeatherIcon name="x" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={teachers}
            contentContainerStyle={{ padding: 20 }}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.modalTeacherCard} onPress={() => addTeacher(item.id)}>
                <View style={styles.teacherAvatar}>
                  <Text style={{color: '#fff', fontWeight: 'bold'}}>{item.firstName?.charAt(0)}</Text>
                </View>
                <Text style={styles.modalTeacherName}>{item.firstName} {item.lastName}</Text>
                <FeatherIcon name="plus" size={20} color="#3B82F6" />
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1F44' },
  headerContainer: { paddingTop: 15, paddingBottom: 25, paddingHorizontal: 20, backgroundColor: '#1E40AF', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 10 },
  teacherHeader: { backgroundColor: '#10B981' },
  headerTop: { flexDirection: 'row', alignItems: 'center' },
  backButtonPill: { backgroundColor: '#ffffff20', padding: 8, borderRadius: 12 },
  roleTag: { color: '#ffffff90', fontSize: 10, fontWeight: 'bold', letterSpacing: 1.5, marginBottom: 2 },
  mainTitle: { color: '#fff', fontSize: 24, fontWeight: '900' },
  timerBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#00000040', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  timerText: { color: '#FFD700', marginLeft: 6, fontWeight: 'bold', fontSize: 14 },
  actionRow: { flexDirection: 'row', marginTop: 20, paddingLeft: 5 },
  pillBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#3B82F6', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 15, marginRight: 10 },
  pillBtnText: { color: '#fff', marginLeft: 8, fontWeight: '700', fontSize: 13 },
  teacherActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', paddingVertical: 14, borderRadius: 15 },
  teacherActionBtnText: { color: '#0A1F44', fontWeight: '800', marginLeft: 10 },
  lockBanner: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFD70020', padding: 10, marginTop: 15, marginHorizontal: 20, borderRadius: 12, borderWidth: 1, borderColor: '#FFD70040' },
  lockText: { color: '#FFD700', marginLeft: 10, fontWeight: '600', fontSize: 14 },
  taskCard: { backgroundColor: '#ffffff10', padding: 18, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: '#ffffff10' },
  taskDone: { backgroundColor: '#22C55E20', borderColor: '#22C55E50' },
  taskHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  taskIndexContainer: { width: 30, height: 30, borderRadius: 10, backgroundColor: '#ffffff15', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  taskIndex: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  taskTitle: { flex: 1, color: '#fff', fontSize: 16, fontWeight: '600' },
  taskTitleDone: { color: '#ffffff80' },
  checkCircle: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: '#ffffff40', justifyContent: 'center', alignItems: 'center' },
  checkCircleDone: { backgroundColor: '#22C55E', borderColor: '#22C55E' },
  numberInputContainer: { marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#ffffff10', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  numberLabel: { color: '#ffffff70', fontSize: 13, fontWeight: '500' },
  numberInput: {
    backgroundColor: '#ffffff10',
    color: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 8,
    width: 80,
    textAlign: 'center',
  },
  submitBtn: {
    backgroundColor: '#3B82F6',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0A1F44',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#1E40AF',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 5,
  },
  modalTeacherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff10',
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
  },
  teacherAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  modalTeacherName: {
    flex: 1,
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
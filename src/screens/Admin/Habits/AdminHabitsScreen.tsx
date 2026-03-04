import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  StatusBar,
} from 'react-native';
import database from '@react-native-firebase/database';
import FeatherIcon from 'react-native-vector-icons/Feather';

const AdminHabitsScreen = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  
  const [addQuestionModal, setAddQuestionModal] = useState(false);
  const [newQuestionTitle, setNewQuestionTitle] = useState('');
  
  // Client ki requirement ke mutabiq types
  const [addCheckbox, setAddCheckbox] = useState(true);
  const [addNumber, setAddNumber] = useState(false);
  const [numberPlaceholder, setNumberPlaceholder] = useState('How many mins/times?');

  /* ================= FETCH QUESTIONS ================= */
  const fetchQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const snap = await database().ref('habitsProgress/questions').once('value');
      const data = snap.val() || {};
      const list = Object.keys(data).map((key) => ({ key, ...data[key] }));
      setQuestions(list);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  /* ================= ADD QUESTION LOGIC ================= */
  const handleAddQuestion = async () => {
    if (!newQuestionTitle.trim()) return Alert.alert('Error', 'Enter question title');

    try {
      // 1. Create Question Object
      const questionObj = {
        title: newQuestionTitle.trim(),
        hasCheckbox: addCheckbox, // Yes/No box show hoga ya nahi
        hasNumberField: addNumber, // Mins/Times field show hogi ya nahi
        numberLabel: numberPlaceholder.trim() || 'Amount', // Label: e.g. "How many mins"
        createdAt: new Date().toISOString(),
      };

      // 2. Push to Global Questions Node
      await database().ref('habitsProgress/questions').push(questionObj);

      Alert.alert('Success', 'Question added for all students!');
      fetchQuestions();
      
      // Reset Modal
      setAddQuestionModal(false);
      setNewQuestionTitle('');
      setAddCheckbox(true);
      setAddNumber(false);
      setNumberPlaceholder('How many mins/times?');
    } catch (error) {
      Alert.alert('Error', 'Failed to add question');
    }
  };

  /* ================= DELETE QUESTION ================= */
  const handleDeleteQuestion = (key: string) => {
    Alert.alert('Delete', 'Delete this from everyone?', [
      { text: 'No' },
      { text: 'Yes, Delete', style: 'destructive', onPress: () => {
        database().ref(`habitsProgress/questions/${key}`).remove();
        fetchQuestions();
      }}
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Habit Configurator</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setAddQuestionModal(true)}>
          <FeatherIcon name="plus" size={20} color="#fff" />
          <Text style={styles.addBtnText}>New Habit</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Current Daily Routine</Text>
      
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {loadingQuestions ? (
          <ActivityIndicator size="large" color="#3B82F6" />
        ) : (
          questions.map((q) => (
            <View key={q.key} style={styles.questionCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.qTitle}>{q.title}</Text>
                <View style={styles.tagRow}>
                  {q.hasCheckbox && <View style={styles.tag}><Text style={styles.tagText}>Checkbox</Text></View>}
                  {q.hasNumberField && <View style={[styles.tag, {backgroundColor: '#EEF2FF'}]}><Text style={[styles.tagText, {color: '#4338CA'}]}>{q.numberLabel}</Text></View>}
                </View>
              </View>
              <TouchableOpacity onPress={() => handleDeleteQuestion(q.key)}>
                <FeatherIcon name="trash-2" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* --- ADD HABIT MODAL --- */}
      <Modal visible={addQuestionModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeading}>Add New Habit</Text>
            
            <Text style={styles.label}>Question / Habit Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Amrit Vela Nitnem"
              value={newQuestionTitle}
              onChangeText={setNewQuestionTitle}
            />

            <Text style={styles.label}>Input Type (Select both if needed)</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity 
                style={[styles.toggleBtn, addCheckbox && styles.toggleActive]}
                onPress={() => setAddCheckbox(!addCheckbox)}
              >
                <FeatherIcon name={addCheckbox ? "check-square" : "square"} size={18} color={addCheckbox ? "#fff" : "#6B7280"} />
                <Text style={[styles.toggleText, addCheckbox && {color: '#fff'}]}>Checkbox (Done?)</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.toggleBtn, addNumber && styles.toggleActive]}
                onPress={() => setAddNumber(!addNumber)}
              >
                <FeatherIcon name={addNumber ? "hash" : "hash"} size={18} color={addNumber ? "#fff" : "#6B7280"} />
                <Text style={[styles.toggleText, addNumber && {color: '#fff'}]}>Number Field</Text>
              </TouchableOpacity>
            </View>

            {addNumber && (
              <>
                <Text style={styles.label}>Number Field Label</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. How many mins?"
                  value={numberPlaceholder}
                  onChangeText={setNumberPlaceholder}
                />
              </>
            )}

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setAddQuestionModal(false)}>
                <Text style={{ color: '#4B5563', fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAddQuestion}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save Habit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AdminHabitsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#111827' },
  addBtn: { flexDirection: 'row', backgroundColor: '#2563EB', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: 'bold', marginLeft: 5 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#6B7280', marginLeft: 20, marginTop: 20, letterSpacing: 1 },
  questionCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 18, borderRadius: 16, marginBottom: 12, alignItems: 'center', elevation: 2 },
  qTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  tagRow: { flexDirection: 'row', marginTop: 8 },
  tag: { backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginRight: 8 },
  tagText: { fontSize: 10, color: '#065F46', fontWeight: 'bold' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', width: '90%', borderRadius: 24, padding: 25 },
  modalHeading: { fontSize: 20, fontWeight: '900', color: '#111827', marginBottom: 20 },
  label: { fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 8, marginTop: 15 },
  input: { backgroundColor: '#F3F4F6', borderRadius: 12, padding: 15, fontSize: 15, color: '#000' },
  toggleRow: { flexDirection: 'column', gap: 10 },
  toggleBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', padding: 12, borderRadius: 12, gap: 10 },
  toggleActive: { backgroundColor: '#2563EB' },
  toggleText: { fontSize: 14, fontWeight: '600', color: '#4B5563' },
  btnRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 30 },
  cancelBtn: { padding: 15 },
  saveBtn: { backgroundColor: '#2563EB', paddingHorizontal: 25, paddingVertical: 15, borderRadius: 12 },
});
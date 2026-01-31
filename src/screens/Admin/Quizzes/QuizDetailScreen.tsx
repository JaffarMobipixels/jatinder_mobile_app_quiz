import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import database from '@react-native-firebase/database';
 
const QuizDetailScreen = ({ route }: any) => {
  const { quiz, categoryId, quizId } = route.params; // ensure quizId pass ho
 
  const [question, setQuestion] = useState(quiz.question);
  const [options, setOptions] = useState(quiz.options);
  const [correctOption, setCorrectOption] = useState(quiz.correctOption);
 
  const [modalVisible, setModalVisible] = useState(false);
  const [editField, setEditField] = useState('');
  const [tempValue, setTempValue] = useState('');
 
  const handleEdit = (field: string) => {
    if (field === 'question') setTempValue(question);
    else if (field === 'correctOption') setTempValue(correctOption);
    else setTempValue(options[field]);
 
    setEditField(field);
    setModalVisible(true);
  };
 
  const saveEdit = async () => {
    if (!categoryId || !quizId) {
      Alert.alert('Error', 'Category or Quiz ID missing');
      return;
    }
 
    let updatedQuestion = question;
    let updatedOptions = { ...options };
    let updatedCorrect = correctOption;
 
    if (editField === 'question') updatedQuestion = tempValue;
    else if (editField === 'correctOption') updatedCorrect = tempValue;
    else updatedOptions[editField] = tempValue;
 
    try {
      await database()
        .ref(`Quiz/${categoryId}/quizzes/${quizId}`)
        .update({
          question: updatedQuestion,
          options: updatedOptions,
          correctOption: updatedCorrect,
        });
 
      setQuestion(updatedQuestion);
      setOptions(updatedOptions);
      setCorrectOption(updatedCorrect);
 
      setModalVisible(false);
      Alert.alert('Success', 'Quiz updated successfully');
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to update quiz');
    }
  };
 
  return (
    <ScrollView style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.question}>{question}</Text>
        <TouchableOpacity onPress={() => handleEdit('question')}>
          <Text style={styles.editIcon}>✏️</Text>
        </TouchableOpacity>
      </View>
 
      {Object.entries(options).map(([key, value]: any) => (
        <View key={key} style={[styles.option, styles.row]}>
          <Text style={styles.optionText}>{key}. {value}</Text>
          <TouchableOpacity onPress={() => handleEdit(key)}>
            <Text style={styles.editIcon}>✏️</Text>
          </TouchableOpacity>
        </View>
      ))}
 
      <View style={[styles.row, { marginTop: 20 }]}>
        <Text style={styles.correct}>Correct Answer: {correctOption}</Text>
        <TouchableOpacity onPress={() => handleEdit('correctOption')}>
          <Text style={styles.editIcon}>✏️</Text>
        </TouchableOpacity>
      </View>
 
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit {editField}</Text>
            <TextInput
              style={styles.input}
              value={tempValue}
              onChangeText={setTempValue}
              autoFocus
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: '#4CAF50' }]}
                onPress={saveEdit}>
                <Text style={styles.btnText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: '#f44336' }]}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};
 
export default QuizDetailScreen;
 
// ... same styles as before
 
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  question: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
    marginBottom: 20,
    lineHeight: 30,
    flex: 1,
  },
  option: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  optionText: {
    fontSize: 17,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  correct: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
  },
  editIcon: {
    fontSize: 18,
    marginLeft: 10,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#222',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  modalBtns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  btnText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
 
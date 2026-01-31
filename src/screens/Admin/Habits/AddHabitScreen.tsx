import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
 
const AddHabitScreen = () => {
  const navigation = useNavigation<any>();
 
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
 
  const saveHabit = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Habit title required');
      return;
    }
 
    // 🔜 Yahan baad me Firebase / DB save logic aaye ga
    console.log('Habit Saved:', title, description);
 
    Alert.alert('Success', 'Habit added successfully');
 
    navigation.goBack();
  };
 
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Add New Habit</Text>
 
      <TextInput
        style={styles.input}
        placeholder="Habit Title"
        value={title}
        onChangeText={setTitle}
      />
 
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Habit Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />
 
      <TouchableOpacity style={styles.saveBtn} onPress={saveHabit}>
        <Text style={styles.saveText}>Save Habit</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};
 
export default AddHabitScreen;
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6FA',
    padding: 20,
  },
 
  heading: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 25,
    color: '#333',
  },
 
  input: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    marginBottom: 16,
    elevation: 3,
  },
 
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
 
  saveBtn: {
    backgroundColor: '#DD2476',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 20,
    alignItems: 'center',
  },
 
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
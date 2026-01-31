import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  TextInput,
  StatusBar,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
 
type Question = {
  id: string;
  question: string;
  answer: string;
};
 
const AdminAllQuestionsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
 
  const [questions, setQuestions] = useState<Question[]>([
    { id: '1', question: 'Which Guru started the compilation of Gurbani?', answer: 'Guru Arjan' },
    { id: '2', question: 'Capital of France?', answer: 'Paris' },
    { id: '3', question: 'Fastest land animal?', answer: 'Cheetah' },
  ]);
 
  const deleteQuestion = (id: string) => {
    Alert.alert(
      'Delete Question',
      'Are you sure you want to delete this question?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => setQuestions(prev => prev.filter(q => q.id !== id)) },
      ]
    );
  };
 
  const updateQuestion = (id: string, field: 'question' | 'answer', value: string) => {
    setQuestions(prev => prev.map(q => (q.id === id ? { ...q, [field]: value } : q)));
  };
 
  const QuestionCard = ({ item }: { item: Question }) => (
    <LinearGradient
      colors={['#3B4C6B', '#1E2B4D']}
      style={styles.card}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <TextInput
        value={item.question}
        onChangeText={text => updateQuestion(item.id, 'question', text)}
        style={styles.questionInput}
        placeholder="Enter question"
        placeholderTextColor="rgba(255,255,255,0.7)"
        multiline
      />
      <TextInput
        value={item.answer}
        onChangeText={text => updateQuestion(item.id, 'answer', text)}
        style={styles.answerInput}
        placeholder="Enter answer"
        placeholderTextColor="rgba(255,255,255,0.7)"
        multiline
      />
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => deleteQuestion(item.id)} style={styles.deleteBtn}>
          <LinearGradient
            colors={['#FF6B6B', '#C53030']}
            style={{ padding: 12, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}
          >
            <Feather name="trash-2" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
 
  return (
    <LinearGradient colors={['#020617', '#020617']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" />
 
        {/* HEADER */}
        <LinearGradient colors={['#1F2A45', '#0D1321']} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </TouchableOpacity>
 
          <Text style={styles.headerTitle}>Manage Questions</Text>
 
          <TouchableOpacity
            onPress={() => {
              const newId = (Math.random() * 100000).toFixed(0);
              setQuestions(prev => [...prev, { id: newId, question: '', answer: '' }]);
            }}
            style={styles.addBtn}
          >
            <Feather name="plus" size={22} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>
 
        {/* QUESTIONS LIST */}
        <FlatList
          data={questions}
          keyExtractor={item => item.id}
          renderItem={QuestionCard}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          extraData={questions}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};
 
export default AdminAllQuestionsScreen;
 
const styles = StyleSheet.create({
  header: {
    height: 90,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
  },
  backBtn: {
    height: 44,
    width: 44,
    borderRadius: 22,
    backgroundColor: '#4D96FF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  addBtn: {
    height: 44,
    width: 44,
    borderRadius: 22,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFD700',
  },
 
  card: {
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
  },
  questionInput: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
  },
  answerInput: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFD700',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 14,
  },
  deleteBtn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
});
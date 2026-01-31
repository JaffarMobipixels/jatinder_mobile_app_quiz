import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  Animated,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import database from '@react-native-firebase/database';
import { Picker } from '@react-native-picker/picker';
import LinearGradient from 'react-native-linear-gradient';
import FeatherIcon from 'react-native-vector-icons/Feather';

const AdminQuizScreen = ({ navigation }: any) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [catName, setCatName] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState({ A: '', B: '', C: '', D: '' });
  const [correctOption, setCorrectOption] = useState('A');

  const [rules, setRules] = useState<string[]>([]);
  const [newRule, setNewRule] = useState('');
  const [rulesLoading, setRulesLoading] = useState(true);
  const [updatingRules, setUpdatingRules] = useState(false);

  const scale = useRef(new Animated.Value(1)).current;

  /* ================= FETCH QUIZ CATEGORIES ================= */
  useEffect(() => {
    const ref = database().ref('Quiz');

    ref.on('value', snapshot => {
      const data = snapshot.val() || {};
      const list = Object.keys(data)
        .filter(key => data[key].catname)
        .map(key => ({
          id: key,
          name: data[key].catname,
        }));
      setCategories(list);
    });

    return () => ref.off();
  }, []);

  useEffect(() => {
    if (selectedCat && !categories.find(cat => cat.id === selectedCat)) {
      setSelectedCat('');
    }
  }, [categories]);

  /* ================= FETCH GAME RULES ================= */
  useEffect(() => {
    const ref = database().ref('GameRules/allRules');
    const listener = ref.on('value', snapshot => {
      const data = snapshot.val();
      if (data && Array.isArray(data.list)) {
        setRules(data.list);
      } else {
        setRules([]);
      }
      setRulesLoading(false);
    });

    return () => ref.off('value', listener);
  }, []);

  /* ================= QUIZ ACTIONS ================= */
  const addCategory = () => {
    if (!catName.trim()) {
      return Alert.alert('Error', 'Category name required');
    }

    database().ref('Quiz').push({ catname: catName.trim() });
    setCatName('');
    Alert.alert('Success', 'Category added successfully');
  };

  const uploadQuiz = () => {
    const catExists = categories.find(cat => cat.id === selectedCat);

    if (!catExists) {
      return Alert.alert('Invalid Category', 'Category no longer exists');
    }

    if (
      !selectedCat ||
      !question ||
      !options.A ||
      !options.B ||
      !options.C ||
      !options.D
    ) {
      return Alert.alert('Error', 'All fields are required');
    }

    database()
      .ref(`Quiz/${selectedCat}/quizzes`)
      .push({ question, options, correctOption });

    setQuestion('');
    setOptions({ A: '', B: '', C: '', D: '' });
    setCorrectOption('A');
    setModalVisible(false);

    Alert.alert('Success', 'Quiz added successfully');
  };

  /* ================= GAME RULES ACTIONS ================= */
  const addRuleLocally = () => {
    if (!newRule.trim()) {
      Alert.alert('Warning', 'Rule empty nahi ho sakta');
      return;
    }
    setRules(prev => [...prev, newRule.trim()]);
    setNewRule('');
  };

  const removeRule = (index: number) => {
    setRules(prev => prev.filter((_, i) => i !== index));
  };

  const saveRulesToFirebase = async () => {
    if (rules.length === 0) {
      Alert.alert('Warning', 'At least one rule add karo');
      return;
    }

    setUpdatingRules(true);
    try {
      await database()
        .ref('GameRules/allRules')
        .set({ list: rules, updatedAt: Date.now() });

      Alert.alert('Success', 'Saved ✅');
    } catch (error: any) {
      console.log('Save error:', error);
      Alert.alert('Error', error.message);
    } finally {
      setUpdatingRules(false);
    }
  };

  /* ================= BUTTON ANIMATION ================= */
  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <LinearGradient colors={['#0F2027', '#203A43', '#2C5364']} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.container}>
        {/* HEADER */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Admin Quiz Dashboard</Text>
          <View style={{ width: 24 }} /> {/* placeholder for centering */}
        </View>

        {/* CATEGORY CARD */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Create Category</Text>

          <TextInput
            placeholder="Category name"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            value={catName}
            onChangeText={setCatName}
          />

          <TouchableOpacity onPress={addCategory}>
            <LinearGradient
              colors={['#4F46E5', '#6366F1']}
              style={styles.primaryBtn}
            >
              <Text style={styles.btnText}>Add Category</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ADD QUIZ BUTTON */}
        <Animated.View style={{ transform: [{ scale }] }}>
          <TouchableOpacity
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            onPress={() => setModalVisible(true)}
          >
            <LinearGradient
              colors={['#22C55E', '#16A34A']}
              style={styles.primaryBtn}
            >
              <Text style={styles.btnText}>Add New Quiz</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* VIEW CATEGORIES */}
        <TouchableOpacity
          onPress={() => navigation.navigate('QuizCategories')}
        >
          <LinearGradient
            colors={['#F97316', '#EA580C']}
            style={styles.secondaryBtn}
          >
            <Text style={styles.btnText}>View Categories</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* ================= GAME RULES SECTION ================= */}
        <View style={[styles.card, { marginTop: 30 }]}>
          <Text style={styles.sectionTitle}>Manage Game Rules</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Write a rule here..."
              placeholderTextColor="#999"
              value={newRule}
              onChangeText={setNewRule}
            />
            <TouchableOpacity style={styles.addBtn} onPress={addRuleLocally}>
              <FeatherIcon name="plus" size={24} color="#0A1F44" />
            </TouchableOpacity>
          </View>

          {rulesLoading ? (
            <ActivityIndicator size="large" color="#FFD700" />
          ) : (
            <ScrollView style={{ maxHeight: 250 }}>
              {rules.map((rule, index) => (
                <View key={index} style={styles.ruleItem}>
                  <Text style={styles.ruleText}>
                    {index + 1}. {rule}
                  </Text>
                  <TouchableOpacity onPress={() => removeRule(index)}>
                    <FeatherIcon name="trash-2" size={20} color="#FF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          <TouchableOpacity
            style={[styles.saveBtn, updatingRules && { opacity: 0.6 }]}
            onPress={saveRulesToFirebase}
            disabled={updatingRules}
          >
            <Text style={styles.saveBtnText}>SAVE RULES</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ================= MODAL ================= */}
      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Add Quiz</Text>

              <Picker
                selectedValue={selectedCat}
                onValueChange={setSelectedCat}
                style={styles.picker}
              >
                <Picker.Item label="Select Category" value="" />
                {categories.map(cat => (
                  <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
                ))}
              </Picker>

              <TextInput
                placeholder="Question"
                placeholderTextColor="#94a3b8"
                style={styles.input}
                value={question}
                onChangeText={setQuestion}
              />

              {(['A', 'B', 'C', 'D'] as const).map(key => (
                <TextInput
                  key={key}
                  placeholder={`Option ${key}`}
                  placeholderTextColor="#94a3b8"
                  style={styles.input}
                  value={options[key]}
                  onChangeText={text =>
                    setOptions({ ...options, [key]: text })
                  }
                />
              ))}

              <Text style={styles.label}>Correct Option</Text>
              <Picker
                selectedValue={correctOption}
                onValueChange={setCorrectOption}
                style={styles.picker}
              >
                {(['A', 'B', 'C', 'D'] as const).map(opt => (
                  <Picker.Item key={opt} label={opt} value={opt} />
                ))}
              </Picker>

              <TouchableOpacity onPress={uploadQuiz}>
                <LinearGradient
                  colors={['#22C55E', '#16A34A']}
                  style={styles.primaryBtn}
                >
                  <Text style={styles.btnText}>Upload Quiz</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <LinearGradient
                  colors={['#EF4444', '#DC2626']}
                  style={styles.secondaryBtn}
                >
                  <Text style={styles.btnText}>Cancel</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

export default AdminQuizScreen;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 35,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backIcon: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
    color: '#fff',
    flex: 1,
    letterSpacing: 1,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12,
  },

  card: {
    backgroundColor: '#f8fafc',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    elevation: 16,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 2 },
  },

  input: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginVertical: 10,
    fontSize: 15,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },

  picker: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 16,
    marginVertical: 10,
  },

  primaryBtn: {
    borderRadius: 18,
    height: 50,
    marginTop: 20,
    elevation: 12,
    justifyContent: 'center',
  },

  secondaryBtn: {
    borderRadius: 18,
    height: 50,
    marginTop: 20,
    elevation: 12,
    justifyContent: 'center',
  },

  btnText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContainer: {
    width: '92%',
    backgroundColor: '#f8fafc',
    borderRadius: 28,
    padding: 20,
    maxHeight: '85%',
    elevation: 20,
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 20,
    color: '#0f172a',
  },

  label: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
    color: '#334155',
  },

  // ================= GAME RULES =================
  inputContainer: { flexDirection: 'row', marginBottom: 20 },
  addBtn: {
    backgroundColor: '#FFD700',
    width: 50,
    marginLeft: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ruleItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ruleText: { color: '#0f172a', flex: 1, marginRight: 10 },
  saveBtn: {
    backgroundColor: '#FFD700',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  saveBtnText: { color: '#0A1F44', fontWeight: 'bold', fontSize: 16 },
});

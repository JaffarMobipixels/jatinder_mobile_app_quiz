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
} from 'react-native';
import database from '@react-native-firebase/database';
import { Picker } from '@react-native-picker/picker';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';

const CharadesAdminWordsScreen = ({ navigation }: any) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCat, setSelectedCat] = useState('');
  
  // Modals visibility
  const [wordModalVisible, setWordModalVisible] = useState(false);
  const [catModalVisible, setCatModalVisible] = useState(false);

  // Input states
  const [charadeWord, setCharadeWord] = useState('');
  const [newCatName, setNewCatName] = useState('');

  const scale = useRef(new Animated.Value(1)).current;

  /* ================= FETCH CATEGORIES FROM CharadesWord ================= */
  useEffect(() => {
    const ref = database().ref('CharadesWord');
    const onValueChange = ref.on('value', snapshot => {
      const data = snapshot.val() || {};
      const list = Object.keys(data)
        .filter(key => data[key].catname)
        .map(key => ({
          id: key,
          name: data[key].catname,
        }));
      setCategories(list);
    });
    return () => ref.off('value', onValueChange);
  }, []);

  /* ================= CREATE NEW CATEGORY ================= */
  const createCategory = () => {
    if (!newCatName.trim()) {
      return Alert.alert('Error', 'Category name is required');
    }

    const newCatRef = database().ref('CharadesWord').push();
    newCatRef.set({
      catname: newCatName.trim(),
    })
    .then(() => {
      setNewCatName('');
      setCatModalVisible(false);
      Alert.alert('Success', 'New Category Created!');
    })
    .catch(() => Alert.alert('Error', 'Failed to create category'));
  };

  /* ================= UPLOAD WORD ================= */
  const uploadWord = () => {
    if (!selectedCat) return Alert.alert('Error', 'Please select a category');
    if (!charadeWord.trim()) return Alert.alert('Error', 'Word is required');

    database()
      .ref(`CharadesWord/${selectedCat}/words`)
      .push()
      .set({ word: charadeWord.trim() })
      .then(() => {
        setCharadeWord('');
        setWordModalVisible(false);
        Alert.alert('Success', 'Word added successfully');
      })
      .catch(() => Alert.alert('Error', 'Failed to save word'));
  };

  const onPressIn = () => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <LinearGradient colors={['#0F2027', '#203A43', '#2C5364']} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.container}>

        {/* ================= HEADER WITH BACK ICON ================= */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="arrow-left" size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Charades Management</Text>
        </View>

        <Text style={styles.infoText}>First create a Category, then add Words to it.</Text>

        {/* 1. CREATE CATEGORY BUTTON */}
        <TouchableOpacity onPress={() => setCatModalVisible(true)}>
          <LinearGradient colors={['#10B981', '#059669']} style={styles.primaryBtn}>
            <Text style={styles.btnText}>+ Create New Category</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* 2. ADD WORD BUTTON */}
        <Animated.View style={{ transform: [{ scale }], marginTop: 15 }}>
          <TouchableOpacity
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            onPress={() => setWordModalVisible(true)}
          >
            <LinearGradient colors={['#4F46E5', '#6366F1']} style={styles.primaryBtn}>
              <Text style={styles.btnText}>+ Add Word to Category</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* 3. MANAGE BUTTON */}
        <TouchableOpacity
          style={{ marginTop: 15 }}
          onPress={() => navigation.navigate('CharadesAdminCategories')}
        >
          <LinearGradient colors={['#F97316', '#EA580C']} style={styles.secondaryBtn}>
            <Text style={styles.btnText}>Manage All Categories & Words</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* ================= MODAL: CREATE CATEGORY ================= */}
      <Modal visible={catModalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>New Category</Text>
            <TextInput
              placeholder="Category Name (e.g. Movies)"
              style={styles.input}
              value={newCatName}
              onChangeText={setNewCatName}
            />
            <TouchableOpacity onPress={createCategory}>
              <LinearGradient colors={['#10B981', '#059669']} style={styles.primaryBtn}>
                <Text style={styles.btnText}>Save Category</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setCatModalVisible(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL: ADD WORD ================= */}
      <Modal visible={wordModalVisible} animationType="fade" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add Word</Text>
            
            <Text style={styles.label}>Select Category</Text>
            <View style={styles.pickerWrapper}>
              <Picker selectedValue={selectedCat} onValueChange={setSelectedCat}>
                <Picker.Item label="Choose..." value="" />
                {categories.map(cat => (
                  <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>Enter Word</Text>
            <TextInput
              placeholder="e.g. Inception"
              style={styles.input}
              value={charadeWord}
              onChangeText={setCharadeWord}
            />

            <TouchableOpacity onPress={uploadWord}>
              <LinearGradient colors={['#4F46E5', '#6366F1']} style={styles.primaryBtn}>
                <Text style={styles.btnText}>Add Word</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setWordModalVisible(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

export default CharadesAdminWordsScreen;

const styles = StyleSheet.create({
  container: { padding: 20, marginTop:40, },
  // HEADER
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop:30, },
  backBtn: { marginRight: 12 },
  title: { fontSize: 28, fontWeight: '700', color: '#fff' },
  infoText: { color: '#94a3b8', textAlign: 'center', marginBottom: 30, marginTop: 10 },
  primaryBtn: { borderRadius: 15, elevation: 5, height: 60 },
  secondaryBtn: { borderRadius: 15, elevation: 5, height: 60 },
  btnText: { color: '#fff', textAlign: 'center', fontSize: 16, marginTop: 20, fontWeight: '900' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '85%', backgroundColor: '#fff', borderRadius: 25, padding: 20 },
  modalTitle: { fontSize: 22, fontWeight: '900', color: '#1e293b', textAlign: 'center', marginBottom: 20 },
  input: { backgroundColor: '#f1f5f9', borderRadius: 12, padding: 15, fontSize: 16, marginBottom: 15, color: '#000' },
  pickerWrapper: { backgroundColor: '#1e293b', borderRadius: 12, marginBottom: 15, overflow: 'hidden' },
  label: { fontSize: 13, fontWeight: '700', color: '#64748b', marginBottom: 5, marginLeft: 5 },
  cancelBtn: { marginTop: 15 },
  cancelText: { textAlign: 'center', color: '#ef4444', fontWeight: '700' },
});

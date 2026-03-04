// src/screens/Admin/Books/AddEBooksScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import { pick, types, DocumentPickerResponse } from '@react-native-documents/picker';
import RNFS from 'react-native-fs';
import storage from '@react-native-firebase/storage';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import { launchImageLibrary } from 'react-native-image-picker';

const AddEBooksScreen = ({ navigation }: any) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [pdfFile, setPdfFile] = useState<{ name: string; path: string } | null>(null);
  const [imageFile, setImageFile] = useState<{ name: string; path: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Assignment
  const [students, setStudents] = useState<{ id: string; name: string; selected: boolean }[]>([]);
  const [deadline, setDeadline] = useState('');
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [showStudents, setShowStudents] = useState(false);

  // Current teacher state
  const [currentTeacher, setCurrentTeacher] = useState<null | any>(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      setCurrentTeacher(user);
    });
    return () => unsubscribe();
  }, []);

  // Fetch all students dynamically
  useEffect(() => {
    const fetchStudents = async () => {
      setLoadingStudents(true);
      try {
        const snapshot = await database().ref('users').once('value');
        const data = snapshot.val() || {};
        const studentList: { id: string; name: string; selected: boolean }[] = [];

        Object.keys(data).forEach(key => {
          const user = data[key];
          if (user.role === 'user') {
            studentList.push({
              id: key,
              name: user.firstName || 'Unnamed',
              selected: false,
            });
          }
        });

        setStudents(studentList);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch students');
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, []);

  // Storage permission for Android
  const requestStoragePermission = async () => {
    if (Platform.OS !== 'android') return true;
    if (Platform.Version >= 33) return true; // Android 13+ manages it automatically
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  // Pick PDF
  const pickPDF = async () => {
    try {
      const permission = await requestStoragePermission();
      if (!permission) return Alert.alert('Permission Denied', 'Storage permission required');

      const res: DocumentPickerResponse[] = await pick({ type: [types.pdf] });
      const file = res[0];
      const fileName = file.name || `file_${Date.now()}.pdf`;

      // Handle Android content URI by copying to cache
      let path = file.uri;
      if (Platform.OS === 'android' && file.uri.startsWith('content://')) {
        const destPath = `${RNFS.CachesDirectoryPath}/${fileName}`;
        await RNFS.copyFile(file.uri, destPath);
        path = destPath;
      }

      setPdfFile({ name: fileName, path });
    } catch (err: any) {
      if (err?.code !== 'DOCUMENT_PICKER_CANCELED') Alert.alert('Error', 'Failed to select PDF');
    }
  };

  // Pick Image
  const pickImage = async () => {
    try {
      const permission = await requestStoragePermission();
      if (!permission) return Alert.alert('Permission Denied', 'Storage permission required');

      const result = await launchImageLibrary({ mediaType: 'photo' });
      if (result.didCancel) return;
      if (!result.assets || result.assets.length === 0) return;

      const asset = result.assets[0];
      if (!asset.uri) return Alert.alert('Error', 'Cannot access selected image');

      const fileName = asset.fileName || `image_${Date.now()}.jpg`;
      let path = asset.uri;

      if (Platform.OS === 'android' && asset.uri.startsWith('content://')) {
        const destPath = `${RNFS.CachesDirectoryPath}/${fileName}`;
        await RNFS.copyFile(asset.uri, destPath);
        path = destPath;
      }

      setImageFile({ name: fileName, path });
    } catch (err) {
      Alert.alert('Error', 'Failed to select image');
    }
  };

  // Toggle student selection
  const toggleStudent = (id: string) => {
    setStudents(prev =>
      prev.map(stu => (stu.id === id ? { ...stu, selected: !stu.selected } : stu))
    );
  };

  // Add & assign book
  const handleAddAndAssignBook = async () => {
    if (!title || !author || !pdfFile || !imageFile) {
      return Alert.alert('Error', 'All fields and files are required');
    }
    if (!currentTeacher) return Alert.alert('Error', 'Teacher not logged in');

    const selectedStudents = students.filter(stu => stu.selected);
    if (selectedStudents.length === 0 || !deadline) {
      return Alert.alert('Error', 'Select at least one student and set a deadline');
    }

    try {
      setLoading(true);

      // Upload PDF
      const pdfRef = storage().ref(`ebooks/${Date.now()}_${pdfFile.name}`);
      await pdfRef.putFile(pdfFile.path);
      const pdfUrl = await pdfRef.getDownloadURL();

      // Upload Image
      const imgRef = storage().ref(`ebooks/images/${Date.now()}_${imageFile.name}`);
      await imgRef.putFile(imageFile.path);
      const imageUrl = await imgRef.getDownloadURL();

      // Save ebook data
      const ebookRef = database().ref('EBooks').push();
      const ebookId = ebookRef.key!;
      await ebookRef.set({
        title,
        author,
        pdfUrl,
        imageUrl,
        createdAt: Date.now(),
        assignedBy: currentTeacher.uid,
      });

      // Assign to selected students with deadline
      const assignments: any = {};
      selectedStudents.forEach(stu => {
        assignments[stu.id] = { assignedAt: Date.now(), deadline, progress: 0 };
      });
      await database().ref(`Assignments/${ebookId}`).set(assignments);

      setLoading(false);
      Alert.alert('Success', 'Book uploaded and assigned successfully');
      navigation.goBack();
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#FF8C00', '#FFB347']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 10 }}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add & Assign Book</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formCard}>
          <Text style={styles.label}>Book Title</Text>
          <TextInput
            placeholder="Enter book title"
            placeholderTextColor="#999"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />

          <Text style={styles.label}>Author / Category</Text>
          <TextInput
            placeholder="Enter author or category"
            placeholderTextColor="#999"
            value={author}
            onChangeText={setAuthor}
            style={styles.input}
          />

          <Text style={styles.label}>Book Cover Image</Text>
          <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
            {imageFile ? (
              <Image source={{ uri: imageFile.path }} style={styles.previewImage} />
            ) : (
              <Text style={styles.uploadText}>Select Image</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.label}>Upload PDF</Text>
          <TouchableOpacity style={styles.uploadBtn} onPress={pickPDF}>
            <Text style={styles.uploadText}>{pdfFile ? pdfFile.name : 'Select PDF'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.studentToggleBtn}
            onPress={() => setShowStudents(prev => !prev)}
          >
            <Text style={{ fontWeight: '600', color: '#000' }}>
              {showStudents ? 'Hide Students' : 'Select Students'}
            </Text>
          </TouchableOpacity>

          {showStudents && (
            <View style={{ marginVertical: 8 }}>
              {loadingStudents ? (
                <ActivityIndicator size="small" color="#FF8C00" />
              ) : students.length === 0 ? (
                <Text>No students found</Text>
              ) : (
                students.map(stu => (
                  <TouchableOpacity
                    key={stu.id}
                    style={[
                      styles.studentBtn,
                      stu.selected && { backgroundColor: '#FFD700' },
                    ]}
                    onPress={() => toggleStudent(stu.id)}
                  >
                    <Text style={{ color: '#000' }}>
                      {stu.name} {stu.selected ? '(Selected)' : '(Select)'}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}

          <Text style={styles.label}>Set Deadline (YYYY-MM-DD)</Text>
          <TextInput
            placeholder="2026-02-28"
            placeholderTextColor="#999"
            value={deadline}
            onChangeText={setDeadline}
            style={styles.input}
          />

          <TouchableOpacity
            style={styles.addBtn}
            onPress={handleAddAndAssignBook}
            disabled={!currentTeacher || loading} // disable if teacher not logged in
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.addBtnText}>Add & Assign Book</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddEBooksScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3F4F6' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 70,
    borderRadius: 15,
    margin: 10,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  scrollContent: { padding: 16 },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
  },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6 },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    color: '#000',
  },
  uploadBtn: {
    backgroundColor: '#E5E7EB',
    height: 150,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewImage: { width: '100%', height: '100%', borderRadius: 12 },
  uploadText: { color: '#555', fontSize: 16 },
  studentToggleBtn: {
    backgroundColor: '#E5E7EB',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 10,
  },
  studentBtn: {
    backgroundColor: '#E5E7EB',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  addBtn: {
    backgroundColor: '#FF8C00',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
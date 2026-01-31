import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import { pick, types, DocumentPickerResponse } from '@react-native-documents/picker';
import RNFS from 'react-native-fs';
import storage from '@react-native-firebase/storage';
import database from '@react-native-firebase/database';
import { launchImageLibrary } from 'react-native-image-picker';
 
const AddEBooksScreen = ({ navigation }: any) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [pdfFile, setPdfFile] = useState<{ name: string; path: string } | null>(null);
  const [imageFile, setImageFile] = useState<{ name: string; path: string } | null>(null);
  const [loading, setLoading] = useState(false);
 
  // 📌 Android permission for storage
  const requestStoragePermission = async () => {
    if (Platform.OS !== 'android') return true;
    if (Platform.Version >= 33) return true;
 
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };
 
  // 📌 Pick PDF
  const pickPDF = async () => {
    const permission = await requestStoragePermission();
    if (!permission) return Alert.alert('Permission Denied', 'Storage permission required');
 
    try {
      const res: DocumentPickerResponse[] = await pick({ type: [types.pdf] });
      const file = res[0];
      const fileName = file.name || `file_${Date.now()}.pdf`;
      const sourceUri: string = (file as any).fileCopyUri || file.uri;
      if (!sourceUri) return Alert.alert('Error', 'Cannot access selected file');
 
      const destPath = `${RNFS.CachesDirectoryPath}/${fileName}`;
      await RNFS.copyFile(sourceUri, destPath);
 
      setPdfFile({ name: fileName, path: destPath });
    } catch (err: any) {
      if (err?.code !== 'DOCUMENT_PICKER_CANCELED') Alert.alert('Error', 'Failed to select PDF');
    }
  };
 
  // 📌 Pick Image
  const pickImage = async () => {
    const permission = await requestStoragePermission();
    if (!permission) return Alert.alert('Permission Denied', 'Storage permission required');
 
    const result = await launchImageLibrary({ mediaType: 'photo' });
    if (result.didCancel) return;
    if (!result.assets || result.assets.length === 0) return;
 
    const asset = result.assets[0];
    if (!asset.uri) return Alert.alert('Error', 'Cannot access selected image');
 
    const fileName = asset.fileName || `image_${Date.now()}.jpg`;
    setImageFile({ name: fileName, path: asset.uri });
  };
 
  // 📌 Upload PDF + Image + Save
  const handleAddBook = async () => {
    if (!title || !author || !pdfFile || !imageFile) {
      return Alert.alert('Error', 'All fields and image are required');
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
 
      // Save in Firebase Database
      await database().ref('EBooks').push({
        title,
        author,
        pdfUrl,
        imageUrl,
        createdAt: Date.now(),
      });
 
      setLoading(false);
      Alert.alert('Success', 'Book uploaded successfully');
      navigation.goBack();
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Upload Failed', error.message);
    }
  };
 
  return (
    <SafeAreaView style={styles.safeArea}>
    <LinearGradient colors={['#FF8C00', '#FFB347']} style={styles.header}>
  <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 10 }}>
    <Feather name="arrow-left" size={24} color="#fff" />
  </TouchableOpacity>
  <Text style={styles.headerTitle}>Add New Book</Text>
  <View style={{ width: 24 }} />
</LinearGradient>

 
      <View style={styles.form}>
        <TextInput
          placeholder="Book Title"
          placeholderTextColor="#ccc"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />
 
        <TextInput
          placeholder="Author / Category"
          placeholderTextColor="#ccc"
          value={author}
          onChangeText={setAuthor}
          style={styles.input}
        />
 
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: '#4CAF50' }]} onPress={pickImage}>
          <Text style={styles.addBtnText}>{imageFile ? 'Image Selected' : 'Select Book Image'}</Text>
        </TouchableOpacity>
 
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: '#2196F3' }]} onPress={pickPDF}>
          <Text style={styles.addBtnText}>{pdfFile ? pdfFile.name : 'Select PDF'}</Text>
        </TouchableOpacity>
 
        <TouchableOpacity style={styles.addBtn} onPress={handleAddBook}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.addBtnText}>Add Book</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
 
export default AddEBooksScreen;
 
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#6C63FF', padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', margin:10, height: "10%", borderRadius: 18, marginBottom: 20 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  form: { marginTop: 20 },
  input: { backgroundColor: '#5A4FCF', borderRadius: 14, padding: 14, color: '#fff', marginBottom: 14 },
  addBtn: { backgroundColor: '#FFA726', padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 10 },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
 
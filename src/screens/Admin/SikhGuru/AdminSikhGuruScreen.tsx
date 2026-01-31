import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  Linking,
  StatusBar,
} from 'react-native';
import database from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';
import RNFS from 'react-native-fs';
import { pick, types, DocumentPickerResponse } from '@react-native-documents/picker';
import DataFetcher, { GuruType } from './DataFetcher';
import LinearGradient from 'react-native-linear-gradient';

type LocalFile = {
  name: string;
  path: string;
};

const SikhGuruAdminScreen = ({ navigation }: any) => {
  const [title, setTitle] = useState('');
  const [history, setHistory] = useState('');
  const [imageFile, setImageFile] = useState<LocalFile | null>(null);
  const [pdfFile, setPdfFile] = useState<LocalFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [gurus, setGurus] = useState<GuruType[]>([]);
  const [editingGuruId, setEditingGuruId] = useState<string | null>(null);

  // ================= IMAGE PICK =================
  const pickImage = async () => {
    try {
      const res: DocumentPickerResponse[] = await pick({ type: [types.images] });
      const file = res[0];
      const fileName = file.name ?? `image_${Date.now()}.jpg`;
      const sourceUri = (file as any).fileCopyUri ?? file.uri;
      if (!sourceUri) return;
      const destPath = `${RNFS.CachesDirectoryPath}/${fileName}`;
      await RNFS.copyFile(sourceUri, destPath);
      setImageFile({ name: fileName, path: destPath });
    } catch (e: any) {
      if (e?.code !== 'DOCUMENT_PICKER_CANCELED') Alert.alert('Error', 'Image selection failed');
    }
  };

  // ================= PDF PICK =================
  const pickPDF = async () => {
    try {
      const res: DocumentPickerResponse[] = await pick({ type: [types.pdf] });
      const file = res[0];
      const fileName = file.name ?? `file_${Date.now()}.pdf`;
      const sourceUri = (file as any).fileCopyUri ?? file.uri;
      if (!sourceUri) return;
      const destPath = `${RNFS.CachesDirectoryPath}/${fileName}`;
      await RNFS.copyFile(sourceUri, destPath);
      setPdfFile({ name: fileName, path: destPath });
    } catch (e: any) {
      if (e?.code !== 'DOCUMENT_PICKER_CANCELED') Alert.alert('Error', 'PDF selection failed');
    }
  };

  // ================= SAVE OR UPDATE =================
  const saveGuru = async () => {
    if (!title || !history) {
      Alert.alert('Error', 'Title & history required');
      return;
    }

    setLoading(true);
    try {
      let ref;
      const guruId = editingGuruId ?? database().ref('SikhGurus').push().key!;
      ref = database().ref(`SikhGurus/${guruId}`);

      let imageUrl = '';
      let pdfUrl = '';

      // Upload new files if selected
      if (imageFile) {
        const imgRef = storage().ref(`SikhGurus/images/${guruId}_${imageFile.name}`);
        await imgRef.putFile(imageFile.path);
        imageUrl = await imgRef.getDownloadURL();
      } else if (editingGuruId) {
        // keep old image if editing and no new file picked
        const oldGuru = gurus.find(g => g.id === editingGuruId);
        imageUrl = oldGuru?.imageUrl ?? '';
      }

      if (pdfFile) {
        const pdfRef = storage().ref(`SikhGurus/pdfs/${guruId}_${pdfFile.name}`);
        await pdfRef.putFile(pdfFile.path);
        pdfUrl = await pdfRef.getDownloadURL();
      } else if (editingGuruId) {
        const oldGuru = gurus.find(g => g.id === editingGuruId);
        pdfUrl = oldGuru?.pdfUrl ?? '';
      }

      await ref.set({
        title,
        history,
        imageUrl,
        pdfUrl,
        createdAt: editingGuruId ? gurus.find(g => g.id === editingGuruId)?.createdAt ?? Date.now() : Date.now(),
      });

      // Reset form
      setTitle('');
      setHistory('');
      setImageFile(null);
      setPdfFile(null);
      setEditingGuruId(null);
      setLoading(false);

      Alert.alert('Success', editingGuruId ? 'Guru updated successfully' : 'Guru added successfully');
    } catch (e: any) {
      setLoading(false);
      Alert.alert('Error', e.message);
    }
  };

  // ================= DELETE =================
  const deleteGuru = (guru: GuruType) => {
    Alert.alert('Confirm Delete', 'This will permanently delete this Guru.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true);
            if (guru.imageUrl) await storage().refFromURL(guru.imageUrl).delete().catch(() => {});
            if (guru.pdfUrl) await storage().refFromURL(guru.pdfUrl).delete().catch(() => {});
            await database().ref(`SikhGurus/${guru.id}`).remove();
            if (editingGuruId === guru.id) setEditingGuruId(null);
            setLoading(false);
            Alert.alert('Deleted', 'Guru deleted successfully');
          } catch (e: any) {
            setLoading(false);
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  // ================= START EDIT =================
  const startEdit = (guru: GuruType) => {
    setTitle(guru.title);
    setHistory(guru.history);
    setEditingGuruId(guru.id);
    setImageFile(null);
    setPdfFile(null);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Toolbar */}
      <LinearGradient colors={['#4F46E5', '#6366F1']} style={styles.toolbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.toolbarTitle}>🕉 Sikh Gurus Admin</Text>
        <View style={{ width: 30 }} />
      </LinearGradient>

      {/* DataFetcher List */}
      <DataFetcher onDataChange={setGurus} />

      {/* Input Fields */}
      <TextInput
        placeholder="Guru Title"
        value={title}
        onChangeText={setTitle}
        placeholderTextColor="#ccc"
        style={styles.input}
      />

      <TextInput
        placeholder="Guru History"
        value={history}
        onChangeText={setHistory}
        multiline
        placeholderTextColor="#ccc"
        style={[styles.input, { height: 120 }]}
      />

      {/* Pick Image / PDF */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
        <TouchableOpacity style={styles.pickBtn} onPress={pickImage}>
          <Text style={styles.pickText}>{imageFile ? imageFile.name : 'Select Image'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.pickBtn} onPress={pickPDF}>
          <Text style={styles.pickText}>{pdfFile ? pdfFile.name : 'Select PDF'}</Text>
        </TouchableOpacity>
      </View>

      {/* Save / Update Button */}
      <TouchableOpacity style={styles.saveBtn} onPress={saveGuru}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>{editingGuruId ? 'Update Guru' : 'Save Guru'}</Text>}
      </TouchableOpacity>

      {/* Existing Gurus */}
      {gurus.map(g => (
        <LinearGradient
          key={g.id}
          colors={['#1F2937', '#111827']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <Text style={styles.title}>{g.title}</Text>

          {g.imageUrl && <Image source={{ uri: g.imageUrl }} style={styles.image} />}
          {g.pdfUrl && (
            <TouchableOpacity onPress={() => Linking.openURL(g.pdfUrl)}>
              <Text style={styles.pdfLink}>📄 View PDF</Text>
            </TouchableOpacity>
          )}

          <View style={{ flexDirection: 'row', marginTop: 6 }}>
            <TouchableOpacity style={[styles.deleteBtn, { backgroundColor: '#E53935', flex: 1, marginRight: 4 }]} onPress={() => deleteGuru(g)}>
              <Text style={styles.deleteText}>🗑 Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.deleteBtn, { backgroundColor: '#4CAF50', flex: 1, marginLeft: 4 }]} onPress={() => startEdit(g)}>
              <Text style={styles.deleteText}>✏️ Edit</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      ))}
    </ScrollView>
  );
};

export default SikhGuruAdminScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#0F172A' },
  toolbar: {
    height: 70,
    marginTop: 50,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  backBtn: { width: 30 },
  backText: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  toolbarTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    flex: 1,
  },
  input: {
    backgroundColor: '#1F2937',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    color: '#EDEDED',
    fontSize: 16,
  },
  pickBtn: {
    flex: 1,
    backgroundColor: '#4F46E5',
    padding: 12,
    borderRadius: 14,
    marginHorizontal: 4,
  },
  pickText: { color: '#fff', fontWeight: '700', textAlign: 'center', fontSize: 14 },
  saveBtn: {
    backgroundColor: '#6366F1',
    padding: 16,
    borderRadius: 20,
    marginVertical: 12,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
  },
  saveText: { color: '#fff', fontWeight: '800', textAlign: 'center', fontSize: 18 },
  card: {
    borderRadius: 20,

    marginTop: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
  },
  title: { color: '#FFD700', fontSize: 18, fontWeight: '800', margin:20,},
  image: { width: '90%', height: 200, borderRadius: 14, marginBottom: 10 },
  pdfLink: { color: '#3B82F6', fontWeight: '700', marginBottom: 10 },
  deleteBtn: {
    margin:20,
    padding:10,
    borderRadius: 12,
    marginTop: 8,
    justifyContent: 'center',
  },
  deleteText: { color: '#fff', fontWeight: '800', textAlign: 'center' },
});

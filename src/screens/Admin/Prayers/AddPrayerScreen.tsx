import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { TabView, TabBar } from 'react-native-tab-view';
import database from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';
import DocumentPicker from 'react-native-document-picker';

/* ================= FIELD COMPONENT ================= */
const Field = ({ label, value, onChangeText, multiline = false, placeholder }: any) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      multiline={multiline} 
      placeholder={placeholder}
      placeholderTextColor="#64748b"
      style={[styles.input, multiline && { height: 100 }]}
    />
  </View>
);

const AddPrayerTabsScreen = ({ navigation }: any) => {
  /* ================= COMMON ================= */
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'prayer', title: 'Prayer' },
    { key: 'audio', title: 'Audio' },
    { key: 'video', title: 'Video' },
  ]);

  /* ================= PRAYER ================= */
  const [prayers, setPrayers] = useState<any[]>([]);
  const [editingPrayer, setEditingPrayer] = useState<any>(null);
  const [titleEn, setTitleEn] = useState('');
  const [titlePa, setTitlePa] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [contentPa, setContentPa] = useState('');

  /* ================= AUDIO ================= */
  const [audios, setAudios] = useState<any[]>([]);
  const [editingAudio, setEditingAudio] = useState<any>(null);
  const [audioTitle, setAudioTitle] = useState('');
  const [audioUrl, setAudioUrl] = useState('');

  /* ================= VIDEO ================= */
  const [videos, setVideos] = useState<any[]>([]);
  const [editingVideo, setEditingVideo] = useState<any>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const prayerRef = database().ref('prayers/prayer_written');
    const audioRef = database().ref('prayers/audio');
    const videoRef = database().ref('prayers/video');

    prayerRef.on('value', s => {
      const v = s.val() || {};
      setPrayers(Object.keys(v).map(k => ({ id: k, ...v[k] })).reverse());
    });

    audioRef.on('value', s => {
      const v = s.val() || {};
      setAudios(Object.keys(v).map(k => ({ id: k, ...v[k] })).reverse());
    });

    videoRef.on('value', s => {
      const v = s.val() || {};
      setVideos(Object.keys(v).map(k => ({ id: k, ...v[k] })).reverse());
    });

    return () => {
      prayerRef.off();
      audioRef.off();
      videoRef.off();
    };
  }, []);

  /* ================= CRUD ================= */
  // PRAYER
  const savePrayer = async () => {
    if (!titleEn || !titlePa || !contentEn || !contentPa) {
      Alert.alert('Error', 'Fill all fields');
      return;
    }
    const id = editingPrayer?.id || Date.now().toString();
    await database().ref(`prayers/prayer_written/${id}`).set({
      title: { en: titleEn, pa: titlePa },
      content: { en: contentEn, pa: contentPa },
      createdAt: Date.now(),
    });
    resetPrayer();
  };

  const resetPrayer = () => {
    setEditingPrayer(null);
    setTitleEn('');
    setTitlePa('');
    setContentEn('');
    setContentPa('');
  };

  const editPrayer = (item: any) => {
    setEditingPrayer(item);
    setTitleEn(item.title?.en || '');
    setTitlePa(item.title?.pa || '');
    setContentEn(item.content?.en || '');
    setContentPa(item.content?.pa || '');
  };

  const deletePrayer = (id: string) => {
    Alert.alert(
      'Delete Prayer',
      'Are you sure you want to delete this prayer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            database().ref(`prayers/prayer_written/${id}`).remove(),
        },
      ]
    );
  };

  // AUDIO PICK & UPLOAD
  const pickAudioAndUpload = async () => {
    try {
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.audio],
      });

      const fileUri = res.uri;
      const fileName = res.name;
      const reference = storage().ref(`audios/${Date.now()}_${fileName}`);

      await reference.putFile(fileUri);
      const downloadUrl = await reference.getDownloadURL();

      setAudioUrl(downloadUrl);
      Alert.alert('Success', 'Audio uploaded successfully!');
    } catch (err: any) {
      if (DocumentPicker.isCancel(err)) return;
      Alert.alert('Error', err.message || 'Failed to pick audio');
    }
  };

  const saveAudio = async () => {
    if (!audioTitle || !audioUrl) {
      Alert.alert('Error', 'Pick audio and enter title');
      return;
    }
    const id = editingAudio?.id || Date.now().toString();
    await database().ref(`prayers/audio/${id}`).set({
      title: audioTitle,
      url: audioUrl,
      createdAt: Date.now(),
    });
    setEditingAudio(null);
    setAudioTitle('');
    setAudioUrl('');
  };

  const editAudio = (item: any) => {
    setEditingAudio(item);
    setAudioTitle(item.title);
    setAudioUrl(item.url);
  };

  const deleteAudio = (id: string) => {
    Alert.alert(
      'Delete Audio',
      'Are you sure you want to delete this audio?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => database().ref(`prayers/audio/${id}`).remove(),
        },
      ]
    );
  };

  // VIDEO
  const saveVideo = async () => {
    if (!videoTitle || !videoUrl) return;
    const id = editingVideo?.id || Date.now().toString();
    await database().ref(`prayers/video/${id}`).set({
      title: videoTitle,
      url: videoUrl,
      createdAt: Date.now(),
    });
    setEditingVideo(null);
    setVideoTitle('');
    setVideoUrl('');
  };

  const editVideo = (item: any) => {
    setEditingVideo(item);
    setVideoTitle(item.title);
    setVideoUrl(item.url);
  };

  const deleteVideo = (id: string) => {
    Alert.alert(
      'Delete Video',
      'Are you sure you want to delete this video?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => database().ref(`prayers/video/${id}`).remove(),
        },
      ]
    );
  };

  /* ================= LIST RENDER ================= */
  const renderList = (list: any[], onEdit: any, onDelete: any) =>
    list.map(i => (
      <View key={i.id} style={styles.card}>
        <Text style={styles.cardTitle}>{i?.title?.en || i.title}</Text>
        <Text style={styles.cardContent} numberOfLines={2}>
          {i?.content?.en || i.url}
        </Text>

        <View style={styles.row}>
          <TouchableOpacity style={styles.editBtn} onPress={() => onEdit(i)}>
            <Feather name="edit-2" size={16} color="#000" />
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.delBtn} onPress={() => onDelete(i.id)}>
            <Feather name="trash-2" size={16} color="#fff" />
            <Text style={styles.delText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    ));

  /* ================= TABS ================= */
  const PrayerTab = (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.sectionTitle}>Add / Edit Prayer</Text>
      <Field label="English Title" value={titleEn} onChangeText={setTitleEn} />
      <Field label="Punjabi Title" value={titlePa} onChangeText={setTitlePa} />
      <Field label="English Content" value={contentEn} onChangeText={setContentEn} multiline />
      <Field label="Punjabi Content" value={contentPa} onChangeText={setContentPa} multiline />
      <TouchableOpacity style={styles.btn} onPress={savePrayer}>
        <Text style={styles.btnText}>{editingPrayer ? 'Update Prayer' : 'Save Prayer'}</Text>
      </TouchableOpacity>
      {renderList(prayers, editPrayer, deletePrayer)}
    </ScrollView>
  );

  const AudioTab = (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.sectionTitle}>Add Audio</Text>
      <Field label="Audio Title" value={audioTitle} onChangeText={setAudioTitle} />

      <TouchableOpacity
        style={[styles.input, { justifyContent: 'center', padding: 12 }]}
        onPress={pickAudioAndUpload}
      >
        <Text style={{ color: audioUrl ? '#fff' : '#64748b' }}>
          {audioUrl ? 'Audio Selected' : 'Pick Audio from Phone'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={saveAudio}>
        <Text style={styles.btnText}>{editingAudio ? 'Update Audio' : 'Save Audio'}</Text>
      </TouchableOpacity>

      {renderList(audios, editAudio, deleteAudio)}
    </ScrollView>
  );

  const VideoTab = (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.sectionTitle}>Add Video</Text>
      <Field label="Video Title" value={videoTitle} onChangeText={setVideoTitle} />
      <Field label="Video URL" value={videoUrl} onChangeText={setVideoUrl} />
      <TouchableOpacity style={styles.btn} onPress={saveVideo}>
        <Text style={styles.btnText}>{editingVideo ? 'Update Video' : 'Save Video'}</Text>
      </TouchableOpacity>
      {renderList(videos, editVideo, deleteVideo)}
    </ScrollView>
  );

  /* ================= RETURN ================= */
  return (
    <LinearGradient colors={['#020617', '#0f172a']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Admin Panel</Text>
          <View style={{ width: 22 }} />
        </View>

        <TabView
          navigationState={{ index, routes }}
          renderScene={({ route }) => {
            if (route.key === 'prayer') return PrayerTab;
            if (route.key === 'audio') return AudioTab;
            if (route.key === 'video') return VideoTab;
          }}
          onIndexChange={setIndex}
          renderTabBar={p => (
            <TabBar
              {...p}
              indicatorStyle={{ backgroundColor: '#22c55e' }}
              style={{ backgroundColor: '#020617' }}
            />
          )}
          lazy={false}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

export default AddPrayerTabsScreen;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderColor: '#1e293b' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  container: { padding: 20 },
  sectionTitle: { color: '#e5e7eb', fontSize: 16, fontWeight: '700', marginBottom: 15 },
  field: { marginBottom: 14 },
  label: { color: '#94a3b8', fontSize: 13, marginBottom: 6 },
  input: { backgroundColor: '#020617', borderWidth: 1, borderColor: '#334155', borderRadius: 10, padding: 12, color: '#fff', marginBottom: 10 },
  btn: { backgroundColor: '#22c55e', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontWeight: '800' },
  card: { backgroundColor: '#020617', borderWidth: 1, borderColor: '#1e293b', padding: 14, borderRadius: 12, marginTop: 14 },
  cardTitle: { color: '#fff', fontWeight: '700' },
  cardContent: { color: '#94a3b8', marginTop: 6 },
  row: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
  editBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eab308', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, marginRight: 10 },
  editText: { marginLeft: 6, fontWeight: '700', color: '#000' },
  delBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ef4444', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  delText: { marginLeft: 6, fontWeight: '700', color: '#fff' },
});

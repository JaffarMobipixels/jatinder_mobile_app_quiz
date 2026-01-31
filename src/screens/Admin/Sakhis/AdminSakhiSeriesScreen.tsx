import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  ScrollView,
  Animated,
  StatusBar,
} from 'react-native';
import database from '@react-native-firebase/database';
import LinearGradient from 'react-native-linear-gradient';

type Sakhi = {
  id: string;
  title: string;
  subtitle: string;
};

const AdminSakhiSeriesScreen = ({ navigation }: any) => {
  const [sakhis, setSakhis] = useState<Sakhi[]>([]);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const scale = useRef(new Animated.Value(1)).current;

  // ================= FETCH SAKHIS =================
  useEffect(() => {
    const ref = database().ref('SakhiSeries');
    const listener = ref.on('value', snapshot => {
      const data = snapshot.val() || {};
      const list = Object.keys(data).map(key => ({
        id: key,
        title: data[key].title,
        subtitle: data[key].subtitle,
      }));
      setSakhis(list);
    });
    return () => ref.off('value', listener);
  }, []);

  // ================= SAVE / UPDATE =================
  const saveSakhi = () => {
    if (!title.trim() || !subtitle.trim())
      return Alert.alert('Error', 'All fields are required');

    if (editingId) {
      const ref = database().ref(`SakhiSeries/${editingId}`);
      ref.update({ title, subtitle })
        .then(() => {
          Alert.alert('Updated', 'Sakhi updated successfully');
          setSakhis(prev =>
            prev.map(s => (s.id === editingId ? { ...s, title, subtitle } : s))
          );
          setEditingId(null);
          setTitle('');
          setSubtitle('');
        })
        .catch(err => Alert.alert('Error', err.message));
    } else {
      const ref = database().ref('SakhiSeries').push();
      ref.set({ title, subtitle })
        .then(() => {
          Alert.alert('Added', 'Sakhi added successfully');
          setTitle('');
          setSubtitle('');
        })
        .catch(err => Alert.alert('Error', err.message));
    }
  };

  // ================= EDIT =================
  const editSakhi = (sakhi: Sakhi) => {
    setTitle(sakhi.title);
    setSubtitle(sakhi.subtitle);
    setEditingId(sakhi.id);
  };

  // ================= DELETE =================
  const deleteSakhi = (id: string) => {
    Alert.alert('Confirm', 'Are you sure you want to delete?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          database().ref(`SakhiSeries/${id}`).remove();
          setSakhis(prev => prev.filter(s => s.id !== id));
        },
      },
    ]);
  };

  // ================= READ MORE / LESS =================
  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedIds(newSet);
  };

  // ================= BUTTON ANIMATION =================
  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  // ================= RENDER ITEM =================
  const renderItem = ({ item }: { item: Sakhi }) => {
    const isExpanded = expandedIds.has(item.id);
    const previewText = item.subtitle.split('\n').slice(0, 6).join('\n');

    return (
      <LinearGradient
        colors={['#1E3A8A', '#0F172A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <Text style={styles.title}>{item.title}</Text>

        <Text style={styles.subtitle}>
          {isExpanded ? item.subtitle : previewText}
        </Text>

        {item.subtitle.split('\n').length > 6 && (
          <TouchableOpacity onPress={() => toggleExpand(item.id)}>
            <Text style={styles.readMore}>
              {isExpanded ? 'Read Less ▲' : 'Read More ▼'}
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.cardBtnRow}>
          <TouchableOpacity onPress={() => editSakhi(item)}>
            <LinearGradient
              colors={['#34D399', '#10B981']}
              style={styles.smallBtn}
            >
              <Text style={styles.smallBtnText}>Edit</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => deleteSakhi(item.id)}>
            <LinearGradient
              colors={['#F87171', '#EF4444']}
              style={styles.smallBtn}
            >
              <Text style={styles.smallBtnText}>Delete</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Toolbar with Back Button */}
      <LinearGradient colors={['#4F46E5', '#6366F1']} style={styles.toolbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.toolbarTitle}>📖 Sakhi Series Admin</Text>
        <View style={{ width: 30 }} /> {/* placeholder to center title */}
      </LinearGradient>

      {/* Header */}
      <Text style={styles.header}>Manage Sakhi Series</Text>

      {/* ====== INPUT FIELDS ====== */}
      <TextInput
        placeholder="Sakhi Title"
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholderTextColor="#aaa"
      />
      <TextInput
        placeholder="Sakhi Subtitle"
        style={[styles.input, { height: 120 }]}
        value={subtitle}
        onChangeText={setSubtitle}
        multiline
        placeholderTextColor="#aaa"
      />

      {/* ====== SAVE BUTTON ====== */}
      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          onPress={saveSakhi}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBtn}
          >
            <Text style={styles.btnText}>
              {editingId ? 'Update Sakhi' : 'Add Sakhi'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* ====== LIST OF SAKHIS ====== */}
      <FlatList
        data={sakhis}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingTop: 20 }}
      />
    </ScrollView>
  );
};

export default AdminSakhiSeriesScreen;

// ================= STYLES =================
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#0F172A' },
  toolbar: {
    height: 70,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 45,
    paddingHorizontal: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
  },
  backBtn: { width: 30 },
  backText: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  toolbarTitle: { color: '#fff', fontSize: 20, fontWeight: '900', textAlign: 'center', flex: 1 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center', color: '#FFD700' },
  input: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderColor: '#6366F1',
    backgroundColor: '#1F2937',
    color: '#EDEDED',
    fontSize: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  gradientBtn: {
    borderRadius: 25,
    height: 60,
    marginTop: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  btnText: { color: '#fff', textAlign: 'center', marginTop: 20, fontWeight: '800', fontSize: 16 },
  card: {
    borderRadius: 22,
    marginBottom: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    backgroundColor: '#1E3A8A',
  },
  title: { fontSize: 18, margin: 20, fontWeight: 'bold', color: '#FFD700', marginBottom: 6 },
  subtitle: { fontSize: 14, margin: 20, color: '#E5E7EB', lineHeight: 22 },
  readMore: { marginTop: 14, margin: 20, fontSize: 14, color: '#38BDF8', fontWeight: '700' },
  cardBtnRow: { flexDirection: 'row', margin: 20, justifyContent: 'space-between', marginTop: 12 },
  smallBtn: {
    borderRadius: 16,
    height: 40,
    width: 60,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  smallBtnText: { color: '#0F172A', textAlign: 'center', marginTop: 10, fontWeight: '700', fontSize: 14 },
});

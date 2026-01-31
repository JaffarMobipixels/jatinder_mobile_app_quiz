import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import database from '@react-native-firebase/database';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const CharadesWordsManager = ({ route, navigation }: any) => {
  // Params se data le rahe hain
  const { categoryId, categoryName } = route.params; 
  
  const [words, setWords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH WORDS FROM CharadesWord NODE ================= */
  useEffect(() => {
    // Path updated to CharadesWord/${categoryId}/words
    const ref = database().ref(`CharadesWord/${categoryId}/words`);

    const onValueChange = ref.on('value', snapshot => {
      const data = snapshot.val() || {};
     const list = Object.keys(data).map(key => ({
     id: key,
     word: data[key].word,
          }));
     setWords(list.reverse()); // 👈 ORDER FIX

      setWords(list);
      setLoading(false);
    });

    

    return () => ref.off('value', onValueChange);
  }, [categoryId]);

  /* ================= DELETE ACTION ================= */
  const deleteWord = (wordId: string) => {
    database()
      .ref(`CharadesWord/${categoryId}/words/${wordId}`) // Updated Path
      .remove()
      .then(() => {
        Alert.alert('Deleted', 'Word successfully removed!');
      })
      .catch(err => {
        Alert.alert('Error', 'Could not delete word');
      });
  };

  const confirmDelete = (wordId: string, wordText: string) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete "${wordText}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => deleteWord(wordId) 
        },
      ],
    );
  };

  return (
    <LinearGradient colors={['#0F2027', '#203A43', '#2C5364']} style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* ---------- HEADER ---------- */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={26} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>{categoryName}</Text>
          <Text style={styles.headerSubTitle}>{words.length} Words in this deck</Text>
        </View>
      </View>

      {/* ---------- WORDS LIST ---------- */}
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <FlatList
          data={words}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listPadding}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centerBox}>
              <Icon name="emoticon-sad-outline" size={60} color="#64748b" />
              <Text style={styles.emptyText}>No words found in this category.</Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <View style={styles.wordCard}>
              <View style={styles.wordInfo}>
                <View style={styles.numberBadge}>
                  <Text style={styles.numberText}>{index + 1}</Text>
                </View>
                <Text style={styles.wordText}>{item.word}</Text>
              </View>

              <TouchableOpacity 
                style={styles.deleteAction}
                onPress={() => confirmDelete(item.id, item.word)}
              >
                <Icon name="trash-can-outline" size={24} color="#EF4444" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </LinearGradient>
  );
};

export default CharadesWordsManager;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    marginTop:30,
    paddingBottom: 20,
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 10,
    borderRadius: 12,
    marginRight: 15,
  },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#fff' },
  headerSubTitle: { fontSize: 14, color: '#94a3b8', fontWeight: '600' },
  listPadding: { paddingHorizontal: 20, paddingBottom: 40 },
  wordCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    marginBottom: 12,
    elevation: 8,
  },
  wordInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  numberBadge: {
    backgroundColor: '#EFF6FF',
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  numberText: { color: '#3B82F6', fontWeight: '800' },
  wordText: { fontSize: 17, fontWeight: '700', color: '#1e293b', flex: 1 },
  deleteAction: { padding: 5 },
  centerBox: { marginTop: 100, alignItems: 'center', paddingHorizontal: 40 },
  emptyText: {
    color: '#94a3b8',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
  },
});
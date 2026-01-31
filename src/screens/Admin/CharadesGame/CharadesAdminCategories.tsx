import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import database from '@react-native-firebase/database';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const CharadesAdminCategories = ({ navigation }: any) => {
  const [categories, setCategories] = useState<any[]>([]);

  /* ================= FETCH FROM CharadesWord NODE ================= */
  useEffect(() => {
    const ref = database().ref('CharadesWord');
    
   const onValueChange = ref.on('value', snapshot => {
  const data = snapshot.val() || {};

  const list = Object.keys(data)
    .filter(key => data[key].catname) // sirf valid categories
    .reverse() // 👈 ORDER FIX (new neeche jayega)
    .map((key, index) => ({
      id: key,
      name: data[key].catname,
      number: index + 1, // 👈 correct numbering
    }));

  setCategories(list);
});


    return () => ref.off('value', onValueChange);
  }, []);

  /* ================= DELETE CATEGORY FUNCTION ================= */
  const deleteCategory = (id: string, name: string) => {
    Alert.alert(
      'Delete Category',
      `All words under ${name} category will be permanently removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            database().ref(`CharadesWord/${id}`).remove()
              .then(() => Alert.alert('Success', 'Category removed.'));
          },
        },
      ]
    );
  };

  return (
    <LinearGradient colors={['#0F2027', '#203A43', '#2C5364']} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-left" size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Manage Decks</Text>
          <View style={{ width: 40 }} /> 
        </View>

        <FlatList
          data={categories}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Koi category nahi mili. Dashboard se banayein.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <TouchableOpacity
                style={styles.mainCard}
                onPress={() => navigation.navigate('CharadesWordsManager', {
                  categoryId: item.id,
                  categoryName: item.name,
                })}
              >
                <LinearGradient colors={['#F8FAFC', '#EEF2FF']} style={styles.cardGradient}>
                  <View style={styles.cardContent}>
                    <View style={styles.nameSection}>
                      <Text style={styles.indexText}>{item.number}.</Text>
                      <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
                    </View>
                    <Icon name="chevron-right" size={24} color="#3B82F6" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              {/* DELETE ICON SIDE BUTTON */}
              <TouchableOpacity 
                style={styles.deleteSideBtn}
                onPress={() => deleteCategory(item.id, item.name)}
              >
                <Icon name="trash-can-outline" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </LinearGradient>
  );
};

export default CharadesAdminCategories;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginTop: 60,
    marginBottom: 20 
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 8,
    borderRadius: 10,
  },
  title: { fontSize: 24, fontWeight: '900', color: '#fff' },
  cardWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  mainCard: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 5,
  },
  cardGradient: {
    height:60,
  },
  cardContent: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  nameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  indexText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#3B82F6',
   margin:20,
  },
  cardTitle: { 
    fontSize: 18, 
    fontWeight: '800',
    color: '#1e293b',
    flex: 1,
  },
  deleteSideBtn: {
    backgroundColor: '#EF4444',
    padding: 15,
    borderRadius: 15,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#94a3b8',
    marginTop: 50,
    fontSize: 16,
  },
});
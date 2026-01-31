import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
} from 'react-native';
import database from '@react-native-firebase/database';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather'; // <-- icon for back button

const QuizCategoriesScreen = ({ navigation }: any) => {
  const [categories, setCategories] = useState<any[]>([]);

  /* ================= FETCH CATEGORIES ================= */
  useEffect(() => {
    const ref = database().ref('Quiz');

    ref.on('value', snapshot => {
      const data = snapshot.val() || {};
      const list = Object.keys(data).map((key, index) => ({
        id: key,
        name: data[key].catname,
        number: index + 1,
      }));
      setCategories(list);
    });

    return () => ref.off();
  }, []);

  /* ================= DELETE ================= */
  const deleteCategory = (categoryId: string) => {
    database().ref(`Quiz/${categoryId}`).remove();
  };

  const confirmDelete = (categoryId: string) => {
    Alert.alert(
      'Delete Category',
      'All quizzes under this category will be permanently removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteCategory(categoryId),
        },
      ],
    );
  };

  return (
    <LinearGradient colors={['#0F2027', '#203A43', '#2C5364']} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />

      <View style={styles.container}>
        {/* ================= BACK BUTTON + TITLE ================= */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Quiz Categories</Text>
        </View>

        <FlatList
          data={categories}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => (
            <LinearGradient
              colors={['#F8FAFC', '#EEF2FF']}
              style={styles.card}
            >
              {/* CATEGORY CLICK */}
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('QuizList', {
                    categoryId: item.id,
                    categoryName: item.name,
                  })
                }
                activeOpacity={0.8}
              >
                <Text style={styles.cardTitle}>
                  {item.number}. {item.name}
                </Text>
                <Text style={styles.subText}>
                  Tap to view quizzes
                </Text>
              </TouchableOpacity>

              {/* DELETE */}
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => confirmDelete(item.id)}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </LinearGradient>
          )}
        />
      </View>
    </LinearGradient>
  );
};

export default QuizCategoriesScreen;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 20,
  },

  backBtn: {
    marginRight: 12,
    padding: 4,
  },

  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'left',
    letterSpacing: 1,
  },

  card: {
    borderRadius: 22,
    padding: 18,
    height: "160",

    // 3D depth
    elevation: 14,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },

  subText: {
    fontSize: 13,
    color: '#475569',
    marginTop: 4,
  },

  deleteBtn: {
    marginTop: 14,
    alignSelf: 'flex-start',
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,

    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },

  deleteText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.5,
  },
});

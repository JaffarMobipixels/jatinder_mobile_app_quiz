import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import database from '@react-native-firebase/database';

export default function CategoryScreen({ navigation }: any) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = database().ref('Quiz');
    ref.on('value', snapshot => {
      const data = snapshot.val() || {};
      const list = Object.keys(data).map(key => ({
        key,
        catname: data[key].catname,
        hasQuizzes: !!data[key].quizzes,
      }));
      setCategories(list);
      setLoading(false);
    });

    return () => ref.off();
  }, []);

  const handleCategoryPress = (categoryKey: string, categoryName: string) => {
    navigation.navigate('AllQuestionsScreen', {
      categoryId: categoryKey,
      categoryName,
    });
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1F44" />

      {/* ---------- HEADER ---------- */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtnHeader} onPress={handleBack}>
          <Icon name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quiz App</Text>
      </View>

      {/* ---------- SELECT TITLE ---------- */}
      <Text style={styles.selectTitle}>Select a Category</Text>

      {/* ---------- CATEGORY LIST ---------- */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 }}>
          <ActivityIndicator size="large" color="#FFD700" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30, paddingHorizontal: 20 }}
        >
          {categories.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => handleCategoryPress(item.key, item.catname)}
            >
              <View style={styles.cardInner}>
                <Text style={styles.cardText}>{item.catname}</Text>
                <Icon name="chevron-right" size={28} color="#fff" />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

/* ===================== STYLES ===================== */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A1F44',
  },

  /* ---------- HEADER ---------- */
  header: {
    width: '100%',
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
   
    marginBottom: 20,
  },
  backBtnHeader: {
    position: 'absolute',
    left: 20,
    top: '50%',
    transform: [{ translateY: -21 }],
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  /* ---------- SELECT TITLE ---------- */
  selectTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 30,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  /* ---------- CATEGORY CARD ---------- */
  card: {
    marginBottom: 18,
    borderRadius: 20,
    backgroundColor: '#1E3A8A',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 22,
    paddingHorizontal: 24,
  },
  cardText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});

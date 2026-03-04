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
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import database from '@react-native-firebase/database';
import { CommonActions } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const CharadesCategory = ({ navigation }: any) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = database().ref('CharadesWord');
    const onValueChange = ref.on('value', snapshot => {
      const data = snapshot.val() || {};

      const list = Object.keys(data)
        .map(key => ({
          key,
          catname: data[key].catname,
        }))
        .reverse(); // new category last

      setCategories(list);
      setLoading(false);
    });

    return () => ref.off('value', onValueChange);
  }, []);

  const handleCategoryPress = (categoryKey: string, categoryName: string) => {
    navigation.navigate('CharadesPlay', {
      categoryId: categoryKey,
      categoryName,
    });
  };

  const handleBack = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'CharadesHome' }],
      })
    );
  };

  return (
    <LinearGradient
      colors={['#0A1F44', '#1E3A8A', '#0F172A']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

        {/* ---------- HEADER ---------- */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtnHeader} onPress={handleBack}>
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sikh Virsa</Text>
        </View>

        {/* ---------- TITLE ---------- */}
        <View style={styles.titleWrapper}>
          <Text style={styles.selectTitle}>Select Category</Text>
          <View style={styles.underline} />
        </View>

        {/* ---------- CATEGORY LIST ---------- */}
        {loading ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loaderText}>Loading Decks...</Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContainer}
          >
            {categories.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={styles.card}
                activeOpacity={0.8}
                onPress={() => handleCategoryPress(item.key, item.catname)}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                  style={styles.cardInner}
                >
                  {/* Only category text */}
                  <Text style={styles.cardText}>{item.catname}</Text>
                  <Icon name="chevron-right" size={26} color="rgba(255,255,255,0.5)" />
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <Text style={styles.footerNote}>Tilt phone to start the game!</Text>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default CharadesCategory;

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },

  /* ---------- HEADER ---------- */
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    marginTop: 55,
    position: 'relative',
  },
  backBtnHeader: {
    position: 'absolute',
    left: 20,
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 4,
  },

  /* ---------- TITLE ---------- */
  titleWrapper: {
    alignItems: 'center',
    marginVertical: 20,
  },
  selectTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  underline: {
    width: 50,
    height: 4,
    backgroundColor: '#3B82F6',
    borderRadius: 2,
    marginTop: 5,
  },

  /* ---------- LOADER ---------- */
  loaderBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { color: '#3B82F6', marginTop: 10, fontWeight: '600' },

  /* ---------- LIST ---------- */
  scrollContainer: { paddingHorizontal: 20, paddingBottom: 30 },
  card: {
    marginBottom: 15,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  cardInner: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 20, // added padding for text
  },
  cardText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  footerNote: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.3)',
    fontSize: 12,
    marginBottom: 10,
    fontWeight: '600',
  },
});
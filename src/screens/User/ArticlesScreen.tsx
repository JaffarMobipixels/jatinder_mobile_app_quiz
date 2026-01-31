import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import database from '@react-native-firebase/database';

type ArticleType = {
  id: string;
  title: string;
};

const ArticlesScreen = ({ navigation }: any) => {
  const [articles, setArticles] = useState<ArticleType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = database().ref('Articles');
    const onValueChange = ref.on('value', snapshot => {
      const data = snapshot.val() || {};
    const formattedArticles: ArticleType[] = Object.keys(data)
  .map(key => ({
    id: key,
    title: data[key].title,
  }));

      setArticles(formattedArticles);
      setLoading(false);
    });

    return () => ref.off('value', onValueChange);
  }, []);

  const renderItem = ({ item }: { item: ArticleType }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() =>
        navigation.navigate('ArticleDetailScreen', { articleId: item.id })
      }
    >
      <LinearGradient
        colors={['#0A1F44', '#1E3A8A', '#0F172A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.left}>
          <View style={styles.iconBox}>
            <Text style={{ fontSize: 22 }}>📖</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{item.title}</Text>
          </View>
        </View>

        <Feather  name="chevron-right" size={22} color="#fff"  style={{ marginRight: 15 }}
/>

      </LinearGradient>
    </TouchableOpacity>
  );

  if (loading)
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1F44" />

      {/* HEADER */}
      <LinearGradient
        colors={['#0A1F44', '#1E3A8A', '#0F172A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Articles</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      {/* Quote */}
      <View style={styles.quoteBox}>
        <Text style={styles.quote}>
          “The stories of one’s ancestors make the children good children.”
        </Text>
        <Text style={styles.quoteRef}>Guru Granth Sahib Ji (951)</Text>
      </View>

      {/* List */}
      <FlatList
        data={articles}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default ArticlesScreen;

/* ===================== STYLES (3D Modern + Dark Blue & White) ===================== */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A1F44',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A1F44',
  },
   header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 70,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 25,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 10,
  },

  backBtn: {
    width: 40,
    height: 40,
    
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    flex: 1,
    textAlign: 'center',
    marginRight:20,
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
   /* ===== QUOTE ===== */
  quoteBox: {
    padding: 14,
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 6,
    backgroundColor: '#1E3A8A',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 8,
  },

  quote: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  quoteRef: {
    color: '#FFD700',
    marginTop: 6,
    fontSize: 13,
    fontWeight: '700',
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    marginBottom: 14,
    height: 80,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 10,
  },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1   , marginLeft:20,},
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#ffffff33',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  title: { fontSize: 15, fontWeight: '800', color: '#fff' },
});

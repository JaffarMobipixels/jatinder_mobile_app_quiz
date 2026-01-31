import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
// 1. Safe Area Insets import kiya
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import database from '@react-native-firebase/database';
 
type ArticleType = {
  id: string;
  title: string;
  description: string;
};
 
const ArticleDetailScreen = ({ route, navigation }: any) => {
  const { articleId } = route.params;
  const [article, setArticle] = useState<ArticleType | null>(null);
  const [loading, setLoading] = useState(true);
 
  // 2. Insets hook call kiya
  const insets = useSafeAreaInsets();
 
  useEffect(() => {
    const ref = database().ref(`Articles/${articleId}`);
    const onValueChange = ref.on('value', snapshot => {
      const data = snapshot.val();
      if (data) {
        setArticle({
          id: articleId,
          title: data.title,
          description: data.description,
        });
      }
      setLoading(false);
    });
 
    return () => ref.off('value', onValueChange);
  }, [articleId]);
 
  if (loading)
    return (
      <View style={styles.loader}>
        <ActivityIndicator color="#FF6A00" size="large" />
      </View>
    );
 
  if (!article)
    return (
      <View style={[styles.mainContainer, { paddingTop: insets.top + 50 }]}>
        <Text style={styles.notFoundText}>Article not found</Text>
      </View>
    );
 
  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
 
      {/* ---------- RESPONSIVE HEADER ---------- */}
      <View style={{ paddingTop: insets.top + 10 }}>
        <LinearGradient
          colors={['#FF6A00', '#FFB347']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{article.title}</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>
      </View>
 
      {/* ---------- Article Content ---------- */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 20 }]}
      >
        <View style={styles.card}>
          <Text style={styles.content}>{article.description}</Text>
        </View>
      </ScrollView>
    </View>
  );
};
 
const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#0A1F44' },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A1F44',
  },
  notFoundText: { color: '#fff', textAlign: 'center', fontSize: 18 },
 
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    borderRadius: 25,
    height:100,
    
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    marginBottom:25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
    marginBottom:25,
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 10,
  },
 
  container: {
    padding: 20,
    alignItems: 'center',
  },
 
  card: {
    width: '100%',
    borderRadius: 25,
    padding: 25,
    backgroundColor: '#112255',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
 
  content: {
    fontSize: 18,
    lineHeight: 30,
    color: '#FFF',
    textAlign: 'justify',
  },
});
 
export default ArticleDetailScreen;
 
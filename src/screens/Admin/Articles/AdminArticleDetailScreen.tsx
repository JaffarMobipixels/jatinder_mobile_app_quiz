import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import database from '@react-native-firebase/database';
 
const ArticleDetailScreen = ({ route, navigation }: any) => {
  const { articleId } = route.params; // e.g. "article_01"
 
  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState<any>(null);
 
  useEffect(() => {
    const reference =database().ref(`/articles/${articleId}`);
 
 
 
    const onValueChange = reference.on('value', snapshot => {
      const data = snapshot.val();
      if (data) {
        setArticle(data);
      } else {
        setArticle(null);
      }
      setLoading(false);
    });
 
    return () => reference.off('value', onValueChange);
  }, [articleId]);
 
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color="#FFD700" />
      </SafeAreaView>
    );
  }
 
  if (!article) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.notFoundText}>Article not found</Text>
      </SafeAreaView>
    );
  }
 
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER */}
      <LinearGradient colors={['#FF6A00', '#FFB347']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{article.title}</Text>
      </LinearGradient>
 
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          {article.subtitle && (
            <Text style={styles.subtitle}>{article.subtitle}</Text>
          )}
 
          {/* content, moral, reference fields abhi data me nahi hain, optional */}
          {article.content && <Text style={styles.content}>{article.content}</Text>}
          {article.moral && (
            <View style={styles.moralBox}>
              <Text style={styles.moralTitle}>Moral of the Article</Text>
              <Text style={styles.moralText}>{article.moral}</Text>
            </View>
          )}
          {article.reference && (
            <Text style={styles.reference}>{article.reference}</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
 
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0A1F44' },
  notFoundText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
  },
 
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    marginTop: 40,
    marginHorizontal: 20,
    borderRadius: 20,
  },
  backBtn: {
    padding: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
    marginLeft: 15,
  },
 
  container: {
    padding: 20,
    paddingBottom: 40,
  },
 
  card: {
    backgroundColor: '#112255',
    borderRadius: 20,
    padding: 20,
  },
 
  subtitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFD700',
    marginBottom: 15,
  },
 
  content: {
    fontSize: 15,
    lineHeight: 24,
    color: '#E5E7EB',
  },
 
  moralBox: {
    backgroundColor: '#1E3A8A',
    padding: 18,
    borderRadius: 18,
    marginTop: 25,
  },
 
  moralTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFD700',
    marginBottom: 8,
  },
 
  moralText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#fff',
  },
 
  reference: {
    marginTop: 25,
    fontSize: 13,
    fontWeight: '700',
    color: '#A5B4FC',
    textAlign: 'center',
  },
});
 
export default ArticleDetailScreen;
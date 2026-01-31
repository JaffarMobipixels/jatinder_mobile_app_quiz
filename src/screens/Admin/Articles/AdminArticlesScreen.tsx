import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import database from '@react-native-firebase/database';
import { useNavigation } from '@react-navigation/native';

const AdminArticlesScreen = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const [articles, setArticles] = useState<any[]>([]);
  const [editingArticle, setEditingArticle] = useState<any>(null);

  const navigation = useNavigation();

  // 🔹 Fetch Articles from Firebase
  useEffect(() => {
    const articleRef = database().ref('Articles');
    const listener = articleRef.on('value', snapshot => {
      const data = snapshot.val() || {};
      const list = Object.keys(data)
        .map(key => ({ id: key, ...data[key] }))
        .reverse(); // newest on top
      setArticles(list);
    });

    return () => articleRef.off('value', listener);
  }, []);

  // 🔹 Upload / Update Article
  const uploadArticle = async () => {
    if (!title || !description) {
      Alert.alert('Error', 'Title and Description are required');
      return;
    }

    try {
      setLoading(true);
      const id = editingArticle?.id;
      const articleRef = id
        ? database().ref(`Articles/${id}`)
        : database().ref('Articles').push();

      await articleRef.set({
        title,
        description,
        createdAt: Date.now(),
      });

      setLoading(false);
      setTitle('');
      setDescription('');
      setEditingArticle(null);
      Alert.alert('Success', `Article ${id ? 'updated' : 'uploaded'} successfully`);
    } catch (error: any) {
      setLoading(false);
      console.log(error);
      Alert.alert('Error', 'Failed to upload article');
    }
  };

  // 🔹 Edit Article
  const editArticle = (article: any) => {
    setEditingArticle(article);
    setTitle(article.title);
    setDescription(article.description);
  };

  // 🔹 Delete Article
  const deleteArticle = (id: string) => {
    Alert.alert(
      'Delete Article',
      'Are you sure you want to delete this article?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => database().ref(`Articles/${id}`).remove(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* 🔹 Header with Back Button */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.header}>Admin Articles Panel</Text>
          <View style={{ width: 24 }} /> {/* Placeholder to center header */}
        </View>

        {/* 🔹 Inputs */}
        <TextInput
          placeholder="Article Title"
          style={styles.input}
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          placeholder="Article Description"
          style={[styles.input, { height: 120 }]}
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <TouchableOpacity onPress={uploadArticle}>
          <LinearGradient
            colors={['#43e97b', '#38f9d7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <Text style={styles.btnText}>
              {loading ? 'Uploading...' : editingArticle ? 'Update Article' : 'Upload Article'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* 🔹 Display Articles */}
        <Text style={styles.sectionTitle}>All Articles</Text>
        {articles.map(article => (
          <View key={article.id} style={styles.articleCard}>
            <Text style={styles.articleTitle}>{article.title}</Text>
            <Text style={styles.articleDesc}>{article.description}</Text>

            <View style={styles.row}>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => editArticle(article)}
              >
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.delBtn}
                onPress={() => deleteArticle(article.id)}
              >
                <Text style={styles.delText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminArticlesScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e0eafc' },

  // 🔹 Header styles
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backIcon: { fontSize: 24, color: '#333', fontWeight: 'bold' },
  header: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', color: '#333', flex: 1 },

  input: {
    borderWidth: 1,
    borderColor: '#d1d1d1',
    borderRadius: 16,
    padding: 12,
    marginVertical: 10,
    backgroundColor: '#fff',
  },
  button: {
    borderRadius: 20,
    height: 50,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },

  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 25, marginBottom: 10 },

  articleCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#d1d1d1',
  },
  articleTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  articleDesc: { fontSize: 14, color: '#555', marginTop: 6 },

  row: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  editBtn: { backgroundColor: '#fbbf24', padding: 8, borderRadius: 8, marginRight: 10 },
  editText: { fontWeight: 'bold', color: '#000' },
  delBtn: { backgroundColor: '#ef4444', padding: 8, borderRadius: 8 },
  delText: { fontWeight: 'bold', color: '#fff' },
});

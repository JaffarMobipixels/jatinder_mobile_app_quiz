import React, { useState, useLayoutEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../Dashboard/AppAdmin';
import database from '@react-native-firebase/database';
 
type Props = NativeStackScreenProps<AdminStackParamList, 'AddArticle'>;
 
const AddArticleScreen: React.FC<Props> = ({ navigation, route }) => {
  const article = route.params?.article;
 
  const [title, setTitle] = useState(article?.title || '');
  const [content, setContent] = useState(article?.content || '');
  const [saving, setSaving] = useState(false);
 
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, []);
 
  const handleSave = async () => {
    if (!title || !content) {
      Alert.alert('Error', 'Title & Content are required');
      return;
    }
 
    setSaving(true);
 
    try {
      if (article?.id) {
        // UPDATE
        await database().ref(`/articles/${article.id}`).update({ title, content });
        Alert.alert('Success', 'Article Updated', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        // ADD NEW
        const newRef = database().ref('/articles').push();
        await newRef.set({ title, content });
        Alert.alert('Success', 'Article Added', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      console.log('Firebase Error:', error);
      Alert.alert('Error', 'Something went wrong!');
    }
 
    setSaving(false);
  };
 
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={['#0f2027', '#203a43', '#2c5364']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
 
        <Text style={styles.headerTitle}>{article ? 'Edit Article' : 'Add Article'}</Text>
 
        <View style={{ width: 24 }} />
      </LinearGradient>
 
      <View style={styles.form}>
        <TextInput
          placeholder="Article Title"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />
 
        <TextInput
          placeholder="Article Content"
          value={content}
          onChangeText={setContent}
          style={[styles.input, { height: 140 }]}
          multiline
        />
 
        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveText}>{article ? 'Update Article' : 'Save Article'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
 
export default AddArticleScreen;
 
const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, elevation: 10, justifyContent: 'space-between' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  form: { padding: 20 },
  input: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 16, elevation: 4, fontSize: 15 },
  saveBtn: { backgroundColor: '#22c55e', padding: 16, borderRadius: 16, alignItems: 'center', elevation: 8 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
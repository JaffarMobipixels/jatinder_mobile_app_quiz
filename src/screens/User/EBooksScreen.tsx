import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import database from '@react-native-firebase/database';
import { getAuth } from '@react-native-firebase/auth';

type BookType = {
  id: string;
  title: string;
  author: string;
  pdfUrl: string;
  imageUrl?: string;
  totalPages?: number;
};

const EBooksScreen = ({ navigation }: any) => {
  const [books, setBooks] = useState<BookType[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<{ [key: string]: number }>({}); // bookId -> percent

  useEffect(() => {
    const ref = database().ref('EBooks');
    const onValueChange = ref.on('value', snapshot => {
      const data = snapshot.val() || {};
      const formattedBooks: BookType[] = Object.keys(data).map(key => ({
        id: key,
        title: data[key].title,
        author: data[key].author,
        imageUrl: data[key].imageUrl,
        pdfUrl: data[key].pdfUrl,
        totalPages: data[key].totalPages || 50, // optional: default 50 pages
      }));
      setBooks(formattedBooks);
      setLoading(false);
    });

    return () => ref.off('value', onValueChange);
  }, []);

  // Load user progress
  useEffect(() => {
    const currentUser = getAuth().currentUser;
    if (!currentUser) return;

    const progressRef = database().ref(`UserProgress/${currentUser.uid}`);
    const onProgress = progressRef.on('value', snapshot => {
      const data = snapshot.val() || {};
      const progressObj: { [key: string]: number } = {};
      Object.keys(data).forEach(bookId => {
        progressObj[bookId] = data[bookId].progressPercent || 0;
      });
      setProgress(progressObj);
    });

    return () => progressRef.off('value', onProgress);
  }, []);

  const renderBook = ({ item }: { item: BookType }) => (
    <TouchableOpacity
      style={styles.bookCard}
      activeOpacity={0.85}
      onPress={() => {
        navigation.navigate('PdfViewerScreen', {
          pdfUrl: item.pdfUrl,
          title: item.title,
          id: item.id,
          totalPages: item.totalPages || 50,
        });
      }}
    >
      <LinearGradient
        colors={['#0A1F44', '#1E3A8A', '#0F172A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.bookImageContainer}
      >
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.bookImage} />
        ) : (
          <Text style={{ color: '#fff', textAlign: 'center' }}>No Image</Text>
        )}
      </LinearGradient>

      <Text style={styles.bookTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.bookAuthor}>{item.author}</Text>

      {/* Progress Bar */}
      <View style={styles.progressBarBackground}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${progress[item.id] || 0}%` },
          ]}
        />
      </View>
      <Text style={styles.progressText}>{progress[item.id] || 0}% read</Text>
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
      {/* HEADER */}
      <LinearGradient
        colors={['#0A1F44', '#1E3A8A', '#0F172A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerContainer}
      >
        <Feather
          name="arrow-left"
          size={26}
          color="#fff"
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>E-Books</Text>
        <View style={{ width: 26 }} />
      </LinearGradient>

      <Text style={styles.subTitle}>Read & explore Sikh knowledge 📚</Text>

      <FlatList
        data={books}
        renderItem={renderBook}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default EBooksScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A1F44',
    paddingHorizontal: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A1F44',
  },
headerContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 16,
  borderRadius: 25,
  marginTop: 10,
  marginBottom: 12,
  shadowColor: '#000',
  shadowOpacity: 0.35,
  shadowOffset: { width: 0, height: 8 },
  shadowRadius: 12,
  elevation: 10,
  height: 60, // 👈 increase this to make header taller
},

  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  subTitle: {
    fontSize: 14,
    color: '#EDE7FF',
    marginBottom: 12,
    marginLeft: 4,
  },
  listContent: {
    paddingTop: 10,
    paddingBottom: 30,
  },
  bookCard: {
    width: '48%',
    marginBottom: 22,
    borderRadius: 25,
    padding: 10,
    backgroundColor: '#1E3A8A',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 10,
  },
  bookImageContainer: {
    height: 170,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 8,
  },
  bookImage: {
    width: '75%',
    height: '75%',
    resizeMode: 'contain',
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  bookAuthor: {
    fontSize: 12,
    color: '#FFF8DC',
    marginTop: 2,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#ccc',
    borderRadius: 4,
    marginTop: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 10,
    color: '#fff',
    marginTop: 2,
    textAlign: 'right',
  },
});

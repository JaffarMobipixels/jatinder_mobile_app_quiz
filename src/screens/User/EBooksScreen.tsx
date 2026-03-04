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
import auth from '@react-native-firebase/auth';

/* ================= TYPES ================= */

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
  const [progress, setProgress] = useState<any>({});
  const [userRole, setUserRole] = useState<string>('student');

  /* ===================================================
      FETCH BOOKS
  =================================================== */
  useEffect(() => {

    const ref = database().ref('EBooks');

    const listener = ref.on('value', snapshot => {

      const data = snapshot.val() || {};

      const bookList: BookType[] = Object.keys(data).map(key => ({
        id: key,
        title: data[key].title,
        author: data[key].author,
        pdfUrl: data[key].pdfUrl,
        imageUrl: data[key].imageUrl,
        totalPages: data[key].totalPages || 50,
      }));

      setBooks(bookList);
      setLoading(false);
    });

    return () => ref.off('value', listener);

  }, []);

  /* ===================================================
      FETCH USER ROLE (REALTIME ✅)
  =================================================== */
  useEffect(() => {

    const user = auth().currentUser;
    if (!user) return;

    const roleRef = database().ref(`users/${user.uid}/role`);

    const roleListener = roleRef.on('value', snapshot => {

      if (snapshot.exists()) {
        const role = snapshot.val();
        console.log('USER ROLE:', role);
        setUserRole(role);
      }
    });

    return () => roleRef.off('value', roleListener);

  }, []);

  /* ===================================================
      USER READING PROGRESS
  =================================================== */
  useEffect(() => {

    const user = auth().currentUser;
    if (!user) return;

    const progressRef =
      database().ref(`UserProgress/${user.uid}`);

    const listener = progressRef.on('value', snapshot => {

      const data = snapshot.val() || {};
      const obj: any = {};

      Object.keys(data).forEach(bookId => {
        obj[bookId] = data[bookId]?.progressPercent || 0;
      });

      setProgress(obj);
    });

    return () => progressRef.off('value', listener);

  }, []);

  /* ===================================================
      BOOK CARD
  =================================================== */
  const renderBook = ({ item }: { item: BookType }) => (

    <View style={styles.cardWrapper}>

      {/* BOOK */}
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.bookCard}
        onPress={() =>
          navigation.navigate('PdfViewerScreen', {
            pdfUrl: item.pdfUrl,
            title: item.title,
            id: item.id,
            totalPages: item.totalPages,
          })
        }
      >
        <LinearGradient
          colors={['#0A1F44', '#1E3A8A', '#0F172A']}
          style={styles.bookImageContainer}
        >
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.bookImage}
            />
          ) : (
            <Text style={{ color: '#fff' }}>No Image</Text>
          )}
        </LinearGradient>

        <Text style={styles.bookTitle}>{item.title}</Text>
        <Text style={styles.bookAuthor}>{item.author}</Text>

        {/* Progress */}
        <View style={styles.progressBg}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress[item.id] || 0}%` },
            ]}
          />
        </View>

        <Text style={styles.progressText}>
          {progress[item.id] || 0}% read
        </Text>
      </TouchableOpacity>

      {/* ===================================================
            ✅ TEACHER BUTTON
      =================================================== */}
      {(userRole === 'teacher' || userRole === 'admin') && (
        <TouchableOpacity
          style={styles.assignBtn}
          onPress={() =>
            navigation.navigate('AssignBookScreen', {
              book: item,
            })
          }
        >
          <Text style={styles.assignText}>
            Assign Task
          </Text>
        </TouchableOpacity>
      )}

    </View>
  );

  /* ===================================================
      LOADER
  =================================================== */
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  /* ===================================================
      UI
  =================================================== */
  return (
    <SafeAreaView style={styles.safeArea}>

      <LinearGradient
        colors={['#0A1F44', '#1E3A8A', '#0F172A']}
        style={styles.header}
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

      <FlatList
        data={books}
        renderItem={renderBook}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={{
          justifyContent: 'space-between',
        }}
        showsVerticalScrollIndicator={false}
      />

    </SafeAreaView>
  );
};

export default EBooksScreen;

/* ===================================================
      STYLES
=================================================== */

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

  header: {
    height: 60,
    borderRadius: 20,
    marginVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },

  cardWrapper: {
    width: '48%',
    marginBottom: 20,
  },

  bookCard: {
    backgroundColor: '#1E3A8A',
    borderRadius: 20,
    padding: 10,
  },

  bookImageContainer: {
    height: 160,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },

  bookImage: {
    width: '75%',
    height: '75%',
    resizeMode: 'contain',
  },

  bookTitle: {
    color: '#fff',
    fontWeight: '700',
    marginTop: 6,
  },

  bookAuthor: {
    color: '#FFD',
    fontSize: 12,
  },

  progressBg: {
    height: 6,
    backgroundColor: '#ccc',
    borderRadius: 4,
    marginTop: 6,
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },

  progressText: {
    fontSize: 10,
    color: '#fff',
    textAlign: 'right',
  },

  assignBtn: {
    backgroundColor: '#FFD700',
    marginTop: 6,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },

  assignText: {
    fontWeight: '700',
    color: '#000',
  },

});
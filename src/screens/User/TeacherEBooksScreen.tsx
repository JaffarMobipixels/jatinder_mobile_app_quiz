import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';

type BookType = {
  id: string;
  title: string;
  author: string;
  pdfUrl: string;
  imageUrl?: string;
  totalPages?: number;
};

const TeacherEBooksScreen = ({ navigation }: any) => {
  const [books, setBooks] = useState<BookType[]>([]);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD BOOKS ================= */
  useEffect(() => {
    const ref = database().ref('EBooks');

    const listener = ref.on('value', snapshot => {
      const data = snapshot.val() || {};

      const formatted = Object.keys(data).map(key => ({
        id: key,
        ...data[key],
      }));

      setBooks(formatted);
      setLoading(false);
    });

    return () => ref.off('value', listener);
  }, []);

  /* ================= ASSIGN BOOK ================= */
  const assignBook = async (book: BookType) => {
    navigation.navigate('AssignBookScreen', {
      book,
    });
  };

  /* ================= BOOK CARD ================= */
  const renderBook = ({ item }: { item: BookType }) => (
    <View style={styles.card}>
      <LinearGradient
        colors={['#0A1F44', '#1E3A8A']}
        style={styles.imageContainer}
      >
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
        ) : (
          <Text style={{ color: '#fff' }}>No Image</Text>
        )}
      </LinearGradient>

      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.author}>{item.author}</Text>

      {/* ASSIGN BUTTON */}
      <TouchableOpacity
        style={styles.assignBtn}
        onPress={() => assignBook(item)}
      >
        <Text style={styles.assignText}>Assign To Student</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading)
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Teacher E-Books</Text>

      <FlatList
        data={books}
        keyExtractor={item => item.id}
        renderItem={renderBook}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
      />
    </View>
  );
};

export default TeacherEBooksScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1F44',
    padding: 16,
  },
  header: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '800',
    marginBottom: 15,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#0A1F44',
  },
  card: {
    width: '48%',
    backgroundColor: '#1E3A8A',
    borderRadius: 20,
    padding: 10,
    marginBottom: 18,
  },
  imageContainer: {
    height: 150,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '70%',
    height: '70%',
    resizeMode: 'contain',
  },
  title: {
    color: '#fff',
    fontWeight: '700',
    marginTop: 8,
  },
  author: {
    color: '#ddd',
    fontSize: 12,
  },
  assignBtn: {
    backgroundColor: '#FFD700',
    marginTop: 8,
    paddingVertical: 8,
    borderRadius: 10,
  },
  assignText: {
    textAlign: 'center',
    fontWeight: '700',
  },
});
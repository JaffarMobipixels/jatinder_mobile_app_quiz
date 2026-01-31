import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import database from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';

type BookType = {
  id: string;
  title: string;
  author: string;
  pdfUrl: string;
  imageUrl?: string;
};

const AdminEBooksScreen = ({ navigation }: any) => {
  const [books, setBooks] = useState<BookType[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch books
  useEffect(() => {
    const ref = database().ref('EBooks');
    const onValueChange = ref.on('value', snapshot => {
      const data = snapshot.val() || {};
      const formattedBooks: BookType[] = Object.keys(data).map(key => ({
        id: key,
        title: data[key].title,
        author: data[key].author,
        pdfUrl: data[key].pdfUrl,
        imageUrl: data[key].imageUrl,
      }));
      setBooks(formattedBooks);
      setLoading(false);
    });

    return () => ref.off('value', onValueChange);
  }, []);

  // Delete book
  const deleteBook = (book: BookType) => {
    Alert.alert('Delete Book', 'Are you sure you want to delete this book?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            if (book.pdfUrl) {
              try {
                await storage().refFromURL(book.pdfUrl).delete();
              } catch (err) {
                console.log('PDF not found or already deleted.');
              }
            }

            if (book.imageUrl) {
              try {
                await storage().refFromURL(book.imageUrl).delete();
              } catch (err) {
                console.log('Image not found or already deleted.');
              }
            }

            await database().ref(`EBooks/${book.id}`).remove();
            Alert.alert('Deleted', 'Book deleted successfully');
          } catch (err: any) {
            Alert.alert('Error', err.message);
          }
        },
      },
    ]);
  };

  const renderBook = ({ item }: { item: BookType }) => (
    <View style={styles.bookCard}>
      {/* DELETE BUTTON */}
      <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteBook(item)}>
        <Feather name="trash-2" size={18} color="#fff" />
      </TouchableOpacity>

      {/* BOOK IMAGE */}
      <LinearGradient
        colors={['#FFA726', '#FB8C00']}
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

      {/* BOOK INFO */}
      <Text style={styles.bookTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.bookAuthor}>{item.author}</Text>
    </View>
  );

  if (loading)
    return (
      <View style={styles.loader}>
        <ActivityIndicator color="#FFB347" size="large" />
      </View>
    );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER */}
      <LinearGradient
        colors={['#FF8C00', '#FFB347']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerContainer}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerLeft}>
          <Feather name="arrow-left" size={26} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Admin E-Books</Text>

        <TouchableOpacity
          onPress={() => navigation.navigate('AddEBookScreen')}
          style={styles.headerRight}
        >
          <Feather name="plus-circle" size={26} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <Text style={styles.subTitle}>Manage E-Books (Admin Panel)</Text>

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

export default AdminEBooksScreen;

// ================= STYLES =================
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#6C63FF', paddingHorizontal: 16 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#6C63FF' },

  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 25,
    marginTop: 30,
    marginBottom: 12,
    paddingHorizontal: 16,
    height: 60,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 10,
  },
  headerLeft: { width: 30 },
  headerRight: { width: 50 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff', textAlign: 'center', flex: 1 },

  subTitle: { fontSize: 14, color: '#EDE7FF', marginBottom: 10 },

  listContent: { paddingBottom: 30 },

  bookCard: {
    width: '48%',
    backgroundColor: '#5A4FCF',
    borderRadius: 20,
    padding: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },

  deleteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    backgroundColor: '#E53935',
    padding: 6,
    borderRadius: 20,
  },

  bookImageContainer: {
    height: 160,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    backgroundColor: '#FFA726',
  },

  bookImage: { width: '70%', height: '70%', resizeMode: 'contain' },
  bookTitle: { fontSize: 14, fontWeight: '700', color: '#fff' },
  bookAuthor: { fontSize: 12, color: '#FFF8DC', marginTop: 2 },
});

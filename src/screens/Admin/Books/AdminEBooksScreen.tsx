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

  /**
   * ✅ FETCH BOOKS
   */
  useEffect(() => {

    const ref = database().ref('EBooks');

    const listener = ref.on('value', snapshot => {

      const data = snapshot.val() || {};

      const formatted: BookType[] =
        Object.keys(data).map(key => ({
          id: key,
          title: data[key].title,
          author: data[key].author,
          pdfUrl: data[key].pdfUrl,
          imageUrl: data[key].imageUrl,
        }));

      setBooks(formatted);
      setLoading(false);
    });

    return () => ref.off('value', listener);

  }, []);

  /**
   * ✅ DELETE BOOK
   */
  const deleteBook = (book: BookType) => {

    Alert.alert(
      'Delete Book',
      'Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {

            try {

              if (book.pdfUrl) {
                await storage().refFromURL(book.pdfUrl).delete().catch(()=>{});
              }

              if (book.imageUrl) {
                await storage().refFromURL(book.imageUrl).delete().catch(()=>{});
              }

              await database()
                .ref(`EBooks/${book.id}`)
                .remove();

              Alert.alert('Success', 'Book deleted');

            } catch (error: any) {
              Alert.alert('Error', error?.message);
            }
          },
        },
      ]
    );
  };

  /**
   * ✅ BOOK CARD
   */
  const renderBook = ({ item }: { item: BookType }) => (

    <View style={styles.bookCard}>

      {/* DELETE */}
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => deleteBook(item)}
      >
        <Feather name="trash-2" size={18} color="#fff" />
      </TouchableOpacity>

      {/* IMAGE */}
      <LinearGradient
        colors={['#FFA726', '#FB8C00']}
        style={styles.bookImageContainer}
      >
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.bookImage}
          />
        ) : (
          <Text style={{ color: '#fff' }}>
            No Image
          </Text>
        )}
      </LinearGradient>

      {/* INFO */}
      <Text style={styles.bookTitle} numberOfLines={2}>
        {item.title}
      </Text>

      <Text style={styles.bookAuthor}>
        {item.author}
      </Text>

      {/* ✅ VIEW PROGRESS BUTTON */}
      <TouchableOpacity
        style={styles.progressBtn}
        onPress={() =>
          navigation.navigate('TeacherBookProgress', {
            ebookId: item.id,
          })
        }
      >
        <Feather name="bar-chart-2" size={16} color="#fff" />
        <Text style={styles.progressText}>
          View Progress
        </Text>
      </TouchableOpacity>

    </View>
  );

  /**
   * ✅ LOADER
   */
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#FFB347" />
      </View>
    );
  }

  /**
   * ✅ MAIN UI
   */
  return (
    <SafeAreaView style={styles.safeArea}>

      {/* HEADER */}
      <LinearGradient
        colors={['#FF8C00', '#FFB347']}
        style={styles.headerContainer}
      >

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={26} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Admin E-Books
        </Text>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate('AddEBookScreen')
          }
        >
          <Feather name="plus-circle" size={26} color="#fff" />
        </TouchableOpacity>

      </LinearGradient>

      <Text style={styles.subTitle}>
        Manage E-Books
      </Text>

      <FlatList
        data={books}
        renderItem={renderBook}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={{
          justifyContent: 'space-between',
        }}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

    </SafeAreaView>
  );
};

export default AdminEBooksScreen;
const styles = StyleSheet.create({

  safeArea:{
    flex:1,
    backgroundColor:'#6C63FF',
    paddingHorizontal:16,
  },

  loader:{
    flex:1,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'#6C63FF',
  },

  headerContainer:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    borderRadius:25,
    marginTop:30,
    marginBottom:12,
    paddingHorizontal:16,
    height:60,
  },

  headerTitle:{
    fontSize:20,
    fontWeight:'800',
    color:'#fff',
  },

  subTitle:{
    color:'#EDE7FF',
    marginBottom:10,
  },

  listContent:{
    paddingBottom:30,
  },

  bookCard:{
    width:'48%',
    backgroundColor:'#5A4FCF',
    borderRadius:20,
    padding:10,
    marginBottom:20,
    elevation:10,
  },

  deleteBtn:{
    position:'absolute',
    top:8,
    right:8,
    zIndex:10,
    backgroundColor:'#E53935',
    padding:6,
    borderRadius:20,
  },

  bookImageContainer:{
    height:160,
    borderRadius:16,
    justifyContent:'center',
    alignItems:'center',
    marginBottom:8,
  },

  bookImage:{
    width:'70%',
    height:'70%',
    resizeMode:'contain',
  },

  bookTitle:{
    color:'#fff',
    fontWeight:'700',
    fontSize:14,
  },

  bookAuthor:{
    color:'#FFF8DC',
    fontSize:12,
    marginTop:2,
  },

  progressBtn:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:'#FF8C00',
    paddingVertical:8,
    borderRadius:10,
    marginTop:10,
  },

  progressText:{
    color:'#fff',
    marginLeft:6,
    fontWeight:'600',
  },

});
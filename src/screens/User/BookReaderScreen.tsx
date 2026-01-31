// BookReaderScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthStack';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';

type Props = NativeStackScreenProps<AuthStackParamList, 'BookReader'>;

const BookReaderScreen: React.FC<Props> = ({ route, navigation }) => {
  const { bookUrl, bookId, bookTitle } = route.params;

  const [content, setContent] = useState('');
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const loadLastScroll = async () => {
      const savedPos = await AsyncStorage.getItem(`BOOK_SCROLL_${bookId}`);
      if (savedPos) setScrollPosition(Number(savedPos));
    };
    loadLastScroll();
    setContent(bookUrl);
  }, [bookId, bookUrl]);

  const handleScroll = async (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollY = contentOffset.y;
    const totalHeight = contentSize.height - layoutMeasurement.height;

    await AsyncStorage.setItem(`BOOK_SCROLL_${bookId}`, scrollY.toString());
    if (totalHeight > 0) {
      const percent = Math.floor((scrollY / totalHeight) * 100);
      await AsyncStorage.setItem(`book_progress_${bookId}`, percent.toString());
    }
  };

  return (
    <LinearGradient
      colors={['#0A1F44', '#1E3A8A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
    >
      <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />

      <ScrollView
        contentOffset={{ y: scrollPosition, x: 0 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Card with Back Button */}
        <LinearGradient
          colors={['#4F46E5', '#3B82F6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerCard}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{bookTitle || 'Book Reader'}</Text>
        </LinearGradient>

        {/* Reader Card */}
        <LinearGradient
          colors={['#4F46E5', '#3B82F6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.readerCard}
        >
          <Text style={styles.text}>{content}</Text>
        </LinearGradient>
      </ScrollView>
    </LinearGradient>
  );
};

export default BookReaderScreen;

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // Header Card
  headerCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    marginTop:60,
    elevation: 10,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },

  // Reader Card
  readerCard: {
    borderRadius: 20,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 10,
  },
  text: {
    fontSize: 18,
    lineHeight: 28,
    color: '#E0E0E0',
    textAlign: 'justify',
  },
});

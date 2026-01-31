import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Pdf from 'react-native-pdf';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';

const { width, height } = Dimensions.get('window');

const PdfViewerScreen = ({ route, navigation }: any) => {
  const { pdfUrl, title, id, totalPages } = route.params;
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfHeight, setPdfHeight] = useState(0);
  const [pdfTotalPages, setPdfTotalPages] = useState(totalPages); // default fallback
  const [saving, setSaving] = useState(false);
  const user = auth().currentUser;
  const pdfRef = useRef<any>(null);

  // Load last read page from Firebase
  useEffect(() => {
    if (!user) return;
    const progressRef = database().ref(`UserProgress/${user.uid}/${id}`);
    const listener = progressRef.on('value', snapshot => {
      const data = snapshot.val();
      if (data?.currentPage) setCurrentPage(data.currentPage);
    });
    return () => progressRef.off('value', listener);
  }, [id, user]);

  // Save progress (avoid multiple writes)
  const saveProgress = async (page: number) => {
    if (!user || saving) return;
    setSaving(true);
    try {
      await database().ref(`UserProgress/${user.uid}/${id}`).set({
        currentPage: page,
        totalPages: pdfTotalPages, // use actual PDF pages
        progressPercent: Math.floor((page / pdfTotalPages) * 100),
        lastRead: Date.now(),
      });
    } catch (err) {
      console.log('Save progress error:', err);
    } finally {
      setSaving(false);
    }
  };

  // Called when PDF scrolls
  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (pdfHeight === 0) return;
    const offsetY = event.nativeEvent.contentOffset.y;
    const pageHeight = pdfHeight / pdfTotalPages;
    const visiblePage = Math.min(Math.max(Math.ceil(offsetY / pageHeight), 1), pdfTotalPages);
    if (visiblePage !== currentPage) {
      setCurrentPage(visiblePage);
      saveProgress(visiblePage);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <LinearGradient
        colors={['#FF8C00', '#FFB347']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ ...styles.backBtn, marginLeft: 10 }}>
          <Feather name="arrow-left" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{ width: 26 }} />
      </LinearGradient>

      {/* PDF */}
      <View style={styles.pdfContainer}>
        <Pdf
          ref={pdfRef}
          source={{ uri: pdfUrl, cache: true }}
          style={styles.pdf}
          trustAllCerts={false}
          page={currentPage}
          onLoadComplete={(numberOfPages, path, { width, height }) => {
            setPdfHeight(height);
            setPdfTotalPages(numberOfPages); // update with actual pages
          }}
          onPageChanged={(page) => {
            setCurrentPage(page);
            saveProgress(page);
          }}
          onScroll={onScroll}
          horizontal={false}
        />
      </View>

      {/* CURRENT PAGE + PERCENTAGE */}
      <Text style={styles.progressText}>
        Page {currentPage} ({Math.floor((currentPage / pdfTotalPages) * 100)}% read)
      </Text>
    </SafeAreaView>
  );
};

export default PdfViewerScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    paddingHorizontal: 16,
    borderRadius: 20,
    margin: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
  },
  backBtn: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  pdfContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 6,
    overflow: 'hidden',
  },
  pdf: { flex: 1, width: width - 32, height: height - 150 },
  progressText: {
    textAlign: 'center',
    padding: 8,
    fontSize: 16,
    fontWeight: '700',
    color: '#FF8C00',
  },
});

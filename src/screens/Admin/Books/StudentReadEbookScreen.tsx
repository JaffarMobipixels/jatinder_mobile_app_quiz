import React, { useEffect, useState } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import Pdf from 'react-native-pdf';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';

const StudentReadEbookScreen = ({ route }: any) => {

  const { ebookId, pdfUrl } = route.params;

  const studentId = auth().currentUser?.uid;

  const [loading, setLoading] = useState(true);
  const [initialPage, setInitialPage] = useState(1);

  /**
   * ✅ Load last read page (AUTO RESUME)
   */
  useEffect(() => {
    if (!studentId) return;

    const ref = database()
      .ref(`Assignments/${ebookId}/${studentId}`);

    ref.once('value').then(snapshot => {
      const data = snapshot.val();

      if (data?.currentPage) {
        setInitialPage(data.currentPage);
      }

      setLoading(false);
    });
  }, []);

  /**
   * ✅ Update Progress Function
   */
  const updateProgress = (
    page: number,
    totalPages: number
  ) => {

    if (!studentId) return;

    const progress = Math.floor((page / totalPages) * 100);

    database()
      .ref(`Assignments/${ebookId}/${studentId}`)
      .update({
        currentPage: page,
        totalPages: totalPages,
        progress: progress,
        lastUpdated: Date.now(),
      });
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#FF8C00" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pdf
        source={{ uri: pdfUrl }}
        style={styles.pdf}
        trustAllCerts={false}

        /**
         * ✅ AUTO RESUME PAGE
         */
        page={initialPage}

        /**
         * ✅ TRACK PAGE CHANGE
         */
        onPageChanged={(page, totalPages) => {
          updateProgress(page, totalPages);
        }}

       onError={(error: any) => {
  Alert.alert('PDF Error', error?.message || 'Unknown error');
}}
      />
    </View>
  );
};

export default StudentReadEbookScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  pdf: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Pdf from 'react-native-pdf';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
 
const { width, height } = Dimensions.get('window');
 
const AdminPdfViewerScreen = ({ route, navigation }: any) => {
  const { pdf, title } = route.params;
 
  const deletePdf = () => {
    Alert.alert(
      'Delete E-Book',
      'Are you sure you want to delete this PDF?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // yahan backend / state delete logic ayegi
            navigation.goBack();
          },
        },
      ],
    );
  };
 
  return (
    <SafeAreaView style={styles.container}>
 
      {/* HEADER */}
      <LinearGradient
        colors={['#D32F2F', '#F44336']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
 
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
 
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn}>
            <Feather name="edit-3" size={20} color="#fff" />
          </TouchableOpacity>
 
          <TouchableOpacity style={styles.iconBtn} onPress={deletePdf}>
            <Feather name="trash-2" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
 
      {/* PDF VIEW */}
      <View style={styles.pdfContainer}>
        <Pdf
          source={pdf}
          style={styles.pdf}
          trustAllCerts={false}
        />
      </View>
 
    </SafeAreaView>
  );
};
 
export default AdminPdfViewerScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    paddingHorizontal: 14,
    borderRadius: 18,
    margin: 12,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  headerActions: {
    flexDirection: 'row',
  },
  iconBtn: {
    marginLeft: 12,
  },
  pdfContainer: {
    flex: 1,
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
  },
  pdf: {
    flex: 1,
    width: width - 32,
    height: height - 150,
  },
});
 
 
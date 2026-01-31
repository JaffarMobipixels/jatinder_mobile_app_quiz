// SakhiDetailScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import database from '@react-native-firebase/database';
 
type SakhiType = {
  title: string;
  subtitle: string;
  content: string;
  moral: string;
  reference: string;
};
 
const SakhiDetailScreen = ({ route, navigation }: any) => {
  const { sakhiId } = route.params as { sakhiId: string };
  const [sakhi, setSakhi] = useState<SakhiType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
 
  // ===================== FETCH FROM FIREBASE =====================
  useEffect(() => {
    const ref = database().ref(`SakhiSeries/${sakhiId}`);
    const listener = ref.on('value', snapshot => {
      const data = snapshot.val();
      if (!data) {
        setSakhi(null);
        setLoading(false);
        return;
      }
      setSakhi({
        title: data.title || '',
        subtitle: data.subtitle || '',
        content: data.content || '',
        moral: data.moral || '',
        reference: data.reference || '',
      });
      setLoading(false);
    });
    return () => ref.off('value', listener);
  }, [sakhiId]);
 
  // ===================== LOADER =====================
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }
 
  if (!sakhi) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.notFoundText}>Sakhi not found</Text>
      </SafeAreaView>
    );
  }
 
  // ===================== UI =====================
  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#FF6A00', '#FFB347']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{sakhi.title}</Text>
      </LinearGradient>
 
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          {/* Title & Subtitle inside card */}
          <View style={styles.textContainer}>
            <Text style={styles.subtitle}>{sakhi.subtitle}</Text>
            <Text style={styles.content}>{sakhi.content}</Text>
          </View>
 
         
 
          <Text style={styles.reference}>{sakhi.reference}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
 
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0A1F44' },
  notFoundText: { color: '#fff', textAlign: 'center', marginTop: 50, fontSize: 18 },
 
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A1F44',
  },
 
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height:80,
    marginHorizontal: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 5,
  },
  backBtn: {
    padding: 6,
    marginLeft:10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    marginLeft: 15,
    flexShrink: 1,
  },
 
  container: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
 
  card: {
    backgroundColor: '#112255',
    borderRadius: 20,
    paddingVertical: 25,
    paddingHorizontal: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 5,
  },
 
  // ================= TEXT INSIDE CARD =================
// ===== TEXT INSIDE CARD =====
textContainer: {
  marginBottom: 16,
},
 
subtitle: {
  fontSize: 17,
  fontWeight: '500',
  color: '#FFFFFF',
  marginBottom: 10,
  textAlign: 'left',
  lineHeight: 22,
},
 
content: {
  fontSize: 15,
  lineHeight: 22,        // 👈 balanced (24 → 22)
  color: '#E5E7EB',
  textAlign: 'left',     // 👈 justify removed
},
 
moralBox: {
  backgroundColor: '#1E3A8A',
  paddingVertical: 14,   // 👈 reduced
  paddingHorizontal: 16,
  borderRadius: 16,
  marginBottom: 18,
  elevation: 3,
},
 
moralTitle: {
  fontSize: 15,
  fontWeight: '700',
  color: '#FFD700',
  marginBottom: 6,
},
 
moralText: {
  fontSize: 14,
  lineHeight: 20,        // 👈 tight & clean
  color: '#FFFFFF',
  textAlign: 'left',     // 👈 justify removed
},
 
reference: {
  fontSize: 12,
  fontWeight: '200',
  color: '#A5B4FC',
  textAlign: 'center',
  marginTop: 4,
},
 
});
 
export default SakhiDetailScreen;
 
 
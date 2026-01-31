import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Platform,
} from 'react-native';
// 1. Safe Area Insets import kiya
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import database from '@react-native-firebase/database';
 
/* ===================== TYPES ===================== */
type SakhiType = {
  id: string;
  title: string;
  seriesNumber: number;
};
 
/* ===================== SCREEN ===================== */
const SakhiSeriesScreen = ({ navigation }: any) => {
  const [sakhis, setSakhis] = useState<SakhiType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
 
  // 2. Insets hook call kiya
  const insets = useSafeAreaInsets();
 
  /* ===================== FETCH FROM FIREBASE ===================== */
  useEffect(() => {
    const ref = database().ref('SakhiSeries');
 
    const listener = ref.on('value', snapshot => {
      const data = snapshot.val();
 
      if (!data) {
        setSakhis([]);
        setLoading(false);
        return;
      }
 
      const list: SakhiType[] = Object.keys(data).map(key => {
        const title: string = data[key].title || '';
        const match = title.match(/Sakhi Series\s*-\s*(\d+)/i);
        const seriesNumber = match ? parseInt(match[1], 10) : 0;
 
        return {
          id: key,
          title,
          seriesNumber,
        };
      });
 
      list.sort((a, b) => a.seriesNumber - b.seriesNumber);
 
      setSakhis(list);
      setLoading(false);
    });
 
    return () => ref.off('value', listener);
  }, []);
 
  /* ===================== RENDER ITEM ===================== */
  const renderItem = ({ item }: { item: SakhiType }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() =>
        navigation.navigate('SakhiDetailScreen', {
          sakhiId: item.id,
        })
      }
    >
      <LinearGradient
        colors={['#0A1F44', '#1E3A8A', '#0F172A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.left}>
          <View style={styles.iconBox}>
            <Text style={{ fontSize: 22 }}>📖</Text>
          </View>
          <Text style={styles.title}>{item.title}</Text>
        </View>
 
        <Feather name="chevron-right" size={22} color="#fff" />
      </LinearGradient>
    </TouchableOpacity>
  );
 
  /* ===================== LOADER ===================== */
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }
 
  /* ===================== UI ===================== */
  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
 
      {/* ---------- RESPONSIVE HEADER ---------- */}
      <View style={{ paddingTop: insets.top + 10 }}>
        <LinearGradient
          colors={['#0A1F44', '#1E3A8A', '#0F172A']}
          style={styles.header}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
         
          <Text style={styles.headerTitle}>Sakhis Series</Text>
         
          <View style={{ width: 40 }} />
        </LinearGradient>
      </View>
 
      {/* LIST */}
      <FlatList
        data={sakhis}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{
            padding: 20,
            paddingBottom: insets.bottom + 20 // Bottom safe area check
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};
 
export default SakhiSeriesScreen;
 
/* ===================== STYLES ===================== */
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#0A1F44',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A1F44',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height:70,
    marginLeft:20,
    marginRight:20,
    borderRadius: 25,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  backBtn: {
    width: 40,
    height: 40,
    marginLeft:10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    height:90,
    borderRadius: 25,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft:20,
    flex: 1,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FFFFFF33',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    elevation: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
    flexShrink: 1,
  },
});
 
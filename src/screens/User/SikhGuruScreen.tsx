// SikhGuruScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import database from '@react-native-firebase/database';

/* ===================== TYPES ===================== */
export type GuruType = {
  id: string;
  title: string;
  history: string;
  imageUrl?: string;
};

type RouteType = {
  key: string;
  title: string;
};

/* ===================== TABBAR TYPE FIX ===================== */
const TypedTabBar = TabBar as unknown as React.ComponentType<any>;

/* ===================== GURU SCENE ===================== */
const GuruScene =
  (guru: GuruType) =>
  () => (
    <LinearGradient
      colors={['#0A1F44', '#1E3A8A', '#0F172A']}
      style={styles.scene}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {guru.imageUrl ? (
          <Image source={{ uri: guru.imageUrl }} style={styles.guruImage} />
        ) : null}

        <Text style={styles.guruTitle}>{guru.title}</Text>

        <View style={styles.card}>
          <Text style={styles.historyText}>{guru.history}</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );

/* ===================== MAIN SCREEN ===================== */
export default function SikhGuruScreen({ navigation }: any) {
  const layout = useWindowDimensions();

  const [gurus, setGurus] = useState<GuruType[]>([]);
  const [routes, setRoutes] = useState<RouteType[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  /* ===================== FETCH FROM FIREBASE ===================== */
  useEffect(() => {
    const ref = database().ref('SikhGurus');

    const listener = ref.on('value', snapshot => {
      const data = snapshot.val();

      if (!data) {
        setGurus([]);
        setRoutes([]);
        setLoading(false);
        return;
      }

      const list: GuruType[] = Object.keys(data).map(key => ({
        id: key,
        title: data[key].title,
        history: data[key].history,
        imageUrl: data[key].imageUrl || '',
      }));

      setGurus(list);
      setRoutes(list.map(g => ({ key: g.id, title: g.title })));
      setLoading(false);
    });

    return () => ref.off('value', listener);
  }, []);

  /* ===================== SCENE MAP ===================== */
  const renderScene = SceneMap(
    gurus.reduce((acc, guru) => {
      acc[guru.id] = GuruScene(guru);
      return acc;
    }, {} as Record<string, React.ComponentType>)
  );

  /* ===================== LOADER ===================== */
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F172A' }}>
      {/* ===================== HEADER ===================== */}
      <LinearGradient
        colors={['#1E3A8A', '#0A1F44']}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Feather name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Sikh Gurus</Text>

        <View style={{ width: 24 }} />
      </LinearGradient>

      {/* ===================== TAB VIEW ===================== */}
      {gurus.length > 0 ? (
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
          renderTabBar={props => (
            <TypedTabBar
              {...props}
              scrollEnabled
              style={styles.tabBar}
              indicatorStyle={styles.indicator}
              renderLabel={({ route, focused }: any) => (
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '700',
                    color: focused ? '#FFD700' : '#CBD5E1',
                  }}
                >
                  {route.title}
                </Text>
              )}
            />
          )}
        />
      ) : (
        <View style={styles.empty}>
          <Text style={{ color: '#fff' }}>No Guru data found</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

/* ===================== STYLES ===================== */
const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },

  header: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 8,
  },

  backBtn: {
    width: 24,
    alignItems: 'flex-start',
    marginLeft:10,
  },

  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },

  tabBar: {
    backgroundColor: '#0F172A',
  },

  indicator: {
    backgroundColor: '#FFD700',
    height: 3,
    borderRadius: 2,
  },

  scene: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 30,
  },

  guruImage: {
    width: '100%',
    height: 220,
    resizeMode: 'contain',
    marginBottom: 20,
    borderRadius: 12,
  },

  guruTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 14,
  },

  card: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    marginRight:30,
    
  },

  historyText: {
    fontSize: 16,
    color: '#E5E7EB',
    lineHeight: 30,
    margin: 20,
    textAlign: 'left',
  },

  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
});

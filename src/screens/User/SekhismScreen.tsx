import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { TabView, TabBar } from 'react-native-tab-view';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import database from '@react-native-firebase/database';

/* ===================== DYNAMIC SECTION ===================== */
const DynamicSection = ({
  title,
  content,
}: {
  title: string;
  content: string;
}) => (
  <ScrollView
    showsVerticalScrollIndicator={false}
    contentContainerStyle={styles.scrollContent}
  >
    <View style={styles.card}>
      <LinearGradient
        colors={['#0A1F44', '#1E3A8A', '#0F172A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        <Text style={styles.heading}>{title}</Text>
        <Text style={styles.text}>{content}</Text>
      </LinearGradient>
    </View>
  </ScrollView>
);

/* ===================== MAIN SCREEN ===================== */
export default function SikhismScreen({ navigation }: any) {
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);
  const [routes, setRoutes] = React.useState<
    { key: string; title: string }[]
  >([]);
  const [sections, setSections] = React.useState<Record<string, any>>({});
  const [loading, setLoading] = React.useState(true);

React.useEffect(() => {
  const ref = database().ref('SikhismSections');

  ref.on('value', snapshot => {
    const data = snapshot.val() || {};

    // Separate 'Introduction' from other sections
    const introKey = Object.keys(data).find(
      key => data[key].title.toLowerCase() === 'introduction'
    );

    const otherKeys = Object.keys(data).filter(key => key !== introKey);

    // Reverse the rest if you want latest first
    otherKeys.reverse();

    const orderedSections: Record<string, any> = {};
    const dynamicRoutes: { key: string; title: string }[] = [];

    // First, add Introduction
    if (introKey) {
      orderedSections[introKey] = data[introKey];
      dynamicRoutes.push({
        key: introKey,
        title: data[introKey].title.length > 15
          ? data[introKey].title.slice(0, 15) + '...'
          : data[introKey].title,
      });
    }

    // Then add the rest
    otherKeys.forEach(key => {
      orderedSections[key] = data[key];
      dynamicRoutes.push({
        key,
        title: data[key].title.length > 15
          ? data[key].title.slice(0, 15) + '...'
          : data[key].title,
      });
    });

    setSections(orderedSections);
    setRoutes(dynamicRoutes);
    setLoading(false);
  });

  return () => ref.off();
}, []);

  /* ===================== RENDER SCENE ===================== */
  const renderScene = ({ route }: any) => {
    const section = sections[route.key];
    if (!section) return null;
    return (
      <DynamicSection
        title={section.title}
        content={section.content}
      />
    );
  };

  /* ===================== TAB BAR ===================== */
  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      scrollEnabled
      style={styles.tabBar}
      indicatorStyle={styles.indicator}
      activeColor="#FFF"
      inactiveColor="#BBB"
      labelStyle={{ fontSize: 14, fontWeight: '700' }}
    />
  );

  /* ===================== LOADER ===================== */
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#FFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A1F44' }}>
      {/* ===================== HEADER ===================== */}
      <LinearGradient
        colors={['#0A1F44', '#1E3A8A', '#0F172A']}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Feather name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Sikhism</Text>

        <View style={{ width: 24 }} />
      </LinearGradient>

      {/* ===================== TAB VIEW ===================== */}
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={renderTabBar}
      />
    </SafeAreaView>
  );
}

/* ===================== STYLES ===================== */
const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A1F44',
  },

  header: {
    height: 80,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 8,
  },

  backBtn: {
    width: 24,
    alignItems: 'flex-start',
  },

  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#FFF',
    fontSize: 22,
    fontWeight: '800',
  },

  tabBar: {
    backgroundColor: '#0A1F44',
    elevation: 5,
  },

  indicator: {
    backgroundColor: '#FFF',
    height: 4,
    borderRadius: 2,
  },

  scrollContent: {
    paddingVertical: 20,
    paddingBottom: 40,
  },

  card: {
    marginHorizontal: 16,
    borderRadius: 25,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    backgroundColor: '#0A1F44',
  },

  cardGradient: {
    borderRadius: 25,
    paddingTop:10,
    
    minHeight: 500,        // ❌ fixed height removed
  },

  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 15,
    textAlign: 'left',
     margin:20,
  },

  text: {
    fontSize: 16,
    color: '#FFF',
    lineHeight: 33,        // ✅ iOS readable
    textAlign: 'left',
    margin:20,
  },
});

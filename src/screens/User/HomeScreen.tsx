import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
  Animated,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
 
const HomeScreen: React.FC<any> = ({ navigation }) => {
  const tabBarHeight = useBottomTabBarHeight();
 
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [ctaImage, setCtaImage] = useState<string | null>(null);
  const [ctaLoading, setCtaLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
 
  // --- USER DATA (Fetching Full Name) ---
  useEffect(() => {
    const user = auth().currentUser;
    if (!user) return;
    const ref = database().ref(`users/${user.uid}`);
    const listener = ref.on('value', snap => {
      const d = snap.val();
      if (d) {
        setFirstName(d.firstName || '');
        setLastName(d.lastName || '');
        setProfileImage(d.profileImage || '');
      } else {
        setFirstName('');
        setLastName('');
      }
    });
    return () => ref.off('value', listener);
  }, []);
 
  // --- CTA IMAGE ---
  useEffect(() => {
    const ref = database().ref('HomeScreenCTA/imageUrl');
    const listener = ref.on('value', snap => {
      const v = snap.val();
      setCtaImage(typeof v === 'string' && v.startsWith('http') ? v : null);
    });
    return () => ref.off('value', listener);
  }, []);
 
  // --- QUIZZES WITH CUSTOM SORTING ---
  useEffect(() => {
    const ref = database().ref('Tabs');
    const listener = ref.on('value', snap => {
      const data = snap.val();
      if (!data) {
        setQuizzes([]);
      } else {
        const list = Array.isArray(data) ? data : Object.values(data);
       
        const orderMap: { [key: string]: number } = {
          'Sikhism': 1,
          'Sikh Guru': 2,
          'Quiz': 3,
          'Charades Game': 4,
          'E-books': 5,
          'Habits': 6,
          'Prayer': 7,
        };
 
        const sortedList = list
          .filter((i: any) => i && i.title)
          .sort((a, b) => {
            const orderA = orderMap[a.title] || 99;
            const orderB = orderMap[b.title] || 99;
            return orderA - orderB;
          });
 
        setQuizzes(sortedList);
      }
      setLoadingQuizzes(false);
    });
    return () => ref.off('value', listener);
  }, []);
 
  // --- FEATURE CARD COMPONENT ---
  const FeatureCard = ({ iconName, iconType, title, subtitle, subTitle, onPress }: any) => {
    const scale = useRef(new Animated.Value(1)).current;
    const [iconLoading, setIconLoading] = useState(true);
    const displaySubtitle = subtitle || subTitle;
 
    return (
      <Animated.View style={[styles.cardWrapper, { transform: [{ scale }] }]}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onPress}
          onPressIn={() => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start()}
          onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}
        >
          <LinearGradient
            colors={['#0A1F44', '#1E3A8A', '#0F172A']}
            style={styles.featureCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0.5 }}
          >
            <View style={styles.cardIconContainer}>
              {typeof iconName === 'string' && iconName.startsWith('http') ? (
                <>
                  {iconLoading && <ActivityIndicator style={StyleSheet.absoluteFill} color="#fff" />}
                  <Image
                    source={{ uri: iconName }}
                    style={styles.iconImage}
                    onLoadEnd={() => setIconLoading(false)}
                  />
                </>
              ) : (
                iconType === 'MCI' ?
                <MCI name={iconName} size={34} color="#fff" /> :
                <FeatherIcon name={iconName} size={32} color="#fff" />
              )}
            </View>
 
            <View style={styles.cardTextContainer}>
  <Text style={styles.cardTitle}>{title}</Text>
  {!!displaySubtitle && (
    <Text style={styles.cardSubtitle} numberOfLines={2}>{displaySubtitle}</Text>
  )}
</View>

{/* Margin yahan apply kiya gaya hai */}
<View style={{ marginRight: 25, marginBottom:35, justifyContent: 'center' }}>
  <FeatherIcon 
    name="chevron-right" 
    size={24} 
    color="#ffffff66" 
  />
</View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };
 
  // --- RENDER ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabBarHeight + 30 }}
      >
       
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.headerBtn}>
            <FeatherIcon name="menu" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.logo}>Quizzer Kids</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Image
              source={profileImage ? { uri: profileImage } : require('../../assets/dummy_profile.png')}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>
 
        {/* WELCOME TEXT (Full Name Display) */}
        <View style={styles.welcomeContainer}>
            {firstName === null ? (
                <ActivityIndicator size="small" color="#fff" style={{ alignSelf: 'flex-start' }} />
            ) : (
                <Text style={styles.welcomeText} numberOfLines={1}>
                    {firstName || lastName
                      ? `Hello, ${firstName} ${lastName}`.trim() + '!'
                      : 'Hello!'}
                </Text>
            )}
        </View>
 
        {/* CTA CARD */}
        {ctaImage && (
          <View style={styles.ctaWrapper}>
            <ImageBackground
              source={{ uri: ctaImage }}
              style={styles.ctaCard}
              imageStyle={{ borderRadius: 25 }}
              onLoadStart={() => setCtaLoading(true)}
              onLoadEnd={() => setCtaLoading(false)}
            >
              <LinearGradient colors={['#0A1F44bb', '#1E3A8Abb']} style={styles.ctaCardContent}>
                {ctaLoading && <ActivityIndicator size="small" color="#fff" style={styles.loaderPos} />}
                <Text style={styles.ctaTitle}>Ready for Fun Quizzes?</Text>
                <Text style={styles.ctaSubtitle}>Play, Learn & Explore exciting quizzes!</Text>
                <TouchableOpacity
                  style={styles.startButton}
                  onPress={() => quizzes.length ? navigation.navigate('QuizScreen', { quizzes }) : Alert.alert('Notice', 'No quizzes available')}
                >
                  <Text style={styles.startButtonText}>Let’s Go 🎉</Text>
                </TouchableOpacity>
              </LinearGradient>
            </ImageBackground>
          </View>
        )}
 
        {/* LIST SECTION */}
        <View style={{ paddingHorizontal: 20 }}>
          {loadingQuizzes ? (
            <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 20 }} />
          ) : (
            quizzes.map((q, i) => (
              <FeatureCard
                key={i}
                {...q}
                onPress={() => navigation.navigate(q.navigateTo || 'QuizScreen', { quiz: q })}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
 
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0A1F44' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15
  },
  headerBtn: { padding: 5 },
  logo: { fontSize: 26, fontWeight: '900', color: '#fff' },
  profileImage: { width: 48, height: 48, borderRadius: 24, borderWidth: 1.5, borderColor: '#3B82F6' },
 
  welcomeContainer: { paddingHorizontal: 20, marginBottom: 20, minHeight: 35, justifyContent: 'center' },
  welcomeText: { fontSize: 24, fontWeight: '700', color: '#fff' },
 
  ctaWrapper: { paddingHorizontal: 20, marginBottom: 25 },
  ctaCard: { height: 190, overflow: 'hidden' },
  ctaCardContent: { flex: 1, padding: 22, justifyContent: 'center' },
  loaderPos: { position: 'absolute', right: 20, top: 20 },
  ctaTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  ctaSubtitle: { fontSize: 14, color: '#D1D5DB', marginBottom: 18, marginTop: 4 },
  startButton: { backgroundColor: '#fff', marginBottom:40,  paddingVertical: 12, paddingHorizontal: 24, borderRadius: 15, alignSelf: 'flex-start' },
  startButtonText: { fontSize: 16, fontWeight: '700', color: '#0A1F44' },
 
  cardWrapper: { marginBottom: 18 },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    height:140,
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ffffff15'
  },
  cardIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 20,
    marginBottom:40,
    backgroundColor: '#FFFFFF18',
    justifyContent: 'center',
    alignItems: 'center'
  },
  iconImage: { width: 50, height: 50, resizeMode: 'contain' },
  cardTextContainer: { flex: 1, marginLeft: 18, marginBottom:40, justifyContent: 'center' },
  cardTitle: { fontSize: 19, fontWeight: '800', color: '#fff', marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: '#ffffff99', lineHeight: 18 },
  arrowContainer: { marginLeft: 10 },
});
 
export default HomeScreen;
 
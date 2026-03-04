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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';

const HomeScreen: React.FC<any> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [ctaImages, setCtaImages] = useState<string[]>([]);
  const [ctaLoading, setCtaLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const scrollRef = useRef<ScrollView | null>(null);

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
    const ref = database().ref('HomeScreenCTA');
    const listener = ref.on('value', snap => {
      const data = snap.val();
      if (data) {
        const images = Object.values(data)
          .filter((url: any) => typeof url === 'string' && url.startsWith('http'));
        setCtaImages(images as string[]);
      }
    });
    return () => ref.off('value', listener);
  }, []);

  useEffect(() => {
    if (ctaImages.length === 0) return;

    let index = 0;

    const interval = setInterval(() => {
      index = index === ctaImages.length - 1 ? 0 : index + 1;

      scrollRef.current?.scrollTo({
        x: index * (320 + 15),
        animated: true,
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [ctaImages]);

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
          'Charades': 4,
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
                  <MCI name={iconName} size={40} color="#fff" /> :
                  <FeatherIcon name={iconName} size={38} color="#fff" />
              )}
            </View>

            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>{title}</Text>
              {!!displaySubtitle && (
                <Text style={styles.cardSubtitle} numberOfLines={2}>{displaySubtitle}</Text>
              )}
            </View>

            <View style={{ marginRight: 25, marginTop: 20 }}>
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
        contentContainerStyle={{ paddingBottom: insets.bottom + 9 }}
      >

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.headerBtn}>
            <FeatherIcon name="menu" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.logo}>Sikh Virsa</Text>
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

        {ctaImages.length > 0 && (
          <View style={styles.ctaWrapper}>
            <ScrollView
              ref={scrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              snapToInterval={320 + 15}
              decelerationRate="fast"
              contentContainerStyle={{ paddingRight: 20 }}
            >
              {ctaImages.map((img, index) => (
                <ImageBackground
                  key={index}
                  source={{ uri: img }}
                  style={styles.ctaCard}
                  imageStyle={{ borderRadius: 25 }}
                />
              ))}
            </ScrollView>
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

  welcomeContainer: { paddingHorizontal: 20, marginBottom: 12, minHeight: 35, justifyContent: 'center' },
  welcomeText: { fontSize: 24, fontWeight: '700', color: '#fff' },

  ctaWrapper: { paddingHorizontal: 20, marginBottom: 15 },
  ctaCard: {
    width: 320,
    height: 180,
    marginRight: 15,
    borderRadius: 25,
    overflow: 'hidden',
  },

  cardWrapper: { marginBottom: 8 },

  featureCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    height: 120,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ffffff15',
  },

  cardIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#FFFFFF18',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  iconImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 18,
  },

  cardTextContainer: {
    flex: 1,
    marginLeft: 14,
    marginTop: 10,
    justifyContent: 'center',
  },

  cardTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  cardSubtitle: { fontSize: 12, color: '#ffffff99', lineHeight: 16 },
});

export default HomeScreen;
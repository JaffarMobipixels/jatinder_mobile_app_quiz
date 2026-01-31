// PrayerScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList, Prayer } from '../../navigation/AuthStack';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';

type PrayerScreenNavigationProp =
  NativeStackNavigationProp<AuthStackParamList, 'PrayerScreen'>;

interface Props {
  navigation: PrayerScreenNavigationProp;
}

// ✅ Dummy prayers data
const dummyPrayers: Prayer[] = [
  {
    id: '1',
    title: { en: 'Morning Prayer', pa: 'صبح دی ارداس' },
    content: {
      en: 'Waheguru, bless my day, guide my thoughts, and give me strength to do good deeds.',
      pa: 'واہگرو، میرے دن نوں بابرکت بنا، میرے خیالاں دی رہنمائی فرما تے مینوں نیک کم کرنے دی طاقت عطا فرما۔',
    },
  },
  {
    id: '2',
    title: { en: 'Evening Prayer', pa: 'شام دی ارداس' },
    content: {
      en: 'Waheguru, thank You for today, forgive my mistakes, and grant me peace and rest.',
      pa: 'واہگرو، آج دے دن دا شکر ادا کردا ہاں، میریاں غلطیاں معاف فرما تے مینوں سکون تے آرام عطا فرما۔',
    },
  },
  {
    id: '3',
    title: { en: 'Prayer for Strength', pa: 'طاقت لئی ارداس' },
    content: {
      en: 'Waheguru, give me courage in difficult times and keep my heart calm and strong.',
      pa: 'واہگرو، مشکل ویلے وچ مینوں حوصلہ عطا فرما تے میرے دل نوں مضبوط تے پُرسکون رکھ۔',
    },
  },
  {
    id: '4',
    title: { en: 'Prayer for Guidance', pa: 'رہنمائی لئی ارداس' },
    content: {
      en: 'Waheguru, guide me on the right path and help me make wise decisions.',
      pa: 'واہگرو، مینوں صحیح راہ دکھا تے درست فیصلے کرنے وچ میری مدد فرما۔',
    },
  },
  {
    id: '5',
    title: { en: 'Prayer for Peace', pa: 'سکون لئی ارداس' },
    content: {
      en: 'Waheguru, fill my heart with peace and remove all worries from my mind.',
      pa: 'واہگرو، میرے دل نوں سکون نال بھر دے تے میرے ذہن توں ساری فکران دور کر دے۔',
    },
  },
  {
    id: '6',
    title: { en: 'Prayer for Family', pa: 'پریوار لئی ارداس' },
    content: {
      en: 'Waheguru, bless my family with health, love, and understanding.',
      pa: 'واہگرو، میرے پریوار نوں صحت، محبت تے آپسی سمجھ بوجھ عطا فرما۔',
    },
  },
  {
    id: '7',
    title: { en: 'Prayer for Patience', pa: 'صبر لئی ارداس' },
    content: {
      en: 'Waheguru, grant me patience and wisdom to face every challenge.',
      pa: 'واہگرو، ہر آزمائش دا سامنا کرنے لئی مینوں صبر تے سمجھ عطا فرما۔',
    },
  },
  {
    id: '8',
    title: { en: 'Prayer for Gratitude', pa: 'شکرانے دی ارداس' },
    content: {
      en: 'Waheguru, help me remain grateful for all the blessings in my life.',
      pa: 'واہگرو، زندگی وچ ملن والی ہر نعمت دا شکر گزار رہن دی توفیق عطا فرما۔',
    },
  },
  {
    id: '9',
    title: { en: 'Prayer for Hope', pa: 'امید لئی ارداس' },
    content: {
      en: 'Waheguru, fill my heart with hope and remove fear and doubt.',
      pa: 'واہگرو، میرے دل وچ امید پیدا کر تے ڈر تے شکوک دور کر دے۔',
    },
  },
  {
    id: '10',
    title: { en: 'Night Prayer', pa: 'رات دی ارداس' },
    content: {
      en: 'Waheguru, protect me through the night and grant me peaceful sleep.',
      pa: 'واہگرو، رات بھر میری حفاظت فرما تے مینوں چین دی نیند عطا فرما۔',
    },
  },
];

const PrayerScreen: React.FC<Props> = ({ navigation }) => {
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [language, setLanguage] = useState<'en' | 'pa'>('pa');

  useEffect(() => {
    setPrayers(dummyPrayers);
    setLoading(false);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setPrayers(dummyPrayers);
      setRefreshing(false);
    }, 1000);
  };

  const PrayerCard = ({ prayer }: { prayer: Prayer }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => navigation.navigate('PrayerDetail', { prayer, language })}
      style={styles.cardWrapper}
    >
      <LinearGradient
        colors={['#4F46E5', '#3B82F6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <Text
          style={[styles.cardTitle, { textAlign: language === 'pa' ? 'right' : 'left' }]}
        >
          {prayer.title[language]}
        </Text>
        <Text
          style={[styles.cardContent, { textAlign: language === 'pa' ? 'right' : 'left' }]}
          numberOfLines={3}
        >
          {prayer.content[language]}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#0A1F44', '#1E3A8A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <LinearGradient
          colors={['#4F46E5', '#3B82F6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Daily Prayers</Text>

          {/* Language toggle button */}
          <TouchableOpacity
            style={styles.langBtn}
            onPress={() => setLanguage(language === 'pa' ? 'en' : 'pa')}
          >
            <Text style={styles.langBtnText}>
              {language === 'pa' ? 'EN' : 'PA'}
            </Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Content */}
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#38BDF8"
            style={{ marginTop: 60 }}
          />
        ) : (
          <ScrollView
            contentContainerStyle={styles.content}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#38BDF8"
              />
            }
          >
            {prayers.map(prayer => (
              <PrayerCard key={prayer.id} prayer={prayer} />
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

export default PrayerScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  backButton: { width: 30, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '700', color: '#fff', textAlign: 'center' },
  langBtn: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  langBtnText: { color: '#fff', fontWeight: '700' },

  content: { padding: 20, paddingBottom: 40 },

  cardWrapper: { marginBottom: 16 },
  card: {
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 18,
    elevation: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  cardContent: { fontSize: 14, color: '#E0E0E0', lineHeight: 22 },
});

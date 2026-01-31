import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import database from '@react-native-firebase/database';
import Video from 'react-native-video';
import YoutubePlayer from 'react-native-youtube-iframe';

// Types for prayers
type Prayer = {
  id: string;
  title: { en: string; pa: string };
  content: { en: string; pa: string };
};

interface FullPrayer extends Prayer {
  videoURL?: string;
}

// Navigation stack
type AdminStackParamList = {
  Dashboard: undefined;
  PrayerScreen: undefined;
  AddPrayerScreen: undefined;
  EditPrayerScreen: { prayer: FullPrayer };
};

type Props = NativeStackScreenProps<AdminStackParamList, 'PrayerScreen'>;

const AdminPrayerScreen: React.FC<Props> = ({ navigation }) => {
  const [prayers, setPrayers] = useState<FullPrayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [videoLoadingMap, setVideoLoadingMap] = useState<{ [key: string]: boolean }>({});

  // Fetch prayers from Firebase
  const fetchPrayers = async () => {
    try {
      setLoading(true);
      const snapshot = await database().ref('prayers/prayer_written').once('value');
      const textData = snapshot.val() || {};

      const videoSnapshot = await database().ref('prayers/video').once('value');
      const videoData = videoSnapshot.val() || {};

      const prayersArray: FullPrayer[] = Object.keys(textData).map(key => ({
        ...textData[key].data,
        videoURL: videoData[key]?.downloadURL,
      }));

      const initialLoading: { [key: string]: boolean } = {};
      prayersArray.forEach(p => {
        if (p.videoURL) initialLoading[p.id] = true;
      });

      setVideoLoadingMap(initialLoading);
      setPrayers(prayersArray);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrayers();
  }, []);

  // Delete a prayer
  const deletePrayer = (id: string) => {
    Alert.alert('Delete Prayer', 'Are you sure you want to delete this prayer?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await database().ref(`prayers/prayer_written/${id}`).remove();
            await database().ref(`prayers/video/${id}`).remove();
            setPrayers(prev => prev.filter(p => p.id !== id));
          } catch (error: any) {
            Alert.alert('Error', error.message);
          }
        },
      },
    ]);
  };

  // Video loaded
  const handleVideoLoad = (id: string) => {
    setVideoLoadingMap(prev => ({ ...prev, [id]: false }));
  };

  // Single Prayer Card
  const PrayerCard = ({ prayer }: { prayer: FullPrayer }) => {
    let youtubeId: string | null = null;
    if (prayer.videoURL && (prayer.videoURL.includes('youtube') || prayer.videoURL.includes('youtu.be'))) {
      const match = prayer.videoURL.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
      youtubeId = match ? match[1] : null;
    }

    const isLoading = prayer.videoURL ? videoLoadingMap[prayer.id] : false;

    return (
      <LinearGradient colors={['#1E40AF', '#2563EB']} style={styles.card}>
        <Text style={styles.title}>{prayer.title.en}</Text>
        <Text style={styles.content}>{prayer.content.en}</Text>

        {prayer.videoURL && (
          <View style={styles.videoContainer}>
            {isLoading && youtubeId && (
              <Image
                source={{ uri: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` }}
                style={styles.video}
                resizeMode="cover"
              />
            )}

            {isLoading && (
              <ActivityIndicator
                size="large"
                color="#38BDF8"
                style={{ position: 'absolute', top: '45%', left: '45%', zIndex: 10 }}
              />
            )}

            {youtubeId ? (
              <YoutubePlayer
                height={200}
                play={false}
                videoId={youtubeId}
                onReady={() => handleVideoLoad(prayer.id)}
              />
            ) : (
              <Video
                source={{ uri: prayer.videoURL }}
                style={styles.video}
                controls
                resizeMode="contain"
                onLoad={() => handleVideoLoad(prayer.id)}
              />
            )}
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity onPress={() => navigation.navigate('EditPrayerScreen', { prayer })}>
            <Feather name="edit" size={20} color="#FACC15" style={{ marginBottom: 10 }} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => deletePrayer(prayer.id)}>
            <Feather name="trash-2" size={20} color="#F87171" style={{ marginRight: 20, marginBottom: 10 }} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  };

  return (
    <LinearGradient colors={['#020617', '#020617']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() =>
              navigation.reset({
                index: 0,
                routes: [{ name: 'Dashboard' }],
              })
            }
          >
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Manage Prayers</Text>

          <TouchableOpacity onPress={() => navigation.navigate('AddPrayerScreen')}>
            <Feather name="plus-circle" size={26} color="#22C55E" />
          </TouchableOpacity>
        </View>

        {/* BODY */}
        {loading ? (
          <ActivityIndicator size="large" color="#38BDF8" style={{ marginTop: 50 }} />
        ) : (
          <ScrollView contentContainerStyle={styles.list}>
            {prayers.length > 0 ? (
              prayers.map(prayer => <PrayerCard key={prayer.id} prayer={prayer} />)
            ) : (
              <Text style={styles.noData}>No prayers found.</Text>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

export default AdminPrayerScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  list: {
    padding: 16,
  },
  card: {
    borderRadius: 16,
    marginBottom: 14,
    paddingBottom: 12,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 6,
    fontWeight: '700',
  },
  content: {
    color: '#CBD5F5',
    fontSize: 14,
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 16,
  },
  noData: {
    color: '#94A3B8',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
  videoContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
  },
  video: {
    width: '100%',
    height: '100%',
  },
});

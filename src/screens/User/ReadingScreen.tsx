import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import database from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';
import Video from 'react-native-video';
import YoutubePlayer from 'react-native-youtube-iframe';


const { width } = Dimensions.get('window');

const ReadingScreen = ({ navigation }: any) => {
  const [activeTab, setActiveTab] = useState<'prayer' | 'audio' | 'video'>('prayer');
  const [writtenPrayers, setWrittenPrayers] = useState<any[]>([]);
  const [audioList, setAudioList] = useState<any[]>([]);
  const [videoList, setVideoList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [videoLoadingMap, setVideoLoadingMap] = useState<Record<string, boolean>>({});

  // Fetch prayers/audio/video from Firebase
  useEffect(() => {
    const ref = database().ref('prayers');

    const listener = ref.on('value', snapshot => {
      const data = snapshot.val() || {};

      // Written prayers
  const written = data.prayer_written
  ? Object.keys(data.prayer_written).map(key => {
      const item = data.prayer_written[key];

      return {
        id: key,
        title:
          typeof item?.title === 'object'
            ? item?.title?.en || item?.title?.pa || 'Prayer'
            : item?.title || 'Prayer',

        content:
          typeof item?.content === 'object'
            ? item?.content?.en || item?.content?.pa || ''
            : item?.content || '',
      };
    })
  : [];


      setWrittenPrayers(written.reverse());

      // Audio
    const audios = data.audio
  ? Object.keys(data.audio).map(key => {
      const rawUrl = data.audio[key]?.audioUrl || data.audio[key]?.url || '';
      const cleanUrl = rawUrl.replace(/%22$/, '').replace(/"$/, ''); // remove trailing %22 or quotes
      return {
        id: key,
        title: data.audio[key]?.title ?? 'Prayer Audio',
        url: cleanUrl,
      };
    })
  : [];
setAudioList(audios.reverse());


      // Video
      const videos = data.video
        ? Object.keys(data.video).map(key => ({
            id: key,
            title: data.video[key]?.title ?? 'Video',
            url: data.video[key]?.downloadURL || data.video[key]?.url || '',
          }))
        : [];
      setVideoList(videos.reverse());

      const loadingMap: Record<string, boolean> = {};
      videos.forEach(v => (loadingMap[v.id] = true));
      setVideoLoadingMap(loadingMap);

      setLoading(false);
    });

    return () => ref.off('value', listener);
  }, []);

  const handleVideoLoad = (id: string) => {
    setVideoLoadingMap(prev => ({ ...prev, [id]: false }));
  };

  // -------------------------------
  // Audio Upload Function
  // -------------------------------
  const uploadAudio = async () => {
    try {
      setUploading(true);

    
      Alert.alert('Success', 'Audio uploaded successfully!');
    } catch (err) {
      const error = err as any; // TypeScript-safe

     
    } finally {
      setUploading(false);
    }
  };

  // -------------------------------
  // Render Content Based on Active Tab
  // -------------------------------
  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#38BDF8" style={{ marginTop: 40 }} />;
    }

    // PRAYER TAB
    if (activeTab === 'prayer') {
      if (!writtenPrayers.length) return <Text style={styles.empty}>No Prayers Found</Text>;

      return writtenPrayers.map(item => (
        <View key={item.id} style={styles.prayerCard}>
          <LinearGradient colors={['#1E3A8A', '#312E81']} style={styles.prayerGradient}>
            <Text style={styles.prayerTitle}>{item.title}</Text>
            <View style={styles.divider} />
            <Text style={styles.prayerPreview}>{item.content}</Text>
            <Text
              style={styles.readMore}
              onPress={() =>
                navigation.navigate('PrayerReader', {
                  title: item.title,
                  content: item.content,
                })
              }
            >
              Read Prayer →
            </Text>
          </LinearGradient>
        </View>
      ));
    }

    // AUDIO TAB
    if (activeTab === 'audio') {
      return (
        <>
         

          {!audioList.length ? (
            <Text style={styles.empty}>No Audio Found</Text>
          ) : (
            audioList.map(audio => (
              <TouchableOpacity
                key={audio.id}
                style={styles.audioCard}
                activeOpacity={0.85}
                onPress={() =>
                  navigation.navigate('AudioPlayer', {
                    audioUrl: audio.url,
                    audioTitle: audio.title,
                  })
                }
              >
                <LinearGradient colors={['#1E40AF', '#2563EB']} style={styles.audioGradient}>
                  <View style={styles.audioIcon}>
                    <Feather name="headphones" size={22} color="#fff" />
                  </View>
                  <View style={styles.audioInfo}>
                    <Text numberOfLines={1} style={styles.audioTitle}>
                      {audio.title}
                    </Text>
                    <Text style={styles.audioSub}>Tap to play prayer</Text>
                  </View>
                  <Feather name="chevron-right" size={22}  color="#E0E7FF"  style={{ marginRight: 20 }} // ← Right margin added
/>

                </LinearGradient>
              </TouchableOpacity>
            ))
          )}
        </>
      );
    }

    // VIDEO TAB
    if (activeTab === 'video') {
      if (!videoList.length) return <Text style={styles.empty}>No Videos Found</Text>;

      return videoList.map(video => {
        const isYouTube = video.url?.includes('youtube') || video.url?.includes('youtu.be');
        const match = isYouTube ? video.url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/) : null;
        const youtubeId = match?.[1] ?? null;
        const thumbnail = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : null;
        const isLoading = videoLoadingMap[video.id];

        return (
          <View key={video.id} style={styles.videoCard}>
            <Text style={styles.prayerTitle}>{video.title}</Text>
            <View style={styles.videoContainer}>
              {isLoading && thumbnail && <Image source={{ uri: thumbnail }} style={styles.video} />}
              {isLoading && (
                <ActivityIndicator size="large" color="#38BDF8" style={styles.videoLoader} />
              )}
              {isYouTube && youtubeId ? (
                <YoutubePlayer
                  height={220}
                  play={false}
                  videoId={youtubeId}
                  onReady={() => handleVideoLoad(video.id)}
                />
              ) : video.url ? (
                <Video
                  source={{ uri: video.url }}
                  style={styles.video}
                  controls
                  resizeMode="contain"
                  onLoad={() => handleVideoLoad(video.id)}
                />
              ) : (
                <Text style={styles.empty}>Invalid video URL</Text>
              )}
            </View>
          </View>
        );
      });
    }

    return <Text />;
  };

  return (
    <LinearGradient colors={['#0A1F44', '#1E3A8A']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          {/* HEADER */}
          <LinearGradient colors={['#4F46E5', '#3B82F6']} style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Feather name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Prayers</Text>
            <View style={{ width: 40 }} />
          </LinearGradient>

          {/* TABS */}
          <View style={styles.tabs}>
            {['prayer', 'audio', 'video'].map(tab => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.activeTab]}
                onPress={() => setActiveTab(tab as any)}
              >
                <Text style={styles.tabText}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {renderContent()}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default ReadingScreen;

// -------------------------------
// Styles
// -------------------------------
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 5,
    paddingHorizontal: 16,
    height: 70,
  },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800', textAlign: 'center' },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },

  tabs: { flexDirection: 'row', backgroundColor: '#020617', borderRadius: 14, marginBottom: 25, padding: 4 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  activeTab: { backgroundColor: '#2563EB' },
  tabText: { color: '#E5E7EB', fontSize: 14, fontWeight: '600' },

prayerCard: {
  borderRadius: 25,             // Card corners
  elevation: 10,                // Android shadow
  shadowColor: '#000',          // iOS shadow
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.3,
  shadowRadius: 15,
  marginBottom: 20,             // Space between cards

  width: '100%',                // Full width card
  minHeight: 150,               // Minimum height uniform
  backgroundColor: 'transparent',
  alignSelf: 'center',
  overflow: 'visible',          // iOS shadow fix

  flexDirection: 'row',         // Row layout for icon + text if needed
  alignItems: 'center',         // Vertically center content
},

prayerGradient: {
  borderRadius: 25,             // Matches card radius                 // Inner padding
  width: '100%',                 // Fill card width
  minHeight: 150,                // Same as card for uniformity
  justifyContent: 'flex-start', // Content alignment
},

prayerTitle: {
  fontSize: 18,
  fontWeight: '800',
  marginBottom: 10,
  color: '#fff',
  margin:20,
  textShadowColor: 'rgba(0,0,0,0.3)',
  textShadowOffset: { width: 0, height: 2 },
  textShadowRadius: 4,
},

divider: {
  height: 1,
  backgroundColor: 'rgba(255,255,255,0.25)',
  marginVertical: 8,
},

prayerPreview: {
  fontSize: 14,
  lineHeight: 20,
    margin:20,
  color: '#fff',
  textShadowColor: 'rgba(0,0,0,0.2)',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 2,
  marginBottom: 10,
},

readMore: {
  fontSize: 12,
  color: '#93C5FD',
    margin:20,
  fontWeight: '700',
  textAlign: 'right',
},


 audioCard: {
  borderRadius: 20,
  backgroundColor: '#1E40AF', // Card background
  marginVertical: 8,
  shadowColor: '#000',
  shadowOpacity: 0.25,
  shadowOffset: { width: 0, height: 6 },
  shadowRadius: 12,
  elevation: 5,
},

audioCardContent: {
  borderRadius: 20,
  overflow: 'hidden', // clip only inside content, not shadow
},
  audioGradient: { flexDirection: 'row', alignItems: 'center', height:80,  borderRadius: 20 },
  audioIcon: { width: 46, height: 46, marginLeft:20, borderRadius: 23, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  audioInfo: { flex: 1, justifyContent: 'center' },
  audioTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  audioSub: { fontSize: 12, color: '#E0E7FF', opacity: 0.8 },



  videoContainer: { width: width - 40, height: 220, borderRadius: 12, overflow: 'hidden', marginTop: 10, backgroundColor: '#000' },
  video: { width: '100%', height: '100%' },
  videoCard: { marginBottom: 20 },
  videoLoader: {
    position: 'absolute',
    top: '45%',
    left: '45%',
    zIndex: 10,
  },

  empty: { color: '#E5E7EB', textAlign: 'center', marginTop: 60, fontSize: 16, fontWeight: '500', opacity: 0.7 },
});

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ActivityIndicator, BackHandler } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import Slider from '@react-native-community/slider';
import Sound from 'react-native-sound';

const AudioPlayerScreen: React.FC<any> = ({ route, navigation }) => {
  const { audioTitle, audioUrl } = route.params;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);

  const soundRef = useRef<Sound | null>(null);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    Sound.setCategory('Playback');

    // Initialize sound
    soundRef.current = new Sound(audioUrl, undefined, (error) => {
      if (error) {
        console.log('Audio load error:', error);
        setLoading(false);
        return;
      }
      setDuration(soundRef.current?.getDuration() || 0);
      setLoading(false);
      playAudio(); // Auto play when loaded
    });

    // Handle Android back press
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      stopAudio();
      return false; // allow default back behavior
    });

    return () => {
      stopAudio();
      backHandler.remove();
    };
  }, [audioUrl]);

  const startTracking = () => {
    intervalRef.current = setInterval(() => {
      soundRef.current?.getCurrentTime((sec) => setCurrentTime(sec));
    }, 500);
  };

  const stopTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const stopAudio = () => {
    stopTracking();
    if (soundRef.current) {
      soundRef.current.stop(() => {
        setIsPlaying(false);
        setCurrentTime(0);
        soundRef.current?.release();
        soundRef.current = null;
      });
    }
  };

  const playAudio = () => {
    if (!soundRef.current) return;

    soundRef.current.play((success) => {
      if (success) {
        setIsPlaying(false);
        setCurrentTime(0);
      } else {
        console.log('Playback failed');
      }
      stopTracking();
    });

    setIsPlaying(true);
    startTracking();
  };

  const togglePlayPause = () => {
    if (!soundRef.current) return;

    if (isPlaying) {
      soundRef.current.pause();
      setIsPlaying(false);
      stopTracking();
    } else {
      playAudio();
    }
  };

  const formatTime = (sec: number) => {
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <LinearGradient colors={['#0A1F44', '#1E3A8A']} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />

      {/* Header */}
      <LinearGradient colors={['#4F46E5', '#3B82F6']} style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            stopAudio(); // stop audio on back
            navigation.goBack();
          }}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{audioTitle || 'Audio Player'}</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {/* Play / Pause */}
      <View style={styles.playButtonContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
            <Feather name={isPlaying ? 'pause' : 'play'} size={48} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Slider & Time */}
      <View style={styles.controlsContainer}>
        <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
        <Slider
          style={{ width: '100%', height: 40 }}
          minimumValue={0}
          maximumValue={duration}
          value={currentTime}
          minimumTrackTintColor="#3B82F6"
          maximumTrackTintColor="#E0E0E0"
          thumbTintColor="#F59E0B"
          onSlidingComplete={(value) => {
            soundRef.current?.setCurrentTime(value);
            setCurrentTime(value);
          }}
        />
        <Text style={[styles.timeText, { alignSelf: 'flex-end' }]}>{formatTime(duration)}</Text>
      </View>
    </LinearGradient>
  );
};

export default AudioPlayerScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 90,
    borderRadius: 20,
    marginTop: 90,
    elevation: 10,
  },
  backButton: { marginRight: 12, marginTop: 50, marginLeft: 15 },
  headerTitle: { flex: 1, fontSize: 22, fontWeight: '700', marginTop: 50, color: '#fff', textAlign: 'center' },
  playButtonContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  playButton: { backgroundColor: '#3B82F6', padding: 25, borderRadius: 60, elevation: 8 },
  controlsContainer: { marginHorizontal: 20, marginBottom: 50 },
  timeText: { color: '#E0E0E0', fontSize: 14, marginBottom: 5 },
});

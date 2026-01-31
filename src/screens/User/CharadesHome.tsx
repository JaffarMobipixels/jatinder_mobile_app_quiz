import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Orientation from 'react-native-orientation-locker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootStackParams';

type CharadesHomeProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CharadesHome'>;
};

const { width } = Dimensions.get('window');

const CharadesHome: React.FC<CharadesHomeProps> = ({ navigation }) => {

  useEffect(() => {
    Orientation.lockToPortrait();
  }, []);

  const startGame = () => {
    navigation.replace('CharadesCategory');
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('HomeScreen');
    }
  };

  return (
    <LinearGradient
      colors={['#0A1F44', '#1E3A8A', '#0F172A']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        
        {/* Top Navigation Row */}
        <View style={styles.topBar}>
          <TouchableOpacity 
            onPress={handleBack} 
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)']}
              style={styles.backCircle}
            >
              <Text style={styles.backIconText}>←</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.brandText}>GOQUIZZER</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>CHARADES EDITION</Text>
          </View>
        </View>

        {/* 3D Modern Content Card */}
        <View style={styles.cardOuter}>
          <LinearGradient
            colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
            style={styles.cardInner}
          >
            <Text style={styles.emoji}>🎮</Text>
            <Text style={styles.title}>Charades Game</Text>
            <Text style={styles.subtitle}>
              Hold the phone on your forehead, get hints from friends, and guess the word!
            </Text>
          </LinearGradient>
        </View>

        {/* Start Button with Glow */}
        <View style={styles.buttonWrapper}>
          <TouchableOpacity 
            style={styles.startButton} 
            onPress={startGame}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#4F46E5', '#3B82F6']}
              style={styles.buttonGradient}
            >
              <Text style={styles.startButtonText}>START GAME</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Footer info */}
        <Text style={styles.footerNote}>Tilt Up for Correct • Tilt Down for Pass</Text>

      </SafeAreaView>
    </LinearGradient>
  );
};

export default CharadesHome;

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 20 },
  
  // Back Button Styles
  topBar: {
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'flex-start',
  },
  backButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  backCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  backIconText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: -4, // Optical alignment
  },

  header: { alignItems: 'center' },
  brandText: { 
    fontSize: 24, 
    fontWeight: '900', 
    color: '#fff', 
    letterSpacing: 4,
    textShadowColor: 'rgba(59, 130, 246, 0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  badge: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  badgeText: { color: '#3B82F6', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },

  cardOuter: {
    width: width * 0.85,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 25,
  },
  cardInner: {
    height:250,
    borderRadius: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  emoji: { fontSize: 50, marginTop:50, },
  title: { fontSize: 28, fontWeight: '900', color: '#fff', marginTop:20,  textAlign: 'center' },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 24, fontWeight: '500' },

  buttonWrapper: {
    width: '100%',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 15,
  },
  startButton: {
    width: width * 0.7,
    height: 65,
    borderRadius: 35,
    overflow: 'hidden',
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButtonText: { fontSize: 20, fontWeight: '900', color: '#fff', letterSpacing: 2 },
  
  footerNote: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
  },
});
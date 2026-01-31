import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native'; // Reset logic ke liye
import LinearGradient from 'react-native-linear-gradient'; 
import { RootStackParamList } from '../../navigation/RootStackParams';

type CharadesResultProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CharadesResult'>;
  route: { params: { score: number } };
};

const { width } = Dimensions.get('window');

const CharadesResult: React.FC<CharadesResultProps> = ({ navigation, route }) => {
  const { score } = route.params;

  const playAgain = () => {
    navigation.replace('CharadesPlay');
  };

  // Stack ko reset karke Home par le jane wala function
  const goHome = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'CharadesHome' }],
      })
    );
  };

  return (
    <LinearGradient
      colors={['#0A1F44', '#1E3A8A', '#0F172A']} 
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        
        {/* Modern 3D Score Card */}
        <View style={styles.resultCardOuter}>
          <LinearGradient
            colors={['#4F46E5', '#3B82F6']}
            style={styles.resultCard}
          >
            <Text style={styles.title}>TIME'S UP! ⏰</Text>
            
            <View style={styles.scoreCircle}>
                <Text style={styles.scoreLabel}>TOTAL SCORE</Text>
                <Text style={styles.scoreValue}>{score}</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={playAgain}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FFFFFF', '#E2E8F0']}
              style={styles.buttonGradient}
            >
              <Text style={styles.primaryButtonText}>PLAY AGAIN</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={goHome}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>GO TO HOME</Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  resultCardOuter: {
    width: width * 0.85,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 25,
    marginBottom: 50,
  },
  resultCard: {
   
    borderRadius: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  title: { 
    fontSize: 32, 
    fontWeight: '900', 
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 30,
    marginTop:30,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },
  scoreCircle: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 30,
    borderRadius: 100,
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginBottom:30,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  scoreLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '700', letterSpacing: 1.5 },
  scoreValue: { color: '#FFFFFF', fontSize: 70, fontWeight: '900' },
  buttonContainer: { width: '100%', alignItems: 'center' },
  primaryButton: {
    width: width * 0.7,
    height: 60,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  buttonGradient: { flex: 1, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  primaryButtonText: { fontSize: 18, fontWeight: '800', color: '#0A1F44', letterSpacing: 1 },
  secondaryButton: {
    marginTop: 25,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.3)',
  },
  secondaryButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', letterSpacing: 1 },
});

export default CharadesResult;
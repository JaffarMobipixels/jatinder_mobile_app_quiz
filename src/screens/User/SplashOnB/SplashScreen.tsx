import React, { useEffect } from 'react';
import {
  SafeAreaView,
  Text,
  StyleSheet,
  View,
  StatusBar,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const SplashScreen = ({ navigation }: any) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Welcome');
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <>
      {/* iOS status bar */}
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <LinearGradient
        colors={['#0A1F44', '#1E3A8A', '#0F172A']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.logoOuter}>
            <LinearGradient
              colors={['#4F46E5', '#3B82F6']}
              style={styles.logoBox}
            >
              <Text style={styles.logoText}>GOQUIZZER</Text>
            </LinearGradient>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoOuter: {
    /* iOS shadow */
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 20,

    /* Android fallback */
    elevation: Platform.OS === 'android' ? 20 : 0,
  },

  logoBox: {
    
   height:100,
    borderRadius: 32,
    alignItems: 'center',
  },

  logoText: {
    fontSize: 42,
    margin:20,
    fontWeight: Platform.OS === 'ios' ? '800' : '900',
    color: '#FFFFFF',
    letterSpacing: 3,

    /* iOS text shadow */
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1.5, height: 2.5 },
    textShadowRadius: 5,
  },
});

export default SplashScreen;

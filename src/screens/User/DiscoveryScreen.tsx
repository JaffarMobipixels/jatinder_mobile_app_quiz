import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

const DiscoveryScreen = ({ navigation }: any) => {
  return (
    <LinearGradient
      colors={['#0A1F44', '#1E3A8A', '#0F172A']}
      style={styles.container}
    >
      {/* IMAGE */}
      <View style={styles.imageWrapper}>
        <Image
          source={require('../../assets/Discover_icon.png')}
          style={styles.topImage}
          resizeMode="contain"
        />
      </View>

      {/* TEXT */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>Discover Your Brain Power</Text>
        <Text style={styles.subtitle}>
          Tips & tricks to grow a healthy brain
        </Text>
      </View>

      {/* BOTTOM (Same as Welcome Screen) */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Community')}
        >
          <LinearGradient
            colors={['#4F46E5', '#3B82F6']}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* DOTS */}
        <View style={styles.dots}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: '#0A1F44',
  },

  imageWrapper: {
    marginTop: 70,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
  },

  topImage: {
    width: width * 0.8,
    height: height * 0.4,
  },

  textContainer: {
    paddingHorizontal: 30,
    alignItems: 'center',
    marginTop: -10,
  },

  title: {
    fontSize: 30,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 2, height: 4 },
    textShadowRadius: 6,
  },

  subtitle: {
    marginTop: 12,
    fontSize: 17,
    color: '#E5E7EB',
    textAlign: 'center',
    lineHeight: 26,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },

  bottomContainer: {
    paddingBottom: 50,
    alignItems: 'center',
  },

button: {
  width: 260,        // consistent button width
  height: 56,        // standard height
  borderRadius: 30,

  justifyContent: 'center', // 👈 vertical center
  alignItems: 'center',     // 👈 horizontal center

  shadowColor: '#3B82F6',
  shadowOpacity: 0.7,
  shadowOffset: { width: 0, height: 8 },
  shadowRadius: 16,
  elevation: 12,

  marginBottom: 30,
},

buttonText: {
  color: '#FFFFFF',
  fontSize: 18,
  fontWeight: '700',
  letterSpacing: 0.5,
},

  dots: {
    flexDirection: 'row',
  },

  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#334155',
    marginHorizontal: 6,
  },

  activeDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.8,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
});

export default DiscoveryScreen;

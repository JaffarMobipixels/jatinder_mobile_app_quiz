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

const CommunityScreen = ({ navigation }: any) => {
  return (
    <LinearGradient
      colors={['#0A1F44', '#1E3A8A', '#0F172A']}
      style={styles.container}
    >
      {/* IMAGE */}
      <View style={styles.imageWrapper}>
        <Image
          source={require('../../assets/community_icon.png')}
          style={styles.topImage}
          resizeMode="contain"
        />
      </View>

      {/* TEXT */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>Challenge Friends</Text>
        <Text style={styles.subtitle}>
          Play quizzes and grow smarter every day
        </Text>
      </View>

      {/* BOTTOM (Same as Welcome & Discovery) */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Auth', { screen: 'Signup' })}
        >
          <LinearGradient
            colors={['#2563EB', '#3B82F6']}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Create Account</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* DOTS */}
        <View style={styles.dots}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={[styles.dot, styles.activeDot]} />
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
    width: width * 0.85,
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
    color: '#CBD5E1',
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
  width: 260,          // fixed clean width
  height: 56,          // perfect button height
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
    backgroundColor: '#1E3A8A',
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

export default CommunityScreen;

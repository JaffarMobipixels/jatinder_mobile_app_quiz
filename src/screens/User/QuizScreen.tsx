import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Modal,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import database from '@react-native-firebase/database';

const { width } = Dimensions.get('window');

/* ---------- Menu Button ---------- */
const MenuButton = ({ label, iconName, color, top, left, right, bottom, onPress }: any) => (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={onPress}
    style={[styles.menuItem, { top, left, right, bottom }]}
  >
    <View style={[styles.iconCircle, { backgroundColor: color }]}>
      <Icon name={iconName} size={36} color="#fff" />
    </View>
    <Text style={styles.menuText}>{label}</Text>
  </TouchableOpacity>
);

/* ---------- MAIN SCREEN ---------- */
export default function GameMenuScreen() {
  const navigation = useNavigation<any>();
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);

  /* ---------- FETCH AVATAR FROM FIREBASE ---------- */
  useEffect(() => {
    const ref = database().ref('gameMenuScreen/centerAvatar');

    const listener = ref.on('value', snapshot => {
      const value = snapshot.val();
      if (value && value.length > 5) {
        setAvatar(value);
      }
      setLoading(false);
    });

    return () => ref.off('value', listener);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1F44" />

      {/* ---------- HEADER ---------- */}
      <View style={styles.headerWrapper}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtnHeader}
        >
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Quiz App</Text>
        <View style={{ width: 42 }} />
      </View>

      {/* ---------- MAIN AREA ---------- */}
      <View style={styles.mainArea}>
        {/* Center Avatar or Loader */}
        <View style={styles.centerOuterCircle}>
          <View style={styles.centerInnerCircle}>
            {loading ? (
              <ActivityIndicator size="large" color="#2563EB" />
            ) : (
              <Image
                source={
                  avatar
                    ? { uri: avatar }
                    : require('../../assets/quizscreenavator.jpeg')
                }
                style={styles.avatarImage}
                resizeMode="cover"
              />
            )}
          </View>
        </View>

        {/* ---------- HARDCODED MENU BUTTONS ---------- */}
        <MenuButton
          label="New Game"
          iconName="controller-classic"
          color="#2563EB"
          top={20}
          left={width / 2 - 50}
          onPress={() => navigation.navigate('CategoryScreen')}
        />

        <MenuButton
          label="Game Rules"
          iconName="book-open-variant"
          color="#1E40AF"
          top={120}
          left={15}
          onPress={() => navigation.navigate('RulesScreen')}
        />

        <MenuButton
          label="Game Stats"
          iconName="chart-line"
          color="#1E40AF"
          top={120}
          right={15}
          onPress={() => navigation.navigate('GameStats')}
        />

        <MenuButton
          label="Leaderboard"
          iconName="trophy-variant-outline"
          color="#3B82F6"
          top={275}
          left={10}
          onPress={() => navigation.navigate('LeaderboardScreen')}
        />

      

        <MenuButton
          label="Profile"
          iconName="account-outline"
          color="#60A5FA"
          bottom={20}
          left={width / 2 - 50}
          onPress={() => navigation.navigate('UserProfileScreen')}
        />

        <MenuButton
          label="Who is playing"
          iconName="map-marker-outline"
          color="#60A5FA"
          top={275}
          right={10}
          onPress={() => setShowMap(true)}
        />
      </View>

      {/* ---------- MAP MODAL ---------- */}
      <Modal visible={showMap} animationType="slide">
        <View style={{ flex: 1 }}>
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: 24.8607,
              longitude: 67.0011,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            <Marker
              coordinate={{ latitude: 24.8607, longitude: 67.0011 }}
              title="Player Location"
            />
          </MapView>

          <TouchableOpacity
            style={styles.closeMapBtn}
            onPress={() => setShowMap(false)}
          >
            <Text style={styles.closeMapText}>Close Map</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0A1F44' },

  headerWrapper: {
    height: 90,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#1E3A8A',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  backBtnHeader: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
  },

  mainArea: {
    width,
    height: 480,
    justifyContent: 'center',
    alignItems: 'center',
  },

  centerOuterCircle: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 2,
    borderColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E3A8A',
  },

  centerInnerCircle: {
    width: 155,
    height: 155,
    borderRadius: 78,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarImage: {
    width: '100%',
    height: '100%',
  },

  menuItem: {
    position: 'absolute',
    alignItems: 'center',
    width: 100,
  },

  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },

  menuText: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
  },

  closeMapBtn: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: '#1E40AF',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
  },

  closeMapText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A1F44',
  },
});

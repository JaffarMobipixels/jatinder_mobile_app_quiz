// PrayerReader.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';

const PrayerReader = ({ route, navigation }: any) => {
  const { title, content } = route.params;

  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
          <View style={{ width: 22 }} />
        </View>

        {/* CONTENT */}
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Title Card */}
          <LinearGradient
            colors={['#1E3A8A', '#312E81']}
            style={styles.titleCard}
          >
            <Text style={styles.titleText}>{title}</Text>
          </LinearGradient>

          {/* Prayer Text */}
          <View style={styles.prayerBox}>
            <Text style={styles.prayerText}>{content}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default PrayerReader;

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },

  container: {
    padding: 20,
    paddingBottom: 40,
  },

  titleCard: {
    borderRadius: 18,
    height:60,
    marginBottom: 20,
    alignItems: 'center',
  },
  titleText: {
    color: '#fff',
    fontSize: 18,
    margin:20,
    fontWeight: '800',
    textAlign: 'center',
  },

  prayerBox: {
    backgroundColor: '#020617',
    borderRadius: 16,
    padding: 18,
  },
  prayerText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#E5E7EB',
    textAlign: 'left',
  },
});

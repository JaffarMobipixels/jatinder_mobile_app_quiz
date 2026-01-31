// PrayerDetailScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Clipboard, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthStack';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';

type Props = NativeStackScreenProps<AuthStackParamList, 'PrayerDetail'>;

const PrayerDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { prayer, language } = route.params;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${prayer.title[language]}\n\n${prayer.content[language]}`,
      });
    } catch (error) {
      console.log('Error sharing prayer:', error);
    }
  };

  const handleCopy = () => {
    Clipboard.setString(`${prayer.title[language]}\n\n${prayer.content[language]}`);
    Alert.alert("Copied!", "Prayer text has been copied to clipboard.");
  };

  return (
    <LinearGradient
      colors={['#0A1F44', '#1E3A8A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Prayer Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Prayer Card */}
        <View style={styles.container}>
          <Text
            style={[
              styles.title,
              { textAlign: language === 'pa' ? 'right' : 'left' },
            ]}
          >
            {prayer.title[language]}
          </Text>
          <Text
            style={[
              styles.content,
              { textAlign: language === 'pa' ? 'right' : 'left' },
            ]}
          >
            {prayer.content[language]}
          </Text>

          {/* Buttons inside card */}
          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={handleCopy} style={styles.cardButton}>
              <Feather name="copy" size={20} color="#fff" />
              <Text style={styles.buttonText}>Copy</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={styles.cardButton}>
              <Feather name="share-2" size={20} color="#fff" />
              <Text style={styles.buttonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop:40,
    paddingVertical: 15,
    marginBottom: 10,
  },
  backButton: {
    backgroundColor: '#3B82F6',
    padding: 8,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    padding: 25,
    borderRadius: 20,
    backgroundColor: '#4F46E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 15,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  content: {
    fontSize: 18,
    lineHeight: 28,
    color: '#E0E0E0',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  cardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PrayerDetailScreen;

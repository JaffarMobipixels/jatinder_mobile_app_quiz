import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../localization/i18n';

const LanguageSelectScreen = ({ navigation }: any) => {

  const selectLanguage = async (lang: string) => {
    await AsyncStorage.setItem('APP_LANGUAGE', lang);
    i18n.locale = lang;

    navigation.replace('Home'); // ya CategoryScreen
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{i18n.t('selectLanguage')}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => selectLanguage('en')}
      >
        <Text style={styles.text}>English</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => selectLanguage('pa')}
      >
        <Text style={styles.text}>Punjabi</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LanguageSelectScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, marginBottom: 30 },
  button: {
    padding: 15,
    width: '70%',
    backgroundColor: '#4A90E2',
    marginVertical: 10,
    borderRadius: 8,
  },
  text: { color: '#fff', textAlign: 'center', fontSize: 18 },
});

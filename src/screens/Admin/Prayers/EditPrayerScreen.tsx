import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
 
/* ===== TYPES ===== */
import {
  AdminStackParamList,
  Prayer,
} from '../../../navigation/AdminStack';
 
type EditPrayerRouteProp = RouteProp<
  AdminStackParamList,
  'EditPrayerScreen'
>;
 
type EditPrayerNavigationProp = NativeStackNavigationProp<
  AdminStackParamList,
  'EditPrayerScreen'
>;
 
interface Props {
  route: EditPrayerRouteProp;
  navigation: EditPrayerNavigationProp;
}
 
const EditPrayerScreen: React.FC<Props> = ({ route, navigation }) => {
  const { prayer } = route.params;
 
  /* ===== STATE ===== */
  const [titleEn, setTitleEn] = useState(prayer.title.en);
  const [titlePa, setTitlePa] = useState(prayer.title.pa);
  const [contentEn, setContentEn] = useState(prayer.content.en);
  const [contentPa, setContentPa] = useState(prayer.content.pa);
 
  /* ===== SAVE HANDLER ===== */
  const handleSave = () => {
    if (!titleEn || !contentEn) {
      Alert.alert('Validation', 'English title and content are required');
      return;
    }
 
    const updatedPrayer: Prayer = {
      id: prayer.id,
      title: {
        en: titleEn,
        pa: titlePa,
      },
      content: {
        en: contentEn,
        pa: contentPa,
      },
    };
 
    console.log('UPDATED PRAYER:', updatedPrayer);
 
    Alert.alert('Success', 'Prayer updated successfully');
    navigation.goBack();
  };
 
  return (
    <LinearGradient colors={['#020617', '#020617']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* ===== HEADER ===== */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
 
          <Text style={styles.headerTitle}>Edit Prayer</Text>
 
          <TouchableOpacity onPress={handleSave}>
            <Feather name="check" size={24} color="#22C55E" />
          </TouchableOpacity>
        </View>
 
        {/* ===== FORM ===== */}
        <View style={styles.form}>
          <Text style={styles.label}>Title (English)</Text>
          <TextInput
            style={styles.input}
            value={titleEn}
            onChangeText={setTitleEn}
            placeholder="Enter title in English"
            placeholderTextColor="#64748B"
          />
 
          <Text style={styles.label}>Title (Punjabi)</Text>
          <TextInput
            style={styles.input}
            value={titlePa}
            onChangeText={setTitlePa}
            placeholder="Enter title in Punjabi"
            placeholderTextColor="#64748B"
          />
 
          <Text style={styles.label}>Content (English)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={contentEn}
            onChangeText={setContentEn}
            placeholder="Enter prayer content"
            placeholderTextColor="#64748B"
            multiline
          />
 
          <Text style={styles.label}>Content (Punjabi)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={contentPa}
            onChangeText={setContentPa}
            placeholder="Enter prayer content"
            placeholderTextColor="#64748B"
            multiline
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};
 
export default EditPrayerScreen;
 
/* ================= STYLES ================= */
 
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  form: {
    padding: 16,
  },
  label: {
    color: '#CBD5F5',
    fontSize: 14,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
});
import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  View,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import database from '@react-native-firebase/database';
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';

const AddTabScreen = ({ navigation }: any) => {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Default values jo aap manually change bhi kar sakte hain
  const [iconName, setIconName] = useState('book-open-variant');
  const [navigateTo, setNavigateTo] = useState('');

  const saveTab = async () => {
    if (!title.trim() || !navigateTo.trim()) {
      Alert.alert('Error', 'Tab Name aur Screen Name dono zaroori hain');
      return;
    }

    try {
      setLoading(true);

      const cleanTitle = title.trim();
      // Yahan hum order set karne ke liye pehle count le sakte hain ya timestamp use kar sakte hain
      const orderValue = Date.now(); 

      // 🔴 IMPORTANT: Path exactly wahi jo HomeScreen mein hai
      const ref = database().ref('/adminTabs');
      const newTabRef = ref.push();

      await newTabRef.set({
        id: newTabRef.key,
        title: cleanTitle,
        iconName: iconName,
        iconType: 'MCI',
        navigateTo: navigateTo.trim(), // Jo screen aapne open karni hai uska exact name
        colors: ['#36D1DC', '#5B86E5'], // Aap isse dynamic bhi bana sakte hain
        order: orderValue,
        createdAt: database.ServerValue.TIMESTAMP,
      });

      Alert.alert('Success', 'Naya tab add ho gaya!');
      navigation.goBack();
    } catch (error: any) {
      console.log('Firebase Error:', error);
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#A1C4FD', '#C2E9FB']} style={styles.container}>
      <ScrollView contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}}>
        <Text style={styles.heading}>Add New Module</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Tab Title</Text>
          <TextInput
            placeholder="e.g. Daily Sakhi"
            placeholderTextColor="#888"
            style={styles.input}
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Navigate To (Exact Screen Name)</Text>
          <TextInput
            placeholder="e.g. AdminSakhiSeriesScreen"
            placeholderTextColor="#888"
            style={styles.input}
            value={navigateTo}
            onChangeText={setNavigateTo}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Icon Name (MaterialCommunityIcons)</Text>
          <View style={styles.iconPreviewRow}>
            <TextInput
              placeholder="e.g. star, heart, book"
              placeholderTextColor="#888"
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              value={iconName}
              onChangeText={setIconName}
            />
            <View style={styles.iconPreview}>
              <MCI name={iconName || 'help'} size={30} color="#3A86FF" />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.btn, loading && { opacity: 0.6 }]}
          onPress={saveTab}
          disabled={loading}
        >
          <Text style={styles.btnText}>
            {loading ? 'SAVING...' : 'CREATE TAB'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.cancelBtn} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

export default AddTabScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  
  },
  heading: {
    fontSize: 28,
    fontWeight: '900',
    color: '#3A86FF',
    textAlign: 'center',
    marginBottom: 30,
    textTransform: 'uppercase',
  },
  inputContainer: {
    margin: 25,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3A86FF',
    marginBottom: 8,
    marginLeft: 5,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 15,
    elevation: 2,
    color: '#000',
  },
  iconPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconPreview: {
    width: 50,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  btn: {
    backgroundColor: '#3A86FF',
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 5,
    marginTop: 10,
    marginLeft:25,
    marginRight:25,
  },
  btnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  cancelBtn: {
    marginTop: 15,
    alignItems: 'center',
  },
  cancelText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});
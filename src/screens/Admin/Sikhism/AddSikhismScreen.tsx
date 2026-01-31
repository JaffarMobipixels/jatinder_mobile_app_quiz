// AddSikhismScreen.tsx
import * as React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import database from '@react-native-firebase/database';

interface AddSikhismScreenProps {
  navigation: any;
  route: any;
}

export default function AddSikhismScreen({ navigation }: AddSikhismScreenProps) {
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleAdd = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert("Error", "Both title and content are required!");
      return;
    }

    setLoading(true);

    try {
      // 🔹 Push the new tab into Firebase under SikhismSection
      const ref = database().ref('SikhismSection').push();
      await ref.set({
        title: title.trim(),
        content: content.trim(),
        createdAt: Date.now(),
      });

      Alert.alert("Success", "New Sikhism tab has been added!");
      setTitle('');
      setContent('');
      navigation.goBack();
    } catch (error: any) {
      console.log("Firebase Error:", error);
      Alert.alert("Error", "Failed to add tab. Try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#6C63FF', '#8A70FF']} style={{ flex: 1, padding: 20 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Sikhism Tab</Text>
        <View style={{ width: 24 }} />
      </View>

      <TextInput
        style={styles.inputTitle}
        placeholder="Enter Tab Title"
        placeholderTextColor="rgba(255,255,255,0.6)"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={styles.inputContent}
        placeholder="Enter Content"
        placeholderTextColor="rgba(255,255,255,0.5)"
        value={content}
        onChangeText={setContent}
        multiline
      />

      <TouchableOpacity style={styles.addButton} onPress={handleAdd} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#6C63FF" size="small" />
        ) : (
          <Text style={styles.addButtonText}>Add Tab</Text>
        )}
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '800',
  },
  inputTitle: {
    fontSize: 18,
    color: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.5)',
    marginBottom: 20,
    paddingVertical: 5,
  },
  inputContent: {
    fontSize: 16,
    color: '#FFF',
    minHeight: 200,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    padding: 10,
  },
  addButton: {
    marginTop: 30,
    backgroundColor: '#FFD700',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#6C63FF',
    fontSize: 18,
    fontWeight: '700',
  },
});

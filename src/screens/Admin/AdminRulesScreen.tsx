import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import database from '@react-native-firebase/database';
import FeatherIcon from 'react-native-vector-icons/Feather';

const AdminRulesScreen = ({ navigation }: any) => {
  const [rules, setRules] = useState<string[]>([]);
  const [newRule, setNewRule] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  /* ===== FETCH RULES FROM REALTIME DB ===== */
  useEffect(() => {
    const ref = database().ref('GameRules/allRules');

    const listener = ref.on('value', snapshot => {
      const data = snapshot.val();
      console.log('Fetched rules:', data);

      if (data && Array.isArray(data.list)) {
        setRules(data.list);
      } else {
        setRules([]);
      }
      setLoading(false);
    });

    return () => ref.off('value', listener);
  }, []);

  /* ===== ADD RULE (LOCAL) ===== */
  const addRuleLocally = () => {
    if (!newRule.trim()) {
      Alert.alert('Warning', 'Rule empty nahi ho sakta');
      return;
    }
    setRules(prev => [...prev, newRule.trim()]);
    setNewRule('');
  };

  /* ===== REMOVE RULE ===== */
  const removeRule = (index: number) => {
    setRules(prev => prev.filter((_, i) => i !== index));
  };

  /* ===== SAVE TO REALTIME DATABASE ===== */
  const saveToFirebase = async () => {
    if (rules.length === 0) {
      Alert.alert('Warning', 'At least one rule add karo');
      return;
    }

    setUpdating(true);
    try {
      await database()
        .ref('GameRules/allRules')
        .set({
          list: rules,
          updatedAt: Date.now(),
        });

      Alert.alert('Success', 'Rules Realtime Database mein save ho gaye ✅');
    } catch (error: any) {
      console.log('Save error:', error);
      Alert.alert('Error', error.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* ================= HEADER WITH BACK BUTTON ================= */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <FeatherIcon name="arrow-left" size={26} color="#FFD700" />
        </TouchableOpacity>
        <Text style={styles.title}>Admin: Manage Rules</Text>
      </View>

      {/* INPUT */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Write a rule here..."
          placeholderTextColor="#999"
          value={newRule}
          onChangeText={setNewRule}
        />
        <TouchableOpacity style={styles.addBtn} onPress={addRuleLocally}>
          <FeatherIcon name="plus" size={24} color="#0A1F44" />
        </TouchableOpacity>
      </View>

      {/* RULE LIST */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {rules.map((rule, index) => (
          <View key={index} style={styles.ruleItem}>
            <Text style={styles.ruleText}>
              {index + 1}. {rule}
            </Text>
            <TouchableOpacity onPress={() => removeRule(index)}>
              <FeatherIcon name="trash-2" size={20} color="#FF4444" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* SAVE BUTTON */}
      <TouchableOpacity
        style={[styles.saveBtn, updating && { opacity: 0.6 }]}
        onPress={saveToFirebase}
        disabled={updating}
      >
        {updating ? (
          <ActivityIndicator color="#0A1F44" />
        ) : (
          <Text style={styles.saveBtnText}>SAVE TO DATABASE</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1F44', padding: 20 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A1F44' },
  
  // HEADER
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backBtn: { marginRight: 12 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFD700', marginLeft:20, },

  inputContainer: { flexDirection: 'row', marginBottom: 20 },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    color: '#000',
    fontSize: 16,
  },
  addBtn: {
    backgroundColor: '#FFD700',
    width: 50,
    marginLeft: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ruleItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ruleText: { color: '#fff', flex: 1, marginRight: 10 },
  saveBtn: {
    backgroundColor: '#FFD700',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  saveBtnText: { color: '#0A1F44', fontWeight: 'bold', fontSize: 16 },
});

export default AdminRulesScreen;

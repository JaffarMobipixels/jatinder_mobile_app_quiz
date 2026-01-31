import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import FeatherIcon from 'react-native-vector-icons/Feather';
import database from '@react-native-firebase/database';
 
const RulesScreen: React.FC<any> = ({ navigation }) => {
  const [rules, setRules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
 
  /* ===== FETCH RULES FROM FIREBASE ===== */
  useEffect(() => {
    const ref = database().ref('GameRules/allRules');
 
    const onValueChange = ref.on('value', snapshot => {
      const data = snapshot.val();
 
      if (data && Array.isArray(data.list)) {
        setRules(data.list);
      } else {
        setRules([]);
      }
 
      setLoading(false);
    });
 
    return () => ref.off('value', onValueChange);
  }, []);
 
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }
 
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ===== HEADER ===== */}
      <LinearGradient colors={['#1E3A8A', '#0A1F44']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <FeatherIcon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Game Rules</Text>
        <View style={{ width: 42 }} />
      </LinearGradient>
 
      {/* ===== RULES LIST ===== */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {rules.map((rule, index) => (
          <LinearGradient
            key={index}
            colors={['#2563EB', '#1E40AF']}
            style={styles.ruleCard}
          >
            <View style={styles.ruleNumberContainer}>
              <Text style={styles.ruleNumber}>{index + 1}</Text>
            </View>
            <Text style={styles.ruleText}>{rule}</Text>
          </LinearGradient>
        ))}
 
        {rules.length === 0 && (
          <Text style={styles.emptyText}>No rules found</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
 
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0A1F44' },
 
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A1F44',
  },
 
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
   
   height:'10%',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
 
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginLeft:20,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
 
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFD700',
  },
 
  scrollContainer: {
    padding: 20,
    paddingBottom: 30,
  },
 
  ruleCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    height:'15%',
    borderRadius: 20,
    marginBottom: 25,
    elevation: 8,
  },
 
  ruleNumberContainer: {
    width: 28,
    height: 28,
    marginTop:20,
    marginLeft:10,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
 
  ruleNumber: {
    fontSize: 16,
    fontWeight: '900',
    
    color: '#fff',
  },
 
  ruleText: {
    fontSize: 16,
    marginTop:20,
    color: '#fff',
    flex: 1,
    lineHeight: 22,
  },
 
  emptyText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 30,
    opacity: 0.7,
  },
});
 
export default RulesScreen;
 
 
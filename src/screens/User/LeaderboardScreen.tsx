import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import database from '@react-native-firebase/database';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';

export default function LeaderboardScreen() {
  const [usersData, setUsersData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const usersRef = database().ref('users');
    const listener = usersRef.on('value', snapshot => {
      const usersObj = snapshot.val();
      if (usersObj) {
        const usersArray = Object.keys(usersObj).map(key => ({
          id: key,
          name: `${usersObj[key].firstName || ''} ${usersObj[key].lastName || ''}`.trim(),
          score: usersObj[key].score || 0,
        }));
        usersArray.sort((a, b) => b.score - a.score);
        setUsersData(usersArray);
      } else {
        setUsersData([]);
      }
      setLoading(false);
    });

    return () => usersRef.off('value', listener);
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FBBF24" />
      </View>
    );
  }

  const renderHeader = () => (
    <View style={styles.listHeader}>
      <Text style={[styles.rank, styles.headerText]}>#</Text>
      <Text style={[styles.name, styles.headerText, { textAlign: 'left', marginLeft: 10 }]}>PLAYER</Text>
      <Text style={[styles.score, styles.headerText]}>SCORE</Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      
      {/* PERFECTLY ALIGNED HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="chevron-left" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Leaderboard</Text>
        <View style={{ width: 44 }} /> {/* Back button ko balance karne ke liye */}
      </View>

      <FlatList
        data={usersData}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        stickyHeaderIndices={[0]} // Header ko top par lock karne ke liye
        renderItem={({ item, index }) => (
          <View style={[styles.item, index === 0 && styles.topRank]}>
            <Text style={styles.rank}>{index + 1}</Text>
            <Text style={styles.name} numberOfLines={1}>{item.name || 'Anonymous'}</Text>
            <Text style={styles.score}>{item.score}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0A1F44' 
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A1F44'
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    height: 60,
  },
  backButton: { 
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { 
    fontSize: 22, 
    fontWeight: '900', 
    color: '#fff', 
    textAlign: 'center',
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    backgroundColor: '#1E3CFF',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  headerText: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 14,
    letterSpacing: 1,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3A8A',
    padding: 15,
    marginBottom: 8,
    borderRadius: 15,
    // iOS Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    // Android Shadow
    elevation: 3,
  },
  topRank: {
    backgroundColor: '#2563EB', // First rank ka thora different color
    borderWidth: 1,
    borderColor: '#FBBF24',
  },
  rank: { 
    fontSize: 16, 
    color: '#FBBF24', 
    fontWeight: '800', 
    width: 35, 
    textAlign: 'center',
  },
  name: { 
    fontSize: 16, 
    color: '#fff', 
    fontWeight: '600', 
    flex: 1, // Name saari beech ki jagah le lega
    paddingHorizontal: 10,
  },
  score: { 
    fontSize: 16, 
    color: '#fff', 
    fontWeight: '800', 
    width: 60, 
    textAlign: 'right' 
  },
});
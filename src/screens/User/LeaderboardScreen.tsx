import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';

export default function LeaderboardScreen() {
  const [usersData, setUsersData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

useEffect(() => {
  const leaderboardRef = database().ref('Leaderboard');

  const listener = leaderboardRef.on('value', async snapshot => {
    const leaderboardObj = snapshot.val();
    if (!leaderboardObj) {
      setUsersData([]);
      setLoading(false);
      return;
    }

    const usersMap: { [key: string]: { firstName: string; lastName: string; score: number } } = {};

    for (const entry of Object.values(leaderboardObj)) {
      const e: any = entry;
      const email = e.user || `guest_${Math.random()}`;
      // Use ?? to avoid overwriting existing names with empty string
      let firstName = e.firstName ?? '';
      let lastName = e.lastName ?? '';
      const score = Number(e.score || 0);

      // If firstName/lastName missing, fetch from users node using UID
      if ((!firstName && !lastName) && e.uid) {
        try {
          const userSnapshot = await database().ref(`users/${e.uid}`).once('value');
          const userData = userSnapshot.val();
          firstName = userData?.firstName ?? '';
          lastName = userData?.lastName ?? '';
        } catch (err) {
          console.log('Error fetching user name:', err);
        }
      }

      if (!usersMap[email]) {
        usersMap[email] = { firstName, lastName, score };
      } else {
        usersMap[email].score += score;
      }
    }

    const usersArray = Object.keys(usersMap).map(email => ({
      id: email,
      name: `${usersMap[email].firstName} ${usersMap[email].lastName}`.trim() || 'Unknown Player',
      score: usersMap[email].score,
    }));

    usersArray.sort((a, b) => b.score - a.score);
    setUsersData(usersArray);
    setLoading(false);
  });

  return () => leaderboardRef.off('value', listener);
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
      <Text style={[styles.score, styles.headerText]}>TOTAL SCORE</Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="chevron-left" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Leaderboard</Text>
        <View style={{ width: 44 }} />
      </View>

      <FlatList
        data={usersData}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        stickyHeaderIndices={[0]}
        renderItem={({ item, index }) => (
          <View style={[styles.item, index === 0 && styles.topRank]}>
            <Text style={styles.rank}>{index + 1}</Text>
            <Text style={styles.name} numberOfLines={1}>{item.name || 'Unknown Player'}</Text>
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
  container: { flex: 1, backgroundColor: '#0A1F44' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A1F44' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, height: 60 },
  backButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '900', color: '#fff', textAlign: 'center', flex: 1 },
  listHeader: { flexDirection: 'row', backgroundColor: '#1E3CFF', paddingVertical: 12, paddingHorizontal: 15, borderRadius: 12, marginBottom: 10 },
  headerText: { fontWeight: 'bold', color: '#fff', fontSize: 14, letterSpacing: 1 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3A8A',
    padding: 15,
    marginBottom: 8,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  topRank: { backgroundColor: '#2563EB', borderWidth: 1, borderColor: '#FBBF24' },
  rank: { fontSize: 16, color: '#FBBF24', fontWeight: '800', width: 35, textAlign: 'center' },
  name: { fontSize: 16, color: '#fff', fontWeight: '600', flex: 1, paddingHorizontal: 10 },
  score: { fontSize: 16, color: '#fff', fontWeight: '800', width: 60, textAlign: 'right' },
});
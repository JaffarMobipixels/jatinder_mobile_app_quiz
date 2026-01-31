import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import { useFocusEffect } from '@react-navigation/native';
 
const { width } = Dimensions.get('window');
 
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};
 
export default function GameStatsScreen({ navigation }: any) {
  const [gameStats, setGameStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bestScore, setBestScore] = useState(0);
 
  const insets = useSafeAreaInsets();
 
  const currentUser = auth().currentUser;
  const userEmail = currentUser?.email || 'guest';
 
  // 🔥 FETCH DATA FROM FIREBASE LEADERBOARD
  useFocusEffect(
    useCallback(() => {
      const fetchStats = async () => {
        try {
          setLoading(true);
 
          const ref = database().ref('Leaderboard');
          const snapshot = await ref.once('value');
 
          if (snapshot.exists()) {
            const data = snapshot.val();
 
            const list = Object.keys(data)
              .map(key => ({
                id: key,
                ...data[key],
              }))
              // sirf current user ka data
              .filter(item => item.user === userEmail)
              // latest first
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
              );
 
            setGameStats(list);
 
            const scores = list.map(item => item.score);
            setBestScore(scores.length ? Math.max(...scores) : 0);
          } else {
            setGameStats([]);
            setBestScore(0);
          }
        } catch (e) {
          console.log('Firebase fetch error:', e);
        } finally {
          setLoading(false);
        }
      };
 
      fetchStats();
    }, [userEmail])
  );
 
  // 🔥 DELETE FROM FIREBASE
  const deleteStat = (id: string) => {
    Alert.alert(
      'Delete Record',
      'Are you sure you want to remove this from your history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await database().ref(`Leaderboard/${id}`).remove();
            setGameStats(prev => prev.filter(item => item.id !== id));
          },
        },
      ]
    );
  };
 
  const StatCard = ({ item }: any) => (
    <View style={styles.cardContainer}>
      <View style={styles.threeDShadow} />
      <LinearGradient colors={['#1E3A8A', '#1E2B4D']} style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.labelText}>DATE</Text>
            <Text style={styles.cardDate}>{formatDate(item.date)}</Text>
          </View>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>{item.score}</Text>
            <Text style={styles.ptsLabel}>Score</Text>
          </View>
        </View>
 
        <View style={styles.detailsRow}>
          <Text style={styles.detailText}>📂 {item.category}</Text>
        </View>
 
        <TouchableOpacity
          style={styles.deleteIconButton}
          onPress={() => deleteStat(item.id)}
        >
          <Text style={styles.deleteButtonText}>Remove Record</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
 
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent />
 
      {/* HEADER */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 10, paddingBottom: 15 },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backBtnIcon}>◀</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MY HISTORY</Text>
        <View style={styles.placeholder} />
      </View>
 
      {/* BEST SCORE */}
      {!loading && gameStats.length > 0 && (
        <LinearGradient
          colors={['#FFD93D', '#FF914D']}
          style={styles.bestScoreBanner}
        >
          <Text style={styles.bestScoreLabel}>PERSONAL BEST</Text>
          <Text style={styles.bestScoreValue}>{bestScore} SCORE</Text>
        </LinearGradient>
      )}
 
      {loading ? (
        <ActivityIndicator size="large" color="#FFD700" style={{ marginTop: 50 }} />
      ) : gameStats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📜</Text>
          <Text style={styles.emptyText}>No games played yet!</Text>
        </View>
      ) : (
        <FlatList
          data={gameStats}
          renderItem={({ item }) => <StatCard item={item} />}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </View>
  );
}
 
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1F44' },
 
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backBtn: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnIcon: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
  },
  placeholder: { width: 45 },
 
  bestScoreBanner: {
    margin:15,
    borderRadius: 20,
    height: ' 6.5%',
    
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  bestScoreLabel: { color: '#0A1F44', fontWeight: '900', margin:15,},
  bestScoreValue: { color: '#0A1F44', fontWeight: '900', fontSize: 22 , margin:15,},
 
  cardContainer: {
    position: 'relative',
  },
  threeDShadow: {
    position: 'absolute',
  
   
    backgroundColor: '#000',
    borderRadius: 25,
    opacity: 0.3,
  },
  card: {
    borderRadius: 25,
    margin:15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    margin: 20,
  },
  labelText: { fontSize: 10, color: '#ABB2BF', fontWeight: '800' },
  cardDate: { fontSize: 16, marginTop:1,fontWeight: '700', color: '#fff' },
 
  scoreBadge: {
    backgroundColor: 'rgba(255,215,0,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  scoreText: { color: '#FFD700', fontSize: 20, fontWeight: '900' },
  ptsLabel: { color: '#FFD700', fontSize: 8 },
 
  detailsRow: { marginTop:10 , marginBottom:12, marginLeft:20 },
  detailText: { color: '#fff', fontSize: 13 },
 
  deleteIconButton: {
    alignItems: 'center',
    paddingVertical: 8,
    marginLeft:20,
    marginRight:20,
    marginBottom:15,
    backgroundColor: 'rgba(255,77,77,0.1)',
    borderRadius: 12,
  },
  deleteButtonText: {
    color: '#FF6B6B',
    fontWeight: '800',
    fontSize: 12,
    
  },
 
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyEmoji: { fontSize: 60 },
  emptyText: { color: '#ABB2BF', fontSize: 18 },
});
 
 
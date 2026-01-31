import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import FeatherIcon from 'react-native-vector-icons/Feather';
import database from '@react-native-firebase/database';


const userEmailKey = 'qas12@gmail_com';

const HabitDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { habitId } = route.params;

  const [habit, setHabit] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = database().ref(`habits/${userEmailKey}/${habitId}`);
    const listener = ref.on('value', snapshot => {
      const data = snapshot.val();
      setHabit(data || null);
      setLoading(false);
    });

    return () => ref.off('value', listener);
  }, [habitId]);

  const getBadgeColor = (result: string) => {
    switch (result.toLowerCase()) {
      case 'done':
        return '#22C55E';
      case 'missed':
        return '#EF4444';
      case 'unclear':
      default:
        return '#FBBF24';
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#764BA2" />
      </View>
    );
  }

  if (!habit) {
    return (
      <View style={styles.loader}>
        <Text style={{ color: '#999', fontSize: 16 }}>Habit not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient
        colors={['#667EEA', '#764BA2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <FeatherIcon
          name="arrow-left"
          size={24}
          color="#fff"
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>{habit.name}</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.card}>
          <Text style={styles.label}>Question</Text>
          <Text style={styles.question}>{habit.question}</Text>
        </View>

        
        <View style={styles.card}>
          <Text style={styles.label}>Days Progress</Text>
          {habit.days && habit.days.length > 0 ? (
            habit.days.map((d: any, index: number) => (
              <View key={index} style={styles.dayRow}>
                <Text style={styles.dayName}>{d.day}</Text>
                <Text
                  style={[
                    styles.dayResult,
                    { backgroundColor: getBadgeColor(d.result) },
                  ]}
                >
                  {d.result.toUpperCase()}
                </Text>
              </View>
            ))
          ) : (
            <Text style={{ color: '#999', marginTop: 8 }}>No day records yet</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HabitDetailScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6FA',
  },

  header: {
    height: 90,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 18,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },

  content: {
    padding: 20,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },

  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#555',
    marginBottom: 6,
  },

  question: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },

  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },

  dayName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },

  dayResult: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
    overflow: 'hidden',
  },

  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import database from '@react-native-firebase/database';
import LinearGradient from 'react-native-linear-gradient';
 
const UserQuizScreen = ({ route }: any) => {
  const { categoryId } = route.params;
  const [quizList, setQuizList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    const ref = database().ref(`Quiz/${categoryId}/quizzes`);
 
    ref.on('value', snapshot => {
      const data = snapshot.val();
 
      if (data) {
        const list = Object.keys(data).map(key => ({
          id: key,
          ...data[key],
        }));
        setQuizList(list);
      } else {
        setQuizList([]);
      }
 
      setLoading(false);
    });
 
    return () => ref.off();
  }, []);
 
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FFB347" />
      </View>
    );
  }
 
  return (
    <LinearGradient colors={['#0F2027', '#203A43', '#2C5364']} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.header}>🌟 Dark Quiz Zone 🌟</Text>
 
      <FlatList
        data={quizList}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <LinearGradient
            colors={['#1F1C2C', '#928DAB']}
            style={styles.card}
          >
            <Text style={styles.question}>{item.question}</Text>
 
            {item.options &&
              Object.entries(item.options).map(([key, value]: any) => (
                <LinearGradient
                  key={key}
                  colors={['#FF6B81', '#FF9472']}
                  style={styles.optionCard}
                >
                  <Text style={styles.option}>
                    {key}. {value}
                  </Text>
                </LinearGradient>
              ))}
          </LinearGradient>
        )}
      />
    </LinearGradient>
  );
};
 
export default UserQuizScreen;
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    
    backgroundColor: '#0F2027',
  },
 
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F2027',
  },
 
  header: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFD700',
    textAlign: 'center',
    marginTop:70,
    marginVertical: 20,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
 
  card: {
    margin:20,
    paddingTop:30,

   
    
   
 
  },
 
  question: {
    fontSize: 18,

    fontWeight: '700',
    color: '#FFE066',
    margin:10,
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
 
  optionCard: {
    borderRadius: 18,
  
    elevation: 5,
    shadowColor: '#FF6B81',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
 
  option: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    margin:10,
  },
 
});
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Dimensions,
  Animated,
  ActivityIndicator,
  Modal,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import FeatherIcon from 'react-native-vector-icons/Feather';
 
const { width } = Dimensions.get('window');
 
type QuizOption = { A: string; B: string; C: string; D: string };
type QuizItem = { question: string; options: QuizOption; correctOption: keyof QuizOption };
 
export default function MCQGameScreen({ navigation, route }: any) {
  const categoryId = route.params?.categoryId;
  const categoryName = route.params?.categoryName || 'Quiz';
 
  const [questions, setQuestions] = useState<QuizItem[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<keyof QuizOption | null>(null);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(true);
 
  const [showWellDone, setShowWellDone] = useState(false);
  const [showCongratsPopup, setShowCongratsPopup] = useState(false);
  const [isLostPopup, setIsLostPopup] = useState(false);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
 
  const progress = useRef(new Animated.Value(0)).current;
  const wellDoneAnim = useRef(new Animated.Value(0)).current;
 
  const LABEL_COLORS = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF'];
 
  useEffect(() => {
    const ref = database().ref(`Quiz/${categoryId}/quizzes`);
    ref.once('value').then(snapshot => {
      const data = snapshot.val();
      if (data) {
        const quizArray: QuizItem[] = Object.keys(data).map(key => ({
          question: data[key].question,
          options: data[key].options,
          correctOption: data[key].correctOption,
        }));
        setQuestions(quizArray);
      }
      setLoading(false);
    });
  }, [categoryId]);
 
  useEffect(() => {
    if (isTimerPaused || loading || showWellDone || isLostPopup || showCongratsPopup) return;
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleWrongAnswer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerPaused, loading, showWellDone, isLostPopup, showCongratsPopup]);
 
  const handleOptionPress = (option: keyof QuizOption) => {
    if (selectedOption || isLostPopup || showWellDone) return;
    setSelectedOption(option);
    const correctOption = questions[currentQuestion].correctOption;
 
    if (option === correctOption) {
      setIsTimerPaused(true);
      const newScore = score + 20;
      setScore(newScore);
 
      Animated.timing(progress, {
        toValue: ((currentQuestion + 1) / questions.length) * (width - 60),
        duration: 400,
        useNativeDriver: false,
      }).start();
 
      setShowWellDone(true);
      wellDoneAnim.setValue(0);
      Animated.spring(wellDoneAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start();
 
      setTimeout(() => {
        setShowWellDone(false);
        if (currentQuestion < questions.length - 1) {
          setCurrentQuestion(prev => prev + 1);
          setSelectedOption(null);
          // YAHAN SE setTimer(30) HATAYA GYA HAI TAUKAY TIMER RESET NA HO
          setIsTimerPaused(false);
        } else {
          saveGameData(newScore);
          setShowCongratsPopup(true);
        }
      }, 1800);
    } else {
      handleWrongAnswer();
    }
  };
 
  const handleWrongAnswer = () => {
    setIsTimerPaused(true);
    saveGameData(score);
    setIsLostPopup(true);
  };
 
  const resetGame = () => {
    setScore(0);
    setCurrentQuestion(0);
    setSelectedOption(null);
    setTimer(30); // Game restart par timer reset hoga
    setIsTimerPaused(false);
    setShowCongratsPopup(false);
    setIsLostPopup(false);
    progress.setValue(0);
  };
const saveGameData = async (finalScore: number) => {
  try {
    const user = auth().currentUser;
    if (!user) return;

    // Fetch first & last name from 'users' node
    const userSnapshot = await database().ref(`users/${user.uid}`).once('value');
    const userData = userSnapshot.val();

    const firstName = userData?.firstName || 'Anonymous';
    const lastName = userData?.lastName || '';

    // Save game data in Leaderboard
    const ref = database().ref(`Leaderboard/${Date.now()}`);
    await ref.set({
      score: finalScore,
      category: categoryName,
      user: user.email || 'guest',
      firstName,
      lastName,
      date: new Date().toISOString(),
    });

    console.log('Game data saved successfully!');
  } catch (e) {
    console.log('Error saving game data:', e);
  }
};
  if (loading) return <View style={styles.loader}><ActivityIndicator size="large" color="#4D96FF" /></View>;
 
  const currentQ = questions[currentQuestion];
 
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0A1F44', '#0F172A']} style={StyleSheet.absoluteFill} />
     
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
       
        {/* TOP BAR */}
        <View style={styles.topBar}>
           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
             <FeatherIcon name="x" size={24} color="#fff" />
           </TouchableOpacity>
           <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>SCORE</Text>
              <Text style={styles.scoreValue}>{score}</Text>
           </View>
        </View>
 
        {/* PROGRESS BAR */}
        <View style={styles.progressSection}>
           <Text style={styles.questionCount}>Question {currentQuestion + 1}/{questions.length}</Text>
           <View style={styles.progressBarBackground}>
              <Animated.View style={[styles.progressBarFill, { width: progress }]} />
           </View>
        </View>
 
        {/* TIMER & QUESTION CARD */}
        <View style={styles.mainCard}>
           <View style={styles.timerWrapper}>
              <LinearGradient colors={timer < 10 ? ['#FF6B6B', '#E11D48'] : ['#4D96FF', '#1E3CFF']} style={styles.timerCircle}>
                 <Text style={styles.timerText}>{timer}</Text>
              </LinearGradient>
           </View>
           <Text style={styles.questionText}>{currentQ?.question}</Text>
        </View>
 
        {/* OPTIONS */}
        <View style={styles.optionsWrapper}>
          {currentQ && (['A', 'B', 'C', 'D'] as (keyof QuizOption)[]).map((key, index) => {
            const isSelected = selectedOption === key;
            const isCorrect = key === currentQ.correctOption;
           
            let cardStyle = styles.optionCard;
            let labelBg = LABEL_COLORS[index];
 
            if (selectedOption) {
               if (isSelected) cardStyle = isCorrect ? styles.correctCard : styles.wrongCard;
               else if (isCorrect) cardStyle = styles.correctCard;
            }
 
            return (
              <TouchableOpacity
                key={key}
                onPress={() => handleOptionPress(key)}
                activeOpacity={0.9}
                disabled={!!selectedOption}
                style={styles.optionTouchable}
              >
                <View style={[cardStyle, isSelected && styles.selectedShadow]}>
                  <View style={[styles.labelCircle, { backgroundColor: labelBg }]}>
                    <Text style={styles.labelText}>{key}</Text>
                  </View>
                  <Text style={styles.optionText}>{currentQ.options[key]}</Text>
                  {selectedOption && isCorrect && <FeatherIcon name="check-circle" size={20} color="#6BCB77" />}
                  {selectedOption && isSelected && !isCorrect && <FeatherIcon name="x-circle" size={20} color="#FF6B6B" />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
 
        {/* WELL DONE OVERLAY */}
        {showWellDone && (
          <View style={styles.overlay}>
            <Animated.View style={[styles.badgeContainer, { transform: [{ scale: wellDoneAnim }] }]}>
              <LinearGradient colors={['#10B981', '#059669']} style={styles.wellDoneBadge}>
                <Text style={styles.badgeEmoji}>✨</Text>
                <Text style={styles.badgeTitle}>FANTASTIC!</Text>
                <Text style={styles.badgePoints}>+20 POINTS</Text>
              </LinearGradient>
            </Animated.View>
          </View>
        )}
 
        {/* MODALS */}
        <Modal visible={isLostPopup || showCongratsPopup} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <LinearGradient colors={['#1E293B', '#0F172A']} style={styles.popupCard}>
              <Text style={styles.popupEmoji}>{isLostPopup ? '⏳' : '🏆'}</Text>
              <Text style={[styles.popupTitle, { color: isLostPopup ? '#FF6B6B' : '#FFD93D' }]}>
                {isLostPopup ? 'GAME OVER' : 'VICTORY!'}
              </Text>
              <View style={styles.finalScorePill}>
                 <Text style={styles.finalScoreLabel}>TOTAL SCORE</Text>
                 <Text style={styles.finalScoreValue}>{score}</Text>
              </View>
             
              <TouchableOpacity style={styles.primaryBtn} onPress={resetGame}>
                <Text style={styles.primaryBtnText}>Try Again</Text>
              </TouchableOpacity>
             
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.secondaryBtn}>
                <Text style={styles.secondaryBtnText}>Next Quiz</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </Modal>
 
      </ScrollView>
    </SafeAreaView>
  );
}
 
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1F44' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A1F44' },
  scrollContainer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 },
 
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  backBtn: { width: 45, height: 45, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  scoreContainer: { alignItems: 'flex-end' },
  scoreLabel: { color: '#4D96FF', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  scoreValue: { color: '#fff', fontSize: 24, fontWeight: '900' },
 
  progressSection: { marginBottom: 25 },
  questionCount: { color: '#ABB2BF', fontSize: 14, fontWeight: '700', marginBottom: 8 },
  progressBarBackground: { width: '100%', height: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 10, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#4D96FF', borderRadius: 10 },
 
  mainCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 30,
    padding: 25,
    paddingTop: 45,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 30,
    marginTop: 20
  },
  timerWrapper: { position: 'absolute', top: -35, backgroundColor: '#0A1F44', padding: 8, borderRadius: 50 },
  timerCircle: { width: 65, height: 65, borderRadius: 32.5, justifyContent: 'center', alignItems: 'center', elevation: 10, shadowColor: '#4D96FF', shadowOpacity: 0.5, shadowRadius: 10 },
  timerText: { color: '#fff', fontSize: 24, fontWeight: '900' },
  questionText: { fontSize: 22, fontWeight: '800', color: '#fff', textAlign: 'center', lineHeight: 30 },
 
  optionsWrapper: { width: '100%' },
  optionTouchable: { marginBottom: 15 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  correctCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(107, 203, 119, 0.15)',
    borderWidth: 1.5,
    borderColor: '#6BCB77'
  },
  wrongCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    borderWidth: 1.5,
    borderColor: '#FF6B6B'
  },
  labelCircle: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  labelText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  optionText: { color: '#fff', fontSize: 16, fontWeight: '700', flex: 1 },
  selectedShadow: { elevation: 5, shadowColor: '#fff', shadowOpacity: 0.2 },
 
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 10,  backgroundColor: 'rgba(10, 31, 68, 0.8)' },
  badgeContainer: { alignItems: 'center' },
  wellDoneBadge: {  borderRadius: 40,  width: 200, height: '50%',  alignItems: 'center', borderWidth: 3, borderColor: '#fff' },
  badgeEmoji: { fontSize: 50, marginBottom: 10 },
  badgeTitle: { color: '#fff', fontSize: 28, fontWeight: '900' },
  badgePoints: { color: '#FFD93D', fontWeight: '800', fontSize: 18, marginTop: 5 },
 
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  popupCard: { width: '100%', borderRadius: 40,  alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  popupEmoji: { fontSize: 70, marginBottom: 10 },
  popupTitle: { fontSize: 32, fontWeight: '900', marginBottom: 20 },
  finalScorePill: { backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 20, alignItems: 'center', marginBottom: 30 },
  finalScoreLabel: { color: '#ABB2BF', fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  finalScoreValue: { color: '#fff', fontSize: 40, fontWeight: '900' },
  primaryBtn: { backgroundColor: '#4D96FF', width: '80%', padding: 18, borderRadius: 20, alignItems: 'center', marginBottom: 15 },
  primaryBtnText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  secondaryBtn: { padding: 10, marginBottom:20, },
  secondaryBtnText: { color: '#ABB2BF', fontSize: 16, fontWeight: '700' }
});
 
 
 
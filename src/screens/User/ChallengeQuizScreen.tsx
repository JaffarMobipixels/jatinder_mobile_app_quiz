// ChallengeQuizScreen.tsx
import React, { useState, useRef } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Animated 
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const challengeQuestions = [
  { question: '2 + 3 = ?', options: ['4', '5', '6'], answer: '5' },
  { question: 'Capital of Pakistan?', options: ['Lahore', 'Islamabad', 'Karachi'], answer: 'Islamabad' },
  { question: 'React Native is used for?', options: ['Web', 'Mobile', 'Desktop'], answer: 'Mobile' },
];

const ChallengeQuizScreen: React.FC<any> = ({ navigation }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const handleOptionPress = (option: string) => {
    setSelectedOption(option);

    // ✅ Add 1 point for correct answer
    if (option === challengeQuestions[currentQuestion].answer) {
      setScore(prev => prev + 1);
    }

    setTimeout(() => {
      setSelectedOption(null);
      if (currentQuestion + 1 < challengeQuestions.length) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        setShowPopup(true);
        Animated.parallel([
          Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 6 }),
          Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        ]).start();
      }
    }, 400);
  };

  const handleRetry = () => {
    setScore(0);
    setCurrentQuestion(0);
    setSelectedOption(null);
    Animated.parallel([
      Animated.timing(opacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 0, useNativeDriver: true }),
    ]).start(() => setShowPopup(false));
  };

  const handleExit = () => {
    Animated.parallel([
      Animated.timing(opacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 0, useNativeDriver: true }),
    ]).start(() => {
      setShowPopup(false);
      navigation.goBack();
    });
  };

  const handleNextQuiz = () => {
    setShowPopup(false);
    navigation.navigate('AgeQuizScreen'); // next quiz screen
  };

  const getPopupMessage = () => {
    if (score === challengeQuestions.length) return '🎉 Awesome! You got all correct! 🎉';
    if (score > 0) return 'Good job! Keep practicing!';
    return 'Try again!';
  };

  return (
    <LinearGradient colors={['#0A1F44', '#1E3A8A']} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Challenge Quiz</Text>
          <Text style={styles.question}>{challengeQuestions[currentQuestion].question}</Text>

          {challengeQuestions[currentQuestion].options.map((opt, idx) => {
            const isSelected = selectedOption === opt;
            const isCorrect = opt === challengeQuestions[currentQuestion].answer;
            return (
              <TouchableOpacity
                key={idx}
                style={styles.optionButton}
                onPress={() => handleOptionPress(opt)}
                disabled={!!selectedOption}
              >
                <LinearGradient
                  colors={
                    isSelected
                      ? isCorrect
                        ? ['#22C55E', '#16A34A']
                        : ['#EF4444', '#B91C1C']
                      : ['#3B82F6', '#2563EB']
                  }
                  style={styles.optionGradient}
                >
                  <Text style={[styles.optionText, isSelected && { color: '#fff', fontWeight: '700' }]}>
                    {opt}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {showPopup && (
          <Animated.View style={[styles.popupOverlay, { opacity: opacityAnim }]}>
            <Animated.View style={[styles.popupContainer, { transform: [{ scale: scaleAnim }] }]}>
              <Text style={styles.popupMessage}>{getPopupMessage()}</Text>
              <Text style={styles.popupScore}>Score: {score}/{challengeQuestions.length}</Text>

              <TouchableOpacity style={styles.nextBtn} onPress={handleNextQuiz}>
                <Text style={styles.btnText}>Next Quiz</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
                <Text style={styles.btnText}>Retry</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.exitBtn} onPress={handleExit}>
                <Text style={styles.btnText}>Exit</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

export default ChallengeQuizScreen;

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 40 },
  title: { fontSize: 24, fontWeight: '700', color: '#fff', textAlign: 'center', marginBottom: 30 },
  question: { fontSize: 18, fontWeight: '600', color: '#E0E0E0', marginBottom: 20 },

  optionButton: { marginBottom: 15 },
  optionGradient: {
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  optionText: { color: '#fff', fontSize: 16, fontWeight: '600', textAlign: 'center' },

  popupOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    width: '80%',
    backgroundColor: '#1E3A8A',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#FBBF24',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 10,
  },
  popupMessage: { fontSize: 20, fontWeight: '700', color: '#FBBF24', marginBottom: 10, textAlign: 'center' },
  popupScore: { fontSize: 18, fontWeight: '600', color: '#fff', marginBottom: 20 },

  nextBtn: { backgroundColor: '#10B981', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 15, marginBottom: 10 },
  retryBtn: { backgroundColor: '#FBBF24', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 15, marginBottom: 10 },
  exitBtn: { backgroundColor: '#3B82F6', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 15 },
  btnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});

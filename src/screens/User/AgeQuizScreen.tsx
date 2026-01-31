// AgeQuizScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Animated 
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const questions = [
  { question: 'What is your age group?', options: ['Below 18', '18-30', '31-50', 'Above 50'] },
  { question: 'Do you exercise regularly?', options: ['Yes', 'No'] },
  { question: 'Do you follow a healthy diet?', options: ['Yes', 'No'] },
];

const AgeQuizScreen: React.FC<any> = ({ navigation }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const handleOptionPress = (option: string) => {
    setSelectedOption(option);
    setAnswers([...answers, option]);

    if (currentQuestion + 1 < questions.length) {
      setTimeout(() => { // small delay for color feedback
        setSelectedOption(null);
        setCurrentQuestion(currentQuestion + 1);
      }, 400);
    } else {
      setShowPopup(true);
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 6 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  };

  const handleRetry = () => {
    setAnswers([]);
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
    navigation.navigate('ChallengeQuizScreen'); // next quiz
  };

  return (
    <LinearGradient colors={['#0A1F44', '#1E3A8A']} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Age-Based Quiz</Text>
          <Text style={styles.question}>{questions[currentQuestion].question}</Text>

          {questions[currentQuestion].options.map((opt, idx) => {
            const isSelected = selectedOption === opt;
            return (
              <TouchableOpacity
                key={idx}
                style={styles.optionButton}
                onPress={() => handleOptionPress(opt)}
                disabled={!!selectedOption} // disable while showing feedback
              >
                <LinearGradient
                  colors={
                    isSelected
                      ? ['#22C55E', '#16A34A'] // green feedback for selection
                      : ['#3B82F6', '#2563EB']
                  }
                  style={styles.optionGradient}
                >
                  <Text style={[styles.optionText, isSelected && { color: '#fff', fontWeight: '700' }]}>{opt}</Text>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {showPopup && (
          <Animated.View style={[styles.popupOverlay, { opacity: opacityAnim }]}>
            <Animated.View style={[styles.popupContainer, { transform: [{ scale: scaleAnim }] }]}>
              <Text style={styles.popupMessage}>🎉 You completed the Age Quiz! 🎉</Text>

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

export default AgeQuizScreen;

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
    shadowColor: '#10B981',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 10,
  },
  popupMessage: { fontSize: 20, fontWeight: '700', color: '#10B981', marginBottom: 20, textAlign: 'center' },

  nextBtn: { backgroundColor: '#10B981', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 15, marginBottom: 10 },
  retryBtn: { backgroundColor: '#FBBF24', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 15, marginBottom: 10 },
  exitBtn: { backgroundColor: '#3B82F6', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 15 },
  btnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});

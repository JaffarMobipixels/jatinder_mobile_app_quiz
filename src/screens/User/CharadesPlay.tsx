import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Vibration,
  ActivityIndicator,
  AppState,
  AppStateStatus,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import Orientation from 'react-native-orientation-locker';
import LinearGradient from 'react-native-linear-gradient';
import { RootStackParamList } from '../../navigation/RootStackParams';
import {
  accelerometer,
  SensorTypes,
  setUpdateIntervalForType,
} from 'react-native-sensors';

type CharadesPlayProps = {
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    'CharadesPlay'
  >;
  route: any;
};

const TOTAL_TIME = 60;
const COOLDOWN_TIME = 1500;
const FALLBACK_WORDS = ['APPLE', 'BANANA', 'PIZZA', 'SUPERMAN', 'GUITAR'];

const CORRECT_Z = -0.9;
const PASS_Z = 0.5;

const NEUTRAL_MIN = -0.2;
const NEUTRAL_MAX = 0.2;

const CharadesPlay: React.FC<CharadesPlayProps> = ({
  navigation,
  route,
}) => {
  const selectedCatId = route.params?.categoryId;

  const [gameState, setGameState] = useState<
    'loading' | 'positioning' | 'countdown' | 'playing' | 'correct' | 'pass'
  >('loading');
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [score, setScore] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [words, setWords] = useState<string[]>([]);
  const [isLandscape, setIsLandscape] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isProcessing = useRef(false);
  const canTriggerRef = useRef(true);
  const currentIndexRef = useRef(0);
  const scoreRef = useRef(0);
  const wordsRef = useRef<string[]>([]);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  /* ================= APP STATE ================= */
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      appState.current = state;
      if (state !== 'active') {
        isProcessing.current = false;
        canTriggerRef.current = true;
      }
    });
    return () => sub.remove();
  }, []);

  /* ================= ORIENTATION (FINAL) ================= */
 /* ================= ORIENTATION (FIXED) ================= */
useEffect(() => {
  // 🔒 LOCK landscape for entire CharadesPlay lifecycle
  Orientation.lockToLandscape();

  // ✅ FORCE landscape state (IMPORTANT FIX)
  setIsLandscape(true);

  const onOrientationChange = (orientation: string) => {
    const landscape =
      orientation === 'LANDSCAPE-LEFT' ||
      orientation === 'LANDSCAPE-RIGHT';
    setIsLandscape(landscape);
  };

  Orientation.addOrientationListener(onOrientationChange);

  return () => {
    Orientation.removeOrientationListener(onOrientationChange);
    Orientation.unlockAllOrientations();
  };
}, []);

  /* ================= FETCH WORDS ================= */
  useEffect(() => {
    fetchWordsFromFirebase();
  }, []);

  const fetchWordsFromFirebase = async () => {
    try {
      const snapshot = await database()
        .ref('/CharadesWord')
        .once('value');
      const data = snapshot.val();
      let list: string[] = [];

      if (data) {
        Object.keys(data).forEach((catKey) => {
          if (!selectedCatId || selectedCatId === catKey) {
            const wordsObj = data[catKey]?.words;
            if (wordsObj) {
              Object.values(wordsObj).forEach(
                (w: any) => w?.word && list.push(w.word),
              );
            }
          }
        });
      }

      const finalWords =
        list.length > 0
          ? list.sort(() => Math.random() - 0.5)
          : FALLBACK_WORDS;

      setWords(finalWords);
      wordsRef.current = finalWords;
      setGameState('positioning');
    } catch {
      setWords(FALLBACK_WORDS);
      wordsRef.current = FALLBACK_WORDS;
      setGameState('positioning');
    }
  };

  /* ================= SENSOR ================= */
  useEffect(() => {
    if (gameState === 'loading') return;

    setUpdateIntervalForType(SensorTypes.accelerometer, 50);

    const sub = accelerometer.subscribe(({ z }) => {
      if (!isLandscape) return;
      if (appState.current !== 'active') return;

      if (z >= NEUTRAL_MIN && z <= NEUTRAL_MAX) {
        canTriggerRef.current = true;
      }

      if (gameState !== 'playing') return;
      if (!canTriggerRef.current) return;
      if (isProcessing.current) return;

      if (z <= CORRECT_Z) {
        handleAction('correct');
        canTriggerRef.current = false;
      } else if (z >= PASS_Z) {
        handleAction('pass');
        canTriggerRef.current = false;
      }
    });

    return () => sub.unsubscribe();
  }, [gameState, isLandscape]);

  /* ================= TIMERS ================= */
 const startCountdown = () => {
  let c = 3;
  setCountdown(c);

  // ✅ IMPORTANT FIX
  setGameState('countdown');

  const i = setInterval(() => {
    c--;
    if (c <= 0) {
      clearInterval(i);
      setGameState('playing');
      startGameTimer();
    } else {
      setCountdown(c);
    }
  }, 1000);
};


  const startGameTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          finishGame();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const handleAction = (type: 'correct' | 'pass') => {
    if (isProcessing.current) return;

    isProcessing.current = true;

    if (type === 'correct') {
      scoreRef.current++;
      setScore(scoreRef.current);
      setGameState('correct');
    } else {
      setGameState('pass');
    }

    Vibration.vibrate();

    setTimeout(() => {
      setGameState('playing');
      nextWord();
      isProcessing.current = false;
    }, COOLDOWN_TIME);
  };

  const nextWord = () => {
    const next = currentIndexRef.current + 1;
    if (next < wordsRef.current.length) {
      currentIndexRef.current = next;
      setCurrentIndex(next);
    } else finishGame();
  };

  const finishGame = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const user = auth().currentUser;
    if (user) {
      await database().ref(`charadesScores/${user.uid}`).push({
        score: scoreRef.current,
        timestamp: Date.now(),
      });
    }
    navigation.replace('CharadesResult', {
      score: scoreRef.current,
    });
  };

  useEffect(() => {
    if (gameState === 'positioning') {
      const timeout = setTimeout(() => startCountdown(), 5000);
      return () => clearTimeout(timeout);
    }
  }, [gameState]);

  const getColors = (): string[] => {
    switch (gameState) {
      case 'correct':
        return ['#059669', '#10B981'];
      case 'pass':
        return ['#DC2626', '#EF4444'];
      case 'positioning':
        return ['#1E293B', '#334155'];
      case 'countdown':
        return ['#4F46E5', '#3B82F6'];
      default:
        return ['#0A1F44', '#1E3A8A'];
    }
  };

  if (gameState === 'loading') {
    return (
      <LinearGradient
        colors={['#0A1F44', '#1E3A8A']}
        style={styles.container}
      >
        <View style={styles.centerMode}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={[styles.subInstruction, { marginTop: 10 }]}>
            Loading Deck...
          </Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={getColors()} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {gameState === 'positioning' ? (
          <View style={styles.centerMode}>
            <Text style={styles.largeInstruction}>
              PLACE ON FOREHEAD
            </Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                WAITING 5 SECONDS...
              </Text>
            </View>
            <Text style={styles.subInstruction}>
              Hold phone vertically facing your friends
            </Text>
          </View>
        ) : gameState === 'countdown' ? (
          <View style={styles.centerMode}>
            <Text style={styles.countdownText}>
              {countdown}
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.header}>
              <View style={styles.glassBox}>
                <Text style={styles.label}>TIME</Text>
                <Text style={styles.val}>{timeLeft}s</Text>
              </View>
              <View style={styles.glassBox}>
                <Text style={styles.label}>SCORE</Text>
                <Text style={styles.val}>{score}</Text>
              </View>
            </View>

            <View style={styles.cardOuter}>
              <View style={styles.cardInner}>
                <Text style={styles.word}>
                  {gameState === 'correct'
                    ? '✅ CORRECT'
                    : gameState === 'pass'
                    ? '❌ PASS'
                    : words[currentIndex]}
                </Text>
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                TILT UP: CORRECT • TILT DOWN: PASS
              </Text>
            </View>
          </>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

export default CharadesPlay;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  centerMode: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  glassBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
    minWidth: 140,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  label: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  val: { color: '#fff', fontSize: 24, fontWeight: '900' },
  cardOuter: {
    width: '80%',
    height: '55%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 40,
    padding: 15,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  cardInner: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  word: {
    fontSize: 55,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  largeInstruction: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 2,
  },
  badge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 10,
    marginTop: 15,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  countdownText: {
    fontSize: 150,
    fontWeight: '900',
    color: '#fff',
  },
  subInstruction: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 20,
    textAlign: 'center',
    fontWeight: '500',
  },
  footer: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  footerText: {
    color: 'rgba(255,255,255,0.5)',
    fontWeight: 'bold',
    letterSpacing: 2,
    fontSize: 12,
  },
});

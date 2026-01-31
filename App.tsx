import 'react-native-gesture-handler';
import 'react-native-reanimated';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';

/* ================= NAVIGATION ================= */
import UserTabs from './src/navigation/UserTabs';
import AuthStack from './src/navigation/AuthStack';
import AppAdmin from './src/screens/Admin/Dashboard/AppAdmin'; // Correct Admin Stack

/* ================= SCREENS ================= */
// Splash & Auth
import SplashScreen from './src/screens/User/SplashOnB/SplashScreen';
import WelcomeScreen from './src/screens/User/WelcomeScreen';
import LoginScreen from './src/screens/User/LoginScreen';

// Extra Screens (outside tabs)
import AllQuestionsScreen from './src/screens/User/AllQuestionsScreen';
import CategoryScreen from './src/screens/User/CategoryScreen';
import RulesScreen from './src/screens/User/RulesScreen';
import GameStats from './src/screens/User/GameStatsScreen';
import HabitsScreen from './src/screens/User/HabitsScreen';
import CreateHabitScreen from './src/screens/User/CreateHabitScreen';
import DiscoveryScreen from './src/screens/User/DiscoveryScreen';
import CommunityScreen from './src/screens/User/CommunityScreen';
import QuizScreen from './src/screens/User/QuizScreen';
import ChallengeQuizScreen from './src/screens/User/ChallengeQuizScreen';
import AgeQuizScreen from './src/screens/User/AgeQuizScreen';
import SakhisScreen from './src/screens/User/SakhisScreen';
import SikhismScreen from './src/screens/User/SekhismScreen';
import SikhGuruScreen from './src/screens/User/SikhGuruScreen';
import SakhiDetailScreen from './src/screens/User/SakhiDetailScreen';
import ArticlesScreen from './src/screens/User/ArticlesScreen';
import ArticleDetailScreen from './src/screens/User/ArticleDetailScreen';
import UserProfileScreen from './src/screens/User/UserProfileScreen';
import ChangePasswordScreen from './src/screens/User/ChangePasswordScreen';
import FaqsScreen from './src/screens/User/FaqsScreen';
import PrayerScreen from './src/screens/User/PrayerScreen';
import PrayerDetailScreen from './src/screens/User/PrayerDetailScreen';
import AudioPlayerScreen from './src/screens/User/AudioPlayer';
import ReadingScreen from './src/screens/User/ReadingScreen';
import BookReaderScreen from './src/screens/User/BookReaderScreen';
import EBooksScreen from './src/screens/User/EBooksScreen';
import PdfViewerScreen from './src/screens/User/PdfViewerScreen';
import PrayerReader from './src/screens/User/PrayerReader';
import HabitDetailScreen from './src/screens/User/HabitDetailScreen';
import HomeScreen from './src/screens/User/HomeScreen';
import MapScreen from './src/screens/User/MapScreen';
import LeaderboardScreen from './src/screens/User/LeaderboardScreen';
import CharadesResult from './src/screens/User/CharadesResult';
import CharadesPlay from './src/screens/User/CharadesPlay';
import CharadesHome from './src/screens/User/CharadesHome';
import CharadesCategory from './src/screens/User/CharadesCategory';

const Stack = createNativeStackNavigator();

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<any>(null);

  /* ================= FIREBASE AUTH ================= */
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(currentUser => {
      setUser(currentUser);
      if (initializing) setInitializing(false);
    });
    return unsubscribe;
  }, [initializing]);

  /* ================= SPLASH ================= */
  if (initializing) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>

        {/* ================= USER NOT LOGGED IN ================= */}
        {!user ? (
          <>
          
            
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Discovery" component={DiscoveryScreen} />
            <Stack.Screen name="Community" component={CommunityScreen} />
            <Stack.Screen name="Auth" component={AuthStack} />
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="SignUpScreen" component={CreateHabitScreen} />
            
            {/* Admin Stack Entry */}
            <Stack.Screen name="AppAdmin" component={AppAdmin} />
            
            <Stack.Screen name="Home" component={HomeScreen} />
          </>
        ) : (
          <>
            {/* ================= USER LOGGED IN ================= */}
            <Stack.Screen name="UserTabs" component={UserTabs} />
            <Stack.Screen name="Auth" component={AuthStack} />
            <Stack.Screen name="CharadesHome" component={CharadesHome} />
            <Stack.Screen name="CharadesPlay" component={CharadesPlay} />
            <Stack.Screen name="CharadesResult" component={CharadesResult} />
            <Stack.Screen name="CharadesCategory" component={CharadesCategory} />

            {/* Sikhism & Articles */}
            <Stack.Screen name="SikhismScreen" component={SikhismScreen} />
            <Stack.Screen name="SikhGuruScreen" component={SikhGuruScreen} />
            <Stack.Screen name="SakhiDetailScreen" component={SakhiDetailScreen} />
            <Stack.Screen name="ArticlesScreen" component={ArticlesScreen} />
            <Stack.Screen name="ArticleDetailScreen" component={ArticleDetailScreen} />

            {/* Profile & Settings */}
            <Stack.Screen name="UserProfileScreen" component={UserProfileScreen} />
            <Stack.Screen name="ChangePasswordScreen" component={ChangePasswordScreen} />
            <Stack.Screen name="FaqsScreen" component={FaqsScreen} />

            {/* Habits */}
            <Stack.Screen name="HabitsScreen" component={HabitsScreen} />
            <Stack.Screen name="HabitDetail" component={HabitDetailScreen} />
            <Stack.Screen name="CreateHabit" component={CreateHabitScreen} />

            {/* Prayer & Audio */}
            <Stack.Screen name="PrayerScreen" component={PrayerScreen} />
            <Stack.Screen name="PrayerDetail" component={PrayerDetailScreen} />
            <Stack.Screen name="AudioPlayer" component={AudioPlayerScreen} />
            <Stack.Screen name="PrayerReader" component={PrayerReader} />

            {/* Reading & Books */}
            <Stack.Screen name="ReadingScreen" component={ReadingScreen} />
            <Stack.Screen name="BookReader" component={BookReaderScreen} />
            <Stack.Screen name="EbookScreen" component={EBooksScreen} />
            <Stack.Screen name="PdfViewerScreen" component={PdfViewerScreen} />

            {/* Quiz */}
            <Stack.Screen name="QuizScreen" component={QuizScreen} />
            <Stack.Screen name="QuizList" component={SakhisScreen} />
            <Stack.Screen name="AgeQuizScreen" component={AgeQuizScreen} />
            <Stack.Screen name="ChallengeQuizScreen" component={ChallengeQuizScreen} />
            <Stack.Screen name="CategoryScreen" component={CategoryScreen} />
            <Stack.Screen name="AllQuestionsScreen" component={AllQuestionsScreen} />
            <Stack.Screen name="RulesScreen" component={RulesScreen} />
            <Stack.Screen name="GameStats" component={GameStats} />
            <Stack.Screen name='MapScreen' component={MapScreen} />
            <Stack.Screen name="LeaderboardScreen" component={LeaderboardScreen} />

            {/* Admin Stack Entry for Logged In users (if needed) */}
            <Stack.Screen name="AppAdmin" component={AppAdmin} />
          </>
        )}

      </Stack.Navigator>
    </NavigationContainer>
  );
}
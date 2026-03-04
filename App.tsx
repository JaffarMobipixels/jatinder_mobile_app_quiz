import 'react-native-gesture-handler';
import 'react-native-reanimated';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';

/* ================= NAVIGATION ================= */
import UserTabs from './src/navigation/UserTabs';
import AuthStack from './src/navigation/AuthStack';

/* ================= SCREENS ================= */
import SplashScreen from './src/screens/User/SplashOnB/SplashScreen';
import AppAdmin from './src/screens/Admin/Dashboard/AppAdmin';
import PendingApprovalScreen from './src/screens/User/PendingApprovalScreen';
import HomeScreen from './src/screens/User/HomeScreen';

/* Extra screens outside tabs */
import CharadesHome from './src/screens/User/CharadesHome';
import CharadesPlay from './src/screens/User/CharadesPlay';
import CharadesResult from './src/screens/User/CharadesResult';
import CharadesCategory from './src/screens/User/CharadesCategory';
import UserProfileScreen from './src/screens/User/UserProfileScreen';
import ChangePasswordScreen from './src/screens/User/ChangePasswordScreen';
import FaqsScreen from './src/screens/User/FaqsScreen';
import HabitsScreen from './src/screens/User/HabitsScreen';
import HabitDetailScreen from './src/screens/User/HabitDetailScreen';
import CreateHabitScreen from './src/screens/User/CreateHabitScreen';
import PrayerScreen from './src/screens/User/PrayerScreen';
import PrayerDetailScreen from './src/screens/User/PrayerDetailScreen';
import AudioPlayerScreen from './src/screens/User/AudioPlayer';
import PrayerReader from './src/screens/User/PrayerReader';
import ReadingScreen from './src/screens/User/ReadingScreen';
import BookReaderScreen from './src/screens/User/BookReaderScreen';
import EBooksScreen from './src/screens/User/EBooksScreen';
import PdfViewerScreen from './src/screens/User/PdfViewerScreen';
import QuizScreen from './src/screens/User/QuizScreen';
import SakhisScreen from './src/screens/User/SakhisScreen';
import AgeQuizScreen from './src/screens/User/AgeQuizScreen';
import ChallengeQuizScreen from './src/screens/User/ChallengeQuizScreen';
import CategoryScreen from './src/screens/User/CategoryScreen';
import AllQuestionsScreen from './src/screens/User/AllQuestionsScreen';
import RulesScreen from './src/screens/User/RulesScreen';
import GameStats from './src/screens/User/GameStatsScreen';
import MapScreen from './src/screens/User/MapScreen';
import LeaderboardScreen from './src/screens/User/LeaderboardScreen';
import SikhismScreen from './src/screens/User/SekhismScreen';
import SikhGuruScreen from './src/screens/User/SikhGuruScreen';
import SakhiDetailScreen from './src/screens/User/SakhiDetailScreen';
import ArticlesScreen from './src/screens/User/ArticlesScreen';
import ArticleDetailScreen from './src/screens/User/ArticleDetailScreen';
import WelcomeScreen from './src/screens/User/WelcomeScreen';
import LoginScreen from './src/screens/User/LoginScreen';
import SignUpScreen from './src/screens/User/SignupScreen';
import CreateHabitScreen2 from './src/screens/User/CreateHabitScreen';
import DiscoveryScreen from './src/screens/User/DiscoveryScreen';
import CommunityScreen from './src/screens/User/CommunityScreen';
import TeacherEBooksScreen from './src/screens/User/TeacherEBooksScreen';
import AssignBookScreen from './src/screens/User/AssignBookScreen';
import TaskDetailScreen from './src/screens/User/TaskDetailScreen';
import StudentHistoryScreen from './src/screens/User/StudentHistoryScreen';
import PreviousRecordScreen from './src/screens/User/PreviousRecordScreen';
import TeacherStudentRecordsScreen from './src/screens/User/TeacherStudentRecordsScreen';
import StudentPreviousRecordsScreen from './src/screens/User/StudentPreviousRecordsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected' | 'admin' | null>(null);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async currentUser => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const snapshot = await database()
            .ref('users/' + currentUser.uid + '/status')
            .once('value');
          const dbStatus = snapshot.exists() ? snapshot.val() : 'pending';
          setStatus(['approved', 'pending', 'rejected', 'admin'].includes(dbStatus) ? dbStatus : 'pending');
        } catch (err) {
          console.log('Error fetching status:', err);
          setStatus('pending');
        }
      } else {
        setStatus(null);
      }

      if (initializing) setInitializing(false);
    });

    return unsubscribe;
  }, [initializing]);

  if (initializing) return <SplashScreen />;

  // Decide initial route
  let initialRouteName: string;
  if (!user) initialRouteName = 'AuthStack';
  else if (status === 'pending') initialRouteName = 'PendingApprovalScreen';
  else if (status === 'rejected') initialRouteName = 'AuthStack';
  else if (status === 'admin') initialRouteName = 'AppAdmin';
  else initialRouteName = 'UserTabs';

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRouteName}>

        {/* Auth */}
        <Stack.Screen name="AuthStack" component={AuthStack} />
        <Stack.Screen name="PendingApprovalScreen" component={PendingApprovalScreen} />

        {/* Admin */}
        <Stack.Screen name="AppAdmin" component={AppAdmin} />

        {/* User Tabs */}
        <Stack.Screen name="UserTabs" component={UserTabs} />

        {/* Home */}
        <Stack.Screen name="Home" component={HomeScreen} />

        {/* Charades */}
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
        <Stack.Screen name="CreateHabit" component={CreateHabitScreen2} />

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
        <Stack.Screen name="MapScreen" component={MapScreen} />
        <Stack.Screen name="LeaderboardScreen" component={LeaderboardScreen} />

        {/* Extra */}
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="SignUpScreens" component={SignUpScreen} />
        <Stack.Screen name="DiscoveryScreen" component={DiscoveryScreen} />
        <Stack.Screen name="CommunityScreen" component={CommunityScreen} />

        <Stack.Screen  name="TeacherEBooksScreen"  component={TeacherEBooksScreen}/>
        {/* Teacher Assign Task */}
<Stack.Screen  name="AssignBookScreen"  component={AssignBookScreen}/>


<Stack.Screen  name="TaskDetailScreen"component={TaskDetailScreen}/>
<Stack.Screen name="StudentHistoryScreen"component={StudentHistoryScreen}/>
<Stack.Screen name="PreviousRecordScreen"component={PreviousRecordScreen}/>
<Stack.Screen name="TeacherStudentRecordsScreen"component={TeacherStudentRecordsScreen}/>
<Stack.Screen name="StudentPreviousRecordsScreen"component={StudentPreviousRecordsScreen}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
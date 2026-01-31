// AppAdmin.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

/* ========= SCREENS ========= */
import HomeScreenAdmin from './HomeScreenAdmin';
import AddTabScreen from './AddTabScreen';

import AdminPrayerScreen from '../Prayers/AdminPrayerScreen';
import AddPrayerScreen from '../Prayers/AddPrayerScreen';
import EditPrayerScreen from '../Prayers/EditPrayerScreen';

import AdminArticlesScreen from '../Articles/AdminArticlesScreen';
import AddArticleScreen from '../Articles/AddArticleScreen';
import AdminArticleDetailScreen from '../Articles/AdminArticleDetailScreen';

import AdminHabitsScreen from '../Habits/AdminHabitsScreen';
import AddHabitScreen from '../Habits/AddHabitScreen';

import AdminAllQuestionsScreen from '../Questionaires/QuestionsScreen';

import AdminSikhismScreen from '../Sikhism/AdminSikhismScreen';
import AdminSikhGuruScreen from '../SikhGuru/AdminSikhGuruScreen';

import AdminQuizScreen from '../Quizzes/DataFetcher';
import QuizCategoriesScreen from '../Quizzes/QuizCategoriesScreen';
import QuizListScreen from '../Quizzes/QuizListScreen';
import QuizDetailScreen from '../Quizzes/QuizDetailScreen';

import AdminEBooksScreen from '../Books/AdminEBooksScreen';
import AddEBookScreen from '../Books/AddEBookScreen';
import AdminPdfViewerScreen from '../Books/AdminPdfViewerScreen';

import AdminSakhiSeriesScreen from '../Sakhis/AdminSakhiSeriesScreen';

import CharadesAdminWordsScreen from '../CharadesGame/CharadesAdminWordsScreen';
import CharadesAdminCategories from '../CharadesGame/CharadesAdminCategories';
import CharadesWordsManager from '../CharadesGame/CharadesWordsManager';

import AdminRulesScreen from '../AdminRulesScreen';

/* ========= PARAM LIST (IMPORTANT) ========= */
export type AdminStackParamList = {
  Dashboard: undefined;
  AddTabScreen: undefined;

  PrayerScreen: undefined;
  AddPrayerScreen: undefined;
  EditPrayerScreen: { prayer?: any } | undefined;

  AdminArticlesScreen: undefined;
  AddArticle: { article?: any } | undefined;
  AdminArticleDetailScreen: { articleId?: string } | undefined;

  AdminHabitsScreen: undefined;
  AddHabitScreen: { habit?: any } | undefined;

  AdminAllQuestionsScreen: undefined;

  AdminSikhismScreen: undefined;
  AdminSikhGuruScreen: undefined;

  AdminSakhiSeriesScreen: undefined;

  QuizFetchScreen: undefined;
  QuizCategories: undefined;
  QuizList: { categoryId?: string } | undefined;
  QuizDetail: { quizId?: string } | undefined;

  AdminRulesScreen: undefined;

  AdminEBooksScreen: undefined;
  AddEBookScreen: { book?: any } | undefined;
  PdfViewer: { pdfUrl?: string } | undefined;

  CharadesAdminWordsScreen: undefined;
  CharadesAdminCategories: undefined;
  CharadesWordsManager: undefined;
};

/* ========= STACK ========= */
const Stack = createNativeStackNavigator<AdminStackParamList>();

/* ========= NAVIGATOR ========= */
export default function AppAdmin() {
  return (
    <Stack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{ headerShown: false }}
    >
      {/* ===== DASHBOARD ===== */}
      <Stack.Screen name="Dashboard" component={HomeScreenAdmin} />
      <Stack.Screen name="AddTabScreen" component={AddTabScreen} />

      {/* ===== PRAYERS ===== */}
      <Stack.Screen name="PrayerScreen" component={AdminPrayerScreen} />
      <Stack.Screen name="AddPrayerScreen" component={AddPrayerScreen} />
      <Stack.Screen name="EditPrayerScreen" component={EditPrayerScreen} />

      {/* ===== ARTICLES ===== */}
      <Stack.Screen
        name="AdminArticlesScreen"
        component={AdminArticlesScreen}
      />
      <Stack.Screen name="AddArticle" component={AddArticleScreen} />
      <Stack.Screen
        name="AdminArticleDetailScreen"
        component={AdminArticleDetailScreen}
      />

      {/* ===== HABITS ===== */}
      <Stack.Screen
        name="AdminHabitsScreen"
        component={AdminHabitsScreen}
      />
      <Stack.Screen name="AddHabitScreen" component={AddHabitScreen} />

      {/* ===== QUESTIONS ===== */}
      <Stack.Screen
        name="AdminAllQuestionsScreen"
        component={AdminAllQuestionsScreen}
      />

      {/* ===== SIKHISM ===== */}
      <Stack.Screen
        name="AdminSikhismScreen"
        component={AdminSikhismScreen}
      />
      <Stack.Screen
        name="AdminSikhGuruScreen"
        component={AdminSikhGuruScreen}
      />

      {/* ===== SAKHI ===== */}
      <Stack.Screen
        name="AdminSakhiSeriesScreen"
        component={AdminSakhiSeriesScreen}
      />

      {/* ===== QUIZ ===== */}
      <Stack.Screen
        name="QuizFetchScreen"
        component={AdminQuizScreen}
      />
      <Stack.Screen
        name="QuizCategories"
        component={QuizCategoriesScreen}
      />
      <Stack.Screen name="QuizList" component={QuizListScreen} />
      <Stack.Screen name="QuizDetail" component={QuizDetailScreen} />
      <Stack.Screen
        name="AdminRulesScreen"
        component={AdminRulesScreen}
      />

      {/* ===== EBOOKS ===== */}
      <Stack.Screen
        name="AdminEBooksScreen"
        component={AdminEBooksScreen}
      />
      <Stack.Screen name="AddEBookScreen" component={AddEBookScreen} />
      <Stack.Screen name="PdfViewer" component={AdminPdfViewerScreen} />

      {/* ===== CHARADES ===== */}
      <Stack.Screen
        name="CharadesAdminWordsScreen"
        component={CharadesAdminWordsScreen}
      />
      <Stack.Screen
        name="CharadesAdminCategories"
        component={CharadesAdminCategories}
      />
      <Stack.Screen
        name="CharadesWordsManager"
        component={CharadesWordsManager}
      />
    </Stack.Navigator>
  );
}

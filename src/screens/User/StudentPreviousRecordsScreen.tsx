import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  ScrollView,
} from 'react-native';
import database from '@react-native-firebase/database';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useNavigation, useRoute } from '@react-navigation/native';
import { BarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function TeacherPreviousRecordsScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  
  const { studentId, studentName } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<any[]>([]);
  const [allQuestions, setAllQuestions] = useState<any>({});
  const [activeTab, setActiveTab] = useState<'list' | 'graph'>('list');

  useEffect(() => {
    const loadRecords = async () => {
      if (!studentId) {
        setLoading(false);
        return;
      }

      try {
        const qSnap = await database().ref('habitsProgress/questions').once('value');
        setAllQuestions(qSnap.val() || {});

        const snap = await database().ref(`previousRecords/${studentId}`).once('value');
        const userData = snap.val() || {};
        
        const filteredRecords: any[] = [];

        Object.keys(userData).forEach((date) => {
          const record = userData[date];
          if (record.locked) {
            filteredRecords.push({
              date,
              points: record.points || 0, // Points fetch ho rahe hain
              answers: record.answers || {},
              savedAt: record.savedAt || null,
            });
          }
        });

        filteredRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        setRecords(filteredRecords);
        setLoading(false);
      } catch (e) {
        console.log("Error:", e);
        setLoading(false);
      }
    };

    loadRecords();
  }, [studentId]);

  /* ================= 3D GRAPH RENDER ================= */
  const renderGraph = () => {
    // Purane se naye ki taraf sort (Last 7 days)
    const sortedForGraph = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-7);
    
    const labels = sortedForGraph.map(r => {
        const parts = r.date.split('-');
        return parts.length > 2 ? `${parts[1]}/${parts[2]}` : r.date;
    });
    const dataPoints = sortedForGraph.map(r => r.points || 0);

    if (dataPoints.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <FeatherIcon name="bar-chart-2" size={50} color="#ffffff20" />
          <Text style={styles.emptyText}>No data for analytics</Text>
        </View>
      );
    }

    return (
      <View style={styles.graphWrapper}>
        <View style={styles.yAxisLabelContainer}>
           <FeatherIcon name="arrow-up" size={14} color="#94A3B8" />
           <Text style={styles.yAxisText}>Score (0-100)</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <BarChart
            data={{
              labels,
              datasets: [{ data: dataPoints }],
            }}
            width={Math.max(screenWidth - 40, labels.length * 68)}
            height={350}
            fromZero={true}
            segments={10}       // 0, 10, 20... 100 fixed grid
            fromNumber={100}    // Maximum limit 100
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: '#1E293B',
              backgroundGradientFrom: '#1E293B',
              backgroundGradientTo: '#0F172A',
              fillShadowGradientOpacity: 1,
              decimalPlaces: 0,
              color: (opacity = 1, index) => {
                const barColors = ['#84CC16', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6', '#10B981', '#F43F5E'];
                return index !== undefined ? barColors[index % barColors.length] : '#3B82F6';
              },
              labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
              propsForBackgroundLines: {
                stroke: '#334155',
                strokeWidth: 1,
              },
            }}
            showValuesOnTopOfBars={true}
            flatColor={true} 
            style={styles.chartStyle}
          />
        </ScrollView>

        <View style={styles.xAxisLabelContainer}>
           <Text style={styles.yAxisText}>Timeline (Days)</Text>
           <FeatherIcon name="arrow-right" size={14} color="#94A3B8" />
        </View>
      </View>
    );
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.dayCard}>
      <View style={styles.cardHeader}>
        <View style={styles.dateContainer}>
          <View style={styles.calendarIcon}>
            <FeatherIcon name="calendar" size={14} color="#60A5FA" />
          </View>
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
        <View style={styles.pointsBadge}>
          <FeatherIcon name="award" size={12} color="#FFD700" />
          <Text style={styles.pointsText}>{item.points} PTS</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.answersContainer}>
        {Object.keys(item.answers).map((qId) => {
          const answerObj = item.answers[qId];
          const questInfo = allQuestions[qId] || {};
          const isDone = typeof answerObj === 'boolean' ? answerObj : answerObj.done;
          const numVal = answerObj?.value || null;

          return (
            <View key={qId} style={styles.answerTile}>
              <View style={styles.rowTop}>
                <View style={styles.questionInfo}>
                  <View style={[styles.statusDot, { backgroundColor: isDone ? '#10B981' : '#EF4444' }]} />
                  <Text style={styles.questionText} numberOfLines={1}>{questInfo.title || "Daily Question"}</Text>
                </View>
                {isDone && <FeatherIcon name="check-circle" size={14} color="#10B981" />}
              </View>
              {numVal !== null && numVal !== '' && (
                <View style={styles.valueBadge}>
                  <Text style={styles.valueLabel}>{questInfo.numberLabel}: </Text>
                  <Text style={styles.valueText}>{numVal}</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

      {item.savedAt && (
        <View style={styles.cardFooter}>
          <Text style={styles.timeStamp}>
            Student submitted at {new Date(item.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      )}
    </View>
  );

  if (loading) return (
    <View style={styles.loaderContainer}>
      <ActivityIndicator size="large" color="#3B82F6" />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <FeatherIcon name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{studentName}'s Progress</Text>
          <Text style={styles.headerSubtitle}>Personal Archive Access</Text>
        </View>
      </View>

      {/* TABS SELECTION */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity style={[styles.tabButton, activeTab === 'list' && styles.tabActive]} onPress={() => setActiveTab('list')}>
          <Text style={[styles.tabText, activeTab === 'list' && styles.tabTextActive]}>Records</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabButton, activeTab === 'graph' && styles.tabActive]} onPress={() => setActiveTab('graph')}>
          <Text style={[styles.tabText, activeTab === 'graph' && styles.tabTextActive]}>Analytics</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'list' ? (
        <FlatList
          data={records}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listPadding}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <FeatherIcon name="folder-minus" size={60} color="#ffffff10" />
              <Text style={styles.emptyText}>No Records Found</Text>
            </View>
          }
        />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            {renderGraph()}
            <View style={styles.infoCard}>
                <FeatherIcon name="activity" size={16} color="#60A5FA" />
                <Text style={styles.infoText}>Visualizing performance over the last 7 locked submissions.</Text>
            </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1F44' },
  loaderContainer: { flex: 1, backgroundColor: '#0A1F44', justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  backBtn: { width: 45, height: 45, backgroundColor: '#ffffff15', borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  headerTitleContainer: { flex: 1 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '900' },
  headerSubtitle: { color: '#94A3B8', fontSize: 12, fontWeight: '600' },
  
  tabsContainer: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 10, borderRadius: 20, backgroundColor: '#1E293B', overflow: 'hidden' },
  tabButton: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabText: { color: '#94A3B8', fontWeight: '700' },
  tabActive: { backgroundColor: '#10B981' }, // Teacher side green tab
  tabTextActive: { color: '#fff' },

  listPadding: { padding: 20 },
  dayCard: { backgroundColor: '#1E293B', borderRadius: 25, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#334155' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  dateContainer: { flexDirection: 'row', alignItems: 'center' },
  calendarIcon: { padding: 8, backgroundColor: '#1D4ED830', borderRadius: 10, marginRight: 10 },
  dateText: { color: '#E2E8F0', fontWeight: '800', fontSize: 15 },
  pointsBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFD70015', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  pointsText: { color: '#FFD700', fontSize: 10, fontWeight: 'bold', marginLeft: 4 },
  divider: { height: 1, backgroundColor: '#334155', marginBottom: 15 },
  
  answersContainer: { gap: 10 },
  answerTile: { backgroundColor: '#0F172A', padding: 12, borderRadius: 15, borderWidth: 1, borderColor: '#1E293B' },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  questionInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  questionText: { color: '#F1F5F9', fontSize: 14, fontWeight: '600' },
  valueBadge: { marginTop: 8, flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  valueLabel: { color: '#94A3B8', fontSize: 11 },
  valueText: { color: '#60A5FA', fontSize: 13, fontWeight: '800' },
  cardFooter: { marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#334155' },
  timeStamp: { color: '#64748B', fontSize: 10, textAlign: 'center' },

  graphWrapper: { margin: 15, backgroundColor: '#1E293B', borderRadius: 30, padding: 20, borderWidth: 2, borderColor: '#334155', elevation: 25 },
  chartStyle: { marginVertical: 10, borderRadius: 16, paddingRight: 45 },
  yAxisLabelContainer: { position: 'absolute', left: 5, top: 120, transform: [{ rotate: '-90deg' }], flexDirection: 'row', alignItems: 'center', zIndex: 10 },
  xAxisLabelContainer: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', marginTop: -15 },
  yAxisText: { color: '#94A3B8', fontSize: 11, fontWeight: 'bold', marginHorizontal: 5 },
  infoCard: { flexDirection: 'row', backgroundColor: '#10B98115', marginHorizontal: 20, padding: 15, borderRadius: 20, alignItems: 'center' },
  infoText: { color: '#94A3B8', fontSize: 13, marginLeft: 10, flex: 1 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, marginTop: 50 },
  emptyText: { color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 15 },
});
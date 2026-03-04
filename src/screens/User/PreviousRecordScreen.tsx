import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ScrollView,
} from 'react-native';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { BarChart } from 'react-native-chart-kit'; 

const screenWidth = Dimensions.get('window').width;

export default function PreviousRecordScreen() {
  const navigation = useNavigation();
  const [records, setRecords] = useState<any[]>([]);
  const [allQuestions, setAllQuestions] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'graph'>('list');

  const user = auth().currentUser;
  const userKey = user?.uid || '';

  useEffect(() => {
    if (!userKey) return;

    const loadData = async () => {
      try {
        // Questions Load karna labels ke liye
        const qSnap = await database().ref('habitsProgress/questions').once('value');
        const qData = qSnap.val() || {};
        setAllQuestions(qData);

        // User ke locked records load karna
        const snap = await database().ref(`previousRecords/${userKey}`).once('value');
        const data = snap.val() || {};

        const list = Object.keys(data)
          .map(date => ({
            date,
            ...data[date],
          }))
          .filter(record => record.locked === true)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setRecords(list);
        setLoading(false);
      } catch (e) {
        console.log("Error loading records:", e);
        setLoading(false);
      }
    };

    loadData();
  }, [userKey]);

  /* ================= LIST ITEM RENDER ================= */
  const renderItem = ({ item }: any) => {
    const answers = item.answers || {};
    
    return (
      <View style={styles.dayCard}>
        <View style={styles.cardHeader}>
          <View style={styles.dateBadge}>
            <FeatherIcon name="calendar" size={14} color="#60A5FA" />
            <Text style={styles.dateText}>{item.date}</Text>
          </View>
          <View style={styles.lockBadge}>
            <FeatherIcon name="lock" size={12} color="#FBBF24" />
            <Text style={styles.lockText}>LOCKED</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {Object.keys(answers).length === 0 ? (
          <Text style={styles.noData}>No answers recorded.</Text>
        ) : (
          Object.keys(answers).map((taskId) => {
             const answerObj = answers[taskId];
             const questInfo = allQuestions[taskId] || {};
             const isDone = typeof answerObj === 'boolean' ? answerObj : answerObj.done;
             const numVal = answerObj?.value || null;
             const questionTitle = questInfo.title || "Daily Task";
             
             return (
              <View key={taskId} style={styles.answerRow}>
                <View style={styles.rowTop}>
                  <View style={styles.questionLabel}>
                    {questInfo.hasCheckbox !== false && (
                      <View style={[styles.statusDot, { backgroundColor: isDone ? '#10B981' : '#EF4444' }]} />
                    )}
                    <Text style={styles.questionText} numberOfLines={1}>{questionTitle}</Text>
                  </View>
                  
                  {questInfo.hasCheckbox !== false && (
                    <View style={[styles.statusIcon, { backgroundColor: isDone ? '#064E3B' : '#7F1D1D' }]}>
                      <FeatherIcon name={isDone ? 'check' : 'x'} size={10} color={isDone ? '#34D399' : '#F87171'} />
                    </View>
                  )}
                </View>

                {numVal !== null && numVal !== '' && (
                  <View style={styles.valueBadge}>
                    <Text style={styles.valueLabel}>{questInfo.numberLabel || 'Amount'}: </Text>
                    <Text style={styles.valueText}>{numVal}</Text>
                  </View>
                )}
              </View>
            );
          })
        )}

        <View style={styles.cardFooter}>
            {item.savedAt && (
            <Text style={styles.timeTag}>
                Submitted: {new Date(item.savedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </Text>
            )}
            {item.points !== undefined && (
            <View style={styles.pointsBadge}>
                <FeatherIcon name="award" size={12} color="#FFD700" />
                <Text style={styles.pointsTag}>Points: {item.points}</Text>
            </View>
            )}
        </View>
      </View>
    );
  };

  /* ================= 3D GRAPH RENDER (FIXED SCALING) ================= */
  const renderGraph = () => {
    const sortedRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-7);
    
    const labels = sortedRecords.map(r => {
        const parts = r.date.split('-');
        return parts.length > 2 ? `${parts[1]}/${parts[2]}` : r.date;
    });
    const dataPoints = sortedRecords.map(r => r.points || 0);

    if (dataPoints.length === 0) {
      return (
        <View style={styles.emptyGraphContainer}>
          <FeatherIcon name="bar-chart-2" size={50} color="#ffffff20" />
          <Text style={styles.emptyText}>No points data to visualize</Text>
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
            segments={10}       // 100/10 = 10 ka gap banayega
            fromNumber={100}    // Max limit 100 par lock kar di
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
            withInnerLines={true}
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

  if (loading) return (
    <View style={styles.loaderContainer}>
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text style={{color: '#fff', marginTop: 10, opacity: 0.7}}>Decrypting Vault...</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <FeatherIcon name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>History Vault</Text>
          <Text style={styles.headerSubtitle}>Performance Analytics</Text>
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity style={[styles.tabButton, activeTab === 'list' && styles.tabActive]} onPress={() => setActiveTab('list')}>
          <Text style={[styles.tabText, activeTab === 'list' && styles.tabTextActive]}>Records</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabButton, activeTab === 'graph' && styles.tabActive]} onPress={() => setActiveTab('graph')}>
          <Text style={[styles.tabText, activeTab === 'graph' && styles.tabTextActive]}>3D Graph</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'list' ? (
        <FlatList
          data={records}
          keyExtractor={(item) => item.date}
          renderItem={renderItem}
          contentContainerStyle={styles.listPadding}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <FeatherIcon name="lock" size={40} color="#ffffff20" />
              <Text style={styles.emptyText}>No Locked Records Yet</Text>
            </View>
          }
        />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            {renderGraph()}
            <View style={styles.infoCard}>
                <FeatherIcon name="zap" size={16} color="#FBBF24" />
                <Text style={styles.infoText}>Each bar represents your daily total. The grid is locked at 10-point intervals to match your scoring system.</Text>
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
  backButton: { width: 45, height: 45, backgroundColor: '#ffffff15', borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  headerTitleContainer: { flex: 1 },
  headerTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '900' },
  headerSubtitle: { color: '#94A3B8', fontSize: 12, fontWeight: '600' },
  tabsContainer: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 10, borderRadius: 20, backgroundColor: '#1E293B', overflow: 'hidden' },
  tabButton: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabText: { color: '#94A3B8', fontWeight: '700' },
  tabActive: { backgroundColor: '#3B82F6' },
  tabTextActive: { color: '#fff' },
  listPadding: { padding: 20, paddingBottom: 40 },
  dayCard: { backgroundColor: '#1E293B', borderRadius: 20, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: '#334155' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  dateBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1D4ED830', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  dateText: { color: '#E2E8F0', fontWeight: '800', fontSize: 14, marginLeft: 6 },
  lockBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#78350F30', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  lockText: { color: '#FBBF24', fontSize: 10, fontWeight: 'bold', marginLeft: 4 },
  divider: { height: 1, backgroundColor: '#334155', marginBottom: 15 },
  answerRow: { backgroundColor: '#0F172A', padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#1E293B' },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  questionLabel: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  questionText: { color: '#F1F5F9', fontSize: 14, fontWeight: '600' },
  statusIcon: { padding: 4, borderRadius: 6 },
  valueBadge: { marginTop: 8, backgroundColor: '#1E293B', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#334155' },
  valueLabel: { color: '#94A3B8', fontSize: 11 },
  valueText: { color: '#60A5FA', fontSize: 13, fontWeight: '800' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  timeTag: { color: '#64748B', fontSize: 10, fontWeight: '600' },
  pointsBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFD70015', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  pointsTag: { color: '#FFD700', fontSize: 12, fontWeight: '700', marginLeft: 5 },
  graphWrapper: { margin: 15, backgroundColor: '#1E293B', borderRadius: 30, padding: 20, borderWidth: 2, borderColor: '#334155', elevation: 25 },
  chartStyle: { marginVertical: 10, borderRadius: 16, paddingRight: 45 },
  yAxisLabelContainer: { position: 'absolute', left: 5, top: 120, transform: [{ rotate: '-90deg' }], flexDirection: 'row', alignItems: 'center', zIndex: 10 },
  xAxisLabelContainer: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', marginTop: -15 },
  yAxisText: { color: '#94A3B8', fontSize: 11, fontWeight: 'bold', marginHorizontal: 5 },
  infoCard: { flexDirection: 'row', backgroundColor: '#1D4ED815', marginHorizontal: 20, padding: 15, borderRadius: 20, alignItems: 'center' },
  infoText: { color: '#94A3B8', fontSize: 13, marginLeft: 10, flex: 1 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#64748B', fontSize: 16, marginTop: 10 },
  emptyGraphContainer: { height: 300, justifyContent: 'center', alignItems: 'center' },
  noData: { color: '#64748B', textAlign: 'center', padding: 10 }
});
// AddSikhismScreen.tsx
import * as React from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView 
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import database from '@react-native-firebase/database';

interface AddSikhismScreenProps {
  navigation: any;
  route: any;
}

interface TabItem {
  id: string;
  title: string;
  content: string;
  createdAt: number;
}

const DB_PATH = 'SikhismSections'; // consistent DB path

export default function AddSikhismScreen({ navigation }: AddSikhismScreenProps) {
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [tabs, setTabs] = React.useState<TabItem[]>([]);
  const [fetching, setFetching] = React.useState(true);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  /* ================= FETCH EXISTING TABS ================= */
  React.useEffect(() => {
    const ref = database().ref(DB_PATH);
    const listener = ref.on('value', snapshot => {
      const data = snapshot.val() || {};
      const list: TabItem[] = Object.keys(data).map(key => ({
        id: key,
        title: data[key].title,
        content: data[key].content,
        createdAt: data[key].createdAt,
      }));
      list.sort((a, b) => a.createdAt - b.createdAt);
      setTabs(list);
      setFetching(false);
    });

    return () => ref.off('value', listener);
  }, []);

  /* ================= ADD OR UPDATE TAB ================= */
  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert("Error", "Both title and content are required!");
      return;
    }

    setLoading(true);

    try {
      if (editingId) {
        // UPDATE EXISTING TAB
        await database().ref(`${DB_PATH}/${editingId}`).update({
          title: title.trim(),
          content: content.trim(),
        });
        Alert.alert("Updated!", "Sikhism tab has been updated.");
      } else {
        // ADD NEW TAB
        await database().ref(DB_PATH).push({
          title: title.trim(),
          content: content.trim(),
          createdAt: Date.now(),
        });
        Alert.alert("Added!", "New Sikhism tab has been added.");
      }

      // RESET FORM
      setTitle('');
      setContent('');
      setEditingId(null);
    } catch (error: any) {
      console.log('Firebase save error:', error);
      Alert.alert("Error", "Failed to save tab. Try again!");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE TAB ================= */
  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Tab',
      'Are you sure you want to delete this tab?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await database().ref(`${DB_PATH}/${id}`).remove();
              if (editingId === id) {
                setTitle('');
                setContent('');
                setEditingId(null);
              }
            } catch (err) {
              console.log('Delete error:', err);
            }
          }
        }
      ]
    );
  };

  /* ================= START EDITING ================= */
  const handleEdit = (tab: TabItem) => {
    setTitle(tab.title);
    setContent(tab.content);
    setEditingId(tab.id);
  };

  /* ================= RENDER TAB ITEM ================= */
  const renderItem = ({ item, index }: { item: TabItem; index: number }) => (
    <View style={styles.tabCard}>
      <Text style={styles.tabTitle}>{index + 1}. {item.title}</Text>
      <ScrollView style={{ maxHeight: 100 }}>
        <Text style={styles.tabContent}>{item.content}</Text>
      </ScrollView>
      <View style={{ flexDirection: 'row', marginTop: 6 }}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#EF4444', marginRight: 10 }]}
          onPress={() => handleDelete(item.id)}
        >
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#4CAF50' }]}
          onPress={() => handleEdit(item)}
        >
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#6C63FF', '#8A70FF']} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* ================= HEADER ================= */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Sikhism Tab</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* ================= FORM ================= */}
        <TextInput
          style={styles.inputTitle}
          placeholder="Enter Tab Title"
          placeholderTextColor="rgba(255,255,255,0.6)"
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          style={styles.inputContent}
          placeholder="Enter Content"
          placeholderTextColor="rgba(255,255,255,0.5)"
          value={content}
          onChangeText={setContent}
          multiline
        />

        <TouchableOpacity
          style={[styles.addButton, loading && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#6C63FF" />
          ) : (
            <Text style={styles.addButtonText}>
              {editingId ? "Update Tab" : "Add Tab"}
            </Text>
          )}
        </TouchableOpacity>

        {/* ================= EXISTING TABS LIST ================= */}
        {fetching ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
            <ActivityIndicator size="large" color="#FFF" />
          </View>
        ) : (
          <FlatList
            data={tabs}
            keyExtractor={(item) => item.id}
            style={{ marginTop: 20, paddingHorizontal: 20 }}
            contentContainerStyle={{ paddingBottom: 50 }}
            ListHeaderComponent={() => (
              tabs.length > 0 ? <Text style={styles.listHeader}>Existing Tabs</Text> : null
            )}
            renderItem={renderItem}
          />
        )}
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 70,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '800',
  },
  inputTitle: {
    fontSize: 18,
    color: '#FFF',
    marginHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.5)',
    marginBottom: 20,
    marginTop:40,
    paddingVertical: 4,
  },
  inputContent: {
    fontSize: 16,
    color: '#FFF',
    minHeight: 120,
    marginHorizontal: 20,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    padding: 10,
    marginTop:20,
  },
  addButton: {
    marginTop: 20,
    backgroundColor: '#FFD700',
    paddingVertical: 15,
    borderRadius: 15,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#6C63FF',
    fontSize: 18,
    fontWeight: '700',
  },
  listHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 10,
  },
  tabCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    borderRadius: 15,
    marginBottom: 12,
  },
  tabTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 6,
  },
  tabContent: {
    fontSize: 14,
    color: '#FFF',
    marginBottom: 10,
  },
  actionBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  actionText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
    textAlign: 'center',
  },
});

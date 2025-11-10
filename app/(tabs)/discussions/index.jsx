import  { useEffect, useState } from 'react';
import { ScrollView, Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { globalStyles } from '../../../src/styles/global';
import { useSelector, useDispatch } from 'react-redux';
import {removeUpdatedDiscussions} from "../../../store/features/websocketSlice"

export default function DiscussionsList() {
  const dispatch = useDispatch()
  const {newDiscussions,connected} = useSelector((state) => state.websocket);
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        const res = await fetch(`${apiUrl}discussions/`);
        const data = await res.json();
        setDiscussions(data.results);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDiscussions();
  }, []);

  useEffect(() => {
    if (!connected || newDiscussions.length === 0) return;
    setDiscussions(prev => [...newDiscussions,...prev])
    dispatch(removeUpdatedDiscussions())
  },[newDiscussions,connected,dispatch])

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Loading discussions...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={globalStyles.container}>
      <Text style={globalStyles.title}>Community Discussions</Text>

      <View style={styles.addBtnContainer}>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/discussions/new')}
        >
          <Text style={styles.addBtnText}>+ Add New Discussion</Text>
        </TouchableOpacity>
      </View>

      {discussions.map(d => (
        <TouchableOpacity
          key={d.id}
          style={styles.card}
          onPress={() => router.push(`/discussions/${d.slug}/${d.id}`)}
        >
          <Text style={styles.cardTitle}>{d.title}</Text>
          <Text style={styles.cardMeta}>By {d.author_name} • {new Date(d.created_at).toLocaleDateString()}</Text>
          <Text style={styles.cardSummary}>{d.content.slice(0, 120)}...</Text>
          <Text style={styles.readMore}>Read More →</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loading: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 100,
    color: '#FF6B6B',
  },
  addBtnContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  addBtn: {
    backgroundColor: '#2E8B8B',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: {
    fontFamily: 'Poppins',
    fontWeight: '700',
    fontSize: 20,
    color: '#2E8B8B',
    marginBottom: 4,
  },
  cardMeta: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  cardSummary: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 8,
  },
  readMore: {
    fontWeight: '700',
    color: '#FF6B6B',
  },
});

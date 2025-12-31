import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Link, useFocusEffect, useRouter } from "expo-router";
import { Audio } from "expo-av";
import { Card, BodyText } from "../../../src/components/ThemeProvider/components"
import { useThemeStyles } from "../../../src/hooks/useThemeStyles";
import HtmlPreview from "../../../src/components/journal/HtmlPreview";
import PageLoader from "../../../src/components/common/PageLoader";
import { getJournals } from "../../../src/db/journalsDb";
import { useSQLiteContext } from 'expo-sqlite';

export default function JournalListPage() {
  const db = useSQLiteContext(); 
  const router = useRouter()
  const { globalStyles } = useThemeStyles();
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Audio playback state
  const [sound, setSound] = useState(null);
  const [playingId, setPlayingId] = useState(null);

  const fetchJournals = async () => {
    setRefreshing(true);
    try {
      const res = await getJournals(db)
      setJournals(res);
    } catch (err) {
      console.error("Journal fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
        setLoading(true);
        fetchJournals();
    }, [])
  );
  
  if (loading) return <PageLoader />

  const handlePlayAudio = async (uri, id) => {
    try {
      // Stop previous sound
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
        setPlayingId(null);
      }

      // Load new sound
      const { sound: newSound } = await Audio.Sound.createAsync({ uri });
      setSound(newSound);
      setPlayingId(id);
      await newSound.playAsync();

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setPlayingId(null);
          setSound(null);
        }
      });
    } catch (err) {
      console.error("Audio playback error:", err);
    }
  };

  const handlePauseAudio = async () => {
    if (sound) {
      await sound.pauseAsync();
      setPlayingId(null);
    }
  };

  return (
    <ScrollView
      style={globalStyles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchJournals} />
      }
    >
      <View style={styles.contentWrapper}>
        <View style={styles.headerBar}>
          <Text style={globalStyles.title}>My Journal</Text>
        </View>

        <View 
          style={{
              marginBottom:20,
              display:"flex",
              flexDirection:"row",
              justifyContent:"center",
            }}
        >
          <TouchableOpacity 
            onPress={() => router.push("/journal/create")}  
            style={globalStyles.primaryBtn}
          >
          <Text style={globalStyles.primaryBtnText}>
            + New Entry
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.push("/journal/stats")}  
          style={globalStyles.secondaryBtn}>
          <Text style={globalStyles.secondaryBtnText}>
            Stats
          </Text>
        </TouchableOpacity>
        </View>
        
        {/* Journal List */}
        <View style={styles.journalList}>
          {journals.length === 0 ? (
            <BodyText style={styles.emptyText}>
              No journal entries yet.  
              Tap “+ New Entry” to write your first thought.
            </BodyText>
          ) : (
            journals.map((item) => (
              <Link key={item.uuid} href={`/journal/${item.uuid}`} >
                <Card style={styles.card} >
                  {/* Header */}
                  <View style={styles.cardHeader}>
                    <BodyText style={styles.cardTitle}>
                      {item.title || "Untitled"}
                    </BodyText>
                    {item.mood_label && (
                      <BodyText style={styles.cardMoodText}>{item.mood_label}</BodyText>
                    )}
                  </View>

                  {/* Content */}
                  <View style={styles.cardContent}>
                    

                    <HtmlPreview html={item.content} maxLength={200} />

                    {/* Audio Player */}
                    {item.audio_file && (
                      <View style={{ marginTop: 8 }}>
                        <BodyText
                          style={{
                            marginBottom: 4,
                            fontSize: 12,
                          }}
                        >
                          Audio:
                        </BodyText>
                        <TouchableOpacity
                          style={styles.audioButton}
                          onPress={() =>
                            playingId === item.uuid
                              ? handlePauseAudio()
                              : handlePlayAudio(item.audio_file, item.uuid)
                          }
                        >
                          <BodyText style={styles.audioButtonText}>
                            {playingId === item.uuid ? "⏸ Pause" : "▶ Play"}
                          </BodyText>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Transcript */}
                    {item.transcript && (
                      <BodyText style={styles.transcriptText} numberOfLines={3}>
                        {item.transcript.length > 150
                          ? `${item.transcript.slice(0, 150)}...`
                          : item.transcript}
                      </BodyText>
                    )}
                  </View>
                </Card>
              </Link>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  contentWrapper: { maxWidth: 768, alignSelf: "center", width: "100%" },
  card:{width: "100%"},
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  newEntryButton: { backgroundColor: "#FF6B6B", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12 },
  newEntryButtonText: { color: "white", fontSize: 16, fontWeight: "600" },
  journalList: { gap: 16 },
  cardHeader: { marginBottom: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontSize: 20, fontWeight: "600", flex: 1, marginRight: 8 },
  cardMoodText: { fontSize: 12, color: "#6b7280", paddingHorizontal: 6, paddingVertical: 2, backgroundColor: "#F4E1D2", borderRadius: 6, overflow: "hidden" },
  transcriptText: { marginTop: 8, color: "#6b7280", fontSize: 12 },
  emptyText: { 
    textAlign: "center", 
    marginTop: 40, 
    fontSize: 16, 
  },
  audioButton: { backgroundColor: "#eee", padding: 8, borderRadius: 8, alignItems: "center" },
  audioButtonText: { fontSize: 14, fontWeight: "600" },
});

import { useState, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Link, useFocusEffect } from "expo-router";
import { api } from "../../../api";
import ProtectedAccessPage from "../../../src/components/common/ProtectedAccessPage";
import Markdown from "react-native-markdown-display";
import { Audio } from "expo-av";

export default function JournalListPage() {
  const isUserLoggedIn = useSelector((state) => state?.user?.userDetails);
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Audio playback state
  const [sound, setSound] = useState(null);
  const [playingId, setPlayingId] = useState(null);

  const fetchJournals = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await api.get(`/journal/`);
      setJournals(res.data.results);
    } catch (err) {
      console.error("Journal fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (isUserLoggedIn) {
        setLoading(true);
        fetchJournals();
      }
    }, [fetchJournals, isUserLoggedIn])
  );

  if (!isUserLoggedIn)
    return (
      <ProtectedAccessPage
        message="Your personal journal is waiting. Sign up or log in to continue."
      />
    );

  if (loading && journals.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading Entries...</Text>
      </View>
    );
  }

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
      style={styles.outerContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchJournals} />
      }
    >
      <View style={styles.contentWrapper}>
        {/* Header */}
        <View style={styles.headerBar}>
          <Text style={styles.header}>My Journal</Text>

          <Link href="/journal/create" asChild>
            <TouchableOpacity style={styles.newEntryButton}>
              <Text style={styles.newEntryButtonText}>+ New Entry</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Journal List */}
        <View style={styles.journalList}>
          {journals.length === 0 ? (
            <Text style={styles.emptyText}>
              No journal entries found. Tap '+ New Entry' to begin!
            </Text>
          ) : (
            journals.map((item) => (
              <Link key={item.id} href={`/journal/${item.id}`} asChild>
                <TouchableOpacity style={styles.card}>
                  {/* Header */}
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>
                      {item.title || "Untitled"}
                    </Text>
                    {item.mood && (
                      <Text style={styles.cardMoodText}>{item.mood.name}</Text>
                    )}
                  </View>

                  {/* Content */}
                  <View style={styles.cardContent}>
                    {item.content && (
                      <Markdown style={markdownStyles}>
                        {item.content}
                      </Markdown>
                    )}

                    {/* Audio Player */}
                    {item.audio_file && (
                      <View style={{ marginTop: 8 }}>
                        <Text
                          style={{
                            marginBottom: 4,
                            fontSize: 12,
                            color: "#555",
                          }}
                        >
                          Audio:
                        </Text>
                        <TouchableOpacity
                          style={styles.audioButton}
                          onPress={() =>
                            playingId === item.id
                              ? handlePauseAudio()
                              : handlePlayAudio(item.audio_file, item.id)
                          }
                        >
                          <Text style={styles.audioButtonText}>
                            {playingId === item.id ? "⏸ Pause" : "▶ Play"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Transcript */}
                    {item.transcript && (
                      <Text style={styles.transcriptText} numberOfLines={3}>
                        {item.transcript.length > 150
                          ? `${item.transcript.slice(0, 150)}...`
                          : item.transcript}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              </Link>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: "#f8f8f8" },
  contentWrapper: { padding: 24, maxWidth: 768, alignSelf: "center", width: "100%" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 16, color: "#333" },
  headerBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  header: { fontSize: 28, fontWeight: "bold", color: "#FF6B6B" },
  newEntryButton: { backgroundColor: "#FF6B6B", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12 },
  newEntryButtonText: { color: "white", fontSize: 16, fontWeight: "600" },
  journalList: { gap: 16 },
  card: { backgroundColor: "white", borderRadius: 16, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 3, elevation: 3, marginBottom: 16 },
  cardHeader: { marginBottom: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontSize: 20, fontWeight: "600", flex: 1, marginRight: 8 },
  cardMoodText: { fontSize: 12, color: "#6b7280", paddingHorizontal: 6, paddingVertical: 2, backgroundColor: "#F4E1D2", borderRadius: 6, overflow: "hidden" },
  cardContent: {},
  transcriptText: { marginTop: 8, color: "#6b7280", fontSize: 12 },
  emptyText: { textAlign: "center", marginTop: 40, fontSize: 16, color: "#6b7280" },
  audioButton: { backgroundColor: "#eee", padding: 8, borderRadius: 8, alignItems: "center" },
  audioButtonText: { fontSize: 14, fontWeight: "600" },
});

const markdownStyles = {
  body: { color: "#4b5563", fontSize: 14, lineHeight: 20 },
  link: { color: "#2E8B8B" },
  heading1: { fontSize: 22, fontWeight: "700" },
  heading2: { fontSize: 20, fontWeight: "700" },
};

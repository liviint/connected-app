import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import * as ClipBoard from "expo-clipboard"
import {useRouter, useLocalSearchParams } from "expo-router";
import { Audio } from "expo-av";
import { api } from "../../../../api";
import DeleteButton from "../../../../src/components/common/DeleteButton";
import { htmlToPlainText } from "../../../../src/helpers";
import { useThemeStyles } from "../../../../src/hooks/useThemeStyles";
import HtmlPreview from "../../../../src/components/journal/HtmlPreview";
import { Card , BodyText} from "../../../../src/components/ThemeProvider/components";
import PageLoader from "../../../../src/components/common/PageLoader";
import { getJournals, deleteJournal } from "../../../../src/db/journalsDb";

export default function ViewJournalPage() {
  const {globalStyles} = useThemeStyles()
    const router = useRouter()
  const { id } = useLocalSearchParams();

  const [entry, setEntry] = useState({});
  const [loading, setLoading] = useState(true);

  // Audio playback state
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const fetchJournal = async () => {
      try {
        const res = await getJournals(id)
        setEntry(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJournal();
  }, [id]);

  const handleDelete = () => {
    Alert.alert(
      "Delete Journal",
      "Are you sure you want to delete this entry?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            deleteJournal(id)
            router.push("/journal");
          },
        },
      ]
    );
  };

  const handlePlayAudio = async () => {
    if (!entry.audio_file) return;

    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
        return;
      }

      const { sound: newSound } = await Audio.Sound.createAsync({ uri: entry.audio_file });
      setSound(newSound);
      setIsPlaying(true);

      await newSound.playAsync();

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
          setSound(null);
        }
      });
    } catch (err) {
      console.error("Audio playback error:", err);
    }
  };

  const handleCopy = async () => {
    let content = htmlToPlainText(entry.content)
    await ClipBoard.setStringAsync(content);
  };


  if (loading) return <PageLoader message={"Loading Journal"} />

  return (
    <ScrollView style={globalStyles.container} >
      <Card >
        {/* Header */}
        <View style={styles.headerSection}>
          <BodyText style={styles.title}>{entry.title || "Untitled"}</BodyText>
          {entry.mood && <Text style={styles.mood}>{entry.mood.name}</Text>}
        </View>

        {/* Dates */}
        <View style={styles.dates}>
          <Text style={styles.dateText}>
            <Text style={{ fontWeight: "bold" }}>Created:</Text> {new Date(entry.created_at).toLocaleString()}
          </Text>
          <Text style={styles.dateText}>
            <Text style={{ fontWeight: "bold" }}>Updated:</Text> {new Date(entry.updated_at).toLocaleString()}
          </Text>
        </View>

        <View style={styles.divider} />

        <HtmlPreview  html={entry.content}/>

        {/* Audio Player */}
        {entry.audio_file && (
          <View style={{ marginTop: 16 }}>
            <TouchableOpacity style={styles.audioButton} onPress={handlePlayAudio}>
              <Text style={styles.audioButtonText}>{isPlaying ? "⏸ Pause" : "▶ Play Audio"}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Transcript */}
        {entry.transcript && (
          <View style={styles.transcriptContainer}>
            <Text style={styles.transcriptTitle}>Transcript</Text>
            <Text style={styles.transcriptText}>{entry.transcript}</Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
              style={styles.editButton}
              onPress={handleCopy}
            >
            <Text style={styles.editButtonText}>Copy</Text>
          </TouchableOpacity>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push(`/journal/${id}/edit`)}
            >
            <Text style={styles.editButtonText}>Edit Entry</Text>
          </TouchableOpacity>
          <DeleteButton 
            handleOk={handleDelete}
            item={"journal"}
            contentAuthor={entry.user}
          />
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 3, elevation: 3 },
  headerSection: { marginBottom: 12 },
  title: { fontSize: 28, fontWeight: "bold" },
  mood: { marginTop: 6, alignSelf: "flex-start", backgroundColor: "#F4E1D2", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, fontSize: 12 },
  dates: { backgroundColor: "#f1f1f1", padding: 12, borderRadius: 12, marginBottom: 12 },
  dateText: { fontSize: 12, color: "#555" },
  divider: { borderBottomWidth: 1, borderBottomColor: "#ddd", marginVertical: 12 },
  audioButton: { backgroundColor: "#2E8B8B", paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  audioButtonText: { color: "#fff", fontWeight: "600" },
  transcriptContainer: { marginTop: 16, backgroundColor: "#F4E1D2", padding: 12, borderRadius: 12 },
  transcriptTitle: { fontWeight: "bold", marginBottom: 6 },
  transcriptText: { fontSize: 14 },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 16 },
  deleteButton: { backgroundColor: "#ff4d4d", paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12 },
  deleteButtonText: { color: "#fff", fontWeight: "600" },
  editButton: { backgroundColor: "#2E8B8B", paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12 },
  editButtonText: { color: "#fff", fontWeight: "600" },
});
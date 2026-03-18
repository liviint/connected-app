import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  PanResponder 
} from "react-native";
import * as ClipBoard from "expo-clipboard"
import {useRouter, useLocalSearchParams } from "expo-router";
import DeleteButton from "../../../../src/components/common/DeleteButton";
import { htmlToPlainText } from "../../../../src/helpers";
import { useThemeStyles } from "../../../../src/hooks/useThemeStyles";
import HtmlPreview from "../../../../src/components/journal/HtmlPreview";
import { Card , BodyText} from "../../../../src/components/ThemeProvider/components";
import PageLoader from "../../../../src/components/common/PageLoader";
import { getJournals, deleteJournal } from "../../../../src/db/journalsDb";
import { useSQLiteContext } from 'expo-sqlite';
import { Audio } from "expo-av";

export default function ViewJournalPage() {
  const db = useSQLiteContext(); 
  const {globalStyles} = useThemeStyles()
  const router = useRouter()
  const { id } = useLocalSearchParams();

  const [entry, setEntry] = useState({});
  const [loading, setLoading] = useState(true);

  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [barWidth, setBarWidth] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  useEffect(() => {
    const fetchJournal = async () => {
      try {
        const res = await getJournals(db,id)
        setEntry(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJournal();
  }, [id]);

  useEffect(() => {
  if (!entry?.audio_uri) return;

  let soundObj;

  const loadAudio = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: entry.audio_uri },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );

      soundObj = sound;
      setSound(sound);
    } catch (err) {
      console.error("Audio load error", err);
    }
  };

  loadAudio();

  return () => {
    soundObj?.unloadAsync();
  };
}, [entry?.audio_uri]);

const onPlaybackStatusUpdate = (status) => {
  if (!status.isLoaded) return;

  if (!isSeeking) {
    setPosition(status.positionMillis);
  }

  setDuration(status.durationMillis || 0);

  if (status.didJustFinish) {
    setIsPlaying(false);
  }
};

const togglePlayback = async () => {
  if (!sound) return;

  if (isPlaying) {
    await sound.pauseAsync();
    setIsPlaying(false);
  } else {
    await sound.playAsync();
    setIsPlaying(true);
  }
};

const handleSeek = async (evt) => {
  if (!sound || !duration) return;

  const touchX = evt.nativeEvent.locationX;

  const percentage = Math.max(0, Math.min(1, touchX / barWidth));

  const newPosition = percentage * duration;

  try {
    await sound.setPositionAsync(newPosition);
    setPosition(newPosition);
  } catch (err) {
    console.error("Seek error", err);
  }
};

const panResponder = useRef(
  PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => setIsSeeking(true),
    onPanResponderMove: handleSeek,
    onPanResponderRelease: () => setIsSeeking(false),
  })
).current;

const formatTime = (millis) => {
  const seconds = Math.floor(millis / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

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
            deleteJournal(db,id)
            router.push("/journal");
          },
        },
      ]
    );
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

        {entry?.audio_uri && (
  <View style={styles.audioContainer}>
    <Text style={styles.audioTitle}>🎙️ Audio Journal</Text>

    <View style={styles.audioControls}>
      <TouchableOpacity
        style={styles.playButton}
        onPress={togglePlayback}
      >
        <Text style={styles.playButtonText}>
          {isPlaying ? "Pause" : "Play"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.time}>
        {formatTime(position || 0)} / {formatTime(duration || 0)}
      </Text>
    </View>

    {/* Progress bar */}
    <View
  style={styles.progressBar}
  onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
  {...panResponder.panHandlers}
>
  <View
    style={[
      styles.progress,
      {
        width:
          duration > 0
            ? `${(position / duration) * 100}%`
            : "0%",
      },
    ]}
  />

  {/* Thumb */}
  <View
    style={[
      styles.thumb,
      {
        left:
          duration > 0
            ? `${(position / duration) * 100}%`
            : "0%",
      },
    ]}
  />
</View>
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
  transcriptContainer: { marginTop: 16, backgroundColor: "#F4E1D2", padding: 12, borderRadius: 12 },
  transcriptTitle: { fontWeight: "bold", marginBottom: 6 },
  transcriptText: { fontSize: 14 },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 16 },
  deleteButton: { backgroundColor: "#ff4d4d", paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12 },
  deleteButtonText: { color: "#fff", fontWeight: "600" },
  editButton: { backgroundColor: "#2E8B8B", paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12 },
  editButtonText: { color: "#fff", fontWeight: "600" },
  audioContainer: {
  marginTop: 16,
  padding: 12,
  backgroundColor: "#F4E1D2",
  borderRadius: 12,
},

audioTitle: {
  fontWeight: "bold",
  marginBottom: 8,
},

audioControls: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
},

playButton: {
  backgroundColor: "#2E8B8B",
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderRadius: 8,
},

playButtonText: {
  color: "#fff",
  fontWeight: "600",
},

time: {
  fontSize: 12,
  color: "#555",
},

progressBar: {
  height: 6,
  backgroundColor: "#ddd",
  borderRadius: 4,
  marginTop: 10,
  overflow: "hidden",
},

progress: {
  height: 6,
  backgroundColor: "#2E8B8B",
},
thumb: {
  position: "absolute",
  top: -4,
  width: 14,
  height: 14,
  borderRadius: 7,
  backgroundColor: "#2E8B8B",
},

});
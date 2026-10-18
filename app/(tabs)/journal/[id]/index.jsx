
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  PanResponder,
} from "react-native";
import * as ClipBoard from "expo-clipboard";
import { useRouter, useLocalSearchParams } from "expo-router";
import DeleteButton from "../../../../src/components/common/DeleteButton";
import { htmlToPlainText } from "../../../../src/helpers";
import { useThemeStyles } from "../../../../src/hooks/useThemeStyles";
import HtmlPreview from "../../../../src/components/journal/HtmlPreview";
import {
  Card,
  BodyText,
} from "../../../../src/components/ThemeProvider/components";
import PageLoader from "../../../../src/components/common/PageLoader";
import { getJournals, deleteJournal } from "../../../../src/db/journalsDb";
import { useSQLiteContext } from "expo-sqlite";
import {
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";

export default function ViewJournalPage() {
  const db = useSQLiteContext();
  const { globalStyles } = useThemeStyles();
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [entry, setEntry] = useState({});
  const [loading, setLoading] = useState(true);

  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [barWidth, setBarWidth] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  // expo-audio player
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);
  const isPlaying = status.playing;

  // Fetch the journal entry
  useEffect(() => {
    let active = true;

    const fetchJournal = async () => {
      setLoading(true);

      try {
        const res = await getJournals(db, id);

        if (active) {
          setEntry(res);
        }
      } catch (err) {
        console.error("Journal fetch error:", err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchJournal();

    return () => {
      active = false;
    };
  }, [db, id]);

  // Load the journal's audio whenever its URI changes
  useEffect(() => {
    if (!entry?.audio_uri) {
      player.pause();
      setPosition(0);
      setDuration(0);
      return;
    }

    player.pause();
    player.replace({ uri: entry.audio_uri });
    setPosition(0);
    setDuration(0);

    return () => {
      player.pause();
    };
  }, [entry?.audio_uri, player]);

  // expo-audio reports currentTime and duration in seconds
  useEffect(() => {
    if (!isSeeking) {
      setPosition(status.currentTime ?? 0);
    }

    setDuration(status.duration ?? 0);

    if (status.didJustFinish) {
      setPosition(0);
      setIsSeeking(false);
    }
  }, [
    status.currentTime,
    status.duration,
    status.didJustFinish,
    isSeeking,
  ]);

  const togglePlayback = () => {
    if (!entry?.audio_uri) return;

    if (status.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  // Seek using seconds, not milliseconds
  const handleSeek = useCallback(
    (evt) => {
      if (!duration || !barWidth) return;

      const touchX = evt.nativeEvent.locationX;
      const percentage = Math.max(
        0,
        Math.min(1, touchX / barWidth)
      );

      const newPosition = percentage * duration;

      setPosition(newPosition);
      player.seekTo(newPosition);
    },
    [barWidth, duration, player]
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          setIsSeeking(true);
          handleSeek(evt);
        },
        onPanResponderMove: handleSeek,
        onPanResponderRelease: () => {
          setIsSeeking(false);
        },
        onPanResponderTerminate: () => {
          setIsSeeking(false);
        },
      }),
    [handleSeek]
  );

  // expo-audio time values are seconds
  const formatTime = (seconds = 0) => {
    const totalSeconds = Math.floor(seconds);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;

    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Journal",
      "Are you sure you want to delete this entry?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteJournal(db, id);
              player.pause();
              router.replace("/journal");
            } catch (err) {
              console.error("Journal delete error:", err);
              Alert.alert(
                "Error",
                "Unable to delete this journal entry."
              );
            }
          },
        },
      ]
    );
  };

  const handleCopy = async () => {
    const content = htmlToPlainText(entry.content ?? "");
    await ClipBoard.setStringAsync(content);
  };

  if (loading) {
    return <PageLoader message="Loading Journal" />;
  }

  return (
    <ScrollView style={globalStyles.container}>
      <Card>
        {/* Header */}
        <View style={styles.headerSection}>
          <BodyText style={styles.title}>
            {entry.title || "Untitled"}
          </BodyText>

          {entry.mood && (
            <Text style={styles.mood}>
              {entry.mood.name}
            </Text>
          )}
        </View>

        {/* Dates */}
        <View style={styles.dates}>
          <Text style={styles.dateText}>
            <Text style={{ fontWeight: "bold" }}>Created:</Text>{" "}
            {entry.created_at
              ? new Date(entry.created_at).toLocaleString()
              : "—"}
          </Text>

          <Text style={styles.dateText}>
            <Text style={{ fontWeight: "bold" }}>Updated:</Text>{" "}
            {entry.updated_at
              ? new Date(entry.updated_at).toLocaleString()
              : "—"}
          </Text>
        </View>

        <View style={styles.divider} />

        <HtmlPreview html={entry.content ?? ""} />

        {/* Audio Journal */}
        {entry?.audio_uri && (
          <View style={styles.audioContainer}>
            <Text style={styles.audioTitle}>
              🎙️ Audio Journal
            </Text>

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
                {formatTime(position)} / {formatTime(duration)}
              </Text>
            </View>

            {/* Seekable progress bar */}
            <View
              style={styles.progressBar}
              onLayout={(e) =>
                setBarWidth(e.nativeEvent.layout.width)
              }
              {...panResponder.panHandlers}
            >
              <View
                style={[
                  styles.progress,
                  {
                    width:
                      duration > 0
                        ? `${Math.min(
                            (position / duration) * 100,
                            100
                          )}%`
                        : "0%",
                  },
                ]}
              />

              <View
                style={[
                  styles.thumb,
                  {
                    left:
                      duration > 0
                        ? `${Math.min(
                            (position / duration) * 100,
                            100
                          )}%`
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
            item="journal"
            contentAuthor={entry.user}
          />
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },

  headerSection: {
    marginBottom: 12,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
  },

  mood: {
    marginTop: 6,
    alignSelf: "flex-start",
    backgroundColor: "#F4E1D2",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
  },

  dates: {
    backgroundColor: "#f1f1f1",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },

  dateText: {
    fontSize: 12,
    color: "#555",
  },

  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginVertical: 12,
  },

  transcriptContainer: {
    marginTop: 16,
    backgroundColor: "#F4E1D2",
    padding: 12,
    borderRadius: 12,
  },

  transcriptTitle: {
    fontWeight: "bold",
    marginBottom: 6,
  },

  transcriptText: {
    fontSize: 14,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 16,
  },

  deleteButton: {
    backgroundColor: "#ff4d4d",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },

  deleteButtonText: {
    color: "#fff",
    fontWeight: "600",
  },

  editButton: {
    backgroundColor: "#2E8B8B",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },

  editButtonText: {
    color: "#fff",
    fontWeight: "600",
  },

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
    height: 14,
    justifyContent: "center",
    backgroundColor: "#ddd",
    borderRadius: 7,
    marginTop: 10,
    overflow: "visible",
  },

  progress: {
    position: "absolute",
    left: 0,
    height: 6,
    backgroundColor: "#2E8B8B",
    borderRadius: 4,
  },

  thumb: {
    position: "absolute",
    top: 0,
    marginLeft: -5,
    width: 10,
    height: 14,
    borderRadius: 5,
    backgroundColor: "#2E8B8B",
  },
});

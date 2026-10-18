
import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Animated,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import {
  RichEditor,
  RichToolbar,
  actions,
} from "react-native-pell-rich-editor";
import { useThemeStyles } from "../../hooks/useThemeStyles";
import {
  Input,
  FormLabel,
  CustomPicker,
  Card,
} from "../ThemeProvider/components";
import {
  upsertJournal,
  getJournals,
  getLocalMoods,
} from "../../db/journalsDb";
import uuid from "react-native-uuid";
import { useSQLiteContext } from "expo-sqlite";
import {
  AudioModule,
  RecordingPresets,
  useAudioRecorder,
  useAudioRecorderState,
  useAudioPlayer,
  useAudioPlayerStatus,
  setAudioModeAsync,
} from "expo-audio";
import { File, Paths } from "expo-file-system";

export default function AddEdit({ id }) {
  const db = useSQLiteContext();
  const { globalStyles, colors } = useThemeStyles();
  const router = useRouter();
  const richText = useRef(null);

  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(false);

  const initialForm = {
    title: "",
    content: "",
    mood_uuid: "",
    mood_label: "",
  };

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [audioUri, setAudioUri] = useState("");
  const [isPaused, setIsPaused] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // expo-audio recorder
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const isRecording = recorderState.isRecording;

  // expo-audio player
  const player = useAudioPlayer(null);
  const playerStatus = useAudioPlayerStatus(player);
  const isPlaying = playerStatus.playing;

  // Fetch moods
  useEffect(() => {
    let active = true;

    const fetchMoods = async () => {
      try {
        const result = await getLocalMoods(db);
        if (active) setMoods(result);
      } catch (err) {
        console.error("Failed to load moods:", err);
      }
    };

    fetchMoods();

    return () => {
      active = false;
    };
  }, [db]);

  // Fetch existing journal entry when editing
  useEffect(() => {
    if (!id) return;

    let active = true;

    const fetchJournal = async () => {
      try {
        const entry = await getJournals(db, id);
        if (!active || !entry) return;

        setForm({
          ...initialForm,
          ...entry,
          mood_uuid: entry.mood_uuid ?? "",
        });

        if (entry.audio_uri) {
          setAudioUri(entry.audio_uri);
        }

        richText.current?.setContentHTML(entry.content || "");
      } catch (err) {
        console.error("Failed to load journal:", err);
      }
    };

    fetchJournal();

    return () => {
      active = false;
    };
  }, [db, id]);

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const saveAudioPermanently = async (uri) => {
    try {
      if (!uri) return null;

      const fileName = `audio_${Date.now()}.m4a`;
      const source = new File(uri);
      const destination = new File(Paths.document, fileName);

      await source.move(destination);

      return destination.uri;
    } catch (err) {
      console.error("File save error:", err);
      return uri;
    }
  };

  const startRecording = async () => {
    try {
      const permission =
        await AudioModule.requestRecordingPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission required",
          "Please allow microphone access to record your journal."
        );
        return;
      }

      // Stop playback before recording
      player.pause();

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      await recorder.prepareToRecordAsync();
      recorder.record();

      setIsPaused(false);
    } catch (err) {
      console.error("Failed to start recording:", err);
      Alert.alert("Recording error", "Could not start recording.");
    }
  };

  const pauseRecording = async () => {
    try {
      recorder.pause();
      setIsPaused(true);
    } catch (err) {
      console.error("Pause failed:", err);
    }
  };

  const resumeRecording = async () => {
    try {
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      recorder.record();
      setIsPaused(false);
    } catch (err) {
      console.error("Resume failed:", err);
    }
  };

  const stopRecording = async () => {
    if (isProcessing) return;

    setIsProcessing(true);

    try {
      await recorder.stop();

      const uri = recorder.uri;

      if (!uri) {
        throw new Error("No recording URI was returned.");
      }

      const savedUri = await saveAudioPermanently(uri);

      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });

      setAudioUri(savedUri || uri);
      setIsPaused(false);
    } catch (err) {
      console.error("Failed to stop recording:", err);
      Alert.alert("Recording error", "Could not save the recording.");
    } finally {
      setIsProcessing(false);
    }
  };

  const playAudio = () => {
    if (!audioUri) return;

    try {
      if (isPlaying) {
        player.pause();
      } else {
        player.replace({ uri: audioUri });
        player.play();
      }
    } catch (err) {
      console.error("Audio playback error:", err);
      Alert.alert("Playback error", "Could not play this recording.");
    }
  };

  // Save journal entry
  const validateForm = () => {
    const newErrors = {};

    if (!form.content.trim() && !audioUri) {
      newErrors.content = "Please write something in your entry.";
    }

    if (!form.mood_uuid) {
      newErrors.mood_uuid = "Please select a mood.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    const journalUuid = form.uuid || uuid.v4();
    const moodLabel = moods.find(
      (mood) => String(mood.uuid) === String(form.mood_uuid)
    )?.name;

    try {
      await upsertJournal(db, {
        ...form,
        audio_uri: audioUri,
        id: form.id || 0,
        uuid: journalUuid,
        mood_label: moodLabel,
      });

      Alert.alert("Success", "Journal entry saved!");

      setForm(initialForm);
      router.push("/journal");
    } catch (err) {
      console.error("Failed to save journal:", err);
      Alert.alert("Error", "Could not save your journal entry.");
    } finally {
      setLoading(false);
    }
  };

  const Waveform = ({ isRecording }) => (
    <View style={styles.waveContainer}>
      {Array.from({ length: 20 }).map((_, i) => (
        <WaveBar
          key={i}
          isRecording={isRecording}
          delay={i * 80}
        />
      ))}
    </View>
  );

  return (
    <ScrollView style={globalStyles.container}>
      <Text style={globalStyles.title}>
        {id ? "Edit Journal" : "Add Journal"}
      </Text>

      <Card>
        <View style={globalStyles.formGroup}>
          <FormLabel>Title (Optional)</FormLabel>
          <Input
            placeholder="Enter title"
            value={form.title}
            onChangeText={(text) => handleChange("title", text)}
          />
        </View>

        <View style={globalStyles.formGroup}>
          <FormLabel>Your Thoughts</FormLabel>

          <RichToolbar
            editor={richText}
            actions={[
              actions.setBold,
              actions.setItalic,
              actions.setUnderline,
              actions.insertBulletsList,
              actions.insertOrderedList,
            ]}
            style={{ backgroundColor: colors.surface }}
            iconTint={colors.textMuted}
            selectedIconTint={colors.primary}
          />

          <RichEditor
            key={id || "new-journal"}
            ref={richText}
            placeholder="Write your thoughts..."
            onChange={(text) => handleChange("content", text)}
            initialContentHTML={form.content}
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 2,
            }}
            editorStyle={{
              backgroundColor: colors.surface,
              color: colors.text,
              placeholderColor: colors.textMuted,
              contentCSSText: `
                padding: 12px;
                min-height: 180px;
                font-size: 16px;
                line-height: 24px;
                color: ${colors.text};
                caret-color: ${colors.primary};
              `,
            }}
          />

          {errors.content && (
            <Text style={styles.error}>{errors.content}</Text>
          )}
        </View>

        <View style={globalStyles.formGroup}>
          <FormLabel>Audio Journal (Optional)</FormLabel>

          <View style={{ gap: 12 }}>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 10,
                alignItems: "center",
              }}
            >
              {!isRecording && !isPaused && (
                <TouchableOpacity
                  style={[
                    styles.audioButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={startRecording}
                  disabled={isProcessing}
                >
                  <Text style={styles.audioText}>Start</Text>
                </TouchableOpacity>
              )}

              {isRecording && !isPaused && (
                <TouchableOpacity
                  style={[
                    styles.audioButton,
                    { backgroundColor: "orange" },
                  ]}
                  onPress={pauseRecording}
                >
                  <Text style={styles.audioText}>Pause</Text>
                </TouchableOpacity>
              )}

              {isPaused && (
                <TouchableOpacity
                  style={[
                    styles.audioButton,
                    { backgroundColor: "green" },
                  ]}
                  onPress={resumeRecording}
                  disabled={isProcessing}
                >
                  <Text style={styles.audioText}>Resume</Text>
                </TouchableOpacity>
              )}

              {(isRecording || isPaused) && (
                <TouchableOpacity
                  disabled={isProcessing}
                  style={[
                    styles.audioButton,
                    {
                      backgroundColor: isProcessing ? "#ccc" : "red",
                    },
                  ]}
                  onPress={stopRecording}
                >
                  <Text style={styles.audioText}>
                    {isProcessing ? "Stopping..." : "Stop"}
                  </Text>
                </TouchableOpacity>
              )}

              {audioUri && !isRecording && !isPaused && (
                <TouchableOpacity
                  style={[
                    styles.audioButton,
                    { backgroundColor: colors.secondary },
                  ]}
                  onPress={playAudio}
                >
                  <Text style={styles.audioText}>
                    {isPlaying ? "Pause Playback" : "Play"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {(isRecording || isPaused || audioUri) && (
              <Waveform isRecording={isRecording && !isPaused} />
            )}

            {(isRecording || isPaused) && (
              <Text
                style={{
                  color: isPaused ? "orange" : "red",
                  fontSize: 12,
                }}
              >
                {isPaused ? "⏸ Paused" : "● Recording..."}
              </Text>
            )}
          </View>
        </View>

        <View style={globalStyles.formGroup}>
          <FormLabel>Mood</FormLabel>

          <CustomPicker
            selectedValue={form.mood_uuid}
            onValueChange={(value) =>
              handleChange("mood_uuid", value)
            }
          >
            <Picker.Item label="Select a mood" value="" />

            {moods.map((mood) => (
              <Picker.Item
                key={mood.uuid}
                label={mood.name}
                value={String(mood.uuid)}
              />
            ))}
          </CustomPicker>

          {errors.mood_uuid && (
            <Text style={styles.error}>{errors.mood_uuid}</Text>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            { opacity: loading ? 0.6 : 1 },
          ]}
          onPress={handleSubmit}
          disabled={loading || isRecording || isPaused || isProcessing}
        >
          <Text style={styles.submitButtonText}>
            {loading
              ? "Saving..."
              : id
                ? "Update Entry"
                : "Save Entry"}
          </Text>
        </TouchableOpacity>
      </Card>
    </ScrollView>
  );
}

const WaveBar = ({ isRecording, delay }) => {
  const anim = useRef(new Animated.Value(5)).current;

  useEffect(() => {
    let loop;

    if (isRecording) {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: Math.random() * 40 + 10,
            duration: 200,
            delay,
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: 5,
            duration: 200,
            useNativeDriver: false,
          }),
        ])
      );

      loop.start();
    } else {
      anim.setValue(5);
    }

    return () => loop?.stop();
  }, [isRecording, delay, anim]);

  return (
    <Animated.View
      style={[
        styles.waveBar,
        {
          height: anim,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  error: {
    color: "red",
    marginTop: 4,
    fontSize: 12,
  },

  submitButton: {
    backgroundColor: "#2E8B8B",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
  },

  submitButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  richEditor: {
    minHeight: 180,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 10,
    backgroundColor: "#fff",
    marginTop: 6,
    marginBottom: 25,
  },

  richToolbar: {
    borderRadius: 12,
    marginBottom: 6,
  },

  audioButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },

  audioText: {
    color: "#fff",
    fontWeight: "600",
  },

  waveContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 50,
    marginTop: 12,
    gap: 4,
  },

  waveBar: {
    width: 4,
    backgroundColor: "#2E8B8B",
    borderRadius: 2,
  },
});

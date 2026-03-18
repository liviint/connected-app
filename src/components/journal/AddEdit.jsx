import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Animated
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { RichEditor, RichToolbar, actions } from "react-native-pell-rich-editor";
import { useThemeStyles } from "../../hooks/useThemeStyles";
import { Input, FormLabel, CustomPicker, Card } from "../ThemeProvider/components";
import { upsertJournal, getJournals, getLocalMoods } from "../../db/journalsDb";
import uuid from 'react-native-uuid';
import { useSQLiteContext } from 'expo-sqlite';
import { Audio } from "expo-av";
import { File, Paths } from "expo-file-system";

export default function AddEdit({ id }) {
  const db = useSQLiteContext(); 
  const { globalStyles, colors } = useThemeStyles();
  const router = useRouter();
  const richText = useRef();
  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const initialForm = {
    title: "", 
    content: "", 
    mood_uuid: "",
    mood_label:"",
  }
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [audioUri, setAudioUri] = useState("");
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch moods
  useEffect(() => {
    let getMoods = async () => {
      let moods = await getLocalMoods(db)
      setMoods(moods)
    }
    getMoods()
  }, []);

  // Fetch existing journal entry if editing
  useEffect(() => {
    if (!id) return;
    let fetchJournal = async () => {
      let entry = await getJournals(db,id)
      setForm({ ...entry,mood_uuid:entry.mood_uuid});
      if (entry?.audio_uri) setAudioUri(entry.audio_uri); 
      if (richText.current) {
        richText.current.setContentHTML(entry.content || "");
      }
    }
    fetchJournal()
  }, [id]);

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission required", "Allow microphone access");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  const stopRecording = async () => {
  if (isProcessing) return;

  try {
    setIsProcessing(true);

    if (!recording) return;

    const currentRecording = recording;

    setRecording(null);
    setIsRecording(false);
    setIsPaused(false);

    await currentRecording.stopAndUnloadAsync();

    const uri = currentRecording.getURI();
    if (!uri) throw new Error("No recording URI");

    const savedUri = await saveAudioPermanently(uri);

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });

    setAudioUri(savedUri);
  } catch (err) {
    console.error(err);
  } finally {
    setIsProcessing(false);
  }
};

  const pauseRecording = async () => {
    try {
      if (!recording) return;

      await recording.pauseAsync();
      setIsPaused(true);
    } catch (err) {
      console.error("Pause failed", err);
    }
  };

  const resumeRecording = async () => {
    try {
      if (!recording) return;

      await recording.startAsync();
      setIsPaused(false);
    } catch (err) {
      console.error("Resume failed", err);
    }
  };

  const playAudio = async () => {
    if (!audioUri) return;

    const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
    await sound.playAsync();
  };

  const saveAudioPermanently = async (uri) => {
  try {
    if (!uri) return null;

    const fileName = `audio_${Date.now()}.m4a`;

    const dest = new File(Paths.document, fileName);
    const source = new File(uri);

    await source.move(dest);

    return dest.uri;
  } catch (err) {
    console.error("File save error", err);
    return uri; // fallback (VERY important)
  }
};

  const Waveform = ({ isRecording }) => {
    const bars = Array.from({ length: 20 });

    return (
      <View style={styles.waveContainer}>
        {bars.map((_, i) => (
          <WaveBar key={i} isRecording={isRecording} delay={i * 80} />
        ))}
      </View>
    );
  };

  const validateForm = () => {
    let newErrors = {};
    if (!form.content.trim() && !audioUri)
      newErrors.content = "Please write something in your entry.";
    if (!form.mood_uuid) newErrors.mood_uuid = "Please select a mood.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async () => {
  if (!validateForm()) return;
  setLoading(true);
  const journalUuid = form.uuid || uuid.v4();
  const moodLabel = moods.filter(mood => mood.uuid == form.mood_uuid)[0]?.name
  try {
    await upsertJournal(db,{...form,audio_uri:audioUri,id:form.id || 0,uuid:journalUuid, mood_label:moodLabel});
    Alert.alert("Success", "Journal entry saved!");
    router.push("/journal");
    setForm(initialForm);
  } catch (err) {
    console.error(err,"hello err");
  } finally {
    setLoading(false);
  }
};

  return (
    <ScrollView style={globalStyles.container} >
      <Text style={globalStyles.title}>{id ? "Edit Journal" : "Add Journal"}</Text>
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
          <FormLabel >Your Thoughts</FormLabel>

          {/* Toolbar on top */}
          <RichToolbar
            editor={richText}
            actions={[
              actions.setBold,
              actions.setItalic,
              actions.setUnderline,
              actions.insertBulletsList,
              actions.insertOrderedList,
            ]}
            style={{
              backgroundColor: colors.surface,
            }}
            iconTint={colors.textMuted}
            selectedIconTint={colors.primary}
          />


          <RichEditor
            key={id}
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


          {errors.content && <Text style={styles.error}>{errors.content}</Text>}
        </View>

        <View style={globalStyles.formGroup}>
          <FormLabel>Audio Journal (Optional)</FormLabel>

          <View style={{ gap: 12 }}>
  <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
    
    {/* Start (only when idle) */}
    {!isRecording && !isPaused && (
      <TouchableOpacity
        style={[styles.audioButton, { backgroundColor: colors.primary }]}
        onPress={startRecording}
      >
        <Text style={styles.audioText}>Start</Text>
      </TouchableOpacity>
    )}

    {/* Pause */}
    {isRecording && !isPaused && (
      <TouchableOpacity
        style={[styles.audioButton, { backgroundColor: "orange" }]}
        onPress={pauseRecording}
      >
        <Text style={styles.audioText}>Pause</Text>
      </TouchableOpacity>
    )}

    {/* Resume */}
    {isPaused && (
      <TouchableOpacity
        style={[styles.audioButton, { backgroundColor: "green" }]}
        onPress={resumeRecording}
      >
        <Text style={styles.audioText}>Resume</Text>
      </TouchableOpacity>
    )}

    {/* Stop (always visible when recording or paused) */}
    {(isRecording || isPaused) && (
      <TouchableOpacity
  disabled={isProcessing}
  style={[
    styles.audioButton,
    { backgroundColor: isProcessing ? "#ccc" : "red" }
  ]}
  onPress={stopRecording}
>
  <Text style={styles.audioText}>
    {isProcessing ? "Stopping..." : "Stop"}
  </Text>
</TouchableOpacity>
    )}

    {/* Play */}
    {audioUri && !isRecording && !isPaused && (
      <TouchableOpacity
        style={[styles.audioButton, { backgroundColor: colors.secondary }]}
        onPress={playAudio}
      >
        <Text style={styles.audioText}>Play</Text>
      </TouchableOpacity>
    )}
  </View>

  {/* Waveform */}
  {(isRecording || isPaused || audioUri) && (
    <Waveform isRecording={isRecording && !isPaused} />
  )}

  {/* Status */}
  {(isRecording || isPaused) && (
    <Text style={{ color: isPaused ? "orange" : "red", fontSize: 12 }}>
      {isPaused ? "⏸ Paused" : "● Recording..."}
    </Text>
  )}
</View>
        </View>

        <View style={globalStyles.formGroup}>
          <FormLabel >Mood</FormLabel>
          <CustomPicker
            selectedValue={form.mood_uuid}
            onValueChange={(value) => handleChange("mood_uuid", value)}
          >
            <Picker.Item label="Select a mood" value="" />
            {moods.map((m) => (
              <Picker.Item key={m.uuid} label={m.name} value={String(m.uuid)} />
            ))}
          </CustomPicker>
          {errors.mood_uuid && <Text style={styles.error}>{errors.mood_uuid}</Text>}
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.submitButtonText}>
            {loading ? "Saving..." : id ? "Update Entry" : "Save Entry"}
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
  }, [isRecording]);

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
  error: { color: "red", marginTop: 4, fontSize: 12 },
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
    fontSize: 16 
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

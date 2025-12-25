import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Audio } from "expo-av";
import { useRouter } from "expo-router";
import { RichEditor, RichToolbar, actions } from "react-native-pell-rich-editor";
import { api } from "../../../api";
import { useThemeStyles } from "../../hooks/useThemeStyles";
import { Input, FormLabel, CustomPicker } from "../ThemeProvider/components";
import { createJournal, markJournalSynced } from "../../db/journalsDb";
import uuid from 'react-native-uuid';

export default function AddEdit({ id }) {
  const { globalStyles, colors } = useThemeStyles();
  const router = useRouter();
  const richText = useRef();
  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const initialForm = {
    title: "", 
    content: "", 
    mood_id: ""
  }
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [recording, setRecording] = useState(null);
  const [audioUri, setAudioUri] = useState("");
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Fetch moods
  useEffect(() => {
    api
      .get("journal/categories/")
      .then((res) => {
        setMoods(res.data)
      })
      .catch((err) => console.error(err));
  }, []);

  // Fetch existing journal entry if editing
  useEffect(() => {
    if (!id) return;
    api
      .get(`journal/${id}/`)
      .then((res) => {
        const entry = res.data;
        setForm({ ...entry, mood_id: String(entry.mood.id) });
        if (entry.audio_file) setAudioUri(entry.audio_file); 
        if (richText.current) {
          richText.current.setContentHTML(entry.content || "");
        }
      })
      .catch((err) => console.error(err));
  }, [id]);

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    let newErrors = {};
    if (!form.content.trim() && !audioUri)
      newErrors.content = "Please write something in your entry.";
    if (!form.mood_id) newErrors.mood_id = "Please select a mood.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async () => {
  if (!validateForm()) return;
  setLoading(true);
  const journalUuid = uuid.v4()
  try {
    // 1️⃣ Save locally first
    await createJournal(journalUuid, form.title, form.content, form.mood_label);

    // 2️⃣ Prepare FormData for API
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("content", form.content);
    formData.append("mood_id", form.mood_id);

    if (audioUri && !audioUri.startsWith("http")) {
      const uriParts = audioUri.split("/");
      const name = uriParts[uriParts.length - 1];
      formData.append("audio_file", { uri: audioUri, name, type: "audio/mpeg" });
    }

    // 3️⃣ Send to API
    const url = id ? `/journal/${id}/` : "/journal/";
    const method = id ? "PUT" : "POST";

    await api({
      url,
      method,
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    });

    // 4️⃣ Mark local journal as synced
    await markJournalSynced(journalUuid);

    Alert.alert("Success", "Journal entry saved!");
    router.push("/journal");
    setForm(initialForm);
  } catch (err) {
    console.error(err);
    Alert.alert(
      "Saved locally",
      "Journal saved locally. It will sync when online."
    );
  } finally {
    setLoading(false);
  }
};


  // Recording functions
  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not start recording");
    }
  };

  const stopRecording = async () => {
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setAudioUri(uri);
      setRecording(null);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not stop recording");
    }
  };

  const playAudio = async () => {
    if (!audioUri) return;
    const { sound: playbackObject } = await Audio.Sound.createAsync({ uri: audioUri });
    setSound(playbackObject);
    setIsPlaying(true);
    await playbackObject.playAsync();
    playbackObject.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        setIsPlaying(false);
        setSound(null);
      }
    });
  };

  const pauseAudio = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
    >
      <Text style={globalStyles.title}>{id ? "Edit Entry" : "Add Entry"}</Text>

      <View style={globalStyles.formGroup}>
        <FormLabel style={styles.label}>Title (Optional)</FormLabel>
        <Input
          placeholder="Enter title"
          value={form.title}
          onChangeText={(text) => handleChange("title", text)}
        />
      </View>

      <View style={globalStyles.formGroup}>
        <FormLabel style={styles.label}>Your Thoughts</FormLabel>

        {/* Toolbar on top */}
        <RichToolbar
          editor={richText}
          actions={[
            actions.setBold,
            actions.setItalic,
            actions.setUnderline,
            actions.insertBulletsList,
            actions.insertOrderedList,
            actions.insertLink,
          ]}
          style={{
            backgroundColor: colors.surface,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
          iconTint={colors.textMuted}
          selectedIconTint={colors.primary}
        />


        <RichEditor
          ref={richText}
          initialContentHTML={form.content}
          placeholder="Write your thoughts..."
          onChange={(text) => handleChange("content", text)}
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
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
        <FormLabel >Mood</FormLabel>
        <CustomPicker
          selectedValue={form.mood_id}
          onValueChange={(value) => handleChange("mood_id", value)}
        >
          <Picker.Item label="Select a mood" value="" />
          {moods.map((m) => (
            <Picker.Item key={m.id} label={m.name} value={String(m.id)} />
          ))}
        </CustomPicker>
        {errors.mood_id && <Text style={styles.error}>{errors.mood_id}</Text>}
      </View>

      <View style={globalStyles.formGroup}>
        <FormLabel >Voice Journal (Optional)</FormLabel>

        {!recording && !audioUri && (
          <TouchableOpacity style={styles.recordButton} onPress={startRecording}>
            <Text style={styles.recordButtonText}>🎤 Start Recording</Text>
          </TouchableOpacity>
        )}

        {recording && (
          <TouchableOpacity
            style={[styles.recordButton, { backgroundColor: "red" }]}
            onPress={stopRecording}
          >
            <Text style={styles.recordButtonText}>⏹ Stop Recording</Text>
          </TouchableOpacity>
        )}

        {audioUri && !recording && (
          <View style={{ marginTop: 10 }}>
            <Text style={{ marginBottom: 6 }}>Audio available ✅</Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                style={styles.recordButton}
                onPress={isPlaying ? pauseAudio : playAudio}
              >
                <Text style={styles.recordButtonText}>
                  {isPlaying ? "⏸ Pause" : "▶ Play"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.recordButton}
                onPress={() => {
                  setAudioUri("");
                  if (sound) {
                    sound.stopAsync();
                    setSound(null);
                    setIsPlaying(false);
                  }
                }}
              >
                <Text style={styles.recordButtonText}>🔁 Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.submitButtonText}>
          {loading ? "Saving..." : id ? "Update Entry" : "Save Entry"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 0 },
  error: { color: "red", marginTop: 4, fontSize: 12 },
  recordButton: {
    backgroundColor: "#2E8B8B",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 6,
  },
  recordButtonText: { color: "#fff", fontWeight: "600" },
  submitButton: {
    backgroundColor: "#2E8B8B",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
  },
  submitButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
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
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    marginBottom: 6,
  },
});

import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
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

export default function AddEdit({ id }) {
  const router = useRouter();
  const richText = useRef();

  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", mood_id: "" });
  const [errors, setErrors] = useState({});
  const [recording, setRecording] = useState(null);
  const [audioUri, setAudioUri] = useState("");
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Fetch moods
  useEffect(() => {
    api
      .get("journal/categories/")
      .then((res) => setMoods(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Fetch existing journal entry if editing
  useEffect(() => {
    if (!id) return;
    api
      .get(`journal/${id}/`)
      .then((res) => {
        const entry = res.data;
        setForm({ ...entry, mood_id: entry.mood.id });
        if (entry.audio_file) setAudioUri(entry.audio_file); // set existing audio
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

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("content", form.content);
    formData.append("mood_id", form.mood_id);

    if (audioUri && !audioUri.startsWith("http")) {
      const uriParts = audioUri.split("/");
      const name = uriParts[uriParts.length - 1];
      formData.append("audio_file", { uri: audioUri, name, type: "audio/mpeg" });
    }

    try {
      const url = id ? `/journal/${id}/` : "/journal/";
      const method = id ? "PUT" : "POST";
      await api({
        url,
        method,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });
      Alert.alert("Success", "Journal entry saved!");
      router.push("/journal");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to save entry");
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{id ? "Edit Entry" : "Add Entry"}</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Title (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter title"
          value={form.title}
          onChangeText={(text) => handleChange("title", text)}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Your Thoughts</Text>

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
          style={styles.richToolbar}
        />

        <RichEditor
          ref={richText}
          initialContentHTML={form.content}
          style={styles.richEditor}
          placeholder="Write your thoughts..."
          onChange={(text) => handleChange("content", text)}
          editorStyle={{
            backgroundColor: "#fff",
            contentCSSText: "padding: 10px; min-height: 180px;",
          }}
        />

        {errors.content && <Text style={styles.error}>{errors.content}</Text>}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Mood</Text>
        <Picker
          selectedValue={form.mood_id}
          onValueChange={(value) => handleChange("mood_id", value)}
        >
          <Picker.Item label="Select a mood" value="" />
          {moods.map((m) => (
            <Picker.Item key={m.id} label={m.name} value={String(m.id)} />
          ))}
        </Picker>
        {errors.mood_id && <Text style={styles.error}>{errors.mood_id}</Text>}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Voice Journal (Optional)</Text>

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
  container: { padding: 24 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 24 },
  formGroup: { marginBottom: 16 },
  label: { marginBottom: 6, fontWeight: "600", fontSize: 16 },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 14,
  },
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

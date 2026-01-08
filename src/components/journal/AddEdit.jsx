import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { RichEditor, RichToolbar, actions } from "react-native-pell-rich-editor";
import { useThemeStyles } from "../../hooks/useThemeStyles";
import { Input, FormLabel, CustomPicker, Card } from "../ThemeProvider/components";
import { upsertJournal, getJournals, getLocalMoods } from "../../db/journalsDb";
import uuid from 'react-native-uuid';
import { useSQLiteContext } from 'expo-sqlite';

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
    mood_id: "",
    mood_label:"",
  }
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [audioUri, setAudioUri] = useState("");

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
      setForm({ ...entry,mood_id:String(entry.mood_id)});
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
  const journalUuid = form.uuid || uuid.v4();
  const moodLabel = moods.filter(mood => mood.id == form.mood_id)[0]?.name
  try {
    await upsertJournal(db,{...form,id:form.id || 0,uuid:journalUuid, mood_label:moodLabel});
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
    <ScrollView style={globalStyles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={globalStyles.title}>{id ? "Edit Entry" : "Add Entry"}</Text>
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

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.submitButtonText}>
            {loading ? "Saving..." : id ? "Update Entry" : "Save Entry"}
          </Text>
        </TouchableOpacity>

      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router"; 
import { api } from "../../../../api";
import { Picker } from "@react-native-picker/picker"; 

export default function CreateJournalPage() {
  const router = useRouter();
  
  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    mood_id: "" 
  });

  const handleChange = (field, value) => {
    setForm(prevForm => ({ ...prevForm, [field]: value }));
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get(`journal/categories/`);
        setMoods(res.data.results);
      } catch (err) {
        console.error("Categories fetch error:", err);
        Alert.alert("Error", "Could not fetch moods.");
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async () => {
    if (!form.content.trim()) {
        Alert.alert("Error", "Please write down your thoughts before saving.");
        return;
    }
    
    setLoading(true);
    try {
      const res = await api.post("/journal/", form);
      console.log(res.data, "Journal created");
      Alert.alert("Success", "Journal entry saved!");
      const newEntryId = res.data.id;
      if (newEntryId) {
        router.push(`/journal/${newEntryId}`); 
      } else {
        router.replace('/(journal'); 
      }

    } catch (err) {
      console.error("Submission error:", err);
      Alert.alert("Error", "Failed to save the journal entry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>New Journal Entry</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Optional"
          value={form.title}
          onChangeText={(text) => handleChange('title', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Your Thoughts</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Write anything..."
          value={form.content}
          onChangeText={(text) => handleChange('content', text)}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Mood</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={form.mood_id}
            onValueChange={(itemValue) => handleChange('mood_id', itemValue)}
          >
            <Picker.Item label="Select a mood" value="" style={{ color: form.mood_id ? '#333' : '#999' }} />
            {moods.map((m) => (
              <Picker.Item key={m.id} label={m.name} value={String(m.id)} />
            ))}
          </Picker>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.saveButtonText}>Save Entry</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 24,
    maxWidth: 600, 
    alignSelf: 'center', 
    width: '100%',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6347', 
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 12, 
    paddingHorizontal: 10,
    fontSize: 16,
  },
  textArea: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 12, 
    padding: 10,
    height: 160, 
    fontSize: 16,
    lineHeight: 20,
  },
  pickerContainer: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f9f9f9', 
  },
  saveButton: {
    backgroundColor: '#FF6347', 
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonDisabled: {
    backgroundColor: '#FF8C7A',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
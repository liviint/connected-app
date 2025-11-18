import { useEffect, useState } from "react";
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
import { useLocalSearchParams, useRouter } from "expo-router"; 
import { api } from "../../../../../api";
import { Picker } from "@react-native-picker/picker"; 

export default function EditJournalPage() {
  const router = useRouter();
  const params = useLocalSearchParams(); 
  const id = params.id; 
  const [entry, setEntry] = useState(null);
  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return; 

    const fetchJournal = async () => {
      try {
        const res = await api.get(`journal/${id}/`);
        setEntry(res.data);
      } catch (err) {
        console.error("Journal fetch error:", err);
        Alert.alert("Error", "Could not fetch journal entry.");
      }
    };
    
    const fetchCategories = async () => {
      try {
        const res = await api.get(`journal/categories/`);
        setMoods(res.data.results);
      } catch (err) {
        console.error("Categories fetch error:", err);
        Alert.alert("Error", "Could not fetch moods.");
      }
    };

    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchJournal(), fetchCategories()]);
      setLoading(false);
    }
    
    fetchData();
  }, [id]);

  const handleSave = async () => {
    try {
      await api.put(`/journal/${id}/`, entry); 
      router.replace(`/(journal)/${id}`); 
    } catch (error) {
      console.error("Save error:", error);
      Alert.alert("Error", "Failed to save the entry.");
    }
  };

  const handleChange = (field, value) => {
    setEntry(prevEntry => ({ ...prevEntry, [field]: value }));
  };

  if (loading || !entry) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6347" /> 
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>Edit Entry</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={entry.title}
          onChangeText={(text) => handleChange('title', text)}
          placeholder="Title"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Your Thoughts</Text>
        <TextInput
          style={styles.textArea}
          value={entry.content}
          onChangeText={(text) => handleChange('content', text)}
          multiline
          numberOfLines={6}
          placeholder="What are your thoughts?"
          textAlignVertical="top"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Mood</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={String(entry.mood_id || entry.mood?.id || "")}
            onValueChange={(itemValue) => handleChange('mood_id', itemValue)}
          >
            <Picker.Item label="Select a mood" value="" enabled={false} style={{ color: '#999' }} />
            {moods.map((m) => (
              <Picker.Item key={m.id} label={m.name} value={String(m.id)} />
            ))}
          </Picker>
        </View>
      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
      >
        <Text style={styles.saveButtonText}>Save Entry</Text>
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
    padding: 20,
    maxWidth: 600, 
    alignSelf: 'center', 
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
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
    height: 140, 
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
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
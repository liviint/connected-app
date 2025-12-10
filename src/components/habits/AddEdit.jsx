import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { api } from "../../../api";

export default function AddEdit() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    description: "",
    frequency: "daily",
    reminder_time: "",
    color: "#FF6B6B",
    icon: "🔥",
  });

  const [errors, setErrors] = useState({
    title: "",
    reminder_time: "",
  });

  const [loading, setLoading] = useState(false);

  // --------------------------
  // Handlers
  // --------------------------
  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = () => {
    let ok = true;

    if (!form.title.trim()) {
      ok = false;
      setErrors((prev) => ({
        ...prev,
        title: "Please write something in your title.",
      }));
    }

    if (!form.reminder_time) {
      ok = false;
      setErrors((prev) => ({
        ...prev,
        reminder_time: "Please select a reminder time.",
      }));
    }

    return ok;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      const url = id ? `habits/${id}/` : "habits/";
      const method = id ? "PUT" : "POST";

      await api({
        url,
        method,
        data: form,
      });

      setTimeout(() => {
        router.push("/habits");
      }, 10);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------
  // Fetch habit on edit
  // --------------------------
  useEffect(() => {
    if (!id) return;

    let isMounted = true;

    const fetchHabit = async () => {
      try {
        const res = await api.get(`habits/${id}/`);
        if (isMounted) setForm(res.data);
      } catch (err) {
        console.log("Fetch error:", err);
      }
    };

    fetchHabit();
    return () => (isMounted = false);
  }, [id]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>{id ? "Edit Habit" : "Create a Habit"}</Text>

      <View style={styles.card}>
        {/* TITLE */}
        <View>
          <Text style={styles.label}>Title</Text>
          <TextInput
            value={form.title}
            onChangeText={(v) => handleChange("title", v)}
            placeholder="e.g., Drink Water"
            style={styles.input}
          />
          {errors.title ? <Text style={styles.error}>{errors.title}</Text> : null}
        </View>

        {/* DESCRIPTION */}
        <View>
          <Text style={styles.label}>Description</Text>
          <TextInput
            value={form.description}
            onChangeText={(v) => handleChange("description", v)}
            placeholder="Optional details..."
            style={[styles.input, { height: 90 }]}
            multiline
          />
        </View>

        {/* FREQUENCY */}
        <View>
          <Text style={styles.label}>Frequency</Text>

          {/* Simple Picker Substitute */}
          <View style={styles.selectBox}>
            <TouchableOpacity
              onPress={() => handleChange("frequency", "daily")}
              style={[
                styles.selectOption,
                form.frequency === "daily" && styles.activeOption,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  form.frequency === "daily" && styles.activeOptionText,
                ]}
              >
                Daily
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleChange("frequency", "weekly")}
              style={[
                styles.selectOption,
                form.frequency === "weekly" && styles.activeOption,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  form.frequency === "weekly" && styles.activeOptionText,
                ]}
              >
                Weekly
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleChange("frequency", "monthly")}
              style={[
                styles.selectOption,
                form.frequency === "monthly" && styles.activeOption,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  form.frequency === "monthly" && styles.activeOptionText,
                ]}
              >
                Monthly
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* REMINDER TIME */}
        <View>
          <Text style={styles.label}>Reminder Time</Text>
          <TextInput
            value={form.reminder_time}
            onChangeText={(v) => handleChange("reminder_time", v)}
            placeholder="HH:MM"
            style={styles.input}
          />
          {errors.reminder_time ? (
            <Text style={styles.error}>{errors.reminder_time}</Text>
          ) : null}
        </View>

        {/* COLOR */}
        <View>
          <Text style={styles.label}>Color</Text>
          <TextInput
            value={form.color}
            onChangeText={(v) => handleChange("color", v)}
            style={[styles.input, { height: 50 }]}
          />
        </View>

        {/* ICON */}
        <View>
          <Text style={styles.label}>Icon</Text>
          <TextInput
            value={form.icon}
            onChangeText={(v) => handleChange("icon", v)}
            style={styles.input}
            placeholder="e.g., 🔥 💧 🌱"
          />
        </View>

        {/* SUBMIT */}
        <TouchableOpacity
          onPress={handleSubmit}
          style={styles.submitButton}
          disabled={loading}
        >
          <Text style={styles.submitText}>
            {loading ? (id ? "Updating..." : "Creating...") : id ? "Edit Habit" : "Create Habit"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#FAF9F7", padding: 20, flex: 1 },
  title: { fontSize: 28, fontWeight: "700", color: "#333", marginBottom: 16 },
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F4E1D2",
    gap: 20,
  },
  label: { fontWeight: "700", marginBottom: 6, color: "#2E8B8B" },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    backgroundColor: "white",
    borderColor: "#ddd",
  },
  error: { color: "#FF6B6B", fontSize: 13, marginTop: 4 },
  selectBox: { flexDirection: "row", gap: 10 },
  selectOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  activeOption: {
    backgroundColor: "#2E8B8B",
    borderColor: "#2E8B8B",
  },
  activeOptionText: { color: "white", fontWeight: "600" },
  optionText: { color: "#333", fontWeight: "500" },
  submitButton: {
    backgroundColor: "#2E8B8B",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
  },
  submitText: { color: "white", fontWeight: "700", fontSize: 16 },
});

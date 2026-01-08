import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useThemeStyles } from "../../hooks/useThemeStyles";
import { FormLabel, Input, Card, BodyText } from "../ThemeProvider/components";
import { upsertHabit, getHabits } from "../../db/habitsDb";
import uuid from 'react-native-uuid';
import { useSQLiteContext } from 'expo-sqlite';
import DateTimePicker from "@react-native-community/datetimepicker";

export default function AddEdit() {
  const db = useSQLiteContext(); 
  const { globalStyles } = useThemeStyles();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [showTimePicker, setShowTimePicker] = useState(false);

  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 5); 
  };

  const inititialForm = {
    title: "",
    description: "",
    frequency: "daily",
    reminder_time: getCurrentTime(),
    color: "#FF6B6B",
    icon: "🔥",
  }

  const [form, setForm] = useState(inititialForm);

  const [errors, setErrors] = useState({
    title: "",
    reminder_time: "",
  });

  const [loading, setLoading] = useState(false);

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
      const habitUuid = form.uuid || uuid.v4();
      await upsertHabit(db,{...form,id:form.id || 0,uuid:habitUuid})
      setForm(inititialForm)
      router.push("/habits");
    } catch (error) {
      console.log(error,"hello error")
    }
    finally{
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!id) return;
    const fetchHabit = async () => {
      let habit = await getHabits(db,id)
      setForm(habit)
    };
    fetchHabit();
  }, [id]);

  return (
    <ScrollView style={globalStyles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={globalStyles.title}>{id ? "Edit Habit" : "Create a Habit"}</Text>

      <Card >
        {/* TITLE */}
        <View style={globalStyles.formGroup}>
          <FormLabel style={styles.label}>Title</FormLabel>
          <Input
            value={form.title}
            onChangeText={(v) => handleChange("title", v)}
            placeholder="e.g., Drink Water"
          />
          {errors.title ? <Text style={styles.error}>{errors.title}</Text> : null}
        </View>

        {/* DESCRIPTION */}
        <View style={globalStyles.formGroup}>
          <FormLabel style={styles.label}>Description</FormLabel>
          <Input
            value={form.description}
            onChangeText={(v) => handleChange("description", v)}
            placeholder="Optional details..."
            style={[styles.input, { height: 90 }]}
            multiline
          />
        </View>

        {/* FREQUENCY */}
        <View style={globalStyles.formGroup}>
          <FormLabel >Frequency</FormLabel>

          {/* Simple Picker Substitute */}
          <View style={styles.selectBox}>
            <TouchableOpacity
              onPress={() => handleChange("frequency", "daily")}
              style={[
                styles.selectOption,
                form.frequency === "daily" && styles.activeOption,
              ]}
            >
              <BodyText
                style={[
                  form.frequency === "daily" && styles.activeOptionText,
                ]}
              >
                Daily
              </BodyText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleChange("frequency", "weekly")}
              style={[
                styles.selectOption,
                form.frequency === "weekly" && styles.activeOption,
              ]}
            >
              <BodyText
                style={[
                  form.frequency === "weekly" && styles.activeOptionText,
                ]}
              >
                Weekly
              </BodyText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleChange("frequency", "monthly")}
              style={[
                styles.selectOption,
                form.frequency === "monthly" && styles.activeOption,
              ]}
            >
              <BodyText
                style={[
                  form.frequency === "monthly" && styles.activeOptionText,
                ]}
              >
                Monthly
              </BodyText>
            </TouchableOpacity>
          </View>
        </View>

        {/* REMINDER TIME */}
        <View style={globalStyles.formGroup}>
          <FormLabel>Reminder Time</FormLabel>

          <TouchableOpacity
            style={styles.timePicker}
            onPress={() => setShowTimePicker(true)}
          >
            <BodyText>{form.reminder_time}</BodyText>
          </TouchableOpacity>

          {showTimePicker && (
            <DateTimePicker
              value={new Date(`1970-01-01T${form.reminder_time}:00`)}
              mode="time"
              onChange={(event, selectedDate) => {
                setShowTimePicker(false);
                if (!selectedDate) return;

                const time = selectedDate.toTimeString().slice(0, 5);
                handleChange("reminder_time", time);
              }}
            />
          )}

          {errors.reminder_time ? (
            <Text style={styles.error}>{errors.reminder_time}</Text>
          ) : null}
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
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  submitButton: {
    backgroundColor: "#2E8B8B",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
  },
  timePicker: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  submitText: { color: "white", fontWeight: "700", fontSize: 16 },
});

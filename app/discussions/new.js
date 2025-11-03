import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { Picker } from "@react-native-picker/picker";
import { blogApi } from "@/api";
import LoginFirst from "../../components/common/LoginFirst";

export default function AddDiscussion() {
  const user = useSelector((state) => state?.user?.userDetails);
  const router = useRouter();

  const [formData, setFormData] = useState({ title: "", content: "", category: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  useEffect(() => {
    const getCategories = async () => {
      try {
        const res = await blogApi.get("discussions/categories/");
        setCategories(res.data.results);
      } catch (err) {
        console.log(err, "Error fetching categories");
      }
    };
    getCategories();
  }, []);

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    setError("");
    try {
      await blogApi.post("discussions/", formData, {
        headers: { Authorization: `Bearer ${user.access}` },
      });
      setFormData({ title: "", content: "", category: "" });
      router.push("/discussions");
    } catch (err) {
      console.log(err, "Error posting discussion");
      setError(err.response?.data?.detail || "Failed to post discussion.");
    } finally {
      setLoading(false);
    }
  };

  //if (!user) return <LoginFirst />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.form}>
        <Text style={styles.heading}>Start a New Discussion</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            value={formData.title}
            onChangeText={(text) => handleChange("title", text)}
            style={styles.input}
            placeholder="Enter discussion title"
          />
        </View>

        {/* <View style={styles.formGroup}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={formData.category}
              onValueChange={(value) => handleChange("category", value)}
            >
              <Picker.Item label="Select a category" value="" />
              {categories.map((cat) => (
                <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
              ))}
            </Picker>
          </View>
        </View> */}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Content</Text>
          <TextInput
            value={formData.content}
            onChangeText={(text) => handleChange("content", text)}
            multiline
            numberOfLines={6}
            style={[styles.input, styles.textarea]}
            placeholder="Enter discussion content"
          />
        </View>
        {!user ? <LoginFirst /> : ""}

        {loading ? (
          <ActivityIndicator size="large" color="#FF6B6B" style={{ marginVertical: 20 }} />
        ) : (
          <Pressable style={styles.btn} onPress={handleSubmit} disabled={loading}>
            <Text style={styles.btnText}>Start Discussion</Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#FAF9F7",
  },
  form: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 25,
    elevation: 5,
    width: "100%",
    maxWidth: 500,
    alignSelf: "center",
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    color: "#333333",
    fontFamily: "Poppins",
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    color: "#333333",
    fontFamily: "Poppins",
    fontWeight: "700",
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#fff",
    fontFamily: "Inter",
  },
  textarea: {
    height: 120,
    textAlignVertical: "top",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  btn: {
    width: "100%",
    paddingVertical: 12,
    backgroundColor: "#FF6B6B",
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },
  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontFamily: "Poppins",
    fontSize: 16,
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
});

import { useState, useEffect } from "react";
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
import { api } from "@/api";
import LoginFirst from "../common/LoginFirst";

export default function AddDiscussion({discussionId}) {
  const user = useSelector((state) => state?.user?.userDetails);
  const router = useRouter();

  const [formData, setFormData] = useState({ title: "", content: "", category: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    setError("");
    try {
        const url = discussionId ? `/discussions/${discussionId}/`  : "/discussions/";
        const method = discussionId ? "put" : "post";
      
        await api({
          method,
          url,
          data: formData,
        });
      setFormData({ title: "", content: "", category: "" });
      router.push("/discussions");
    } catch (err) {
      console.log(err, "Error posting discussion");
      setError(err?.response || "Failed to post discussion.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
      const fetchBlog = async () => {
        try {
          const res = await api.get(`discussions/${discussionId}/`);
          setFormData(res.data);
        } catch (err) {
          console.error("Error loading blog", err);
        }
      };
      if (discussionId) fetchBlog();
    }, [discussionId]);
  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.form}>
        <Text style={styles.heading}>
          {discussionId ? "Edit Discussion" : "Start a New Discussion"}
        </Text>
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
            <Text style={styles.btnText}>
              {
                discussionId ? "Update Discussion" : "Start Discussion"
              }
            </Text>
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

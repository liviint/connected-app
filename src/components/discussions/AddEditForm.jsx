import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { api } from "@/api";
import LoginFirst from "../common/LoginFirst";

export default function AddDiscussion({ discussionId }) {
  const user = useSelector((state) => state?.user?.userDetails);
  const router = useRouter();

  const [formData, setFormData] = useState({ title: "", content: "", category: 1 });
  const [images, setImages] = useState([]); // local selected images
  const [existingImages, setExistingImages] = useState([]); // for edit
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access gallery is required!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const selected = result.assets.map((asset) => ({
        uri: asset.uri,
        name: asset.fileName || asset.uri.split("/").pop(),
        type: "image/jpeg",
      }));
      setImages([...images, ...selected]);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    setError("");
    try {
      const url = discussionId ? `/discussions/${discussionId}/` : "/discussions/";
      const method = discussionId ? "put" : "post";

      const data = new FormData();
      data.append("title", formData.title);
      data.append("content", formData.content);
      data.append("category", formData.category);

      images.forEach((img) => {
        data.append("uploaded_images", {
          uri: img.uri,
          name: img.name,
          type: img.type,
        });
      });

      await api({
        method,
        url,
        data,
        headers: { "Content-Type": "multipart/form-data" },
      });

      setFormData({ title: "", content: "", category: "" });
      setImages([]);
      router.push("/discussions");
    } catch (err) {
      console.log(err, "Error posting discussion");
      setError(err?.response?.data?.detail || "Failed to post discussion.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchDiscussion = async () => {
      try {
        if (!discussionId) return;
        const res = await api.get(`/discussions/${discussionId}/`);
        setFormData(res.data);
        setExistingImages(res.data.images || []);
      } catch (err) {
        console.error("Error loading discussion", err);
      }
    };
    fetchDiscussion();
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

        <View style={styles.formGroup}>
          <Text style={styles.label}>Images</Text>
          <Pressable style={styles.btn} onPress={pickImages}>
            <Text style={styles.btnText}>Pick Images</Text>
          </Pressable>
          <ScrollView horizontal style={{ marginTop: 10 }}>
            {existingImages.map((img, idx) => (
              <Image key={idx} source={{ uri: img.image }} style={styles.previewImage} />
            ))}
            {images.map((img, idx) => (
              <Image key={idx} source={{ uri: img.uri }} style={styles.previewImage} />
            ))}
          </ScrollView>
        </View>

        {!user ? <LoginFirst /> : null}

        {loading ? (
          <ActivityIndicator size="large" color="#FF6B6B" style={{ marginVertical: 20 }} />
        ) : (
          <Pressable style={styles.btn} onPress={handleSubmit} disabled={loading}>
            <Text style={styles.btnText}>
              {discussionId ? "Update Discussion" : "Start Discussion"}
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
  formGroup: { marginBottom: 16 },
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
  textarea: { height: 120, textAlignVertical: "top" },
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
  error: { color: "red", marginBottom: 10 },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 10,
    marginTop: 10,
  },
});

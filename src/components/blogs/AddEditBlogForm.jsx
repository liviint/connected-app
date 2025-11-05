import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { api } from "../../../api";
import { RichEditor, RichToolbar, actions } from "react-native-pell-rich-editor";

export default function AddEditBlogForm({ blogId }) {
  const router = useRouter()
  const author = useSelector((state) => state?.user?.userDetails?.user?.id);
  const richText = useRef();
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    content: "",
    image: null,
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  /** Word count helper */
  const getWordCount = (html) => {
    const text = html.replace(/<[^>]*>/g, " ");
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  const handleImagePick = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Please allow access to your photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setPreview(imageUri);
      setFormData((prev) => ({ ...prev, image: imageUri }));
    }
  };

  const handleSubmit = async (isPublished = false) => {
    if (!formData.title.trim()) {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return;
    }

    setLoading(true);
    const form = new FormData();
    form.append("title", formData.title);
    form.append("summary", formData.summary);
    form.append("content", formData.content);
    form.append("author", author);
    if (isPublished) form.append("published", true);

    if (formData.image) {
      const filename = formData.image.split("/").pop();
      const type = `image/${filename.split(".").pop()}`;
      form.append("image", { uri: formData.image, name: filename, type });
    }

    try {
      const url = blogId ? `/blogs/${blogId}/`  : "/blogs/";
      const method = blogId ? "put" : "post";

      await api({
        method,
        url,
        data: form,
        headers: { "Content-Type": "multipart/form-data" },
      });

      Alert.alert("Success", blogId ? "Blog updated!" : "Blog created!");
      router.push('blog/my-blogs')
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to save blog. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await api.get(`blogs/${blogId}/`);
        const blog = res.data;
        setFormData({
          title: blog.title,
          summary: blog.summary,
          content: blog.content,
          image: blog.image,
        });
        setPreview(blog.image);
        if (richText.current) {
          richText.current.setContentHTML(blog.content);
        }
      } catch (err) {
        console.error("Error loading blog", err);
      }
    };
    if (blogId) fetchBlog();
  }, [blogId]);

  return (
    <ScrollView style={styles.formContainer}>
      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter blog title"
        value={formData.title}
        onChangeText={(t) => setFormData({ ...formData, title: t })}
      />

      <Text style={styles.label}>Content</Text>
      <RichEditor
        ref={richText}
        style={styles.richEditor}
        placeholder="Write your content here..."
        initialContentHTML={formData.content}
        onChange={(html) => setFormData({ ...formData, content: html })}
      />
      <RichToolbar
        editor={richText}
        actions={[
          actions.undo,
          actions.redo,
          actions.bold,
          actions.italic,
          actions.insertBulletsList,
          actions.insertOrderedList,
          actions.insertLink,
        ]}
      />
      <Text style={styles.wordCounter}>
        {getWordCount(formData.content)}{" "}
        {getWordCount(formData.content) === 1 ? "word" : "words"}
      </Text>

      <Text style={styles.label}>Summary</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Enter summary"
        value={formData.summary}
        onChangeText={(t) => setFormData({ ...formData, summary: t })}
        multiline
        numberOfLines={3}
      />

      <TouchableOpacity onPress={handleImagePick} style={styles.imageButton}>
        <Text style={styles.imageButtonText}>
          {preview ? "Change Cover Image" : "Pick Cover Image"}
        </Text>
      </TouchableOpacity>

      {preview && (
        <View style={styles.imagePreview}>
          <Image source={{ uri: preview }} style={styles.image} />
        </View>
      )}

      <View style={styles.btnContainer}>
        <TouchableOpacity
          onPress={() => handleSubmit(false)}
          style={[styles.btn, loading && styles.disabled]}
          disabled={loading}
        >
          <Text style={styles.btnText}>
            {loading ? "Saving..." : "Save Draft"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleSubmit(true)}
          style={[styles.btn, { backgroundColor: "#FF6B6B" }, loading && styles.disabled]}
          disabled={loading}
        >
          <Text style={styles.btnText}>
            {loading ? "Publishing..." : "Publish"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  formContainer: { 
    padding: 16, 
    backgroundColor: "#fff", 
    borderRadius: 12,
    marginBottom:40,
  },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#FAF9F7",
    marginBottom: 16,
  },
  multiline: { minHeight: 100 },
  richEditor: {
    minHeight: 200,
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 8,
    backgroundColor: "#FAF9F7",
    marginBottom: 16,
  },
  wordCounter: { textAlign: "right", color: "#555", fontSize: 12, marginBottom: 16 },
  imageButton: { backgroundColor: "#2E8B8B", padding: 10, borderRadius: 8, marginBottom: 10 },
  imageButtonText: { color: "#FFF", textAlign: "center", fontWeight: "600" },
  imagePreview: { alignItems: "center", marginVertical: 10 },
  image: { width: "100%", height: 180, borderRadius: 10 },
  btnContainer: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 20 },
  btn: { backgroundColor: "#2E8B8B", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 18 },
  btnText: { color: "#FFF", fontWeight: "700", textAlign: "center" },
  disabled: { opacity: 0.6 },
});

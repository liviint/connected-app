import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSelector } from "react-redux";
import { useRouter } from "expo-router";
import { api } from "../../../../api";
import * as ImagePicker from "expo-image-picker";

const ProfilePage = () => {
  const router = useRouter();
  const user = useSelector((state) => state?.user?.userDetails);

  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    profilePic: null,
    phone_number: "",
    bio: "",
    interests:1,
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  const getUserData = async () => {
    api({
        url:"accounts/profile/",
        method:"GET",
    }).then(res => {
        setFormData(res.data)
        setPreview(res.data.profilePic);
    }).catch(error => console.log(error))
    .finally(() => setLoading(false))

  };

  useEffect(() => {
    if (user?.access) getUserData();
  }, [user]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setError("");
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission denied", "Please allow gallery access to upload a photo.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setPreview(asset.uri);
      setFormData((prev) => ({ ...prev, profilePic: asset }));
    }
  };

  const handleSubmit = async () => {
    setUpdating(true);
    const data = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (key === "profilePic") {
        value instanceof File && data.append("profilePic", formData.profilePic)
      } else {
        data.append(key, value);
      }
    });

        api({
            url:`accounts/profile/`,
            method:"PATCH",
            headers: {'content-type': 'multipart/form-data'},
            data,
        }).then(res => {
            Alert.alert("Success", "Profile updated successfully.");
            router.push("/profile");
        }).catch(error => {
            console.log(error)
            setError(error?.response?.data?.username?.[0] || "An error occurred.")
        })
        .finally(() => setUpdating(false))
};

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Profile Form</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={formData.username}
            onChangeText={(text) => handleChange("username", text)}
            placeholder="Username"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={styles.input}
            value={formData.first_name}
            onChangeText={(text) => handleChange("first_name", text)}
            placeholder="First Name"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={styles.input}
            value={formData.last_name}
            onChangeText={(text) => handleChange("last_name", text)}
            placeholder="Last Name"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={3}
            value={formData.bio}
            onChangeText={(text) => handleChange("bio", text)}
            placeholder="Tell us a little about yourself..."
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Profile Photo</Text>
          <TouchableOpacity onPress={pickImage} style={styles.uploadBox}>
            <Text style={styles.uploadText}>Tap to choose a photo</Text>
          </TouchableOpacity>

          {preview ? (
            <Image source={{ uri: preview }} style={styles.avatarPreview} />
          ) : null}
        </View>

        <TouchableOpacity
          style={[styles.button, updating && { opacity: 0.6 }]}
          disabled={updating}
          onPress={handleSubmit}
        >
          <Text style={styles.btnText}>
            {updating ? "Updating..." : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ProfilePage;



const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#FAF9F7",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  form: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: "100%",
    maxWidth: 500,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
  },
  title: {
    textAlign: "center",
    fontSize: 22,
    color: "#FF6B6B",
    fontWeight: "700",
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 14,
  },
  label: {
    color: "#2E8B8B",
    fontWeight: "700",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    color: "#333",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  uploadBox: {
    borderWidth: 1,
    borderColor: "#2E8B8B",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    backgroundColor: "#F4E1D2",
  },
  uploadText: {
    color: "#2E8B8B",
    fontWeight: "600",
  },
  avatarPreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#FF6B6B",
    marginTop: 10,
    alignSelf: "center",
  },
  button: {
    backgroundColor: "#FF6B6B",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  error: {
    color: "#FF6B6B",
    textAlign: "center",
    marginBottom: 10,
  },
});

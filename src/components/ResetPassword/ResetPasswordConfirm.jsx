import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { api } from "@/api";
import { useRouter, useLocalSearchParams } from "expo-router";
import { globalStyles } from "../../styles/global";

const ResetPasswordConfirm = () => {
  const router = useRouter()
  const { uid, token } = useLocalSearchParams(); 

  const [formData, setFormData] = useState({
    new_password: "",
    confirm_password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    const { new_password, confirm_password } = formData;

    if (!new_password || !confirm_password) {
      setError("All fields are required.");
      return;
    }

    if (new_password !== confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    if (new_password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
      setLoading(true);
      await api.post("/accounts/password-reset-confirm/", {
        uid,
        token,
        new_password,
      })
      .then(() => {
        setSuccess("Your password has been successfully reset!");
        setFormData({ new_password: "", confirm_password: "" });
        setTimeout(() => router.push("login"),3000)
      })
      .catch(err => {
        console.error(err);
        setError(
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to reset password. Please try again."
        );
      })
      .finally(() => setLoading(false) )
  }

  return (
    <View style={styles.container}>
      <Text style={globalStyles.title}>Set a New Password</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}

      <View style={styles.formGroup}>
        <Text style={styles.label}>New Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter new password"
          secureTextEntry
          value={formData.new_password}
          onChangeText={(value) => handleChange("new_password", value)}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Confirm new password"
          secureTextEntry
          value={formData.confirm_password}
          onChangeText={(value) => handleChange("confirm_password", value)}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Reset Password</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.hint}>
        <Text
          style={styles.link}
          onPress={() => router.push("/login")}
        >
          Back to Login
        </Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  
  formGroup: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 5,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#2E8B8B",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  buttonDisabled: {
    backgroundColor: "#999",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  error: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
  success: {
    color: "green",
    marginBottom: 10,
    textAlign: "center",
  },
  hint: {
    textAlign: "center",
    marginTop: 10,
  },
  link: {
    color: "#2E8B8B",
    textDecorationLine: "underline",
  },
});

export default ResetPasswordConfirm;

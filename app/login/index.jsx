import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useDispatch } from "react-redux";
import { Link } from "expo-router";
import { useRouter } from "expo-router";
import { setUserDetails } from "@/store/features/userSlice";
import { api } from "@/api"; 
import { safeLocalStorage } from "../../utils/storage";

export default function Login() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
    setServerError("");
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email format";
    if (!formData.password.trim())
      newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setServerError("");
    setSuccess(false);

    try {
      const response = await api.post("accounts/login/", formData);
      dispatch(setUserDetails(response.data));
      safeLocalStorage.setItem("token", response.data.access);
      setSuccess(true);
      router.push("/profile");
      setFormData({ email: "", password: "" });
    } catch (error) {
      console.error("Login failed:", error);
      setServerError(
        error.response?.data?.message ||
        "Invalid credentials. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Welcome Back</Text>

        {serverError ? <Text style={styles.error}>{serverError}</Text> : null}
        {success ? <Text style={styles.success}>Login successful!</Text> : null}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter email"
            keyboardType="email-address"
            value={formData.email}
            onChangeText={(value) => handleChange("email", value)}
          />
          {errors.email ? <Text style={styles.error}>{errors.email}</Text> : null}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter password"
            secureTextEntry
            value={formData.password}
            onChangeText={(value) => handleChange("password", value)}
          />
          {errors.password ? (
            <Text style={styles.error}>{errors.password}</Text>
          ) : null}
        </View>
          <View style={styles.forgotPass}>
              <Link style={styles.forgotPassText} href="/reset-password" >
                  Forgot password?
              </Link> 
          </View>
        <TouchableOpacity
          onPress={handleSubmit}
          style={[styles.button, loading && styles.buttonDisabled]}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.hint}>
          Don’t have an account?{" "}
          <Text
            style={styles.link}
            onPress={() => router.push("/signup")}
          >
            Sign up
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9F7",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  form: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  title: {
    textAlign: "center",
    marginBottom: 20,
    fontSize: 24,
    fontWeight: "700",
    color: "#FF6B6B",
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontWeight: "600",
    marginBottom: 6,
    color: "#2E8B8B",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#FF6B6B",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  error: {
    color: "#FF6B6B",
    fontSize: 14,
    marginTop: 4,
  },
  success: {
    color: "#2E8B8B",
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "700",
  },
  forgotPass: {
    marginTop: 10,           
    alignItems: 'flex-end',  
  },
  forgotPassText: {
    color: '#2E8B8B',        
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  hint: {
    textAlign: "center",
    marginTop: 16,
    fontSize: 15,
  },
  link: {
    color: "#FF6B6B",
    fontWeight: "700",
  },
});

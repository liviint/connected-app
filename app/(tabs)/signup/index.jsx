import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { api } from "../../../api";
import { globalStyles } from "../../../src/styles/global";
import { validateEmail } from "../../../src/helpers";

const Signup = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    source:"app",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
    setErrors({ ...errors, [key]: "" });
    setServerError("");
  };

  const validateForm = () => {
    let newErrors = {};

    let isEmailValid = validateEmail(formData.email)
    if(isEmailValid.errorMessage) newErrors.email = isEmailValid.errorMessage 

    if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setServerError("");
    setSuccess(false);

    try {
      const res = await api.post("/accounts/register/", {...formData,email: formData.email.trim().toLowerCase()});
      setSuccess(true);
      setFormData({ email: "", password: "" });
      Alert.alert("Success", "A verification link has been sent to your email.");
    } catch (error) {
      const errMsg =
        error?.response?.data?.email?.[0] ||
        error?.response?.data?.message ||
        "Something went wrong. Please try again.";
      setServerError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.form}>
        <Text style={globalStyles.title}>Create an Account</Text>

        {serverError ? <Text style={styles.error}>{serverError}</Text> : null}
        {success ? (
          <Text style={styles.success}>
            A verification link has been sent to your email.
          </Text>
        ) : null}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="Enter email"
            style={styles.input}
            value={formData.email}
            onChangeText={(value) => handleChange("email", value)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email ? <Text style={styles.error}>{errors.email}</Text> : null}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={globalStyles.passwordWrapper}>
            <TextInput
              placeholder="Enter password"
              style={styles.input}
              value={formData.password}
              onChangeText={(value) => handleChange("password", value)}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
                style={globalStyles.togglePassword}
                onPress={() => setShowPassword((prev) => !prev)}
              >
                <Text style={globalStyles.togglePasswordText}>{showPassword ? "🙈" : "👁️"}</Text>
            </TouchableOpacity>
            {errors.password ? <Text style={styles.error}>{errors.password}</Text> : null}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Signing up..." : "Sign Up"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Signup;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#FAF9F7",
  },
  form: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: "#333333",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: "Inter-Regular",
    backgroundColor: "#FAF9F7",
  },
  error: {
    color: "#FF6B6B",
    marginTop: 5,
    fontSize: 13,
  },
  success: {
    color: "#2E8B8B",
    marginBottom: 10,
    textAlign: "center",
    fontSize: 14,
  },
  button: {
    backgroundColor: "#FF6B6B",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontFamily: "Poppins-Bold",
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});

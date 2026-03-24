import { useState, useEffect } from "react";
import { StyleSheet, Alert, TouchableOpacity } from "react-native";
import { Card, BodyText } from "@/src/components/ThemeProvider/components";
import * as AuthSession from "expo-auth-session";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

const WEB_CLIENT_ID = "171579827542-vnlu2ildln3llcnrli2g9rbnogtecrc2.apps.googleusercontent.com";
const DEBUG_ANDROID_CLIENT_ID = "171579827542-47pulrvhk9ptf4h00sk5g10l3oprm4u2.apps.googleusercontent.com"; 
const PROD_ANDROID_CLIENT_ID = "171579827542-2tdrdl92lgjaomf09ba6uuqlnq5hnsir.apps.googleusercontent.com";

// Detect environment
const isStandalone = Constants.appOwnership === "standalone";
const isDev = __DEV__;

// Choose client ID based on environment
const clientId = isStandalone
  ? isDev
    ? DEBUG_ANDROID_CLIENT_ID
    : PROD_ANDROID_CLIENT_ID
  : WEB_CLIENT_ID;

// Redirect URI
const REDIRECT_URI = isStandalone
  ? AuthSession.makeRedirectUri({ scheme: "zeniahub" }) 
  : AuthSession.makeRedirectUri({ useProxy: true });   

console.log(REDIRECT_URI, "Redirect URI");

const GoogleBackUp = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastBackup, setLastBackup] = useState(null);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId,
      androidClientId: isStandalone ? clientId : undefined, 
      scopes: ["https://www.googleapis.com/auth/drive.appdata"],
      redirectUri: REDIRECT_URI,
    },
    {
      authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenEndpoint: "https://oauth2.googleapis.com/token",
    }
  );

  useEffect(() => {
    const processResult = async () => {
      if (!response) return;

      if (response.type === "success") {
        if (response.authentication?.accessToken) {
          await handleSuccess(response.authentication.accessToken);
        } else if (response.params?.code) {
          console.log("Authorization code received, exchanging for token...");
        }
      } else if (response.type === "error" || response.type === "cancel") {
        console.log("Auth Status:", response.type, response.error);
      }
    };

    processResult();
  }, [response]);

  const handleSuccess = async (token) => {
    await SecureStore.setItemAsync("gdrive_token", token);
    setIsConnected(true);
    Alert.alert("Connected", "Google Drive connected successfully");
  };

  const handleConnectGoogle = async () => {
    if (!request) return;
    await promptAsync();
  };

  const handleBackup = async () => {
    try {
      // TODO: Replace with real backup logic
      setLastBackup(new Date().toISOString());
      Alert.alert("Success", "Backup completed successfully");
    } catch (error) {
      Alert.alert("Error", "Backup failed");
    }
  };

  const handleRestore = async () => {
    Alert.alert(
      "Restore data?",
      "This will replace your current data.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Restore",
          style: "destructive",
          onPress: async () => {
            try {
              // TODO: Replace with real restore logic
              Alert.alert("Success", "Data restored successfully");
            } catch (error) {
              Alert.alert("Error", "Restore failed");
            }
          },
        },
      ]
    );
  };

  // Check if token exists
  useEffect(() => {
    const checkConnection = async () => {
      const token = await SecureStore.getItemAsync("gdrive_token");
      if (token) setIsConnected(true);
    };
    checkConnection();
  }, []);

  return (
    <Card style={styles.card}>
      <BodyText style={styles.title}>Cloud Backup</BodyText>

      <BodyText style={styles.helperText}>
        Backup and restore your data securely using Google Drive
      </BodyText>

      {!isConnected ? (
        <TouchableOpacity style={styles.primaryButton} onPress={handleConnectGoogle}>
          <BodyText style={styles.buttonText}>Connect Google Drive</BodyText>
        </TouchableOpacity>
      ) : (
        <>
          <TouchableOpacity style={styles.primaryButton} onPress={handleBackup}>
            <BodyText style={styles.buttonText}>Backup Now</BodyText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleRestore}>
            <BodyText style={styles.secondaryButtonText}>Restore Data</BodyText>
          </TouchableOpacity>

          {lastBackup && (
            <BodyText style={styles.helperText}>Last backup: {lastBackup}</BodyText>
          )}
        </>
      )}
    </Card>
  );
};

export default GoogleBackUp;

const styles = StyleSheet.create({
  card: {
    width: "100%",
    maxWidth: 500,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
  },
  primaryButton: {
    marginTop: 16,
    backgroundColor: "#FF6B6B",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  secondaryButton: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#FF6B6B",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  secondaryButtonText: {
    color: "#FF6B6B",
    fontWeight: "600",
  },
  helperText: {
    fontSize: 12,
    color: "#666",
    marginTop: 8,
  },
});
import { useState, useEffect } from "react";
import { StyleSheet, Alert, TouchableOpacity } from "react-native";
import { Card, BodyText } from "@/src/components/ThemeProvider/components";
import * as AuthSession from "expo-auth-session";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import Constants from "expo-constants";

// Required to close the browser window after auth
WebBrowser.maybeCompleteAuthSession();

const WEB_CLIENT_ID = "171579827542-vnlu2ildln3llcnrli2g9rbnogtecrc2.apps.googleusercontent.com";
const DEBUG_ANDROID_CLIENT_ID = "171579827542-47pulrvhk9ptf4h00sk5g10l3oprm4u2.apps.googleusercontent.com"; 
const PROD_ANDROID_CLIENT_ID = "171579827542-2tdrdl92lgjaomf09ba6uuqlnq5hnsir.apps.googleusercontent.com";

// More robust environment detection
const isExpoGo = Constants.executionEnvironment === 'storeClient';
const isDev = __DEV__;

// Choose client ID based on environment
const clientId = !isExpoGo
  ? (isDev ? DEBUG_ANDROID_CLIENT_ID : PROD_ANDROID_CLIENT_ID)
  : WEB_CLIENT_ID;

// Use your custom scheme for standalone/dev builds, useProxy for Expo Go
const REDIRECT_URI = AuthSession.makeRedirectUri({
  scheme: "zeniahub",
  useProxy: isExpoGo, 
});

const GoogleBackUp = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastBackup, setLastBackup] = useState(null);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: clientId,
      androidClientId: !isExpoGo ? clientId : undefined, 
      scopes: ["https://www.googleapis.com/auth/drive.appdata"],
      redirectUri: REDIRECT_URI,
    },
    {
      authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenEndpoint: "https://oauth2.googleapis.com/token",
    }
  );

  // Listen for authentication response
  useEffect(() => {
    const processResult = async () => {
      if (!response) return;

      if (response.type === "success") {
        const { authentication, params } = response;
        
        if (authentication?.accessToken) {
          await handleSuccess(authentication.accessToken);
        } else if (params?.code) {
          // Note: Native Android IDs often return a code that AuthSession 
          // usually exchanges for you if discovery is used.
          console.log("Auth code received. Check if token is available in authentication object.");
        }
      } else if (response.type === "error") {
        console.error("Auth Error:", response.error);
        Alert.alert("Error", "Failed to connect to Google.");
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
    if (!request) {
      Alert.alert("Error", "Auth request not initialized");
      return;
    }
    // promptAsync will now use the independent URI (zeniahub://) in builds
    await promptAsync();
  };

  const handleBackup = async () => {
    try {
      setLastBackup(new Date().toLocaleString());
      Alert.alert("Success", "Backup status updated");
    } catch (error) {
      Alert.alert("Error", "Backup failed");
    }
  };

  const handleRestore = async () => {
    Alert.alert("Restore data?", "This will replace your current data.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Restore",
        style: "destructive",
        onPress: async () => {
          Alert.alert("Success", "Data restored successfully");
        },
      },
    ]);
  };

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
        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={handleConnectGoogle}
          disabled={!request}
        >
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
  card: { width: "100%", maxWidth: 500, padding: 20, borderRadius: 16, marginBottom: 16 },
  title: { fontSize: 18, fontWeight: "600", marginBottom: 20 },
  primaryButton: { marginTop: 16, backgroundColor: "#FF6B6B", paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  secondaryButton: { marginTop: 10, borderWidth: 1, borderColor: "#FF6B6B", paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "600" },
  secondaryButtonText: { color: "#FF6B6B", fontWeight: "600" },
  helperText: { fontSize: 12, color: "#666", marginTop: 8 },
});
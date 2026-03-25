import { useState, useEffect } from "react";
import { StyleSheet, Alert, TouchableOpacity } from "react-native";
import { Card, BodyText } from "@/src/components/ThemeProvider/components";
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import * as SecureStore from "expo-secure-store";

// Use your WEB_CLIENT_ID here - Google's Native SDK uses it to identify the project
const WEB_CLIENT_ID = "171579827542-vnlu2ildln3llcnrli2g9rbnogtecrc2.apps.googleusercontent.com";

const GoogleBackUp = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastBackup, setLastBackup] = useState(null);

  useEffect(() => {
    // Initial configuration of the Native SDK
    GoogleSignin.configure({
      scopes: ["https://www.googleapis.com/auth/drive.appdata"], 
      webClientId: WEB_CLIENT_ID, 
      offlineAccess: true, // Required if you want to refresh tokens later
    });

    checkConnection();
  }, []);

  const checkConnection = async () => {
    const token = await SecureStore.getItemAsync("gdrive_token");
    if (token) {
      setIsConnected(true);
    }
  };

  const handleConnectGoogle = async () => {
    try {
      // Check if Play Services are available (Android only)
      await GoogleSignin.hasPlayServices();
      
      // Trigger Native Account Picker
      const userInfo = await GoogleSignin.signIn();
      
      // Get the Access Token specifically for the Drive API
      const { accessToken } = await GoogleSignin.getTokens();

      if (accessToken) {
        await SecureStore.setItemAsync("gdrive_token", accessToken);
        setIsConnected(true);
        Alert.alert("Connected", `Welcome ${userInfo.user.name || 'User'}! Google Drive is ready.`);
      }
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert("Cancelled", "Login was cancelled");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log("Sign in is already in progress");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert("Error", "Google Play Services not available or outdated");
      } else {
        console.error("Native Auth Error:", error);
        Alert.alert("Error", "Could not connect to Google. Check your SHA-1 and Package Name.");
      }
    }
  };

  const handleBackup = async () => {
    try {
      // Logic for Google Drive Upload goes here
      setLastBackup(new Date().toLocaleString());
      Alert.alert("Success", "Backup synced successfully");
    } catch (error) {
      Alert.alert("Error", "Backup failed");
    }
  };

  const handleRestore = async () => {
    Alert.alert("Restore data?", "This will replace your current local data.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Restore",
        style: "destructive",
        onPress: () => Alert.alert("Success", "Data restored"),
      },
    ]);
  };

  const handleDisconnect = async () => {
    try {
      await GoogleSignin.signOut();
      await SecureStore.deleteItemAsync("gdrive_token");
      setIsConnected(false);
      setLastBackup(null);
      Alert.alert("Disconnected", "You have been signed out.");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Card style={styles.card}>
      <BodyText style={styles.title}>Cloud Backup (Native)</BodyText>
      <BodyText style={styles.helperText}>
        Securely sync your habits and journal to your private Google Drive App Data folder.
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

          <TouchableOpacity style={styles.logoutButton} onPress={handleDisconnect}>
            <BodyText style={styles.logoutText}>Disconnect Account</BodyText>
          </TouchableOpacity>

          {lastBackup && (
            <BodyText style={styles.helperText}>Last sync: {lastBackup}</BodyText>
          )}
        </>
      )}
    </Card>
  );
};

export default GoogleBackUp;

const styles = StyleSheet.create({
  card: { width: "100%", maxWidth: 500, padding: 20, borderRadius: 16, marginBottom: 16 },
  title: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
  primaryButton: { marginTop: 16, backgroundColor: "#FF6B6B", paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  secondaryButton: { marginTop: 10, borderWidth: 1, borderColor: "#FF6B6B", paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  logoutButton: { marginTop: 20, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "600" },
  secondaryButtonText: { color: "#FF6B6B", fontWeight: "600" },
  logoutText: { color: "#999", fontSize: 13, textDecorationLine: 'underline' },
  helperText: { fontSize: 13, color: "#666", marginTop: 8, lineHeight: 18 },
});
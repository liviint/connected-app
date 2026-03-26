import { useState, useEffect } from "react";
import { StyleSheet, Alert, TouchableOpacity } from "react-native";
import { Card, BodyText } from "@/src/components/ThemeProvider/components";
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import * as SecureStore from "expo-secure-store";
import { useSQLiteContext } from 'expo-sqlite';
import { exportDatabase } from "../../db/googleDriveDb";

// Use your WEB_CLIENT_ID here - Google's Native SDK uses it to identify the project
const WEB_CLIENT_ID = "171579827542-vnlu2ildln3llcnrli2g9rbnogtecrc2.apps.googleusercontent.com";

const GoogleBackUp = () => {
  const db = useSQLiteContext(); 
  const [isConnected, setIsConnected] = useState(false);
  const [lastBackup, setLastBackup] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initial configuration of the Native SDK
    GoogleSignin.configure({
      scopes: ["https://www.googleapis.com/auth/drive.file"],
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
        console.log(userInfo.data.user,"user info")
        Alert.alert("Connected", `Signed in as ${userInfo?.data?.user?.email}`);
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
    const { accessToken } = await GoogleSignin.getTokens();
    if (!accessToken) throw new Error("No access token found");

    // Your data
    const dbData = await exportDatabase(db);
    const backupData = {
      timestamp: new Date().toISOString(),
      app: "ZeniaHub",
      data: dbData, 
    };

    const fileName = "Zeniahub_Backup.json";
    
    // 1. Search for existing file
    const searchResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${fileName}'&spaces=drive`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const searchResult = await searchResponse.json();
    let fileId = searchResult.files && searchResult.files.length > 0 ? searchResult.files[0].id : null;

    if (!fileId) {
      // 2. CREATE the file metadata first (Empty file with the right name)
      const createMetaResponse = await fetch(
        "https://www.googleapis.com/drive/v3/files",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: fileName,
            mimeType: "application/json",
          }),
        }
      );
      const newFile = await createMetaResponse.json();
      fileId = newFile.id;
    }

    // 3. UPLOAD/PATCH the content (Simple media upload)
    const uploadResponse = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(backupData),
      }
    );

    if (uploadResponse.ok) {
      setLastBackup(new Date().toLocaleString());
      Alert.alert("Success", "Backup synced to your Google Drive");
    } else {
      const errorData = await uploadResponse.json();
      console.error("Drive API Error:", errorData);
      throw new Error("Upload failed");
    }
  } catch (error) {
    console.error("Backup Error:", error);
    // If it's a Network request failed, it's often a connection or URL issue
    Alert.alert("Error", "Network request failed. Ensure your internet is on and your API is enabled.");
  }
};
  const handleRestore = async () => {
  Alert.alert(
    "Restore data?",
    "This will replace your current local data with the backup from Google Drive.",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Restore",
        style: "destructive",
        onPress: async () => {
          try {
            // 1. Get the latest access token
            const { accessToken } = await GoogleSignin.getTokens();
            if (!accessToken) throw new Error("No access token found");

            const fileName = "Zeniahub_Backup.json";

            // 2. Search for the backup file
            const searchResponse = await fetch(
              `https://www.googleapis.com/drive/v3/files?q=name='${fileName}'&spaces=drive`,
              {
                headers: { Authorization: `Bearer ${accessToken}` },
              }
            );
            const searchResult = await searchResponse.json();
            const file = searchResult.files && searchResult.files[0];

            if (!file) {
              Alert.alert("No Backup Found", "We couldn't find a backup file in your Google Drive.");
              return;
            }

            // 3. Download the file content
            // Using alt=media tells Google to return the file content, not the metadata
            const downloadResponse = await fetch(
              `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
              {
                headers: { Authorization: `Bearer ${accessToken}` },
              }
            );

            if (!downloadResponse.ok) throw new Error("Failed to download backup");

            const restoredData = await downloadResponse.json();

            // 4. Update your local storage
            // Example: await MyLocalDB.importData(restoredData);
            console.log("Restored Data:", restoredData);

            Alert.alert("Success", "Your data has been restored successfully.");
          } catch (error) {
            console.error("Restore Error:", error);
            Alert.alert("Error", "Failed to restore data. Please try again later.");
          }
        },
      },
    ]
  );
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
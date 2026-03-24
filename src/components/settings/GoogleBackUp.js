import { useState, useEffect } from "react";
import { StyleSheet, Alert, TouchableOpacity } from "react-native";
import { Card, BodyText } from "@/src/components/ThemeProvider/components";
import * as AuthSession from "expo-auth-session";
import * as SecureStore from "expo-secure-store";

const CLIENT_ID = "171579827542-2tdrdl92lgjaomf09ba6uuqlnq5hnsir.apps.googleusercontent.com"

const REDIRECT_URI = AuthSession.makeRedirectUri({
  useProxy: false
});

console.log(REDIRECT_URI,"hello redirect url 12")

const GoogleBackUp = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastBackup, setLastBackup] = useState(null);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
  {
    clientId: CLIENT_ID,
    scopes: ["https://www.googleapis.com/auth/drive.appdata"],
    redirectUri: REDIRECT_URI,
  },
  {
    authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenEndpoint: "https://oauth2.googleapis.com/token",
  }
);

  const handleConnectGoogle = async () => {
  try {
    const result = await promptAsync();

    if (result.type === "success") {
      const { authentication } = result;

      if (!authentication?.accessToken) {
        throw new Error("No access token received");
      }

      // Save token securely
      await SecureStore.setItemAsync(
        "gdrive_token",
        authentication.accessToken
      );

      setIsConnected(true);

      Alert.alert(
        "Connected",
        "Google Drive connected successfully"
      );
    } else {
      Alert.alert("Cancelled", "Google sign-in was cancelled");
    }
  } catch (error) {
    console.error(error);
    Alert.alert("Error", "Failed to connect Google Drive");
  }
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

useEffect(() => {
  const checkConnection = async () => {
    const token = await SecureStore.getItemAsync("gdrive_token");

    if (token) {
      setIsConnected(true);
    }
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
            >
            <BodyText style={styles.buttonText}>
                Connect Google Drive
            </BodyText>
            </TouchableOpacity>
        ) : (
            <>
            <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleBackup}
            >
                <BodyText style={styles.buttonText}>
                Backup Now
                </BodyText>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleRestore}
            >
                <BodyText style={styles.secondaryButtonText}>
                Restore Data
                </BodyText>
            </TouchableOpacity>

            {lastBackup && (
                <BodyText style={styles.helperText}>
                Last backup: {lastBackup}
                </BodyText>
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


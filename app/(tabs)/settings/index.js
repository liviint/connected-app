import { View, StyleSheet, Switch, Alert } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "@/store/features/settingsSlice";
import { useThemeStyles } from "@/src/hooks/useThemeStyles";
import { Card, BodyText } from "@/src/components/ThemeProvider/components";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { getSetting, setSetting } from "@/src/db/settingsDb";
import * as LocalAuthentication from "expo-local-authentication";

const SettingsPage = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.settings.theme);
  const { globalStyles } = useThemeStyles();
  const db = useSQLiteContext();

  const [appLockEnabled, setAppLockEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [lastBackup, setLastBackup] = useState(null);

  useEffect(() => {
    const loadSettings = async () => {
      const value = await getSetting(db, "app_lock_enabled");
      setAppLockEnabled(value === "true");
      setLoading(false);
    };
    loadSettings();
  }, []);

  const toggleAppLock = async () => {
    if (!appLockEnabled) {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        Alert.alert(
          "Screen lock required",
          "Please set up a device PIN, fingerprint, or Face ID to enable app lock."
        );
        return;
      }
    }

    const next = !appLockEnabled;
    setAppLockEnabled(next);
    await setSetting(db, "app_lock_enabled", next);
  };

  const handleConnectGoogle = async () => {
  try {
    // TODO: Replace with real Google Auth
    setIsConnected(true);

    Alert.alert("Connected", "Google Drive connected successfully");
  } catch (error) {
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


  return (
    <View style={globalStyles.container}>
      <Card style={styles.card}>
        <BodyText style={styles.title}>Appearance</BodyText>

        <View style={styles.settingRow}>
          <BodyText>Dark mode</BodyText>
          <Switch
            value={theme === "dark"}
            onValueChange={() => dispatch(toggleTheme())}
          />
        </View>
      </Card>

      {/* Security */}
      <Card style={styles.card}>
        <BodyText style={styles.title}>Security</BodyText>

        <View style={styles.settingRow}>
          <BodyText>App lock</BodyText>
          <Switch
            value={appLockEnabled}
            onValueChange={toggleAppLock}
            disabled={loading}
          />
        </View>

        <BodyText style={styles.helperText}>
          Require device authentication to open the app
        </BodyText>
      </Card>

      {/* Cloud Backup */}
<Card style={styles.card}>
  <BodyText style={styles.title}>Cloud Backup</BodyText>

  {!isConnected ? (
    <>
      <BodyText style={styles.helperText}>
        Backup and restore your data securely using Google Drive
      </BodyText>

      <View style={styles.buttonContainer}>
        <BodyText style={styles.actionButton} onPress={handleConnectGoogle}>
          Connect Google Drive
        </BodyText>
      </View>
    </>
  ) : (
    <>
      <BodyText style={styles.helperText}>
        Your data is محفوظ (safe) in your Google Drive
      </BodyText>

      <View style={styles.buttonContainer}>
        <BodyText style={styles.actionButton} onPress={handleBackup}>
          Backup Now
        </BodyText>

        <BodyText style={styles.actionButton} onPress={handleRestore}>
          Restore Data
        </BodyText>
      </View>

      {lastBackup && (
        <BodyText style={styles.helperText}>
          Last backup: {new Date(lastBackup).toLocaleString()}
        </BodyText>
      )}
    </>
  )}
</Card>

    </View>
  );
};

export default SettingsPage;

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
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  helperText: {
    fontSize: 12,
    color: "#666",
    marginTop: 8,
  },
});


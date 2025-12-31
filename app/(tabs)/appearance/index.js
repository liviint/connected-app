import { View, StyleSheet, Switch } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "@/store/features/settingsSlice";
import { useThemeStyles } from "@/src/hooks/useThemeStyles";
import { Card, BodyText } from "@/src/components/ThemeProvider/components";

const AppearancePage = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.settings.theme);
  const { globalStyles } = useThemeStyles();

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
    </View>
  );
};

export default AppearancePage;

const styles = StyleSheet.create({
  card: {
    width: "100%",
    maxWidth: 500,
    padding: 20,
    borderRadius: 16,
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
});

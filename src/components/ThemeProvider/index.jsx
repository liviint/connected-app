import { useSelector } from "react-redux";
import { ThemeProvider } from "styled-components/native";
import { lightTheme, darkTheme } from "../../styles/theme";
import { SafeAreaView, StatusBar } from "react-native";

export default function ThemedApp({children}) {
    const theme = useSelector((state) => state.theme);
    const currentTheme = theme === "dark" ? darkTheme : lightTheme;

    return (
        <ThemeProvider theme={currentTheme}>
        <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.colors.background }}>
            <StatusBar barStyle={theme === "dark" ? "light-content" : "dark-content"} />
            {children}
        </SafeAreaView>
        </ThemeProvider>
    );
    }

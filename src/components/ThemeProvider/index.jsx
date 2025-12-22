import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { ThemeProvider } from "styled-components/native";
import { lightTheme, darkTheme } from "../../styles/theme";
import { SafeAreaView, StatusBar, Appearance } from "react-native";
import { setTheme } from "@/store/features/settingsSlice";

export default function ThemedApp({children}) {
    const dispatch = useDispatch()
    const theme = useSelector((state) => state.settings.theme);
    const currentTheme = theme === "dark" ? darkTheme : lightTheme;

    useEffect(() => {
        if(!theme){
            const systemTheme = Appearance.getColorScheme();
            dispatch(setTheme(systemTheme || "light"));
        }
    }, []);

    return (
        <ThemeProvider theme={currentTheme}>
        <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.colors.background }}>
            <StatusBar barStyle={theme === "dark" ? "light-content" : "dark-content"} />
            {children}
        </SafeAreaView>
        </ThemeProvider>
    );
    }

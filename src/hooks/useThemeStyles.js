import { useMemo } from "react";
import { useSelector } from "react-redux";
import { lightColors, darkColors } from "../styles/global"; 
import { createGlobalStyles } from "../styles/global";

export const useThemeStyles = () => {
    const theme = useSelector((state) => state.settings.theme);
    const colors = theme === "light" ? darkColors : lightColors;

    const styles = useMemo(() => createGlobalStyles(colors), [theme]);

    return { globalStyles:styles, colors };
};

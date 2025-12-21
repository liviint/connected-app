import { StyleSheet } from "react-native";


export const colors = {
  primary: "#FF6B6B",  
  secondary: "#2E8B8B",
  accent: "#F4E1D2",     
  background: "#FAF9F7",
  text: "#333333",
}
export const lightColors = {
  primary: "#FF6B6B",
  secondary: "#2E8B8B",
  accent: "#F4E1D2",
  background: "#FAF9F7",
  text: "#333333",
};

export const darkColors = {
  primary: "#FF6B6B",
  secondary: "#4DB6AC",
  accent: "#2A2A2A",
  background: "#121212",
  text: "#FFFFFF",
};

export const createGlobalStyles = (colors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      flex: 1,
      paddingHorizontal: 16,
      paddingVertical: 24,
    },

    content: {
      paddingHorizontal: 16,
    },

    title: {
      textAlign: "center",
      fontFamily: "Poppins-Bold",
      fontWeight: "700",
      fontSize: 24,
      color: colors.primary,
      marginBottom: 16,
    },
    subTitle: {
      fontFamily: 'Inter-Regular',
      fontSize: 18,
      marginBottom: 20,
      textAlign: 'center',
      color: colors.text,
    },
    body: {
      fontSize: 16,
      color: colors.text,
    },

    addButton: {
      flex: 1,
      backgroundColor: colors.primary,
      paddingVertical: 12,
      borderRadius: 12,
      marginRight: 8,
      alignItems: "center",
    },

    addButtonText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 16,
    },

    primaryBtn: {
      backgroundColor: colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginRight: 8,
      alignItems: "center",
    },

    primaryBtnText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 16,
    },

    secondaryBtn: {
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderColor: colors.secondary,
      borderWidth: 2,
      alignItems: "center",
    },

    secondaryBtnText: {
      color: colors.secondary,
      fontWeight: "bold",
      fontSize: 16,
    },

    trackButton: {
      flex: 1,
      borderColor: colors.secondary,
      borderWidth: 2,
      paddingVertical: 12,
      borderRadius: 12,
      marginLeft: 8,
      alignItems: "center",
    },

    trackButtonText: {
      color: colors.secondary,
      fontWeight: "bold",
      fontSize: 16,
    },

    passwordWrapper: {
      position: "relative",
      width: "100%",
      marginBottom: 12,
    },

    togglePassword: {
      position: "absolute",
      right: 12,
      top: "33%",
      transform: [{ translateY: -10 }],
      padding: 6,
    },

    togglePasswordText: {
      fontSize: 20,
      color: colors.text,
    },
  });

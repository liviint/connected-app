import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";

export default function EditButton({ contentAuthor, href,loggedUser }) {
    const router = useRouter()

    if (loggedUser !== contentAuthor) return null;

    const handlePress = () => {
        router.push(href)
    };

    return (
        <View style={styles.container}>
        <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
            <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
        </View>
    );
    }

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editText: {
    color: "#D97706", // Tailwind yellow-600
    textDecorationLine: "underline",
    fontWeight: "500",
  },
});

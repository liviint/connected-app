import {
    View,
    Pressable,
    StyleSheet
} from "react-native";
import {  useRouter } from "expo-router";
import { SecondaryText } from "../../../src/components/ThemeProvider/components"

const ButtonLinks = ({links,align="right"}) => {
    const router = useRouter()
    return (
        <View style={{...styles.buttonLinkes,justifyContent: align === "right" ? "flex-end" : "flex-start",}}>
            {
                links.map(link => {
                    return (
                        <Pressable key={link.name} onPress={() => router.push(link.route)}>
                            <SecondaryText style={styles.linksText}>
                                {link.name}
                            </SecondaryText>
                        </Pressable>
                    )
                })
            }
        </View>
    )
} 

export default ButtonLinks

const styles = StyleSheet.create({
    buttonLinkes: {
        display:"flex",
        alignItems: "middle",
        marginBottom: 15,
        flexDirection: "row",
        justifyContent: "flex-end",
        gap:12,
        marginTop: 12,
    },

    linksText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#2E8B8B",
    },
});
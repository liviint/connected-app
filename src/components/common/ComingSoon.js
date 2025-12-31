import { View, Text } from "react-native";
import { BodyText, Card } from "../ThemeProvider/components";
import { useThemeStyles } from "../../hooks/useThemeStyles";

export default function ComingSoon() {
    const {globalStyles} = useThemeStyles()
    return (
        <View style={globalStyles.container}>
        <Text style={globalStyles.title}>Stats</Text>

        <Card style={{ padding: 20, alignItems: "center" }}>
            <BodyText style={{ fontSize: 16, textAlign: "center" }}>
                Stats are currently available when you’re signed in.
            </BodyText>

            <BodyText
            style={{
                marginTop: 8,
                textAlign: "center",
                opacity: 0.7,
            }}
            >
            Soon, you’ll be able to view stats even without signing in.
            </BodyText>
        </Card>
        </View>
    );
}




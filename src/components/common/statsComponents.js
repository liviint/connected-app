import {  useState } from "react";
import {
    StyleSheet,
} from "react-native";
import { Card, BodyText, SecondaryText} from "../ThemeProvider/components"

export function StatCard({ label, value }) {
    return (
        <Card style={styles.card}>
            <SecondaryText style={styles.cardLabel}>{label}</SecondaryText>
            <BodyText style={styles.cardValue}>{value}</BodyText>
        </Card>
    );
}

export function ChartCard({ title, children }) {
    const [width,setWidth] = useState(0)
    return (
        <Card 
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        style={styles.chartCard}
        >
        <BodyText style={styles.chartTitle}>{title}</BodyText>
        {width > 0 && children(width - 16)}
        </Card>
    );
}

export const chartConfig = (color,themeColors) => ({
    backgroundGradientFrom: themeColors.background,
    backgroundGradientTo: themeColors.background,
    decimalPlaces: 0,
    color: () => color,
    labelColor: () => themeColors.text,
    barPercentage: 0.6,
});

const styles = StyleSheet.create({
    card: {
        width: "48%",
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#eee",
    },
    cardLabel: {
        fontSize: 13,
    },
    cardValue: {
        fontSize: 22,
        fontWeight: "700",
        marginTop: 4,
    },
    chartCard: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#eee",
        marginBottom: 24,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 12,
    },
});

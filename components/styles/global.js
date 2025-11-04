import { StyleSheet } from "react-native";
export const globalStyles = StyleSheet.create({
    container: {
        backgroundColor: '#FAF9F7',
        flex: 1,
        paddingHorizontal: 16,
    },
    content: {
        paddingVertical: 24,
        paddingHorizontal: 16,
    },
    title: {
        textAlign: 'center',
        fontFamily: 'Poppins-Bold',
        fontWeight: '700',
        fontSize: 24,
        color:'#FF6B6B',
        marginBottom: 16,
    },
    secondaryBtn: {
        backgroundColor: '#2E8B8B',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
});
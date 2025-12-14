import { StyleSheet } from "react-native";
export const globalStyles = StyleSheet.create({
    container: {
        backgroundColor: '#FAF9F7',
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 24,
    },
    content: {
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
    addButton: {
    flex: 1,
    backgroundColor: "#FF6B6B",
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
    primaryBtn:{
        backgroundColor: "#FF6B6B",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginRight: 8,
        alignItems: "center",
    },
    primaryBtnText:{
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    secondaryBtn: {
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderColor: "#2E8B8B",
        borderWidth: 2,
        alignItems: "center",
    },
    secondaryBtnText:{
        color: "#2E8B8B",
        fontWeight: "bold",
        fontSize: 16,
    },

    trackButton: {
    flex: 1,
    borderColor: "#2E8B8B",
    borderWidth: 2,
    paddingVertical: 12,
    borderRadius: 12,
    marginLeft: 8,
    alignItems: "center",
  },
  trackButtonText: {
    color: "#2E8B8B",
    fontWeight: "bold",
    fontSize: 16,
  },
});
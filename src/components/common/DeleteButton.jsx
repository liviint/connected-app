import { useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";

const DeleteButton = ({ handleOk, item , contentAuthor, loggedUser}) => {
    const [visible, setVisible] = useState(false);

    const confirmDelete = async () => {
        setVisible(false);
        if (handleOk) await handleOk();
    };

    const cancelDelete = () => {
        setVisible(false);
    };

    if(loggedUser !== contentAuthor) return 

    return (
        <View>
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => setVisible(true)}
            >
                <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
        <Modal
            transparent
            visible={visible}
            animationType="fade"
        >
            <View style={styles.overlay}>
                <View style={styles.modalBox}>
                    <Text style={styles.title}>Confirm Delete</Text>
                    <Text style={styles.subtitle}>
                        {`Are you sure you want to delete this ${item ? item : "item"}?`}
                    </Text>

                <View style={styles.row}>
                    <TouchableOpacity
                        style={[styles.btn, styles.cancel]}
                        onPress={cancelDelete}
                    >
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.btn, styles.ok]}
                        onPress={confirmDelete}
                    >
                        <Text style={styles.okText}>Delete</Text>
                    </TouchableOpacity>

                </View>
            </View>
            </View>
        </Modal>
        </View>
    );
};

export default DeleteButton;


const styles = StyleSheet.create({
    deleteButton: {
        padding: 10,
        backgroundColor: "#ff4d4d",
        borderRadius: 8,
        alignItems: "center",
    },
    deleteText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },

    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },

    modalBox: {
        width: "90%",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
    },

    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
    },

    subtitle: {
        fontSize: 14,
        color: "#333",
        marginBottom: 20,
        textAlign: "center",
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
    },

    btn: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        flex: 1,
        alignItems: "center",
        marginHorizontal: 5,
    },

    cancel: {
        backgroundColor: "#e5e5e5",
    },

    ok: {
        backgroundColor: "#ff4d4d",
    },

    cancelText: {
        color: "#333",
        fontWeight: "600",
    },

    okText: {
        color: "#fff",
        fontWeight: "600",
    },
});

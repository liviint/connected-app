import { useState } from "react";
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Pressable
} from "react-native";
import { api } from "../../../api";

export function ReportButton({ openModal, contentAuthor,loggedUser}) {
    if(contentAuthor === loggedUser) return
    return (
            <TouchableOpacity
                onPress={openModal}
                style={{
                    backgroundColor: "#FF6B6B",
                    paddingVertical: 10,
                    paddingHorizontal: 18,
                    borderRadius: 10,
            }}
            >
            <Text style={{ color: "#fff", fontWeight: "700" }}>Report</Text>
            </TouchableOpacity>
    );
}


export function ReportModal({ visible, onClose, discussionId }) {
    const [selectedReason, setSelectedReason] = useState("");
    const [details, setDetails] = useState("");
    const [loading, setLoading] = useState(false);

    const reasons = [
        "Spam or misleading",
        "Harassment or hate speech",
        "Violence or dangerous activity",
        "Inappropriate content",
        "Other"
    ];

    const submitReport = async () => {
        if (!selectedReason) {
        alert("Please select a reason.");
        return;
        }

        setLoading(true);

        try {
        await api.post(`discussions/${discussionId}/report/`, {
            reason: selectedReason,
            details,
        });

        alert("Report submitted. Thank you!");
        onClose();
        setSelectedReason("");
        setDetails("");
        } catch (err) {
        console.log("Report error:", err);
        alert("Error submitting report.");
        } finally {
        setLoading(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={onClose} />

        <View style={styles.modalContent}>
            <Text style={styles.title}>Report Discussion</Text>

            <Text style={styles.subtitle}>Select a reason:</Text>

            {reasons.map((reason, idx) => (
            <TouchableOpacity
                key={idx}
                style={[
                styles.reasonOption,
                selectedReason === reason && styles.reasonSelected
                ]}
                onPress={() => setSelectedReason(reason)}
            >
                <Text
                style={[
                    styles.reasonText,
                    selectedReason === reason && styles.reasonTextSelected
                ]}
                >
                {reason}
                </Text>
            </TouchableOpacity>
            ))}

            <TextInput
            style={styles.input}
            placeholder="Additional details (optional)"
            multiline
            value={details}
            onChangeText={setDetails}
            />

            <View style={styles.footer}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={submitReport}
                style={styles.submitBtn}
                disabled={loading}
            >
                <Text style={styles.submitText}>
                {loading ? "Submitting..." : "Submit"}
                </Text>
            </TouchableOpacity>
            </View>
        </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
    },
    modalContent: {
        position: "absolute",
        top: "20%",
        left: "5%",
        width: "90%",
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 16,
        elevation: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: "#FF6B6B",
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 15,
        fontWeight: "600",
        color: "#444",
        marginBottom: 10,
    },
    reasonOption: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        marginBottom: 8,
    },
    reasonSelected: {
        borderColor: "#FF6B6B",
        backgroundColor: "#FFE7E7",
    },
    reasonText: {
        color: "#444",
        fontSize: 15,
    },
    reasonTextSelected: {
        color: "#FF6B6B",
        fontWeight: "700",
    },
    input: {
        marginTop: 12,
        borderColor: "#ddd",
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        height: 100,
        textAlignVertical: "top",
        backgroundColor: "#FAFAFA",
    },
    footer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 16,
        gap: 12,
    },
    cancelBtn: {
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    cancelText: {
        color: "#666",
        fontWeight: "600",
    },
    submitBtn: {
        backgroundColor: "#FF6B6B",
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 10,
    },
    submitText: {
        color: "#fff",
        fontWeight: "700",
    },
});

import  { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams,  Link } from "expo-router";
import { api } from "../../../../api";

export default function ViewJournalPage() {
    const params = useLocalSearchParams(); 
    const id = params.id; 

    const [entry, setEntry] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        const fetchJournal = async () => {
            try {
                const res = await api.get(`journal/${id}/`);
                console.log(res.data, "journal entry res");
                setEntry(res.data);
            } catch (err) {
                console.error("Journal fetch error:", err);
                Alert.alert("Error", "Could not fetch journal entry.");
            } finally {
                setLoading(false);
            }
        }
        
        fetchJournal();
    }, [id]);

    if (loading || !entry) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" /> 
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    const editHref = `/journal/${entry.id}/edit`;

    return (
        <ScrollView style={styles.outerContainer}>
            <View style={styles.contentWrapper}>
                <View style={styles.card}>
                    <View style={styles.cardContent}>
                        <Text style={styles.title}>{entry.title || "Untitled"}</Text>
                        <Text style={styles.moodText}>{entry.mood?.name || "N/A"}</Text>
                        <Text style={styles.contentText}>
                            {entry.content}
                        </Text>

                        <View style={styles.buttonGroup}>
                            <Link href={editHref} asChild>
                                <TouchableOpacity style={styles.editButton}>
                                    <Text style={styles.editButtonText}>Edit</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
        backgroundColor: '#f8f8f8', 
    },
    contentWrapper: {
        flexGrow: 1,
        padding: 24, 
        alignItems: 'center', 
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
    },
    card: {
        width: '100%',
        maxWidth: 600, 
        backgroundColor: 'white',
        borderRadius: 16, 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1.41,
        elevation: 2, 
        marginBottom: 20,
    },
    cardContent: {
        padding: 24, 
        gap: 16, 
    },
    title: {
        fontSize: 28, 
        fontWeight: 'bold',
        color: '#1f2937',
    },
    moodText: {
        fontSize: 14, 
        color: '#6b7280', 
    },
    contentText: {
        fontSize: 18, 
        lineHeight: 28, 
        color: '#374151',
    },
    buttonGroup: {
        flexDirection: 'row',
        gap: 16, 
        paddingTop: 16,
    },
    editButton: {
        backgroundColor: '#00B894',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 12, 
        alignItems: 'center',
    },
    editButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});
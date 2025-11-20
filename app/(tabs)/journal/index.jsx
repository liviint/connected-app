import  { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
  RefreshControl, 
} from "react-native";
import { Link, useFocusEffect } from "expo-router"; 
import { api } from "../../../api";

export default function JournalListPage() {
    const [journals, setJournals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchJournals = useCallback(async () => {
        setRefreshing(true);
        try {
            const res = await api.get(`/journal/`);
            setJournals(res.data.results);
        } catch (err) {
            console.error("Journal fetch error:", err);
            Alert.alert("Error", "Failed to fetch journal entries.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            fetchJournals();
        }, [fetchJournals])
    );
    
    if (loading && journals.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6347" /> 
                <Text style={styles.loadingText}>Loading Entries...</Text>
            </View>
        );
    }

    return (
        <ScrollView 
            style={styles.outerContainer}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={fetchJournals} />
            }
        >
            <View style={styles.contentWrapper}>
                <View style={styles.headerBar}>
                    <Text style={styles.header}>My Journal</Text>

                    <Link href="/journal/create" asChild>
                        <TouchableOpacity style={styles.newEntryButton}>
                            <Text style={styles.newEntryButtonText}>+ New Entry</Text>
                        </TouchableOpacity>
                    </Link>
                </View>

                <View style={styles.journalList}>
                    {journals.length === 0 ? (
                        <Text style={styles.emptyText}>No journal entries found. Tap &apos;+ New Entry&apos; to begin!</Text>
                    ) : (
                        journals.map((item) => (
                            <Link key={item.id} href={`/journal/${item.id}`} asChild>
                                <TouchableOpacity style={styles.card}>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.cardTitle}>{item.title || "Untitled"}</Text>
                                        <Text style={styles.cardMoodText}>{item.mood?.name || 'No Mood'}</Text>
                                    </View>
                                    <View style={styles.cardContent}>
                                        <Text style={styles.cardContentText} numberOfLines={3}>
                                            {item.content}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </Link>
                        ))
                    )}
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
        padding: 24, 
        maxWidth: 768, 
        alignSelf: 'center', 
        width: '100%',
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
    headerBar: {
        flexDirection: 'row',
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 24, 
    },
    header: {
        fontSize: 28, 
        fontWeight: 'bold',
        color: '#FF6347',
    },
    newEntryButton: {
        backgroundColor: '#FF6347', 
        paddingVertical: 10,
        paddingHorizontal: 20, 
        borderRadius: 12,
    },
    newEntryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    journalList: {
        gap: 16, 
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16, 
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 3, 
    },
    cardHeader: {
        marginBottom: 8, 
    },
    cardTitle: {
        fontSize: 20, 
        fontWeight: '600', 
        marginBottom: 4,
    },
    cardMoodText: {
        fontSize: 12, 
        color: '#6b7280', 
    },
    cardContent: {
    },
    cardContentText: {
        color: '#4b5563',
        fontSize: 14,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
        color: '#6b7280',
    }
});
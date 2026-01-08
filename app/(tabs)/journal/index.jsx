import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Link,  useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import { Card, BodyText } from "../../../src/components/ThemeProvider/components"
import { useThemeStyles } from "../../../src/hooks/useThemeStyles";
import HtmlPreview from "../../../src/components/journal/HtmlPreview";
import PageLoader from "../../../src/components/common/PageLoader";
import { getJournals } from "../../../src/db/journalsDb";
import { useSQLiteContext } from 'expo-sqlite';
import { syncManager } from "../../../utils/syncManager";

export default function JournalListPage() {
  const db = useSQLiteContext(); 
  const router = useRouter()
  const isFocused = useIsFocused()
  const { globalStyles } = useThemeStyles();
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchJournals = async () => {
    setRefreshing(true);
    try {
      const res = await getJournals(db)
      setJournals(res);
    } catch (err) {
      console.error("Journal fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  
  useEffect(() => {
    setLoading(true);
    fetchJournals();
  },[isFocused])

  
  useEffect(() => {
  const unsub = syncManager.on("journals_updated", async () => {
    const updated = await getJournals(db);
    setJournals(updated);
  });

  return unsub;
}, []);


  if (loading) return <PageLoader />

  return (
    <ScrollView
      style={globalStyles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchJournals} />
      }
    >
      <View style={styles.contentWrapper}>
        <View style={styles.headerBar}>
          <Text style={globalStyles.title}>My Journal</Text>
        </View>

        <View 
          style={{
              marginBottom:20,
              display:"flex",
              flexDirection:"row",
              justifyContent:"center",
            }}
        >
          <TouchableOpacity 
            onPress={() => router.push("/journal/create")}  
            style={globalStyles.primaryBtn}
          >
          <Text style={globalStyles.primaryBtnText}>
            + New Entry
          </Text>
        </TouchableOpacity>

        {journals.length ? <TouchableOpacity 
          onPress={() => router.push("/journal/stats")}  
          style={globalStyles.secondaryBtn}>
          <Text style={globalStyles.secondaryBtnText}>
            Stats
          </Text>
        </TouchableOpacity> : ""}
        </View>
        
        {/* Journal List */}
        <View style={styles.journalList}>
          {journals.length === 0 ? (
            <BodyText style={styles.emptyText}>
              No journal entries yet.  
              Tap “+ New Entry” to write your first thought.
            </BodyText>
          ) : (
            journals.map((item) => (
              <Link key={item.uuid} href={`/journal/${item.uuid}`} >
                <Card style={styles.card} >
                  {/* Header */}
                  <View style={styles.cardHeader}>
                    <BodyText style={styles.cardTitle}>
                      {item.title || "Untitled"}
                    </BodyText>
                    {item.mood_label && (
                      <BodyText style={styles.cardMoodText}>{item.mood_label}</BodyText>
                    )}
                  </View>

                  {/* Content */}
                  <View style={styles.cardContent}>
                    <HtmlPreview html={item.content} maxLength={200} />
                  </View>
                </Card>
              </Link>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  contentWrapper: { maxWidth: 768, alignSelf: "center", width: "100%" },
  card:{width: "100%"},
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  newEntryButton: { backgroundColor: "#FF6B6B", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12 },
  newEntryButtonText: { color: "white", fontSize: 16, fontWeight: "600" },
  journalList: { gap: 16 },
  cardHeader: { marginBottom: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontSize: 20, fontWeight: "600", flex: 1, marginRight: 8 },
  cardMoodText: { fontSize: 12, color: "#6b7280", paddingHorizontal: 6, paddingVertical: 2, backgroundColor: "#F4E1D2", borderRadius: 6, overflow: "hidden" },
  emptyText: { 
    textAlign: "center", 
    marginTop: 40, 
    fontSize: 16, 
  },
});

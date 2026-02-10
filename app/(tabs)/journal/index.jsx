import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Link } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import { Card, BodyText } from "../../../src/components/ThemeProvider/components"
import { useThemeStyles } from "../../../src/hooks/useThemeStyles";
import HtmlPreview from "../../../src/components/journal/HtmlPreview";
import PageLoader from "../../../src/components/common/PageLoader";
import { getJournals } from "../../../src/db/journalsDb";
import { useSQLiteContext } from 'expo-sqlite';
import { syncManager } from "../../../utils/syncManager";
import TimeFilters from "../../../src/components/common/TimeFilters";
import { AddButton } from "../../../src/components/common/AddButton";
import ButtonLinks from "../../../src/components/common/ButtonLinks";

export default function JournalListPage() {
  const db = useSQLiteContext(); 
  const isFocused = useIsFocused()
  const { globalStyles } = useThemeStyles();
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period,setPeriod] = useState("30 days")


  const onPeriodChange = (value) => {
    setPeriod(value)
  }
  const fetchJournals = async () => {
    try {
      const res = await getJournals(db,null, period)
      setJournals(res);
    } catch (err) {
      console.error("Journal fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  
  useEffect(() => {
    journals.length === 0 && setLoading(true);
    fetchJournals();
  },[isFocused,period])

  
  useEffect(() => {
  const unsub = syncManager.on("journals_updated", async () => {
    const updated = await getJournals(db);
    setJournals(updated);
  });

  return unsub;
}, []);


  if (loading) return <PageLoader />

  return (
    <>
     <ScrollView
      style={globalStyles.container}
    >

      <View style={styles.contentWrapper}>
        <View style={styles.headerBar}>
          <Text style={globalStyles.title}>My Journal</Text>
        </View>

        <TimeFilters 
          selectedPeriod={period}
          onPeriodChange={onPeriodChange} 
        />

        {journals.length ? 
            <ButtonLinks 
              links={[
                {name:"Stats", route:"/journal/stats"}
              ]}
          /> : ""
        }

        <View style={styles.journalList}>
          {journals.length === 0 ? (
            <BodyText style={styles.emptyText}>
              No entries yet.
              Take a moment and write what’s on your mind.
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
    <AddButton 
        primaryAction={{route:"/journal/create",label:"Add Journal"}}
      />
    </>
    
  );
}


const styles = StyleSheet.create({
  contentWrapper: { 
    maxWidth: 768, 
    alignSelf: "center", 
    width: "100%" 
  },
  card:{
    width: "100%"
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
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

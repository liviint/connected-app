import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { useRouter} from "expo-router";
import { BodyText, Card, SecondaryText } from "../../../../src/components/ThemeProvider/components";
import { AddButton } from "../../../../src/components/common/AddButton";
import DeleteButton from "../../../../src/components/common/DeleteButton";
import { deleteMood, getLocalMoods } from "../../../../src/db/journalsDb";
import { useThemeStyles } from "../../../../src/hooks/useThemeStyles";

const COLORS = {
    primary: "#FF6B6B",
    secondary: "#2E8B8B",
    accent: "#F4E1D2",
    text: "#333333",
    muted: "#777777",
};

const MoodsList = () => {
  const { globalStyles } = useThemeStyles();
  const isFocused = useIsFocused()
  const db = useSQLiteContext();
  const router = useRouter();
  const [moods, setMoods] = useState([]);

  const fetchMoods = async () => {
    try {
      const moods = await getLocalMoods(db);
      setMoods(moods);
    } catch (error) {
      console.error("Failed to fetch moods:", error);
    }
  };

  useEffect(() => {
    fetchMoods();
  }, [isFocused]);

    const handleDelete = async (uuid) => {
        await deleteMood(db, uuid);
        fetchMoods()
    };

  const renderMoodItem = ({ item }) => (
    <Card style={styles.card}>
      <View style={styles.moodInfo}>
        <BodyText style={styles.moodName}>{item.name}</BodyText>

        {item.description ? (
          <SecondaryText
            numberOfLines={2} 
            style={styles.moodDescription}
            ellipsizeMode="tail"
        >
            {item.description}
          </SecondaryText>
        ) : null}
      </View>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            globalStyles.editBtn,
            pressed && styles.buttonPressed,
          ]}
          onPress={() =>
            router.push(`/journal/moods/${item.uuid}/edit`)
          }
        >
          <BodyText style={globalStyles.editBtnText}>Edit</BodyText>
        </Pressable>

        <DeleteButton
            handleOk={() => handleDelete(item.uuid)}
            item={"mood"}
        />
      </View>
    </Card>
  );

  return (
    <View style={globalStyles.container}>
      <BodyText style={globalStyles.title}>Your Moods</BodyText>

      <FlatList
        data={moods}
        keyExtractor={(item) => item.uuid}
        renderItem={renderMoodItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No moods yet</Text>
            <Text style={styles.emptyText}>
              Start tracking how you feel. Awareness is the first step to growth.
            </Text>
          </View>
        }
      />

      <AddButton
        primaryAction={{ route: "/journal/moods/add", label: "Add Mood" }}
      />
    </View>
  );
};

export default MoodsList;

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },

  moodInfo: {
    padding: 16,
    paddingBottom: 8,
  },

  moodName: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 4,
  },

  moodDescription: {
    fontSize: 14,
    lineHeight: 20,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },

  buttonPressed: {
    opacity: 0.8,
  },

  emptyContainer: {
    marginTop: 80,
    alignItems: "center",
    paddingHorizontal: 20,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 14,
    textAlign: "center",
    color: COLORS.muted,
    lineHeight: 20,
  },
});

import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router, } from "expo-router";
import { api } from "../../../api";
import DeleteButton from "../common/DeleteButton";
import { Card, BodyText } from "../ThemeProvider/components";
import { deleteHabit } from "../../db/habitsDb";
import { useSQLiteContext } from "expo-sqlite";

export default function HabitRow({ habit, drag, isActive, setRefreshData }) {
  const db = useSQLiteContext()
  const handleDelete = () => {
    deleteHabit(db,habit.uuid)
    setRefreshData(prev => prev + 1)
  };

  const handleStateToggle = () => {
    api
      .put(`/habits/${habit.id}/`, {
        ...habit,
        is_active: !habit.is_active,
      })
      .then(() => setRefreshData((prev) => prev + 1))
      .catch((err) => console.log(err));
  };

  return (
    <TouchableOpacity onPress={() => router.push(`/habits/${habit.id}/stats`)}>
      <Card
        style={[
          styles.row,
          { opacity: isActive ? 0.6 : 1 },
        ]}
        activeOpacity={0.9}
      >
      
           {/* DRAG HANDLE */}
        <TouchableOpacity onLongPress={drag} style={styles.dragHandle}>
          <Text style={styles.dragIcon}>≡</Text>
        </TouchableOpacity>

        {/* CONTENT */}
        <View style={styles.content}>
          <BodyText style={styles.title}>{habit.title}</BodyText>
          <BodyText style={styles.description}>{habit.description}</BodyText>
        </View>

        {/* ACTION BUTTONS */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => router.push(`/habits/${habit.uuid}/edit`)}
          >
            <BodyText style={styles.editText}>Edit</BodyText>
          </TouchableOpacity>

          <DeleteButton 
              handleOk={handleDelete}
              item={"habit"}
              contentAuthor={habit.user}
          />

          <TouchableOpacity
            style={[
              styles.toggleBtn,
              habit.is_active ? styles.active : styles.inactive,
            ]}
            onPress={handleStateToggle}
          >
            <Text style={styles.toggleText}>
              {habit.is_active ? "Deactivate" : "Activate"}
            </Text>
          </TouchableOpacity>
        </View>
        
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    padding: 16,
    marginBottom: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F4E1D2",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  dragHandle: {
    position: "absolute",
    left: 12,
    top: "45%",
  },
  dragIcon: {
    fontSize: 22,
    color: "#999",
  },
  content: {
    paddingLeft: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  description: {
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    marginTop: 12,
    gap: 8,
    justifyContent: "flex-end",
  },
  editBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderColor: "#ccc",
    borderWidth: 1,
  },
  editText: {
    fontSize: 12,
  },
  deleteBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#ffdddd",
  },
  deleteText: {
    color: "#b00000",
    fontSize: 12,
  },
  toggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  active: {
    backgroundColor: "#2E8B8B",
  },
  inactive: {
    backgroundColor: "#ccc",
  },
  toggleText: {
    color: "white",
    fontSize: 12,
  },
});

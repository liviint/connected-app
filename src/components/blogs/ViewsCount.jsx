import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet } from "react-native";
import { api } from "../../../api";

export default function ViewsCount({ blogId }) {
  const [views, setViews] = useState(null);

  useEffect(() => {
    if (!blogId) return;

    const trackView = async () => {
      try {
        const res = await api.post(`blogs/${blogId}/track_view/`,
          {},
          { withCredentials: true }
        );
        setViews(res.data.views_count);
      } catch (err) {
        console.error("Error tracking views:", err);
      }
    };

    trackView();
  }, [blogId]);

  if (views === null) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        👁️ {views} {views === 1 ? "view" : "views"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
  },
  text: {
    fontSize: 14,
    color: "#444",
  },
});

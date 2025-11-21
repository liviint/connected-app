import React, { useState, useEffect } from "react";
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { api } from "@/api";

export default function FriendshipButton({ userId }) {
  const [status, setStatus] = useState("loading");
  const [statusId, setStatusId] = useState(null);
  /*
    status values:
      "none" → no request
      "sent" → request sent by me
      "pending" → request received from user
      "accepted" → friends
  */

  const fetchStatus = async () => {
    try {
      const res = await api.get(`social/friends/?user=${userId}`);
      const results = res.data.results;

      if (results.length === 0) {
        setStatus("none");
        return;
      }

      const data = results[0];
      setStatusId(data.id);

      if (data.status === "pending") {
        // If current user is the sender, the request is sent
        setStatus(userId === data.sender ? "sent" : "pending");
      } else {
        setStatus(data.status); // "accepted"
      }
    } catch (err) {
      console.log(err);
      setStatus("none");
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const sendRequest = async () => {
    try {
      await api.post("social/friends/", { receiver: userId });
      setStatus("sent");
    } catch (err) {
      console.log(err, "send request error");
    }
  };

  const acceptRequest = async () => {
    try {
      await api.post(`social/friends/${statusId}/accept/`);
      setStatus("accepted");
    } catch (err) {
      console.log(err, "accept request error");
    }
  };

  const rejectRequest = async () => {
    try {
      await api.post(`social/friends/${statusId}/reject/`);
      setStatus("none");
    } catch (err) {
      console.log(err, "reject request error");
    }
  };

  if (status === "loading") {
    return (
      <View style={[styles.button, styles.loading]}>
        <ActivityIndicator color="#333333" />
      </View>
    );
  }

  if (status === "accepted") {
    return (
      <Pressable style={[styles.button, styles.accepted]}>
        <Text style={styles.textWhite}>Friends</Text>
      </Pressable>
    );
  }

  if (status === "sent") {
    return (
      <Pressable style={[styles.button, styles.sent]}>
        <Text style={styles.textDark}>Request Sent</Text>
      </Pressable>
    );
  }

  if (status === "pending") {
    return (
      <View style={styles.row}>
        <Pressable style={[styles.button, styles.accepted]} onPress={acceptRequest}>
          <Text style={styles.textWhite}>Accept</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.rejected]} onPress={rejectRequest}>
          <Text style={styles.textWhite}>Reject</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <Pressable style={[styles.button, styles.addFriend]} onPress={sendRequest}>
      <Text style={styles.textWhite}>Add Friend</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginVertical: 5,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  loading: {
    backgroundColor: "#E0E0E0",
  },
  accepted: {
    backgroundColor: "#2E8B8B",
  },
  sent: {
    backgroundColor: "#F4E1D2",
  },
  rejected: {
    backgroundColor: "#FF6B6B",
  },
  addFriend: {
    backgroundColor: "#FF6B6B",
  },
  textWhite: {
    color: "#FFFFFF",
    fontFamily: "Inter",
    fontWeight: "500",
  },
  textDark: {
    color: "#333333",
    fontFamily: "Inter",
    fontWeight: "500",
  },
});

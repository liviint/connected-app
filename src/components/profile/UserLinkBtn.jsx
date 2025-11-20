import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { dateFormat } from "../../../utils/dateFormat";

export default function UserLinkBtn({ content }) {
  const router = useRouter();

  if (!content) return null;
  const author = content.author;

  const handlePress = () => {
    if (author?.id) {
      router.push(`/profile/${author.id}`);
    }
  };

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {author?.profilePic ? (
          <Image
            source={{ uri: author.profilePic }}
            style={styles.avatarImage}
          />
        ) : (
          <Text style={styles.avatarInitial}>
            {author?.username?.charAt(0)?.toUpperCase()}
          </Text>
        )}
      </View>

      {/* Name + Date */}
      <View style={styles.textContainer}>
        <Text style={styles.username}>{author?.username}</Text>
        <Text style={styles.date}>{dateFormat(content?.created_at)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-start", // mimic w-fit
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: "#F4E1D2",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 999,
  },
  avatarInitial: {
    color: "#2E8B8B",
    fontWeight: "600",
    fontSize: 14,
  },
  textContainer: {
    marginLeft: 12,
    justifyContent: "center",
  },
  username: {
    fontWeight: "500",
    fontSize: 16,
    color: "#333333",
  },
  date: {
    fontSize: 12,
    color: "rgba(46, 139, 139, 0.7)", // #2E8B8B/70
  },
});

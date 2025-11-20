import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Image, useWindowDimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { blogApi, api } from "../../../../../api";
import { dateFormat } from "../../../../../utils/dateFormat";
import Markdown from "react-native-markdown-display";
import LikeButton from "../../../../../src/components/discussions/LikeButton";
import Comments from "../../../../../src/components/discussions/Comments";
import ShareButton from "../../../../../src/components/common/ShareButton";
import EditButton from "../../../../../src/components/common/EditButton";
import DeleteButton from "../../../../../src/components/common/DeleteButton";
import UserLinkBtn from "../../../../../src/components/profile/UserLinkBtn";

export default function Index() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams();
  const [discussion, setDiscussion] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const handleDelete = async () => {
    try {
      await api.delete(`discussions/${id}/`);
      router.push('/discussions');
    } catch (err) {
      console.error("Error deleting discussion:", err);
    }
  };

  useEffect(() => {
    const fetchDiscussion = async () => {
      try {
        const res = await blogApi.get(`discussions/${id}/`);
        setDiscussion(res.data);
        setComments(res.data.comments);
      } catch (err) {
        console.error("Error fetching discussion:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDiscussion();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  if (!discussion) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Discussion not found</Text>
      </View>
    );
  }

  const handleScroll = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveImageIndex(index);
  };

  return (
    <ScrollView style={styles.container}>
      
      {/* Image Slider */}
      {discussion.images?.length > 0 && (
        <View style={styles.sliderContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {discussion.images.map((img, idx) => (
              <Image
                key={idx}
                source={{ uri: img.image }}
                style={[styles.coverImage, { width }]}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          <View style={styles.dotsContainer}>
            {discussion.images.map((_, idx) => (
              <View
                key={idx}
                style={[styles.dot, idx === activeImageIndex ? styles.activeDot : null]}
              />
            ))}
          </View>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.title}>{discussion.title}</Text>
        <UserLinkBtn content={{
            author:discussion.author,
            created_at:discussion.created_at
          }} 
        />
      </View>

      <Markdown style={markdownStyles}>
        {discussion.content}
      </Markdown>

      <View style={styles.actions}>
        <LikeButton discussionId={id} initialLikes={discussion.likes_count} />
        <ShareButton url={`https://www.zeniahub.com/discussions/${discussion.slug}/${id}`} />
        <EditButton contentAuthor={discussion.author} href={`/discussions/edit/${id}`} />
        <DeleteButton item={'discussion'} handleOk={handleDelete} />
      </View>

      <Comments comments={comments} setComments={setComments} styles={styles} />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAF9F7", padding: 16 },
  sliderContainer: { height: 250, marginBottom: 16, position: 'relative' },
  coverImage: { height: 250 },
  dotsContainer: { position: 'absolute', bottom: 10, width: '100%', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ccc', marginHorizontal: 3 },
  activeDot: { backgroundColor: '#FF6B6B' },
  header: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "700", color: "#FF6B6B", marginBottom: 6 },
  meta: { fontSize: 14, color: "#666", fontStyle: "italic" },
  actions: { flexDirection: "row", justifyContent: "flex-start", alignItems: "center", gap: 20, marginTop: 16 },
  btn: { backgroundColor: "#FF6B6B", paddingVertical: 10, paddingHorizontal: 18, borderRadius: 10, alignSelf: "flex-start", marginTop: 8 },
  btnText: { color: "#fff", fontWeight: "700" },
  commentsSection: { marginTop: 24 },
  commentsTitle: { fontSize: 18, fontWeight: "700", color: "#2E8B8B", marginBottom: 12 },
  newComment: { marginBottom: 20 },
  textArea: { borderColor: "#ddd", borderWidth: 1, borderRadius: 10, padding: 10, backgroundColor: "#fff", fontSize: 16, textAlignVertical: "top" },
  commentCard: { backgroundColor: "#fff", borderRadius: 12, padding: 12, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  commentAuthor: { fontWeight: "700", color: "#FF6B6B", marginBottom: 4 },
  commentContent: { color: "#333", fontSize: 15 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  notFound: { flex: 1, justifyContent: "center", alignItems: "center" },
  notFoundText: { fontSize: 16, color: "#777" },
});

const markdownStyles = {
  body: { color: "#333", fontSize: 16, lineHeight: 24 },
  heading2: { color: "#2E8B8B", fontWeight: "700", marginVertical: 10 },
  link: { color: "#FF6B6B", textDecorationLine: "underline" },
  image: { borderRadius: 12, marginVertical: 10 },
};

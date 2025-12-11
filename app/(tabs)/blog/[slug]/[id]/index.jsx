import  { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator , useWindowDimensions} from "react-native";
import RenderHtml from "react-native-render-html";
import { blogApi,api } from "../../../../../api";
import { useLocalSearchParams, useRouter } from 'expo-router';
import LikeButton from "../../../../../src/components/blogs/LikeButton";
import Comments from "../../../../../src/components/blogComments/index";
import ViewsCount from "../../../../../src/components/blogs/ViewsCount";
import Share from "../../../../../src/components/common/ShareButton";
import EditButton from "../../../../../src/components/common/EditButton";
import { globalStyles } from "../../../../../src/styles/global";
import DeleteButton from "../../../../../src/components/common/DeleteButton";
import UserLinkBtn from "../../../../../src/components/profile/UserLinkBtn";
import { htmlStyles } from "../../../../../utils/htmlStyles";

export default function SingleBlogPage({ route }) {
  const router = useRouter()
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams()
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleDelete = async() => {
      try {
        await api.delete(`blogs/${id}/`);
        router.push('/blog/my-blogs')
      } catch (err) {
        console.error("Error deleting blog:", err);
      } 
  }

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await blogApi.get(`blogs/${id}`);
        setBlog(res.data);
      } catch (err) {
        console.error("Error fetching blog:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  if (!blog) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Blog not found</Text>
      </View>
    );
  }

  const { title, content, created_at, image, author, likes_count , slug} = blog;

  return (
    <ScrollView style={globalStyles.container} contentContainerStyle={globalStyles.containerContent}>

      <View style={styles.header}>
        {image && <Image source={{ uri: image }} style={styles.coverImage} />}
        <Text style={styles.title}>{title}</Text>

        <UserLinkBtn content={{
              author:author,
              created_at:created_at
          }} 
        />
        
      </View>

      <RenderHtml
        contentWidth={width}
        source={{ html: content }}
        tagsStyles={htmlStyles}
      />

      <View style={styles.actions}>
          <ViewsCount blogId={id} />
          <LikeButton blogId={id} initialLikes={likes_count} />
          <Share url={`https://www.zeniahub.com/blog/${slug}/${id}`}/>
          <EditButton
              contentAuthor={blog.author}
              href={`/blog/edit/${blog.id}`}
          />
          <DeleteButton item='blog' handleOk={handleDelete}/>
      </View>

    <Comments blogId={id} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9F7",
    padding: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  coverImage: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  meta: {
    fontSize: 14,
    color: "#777",
    fontStyle: "italic",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    marginTop: 16,
    justifyContent: "flex-start",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  notFound: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  notFoundText: {
    fontSize: 18,
    color: "#999",
  },
});


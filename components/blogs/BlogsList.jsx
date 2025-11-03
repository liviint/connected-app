import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { dateFormat } from '../../utils/dateFormat';
import EditButton from '../common/EditButton';
import { useRouter } from "expo-router";

export default function BlogsList({ blogs = [], author }) {
    const router = useRouter();

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.blogTitle}>{item.title}</Text>

        {author && (
          <View
            style={[
              styles.statusBadge,
              item.published ? styles.published : styles.draft,
            ]}
          >
            <Text
              style={item.published ? styles.publishedText : styles.draftText}
            >
              {item.published ? 'Published' : 'Draft'}
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.meta}>
        By {item.author_name} • {dateFormat(item.created_at)}
      </Text>

      <Text style={styles.summary}>{item.summary}</Text>

      <TouchableOpacity
        onPress={() => router.push(`/blog/${item.slug}/${item.id}`)}
      >
        <Text style={styles.readMore}>Read More →</Text>
      </TouchableOpacity>

      {author && author === item.author && (
        <EditButton 
            loggedUser={author}
            contentAuthor={item.author}
            href={`/blog/edit/${item.id}`}
        />
      )}
    </View>
  );

  return (
    <FlatList
      data={blogs}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderTopWidth: 4,
    borderTopColor: '#2E8B8B',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  blogTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E8B8B',
  },
  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  published: {
    backgroundColor: '#C8E6C9',
  },
  draft: {
    backgroundColor: '#FFCDD2',
  },
  publishedText: {
    color: '#256029',
    fontSize: 12,
    fontWeight: 'bold',
  },
  draftText: {
    color: '#B71C1C',
    fontSize: 12,
    fontWeight: 'bold',
  },
  meta: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#FF6B6B',
    marginBottom: 10,
  },
  summary: {
    color: '#333',
    lineHeight: 22,
    fontSize: 15,
    marginBottom: 12,
  },
  readMore: {
    fontWeight: '600',
    color: '#2E8B8B',
  },
  editButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#FF6B6B',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  editButtonText: {
    color: '#FAF9F7',
    fontWeight: '700',
  },
});

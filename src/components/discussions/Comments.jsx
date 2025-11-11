import { useEffect, useState } from "react";
import { View, Text, TextInput,  TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { blogApi } from "../../../api";
import LoginFirst from "../common/LoginFirst";
import {removeUpdatedDiscussionsComment} from "../../../store/features/websocketSlice"

export default function Comments({comments, setComments,styles}) {
    const { id } = useLocalSearchParams();
    const dispatch = useDispatch()
    const {newDiscussionComments,connected} = useSelector((state) => state.websocket);
    const user = useSelector((state) => state?.user?.userDetails);
    const [newComment, setNewComment] = useState("");

    const handleComment = async () => {
        if (!user || !newComment.trim()) return;
        try {
        const res = await blogApi.post(
            `discussions/comments/`,
            { content: newComment, discussion: id },
            { headers: { Authorization: `Bearer ${user.access}` } }
        );
        setComments([res.data, ...comments]);
        setNewComment("");
        } catch (err) {
        console.error("Error posting comment:", err);
        }
    };

    useEffect(() => {
        if (!connected || newDiscussionComments.length === 0) return;
        const currentDiscussionComments = newDiscussionComments.filter(c => c.discussion_id === id);
        setComments(prev => {
            const existingIds = new Set(prev.map(c => c.id));
            const newComments = currentDiscussionComments.filter(c => !existingIds.has(c.id));
            return [...newComments, ...prev];
        });
    }, [newDiscussionComments, connected, dispatch]);


    useEffect(() => {
        dispatch(removeUpdatedDiscussionsComment())
    },[comments])

    return (
        <View style={styles.commentsSection}>
        <Text style={styles.commentsTitle}>Comments</Text>

        <View style={styles.newComment}>
            <TextInput
            style={styles.textArea}
            placeholder="Write a comment..."
            multiline
            numberOfLines={3}
            value={newComment}
            onChangeText={setNewComment}
            editable={!!user}
            />
            <TouchableOpacity style={styles.btn} onPress={handleComment}>
            <Text style={styles.btnText}>Post Comment</Text>
            </TouchableOpacity>
        </View>

        {!user && <LoginFirst />}

        {comments.map((c) => (
            <View key={c.id} style={styles.commentCard}>
            <Text style={styles.commentAuthor}>{c.author_name}</Text>
            <Text style={styles.commentContent}>{c.content}</Text>
            </View>
        ))}
        </View>
    );
}

import { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useSelector , useDispatch} from 'react-redux';
import { api } from '../../../api';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../../styles/global';
import {removeUpdatedDiscussionLikes} from "../../../store/features/websocketSlice"

export default function LikeButton({ discussionId, initialLikes }) {
  const dispatch = useDispatch()
  const user = useSelector((state) => state?.user?.userDetails);
  const {newDiscussionLikes,connected} = useSelector((state) => state.websocket);
  const [likes, setLikes] = useState(initialLikes || 0);
  const [liked, setLiked] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    const fetchLikeStatus = async () => {
      try {
        const res = await api.get(`discussions/${discussionId}/liked/`);
        setLiked(res.data.liked);
      } catch (err) {
        console.log('Error checking like status:', err);
      }
    };
    fetchLikeStatus();
  }, [user, discussionId]);


  useEffect(() => {
        if (!connected || newDiscussionLikes.length === 0) return;
        const currentDiscussionLikes = newDiscussionLikes.filter(c => c.discussion === discussionId);
        setLikes(prev => prev + currentDiscussionLikes.length)
    }, [newDiscussionLikes, connected]);

    useEffect(() => {
      dispatch(removeUpdatedDiscussionLikes())
    },[likes])

  const handleLike = async () => {
    setError('');
    if (!user) {
      setError('You must be logged in to like posts.');
      return;
    }

    try {
      await api.post(`discussions/${discussionId}/like/`,{},);
      setLiked(true);
    } catch (err) {
      console.log('Like error:', err);
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('An error occurred.');
      }
    }
  };

  return (
    <View style={globalStyles.container}>
      <TouchableOpacity style={styles.button} onPress={handleLike}>
        <Ionicons
          name={liked ? 'heart' : 'heart-outline'}
          size={22}
          color={liked ? '#FF6B6B' : '#666'}
        />
        <Text style={styles.likesText}>{likes}</Text>
      </TouchableOpacity>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    likesText: {
        marginLeft: 6,
        fontSize: 16,
        color: '#333',
    },
    error: {
        color: 'red',
        marginTop: 4,
        fontSize: 12,
    },
});

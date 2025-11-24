import { useState, useEffect } from 'react';
import { useSelector , useDispatch} from 'react-redux';
import { api } from '../../../api';
import {removeUpdatedDiscussionLikes} from "../../../store/features/websocketSlice"
import Like from '../common/Like';

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
      setLikes(prev => prev + 1)
    } catch (err) {
      console.log('Like error:', err);
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('An error occurred.');
      }
    }
  };

  return <Like 
            liked={liked} 
            handleLike={handleLike} 
            likes={likes} 
            error={error} 
          />
}

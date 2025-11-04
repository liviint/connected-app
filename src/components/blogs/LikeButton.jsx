import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Like from "../common/Like"; 
import { blogApi } from "../../../api";

export default function LikeButton({ blogId, initialLikes }) {
  const user = useSelector((state) => state?.user?.userDetails);
  const [likes, setLikes] = useState(initialLikes || 0);
  const [liked, setLiked] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || !blogId) return;

    const hasUserLiked = async () => {
      try {
        const res = await blogApi.get(`blogs/${blogId}/like/`,
          {
            headers: { Authorization: `Bearer ${user.access}` },
          }
        );
        setLiked(res.data.liked);
      } catch (err) {
        console.error("Error checking like status:", err);
      }
    };

    hasUserLiked();
  }, [blogId, user]);

  const handleLike = async () => {
    setError("");

    if (!user) {
      setError("You must be logged in to like posts.");
      return;
    }

    try {
      const res = await blogApi.post(`blogs/${blogId}/like/`,
        {},
        { headers: { Authorization: `Bearer ${user.access}` } }
      );

      if (res.status === 200) {
        setLiked(true);
        setLikes((prev) => prev + 1);
      }
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("An error occurred.");
      }
    }
  };

  return (
    <Like liked={liked} handleLike={handleLike} likes={likes} error={error} />
  );
}

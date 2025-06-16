import { useState, useEffect } from "react";
import { postService } from "../services/postService";
import { useAuth } from "./useAuth";

export const usePosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadPosts();
    } else {
      setPosts([]);
      setLoading(false);
    }
  }, [user]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const userPosts = await postService.getUserPosts(user.uid);
      setPosts(userPosts);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (postData) => {
    try {
      setError(null);

      const newPost = await postService.createPost({
        ...postData,
        userId: user.uid,
        userDisplayName: user.displayName || user.email,
      });

      setPosts((prev) => [newPost, ...prev]);
      return true;
    } catch (error) {
      setError(error.message);
      return false;
    }
  };

  const updatePost = async (postId, postData) => {
    try {
      setError(null);

      const updatedPost = await postService.updatePost(postId, postData);

      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, ...updatedPost } : post
        )
      );

      return true;
    } catch (error) {
      setError(error.message);
      return false;
    }
  };

  const deletePost = async (postId) => {
    try {
      setError(null);

      await postService.deletePost(postId);
      setPosts((prev) => prev.filter((post) => post.id !== postId));

      return true;
    } catch (error) {
      setError(error.message);
      return false;
    }
  };

  return {
    posts,
    loading,
    error,
    createPost,
    updatePost,
    deletePost,
    loadPosts,
  };
};

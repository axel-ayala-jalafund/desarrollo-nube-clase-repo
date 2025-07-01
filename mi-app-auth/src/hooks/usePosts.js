import { useState } from "react";
import { postService } from "../services/postService";
import { useAuth } from "./useAuth";
import { useRealtimePosts } from "./useRealtimePosts";

export const usePosts = (viewMode = "mine") => {
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Use posts on real time
  const { posts, loading } = useRealtimePosts(viewMode);

  const createPost = async (postData, imageFile = null) => {
    try {
      setError(null);

      await postService.createPost(
        {
          ...postData,
          userId: user.uid,
          userDisplayName: user.displayName || user.email,
        },
        imageFile
      );

      return true;
    } catch (error) {
      setError(error.message);
      return false;
    }
  };

  const updatePost = async (postId, postData, imageFile = null) => {
    try {
      setError(null);

      const currentPost = posts.find((post) => post.id === postId);
      const currentImagePublicId = currentPost?.imagePublicId;

      await postService.updatePost(
        postId,
        { ...postData, userId: user.uid },
        imageFile,
        currentImagePublicId
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

      const postToDelete = posts.find((post) => post.id === postId);
      const imagePublicId = postToDelete?.imagePublicId;

      await postService.deletePost(postId, imagePublicId);

      return true;
    } catch (error) {
      setError(error.message);
      return false;
    }
  };

  const handleReaction = async (postId, reaction, post) => {
    try {
      setError(null);

      await postService.handleReaction(postId, reaction, user, post);
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
    handleReaction,
  };
};

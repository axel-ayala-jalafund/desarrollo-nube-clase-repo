import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../config/firebase";

export const postService = {
  async getUserPosts(userId) {
    try {
      const q = query(
        collection(db, "posts"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      const posts = [];

      querySnapshot.forEach((doc) => {
        posts.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return posts;
    } catch (error) {
      console.error("Error getting posts:", error);
      throw error;
    }
  },

  async createPost(postData) {
    try {
      const timestamp = new Date().toISOString();
      const fullPostData = {
        ...postData,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      const docRef = await addDoc(collection(db, "posts"), fullPostData);

      return { id: docRef.id, ...fullPostData };
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  },

  async updatePost(postId, postData) {
    try {
      const postRef = doc(db, "posts", postId);
      const updateData = {
        ...postData,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(postRef, updateData);
      return { id: postId, ...updateData };
    } catch (error) {
      console.error("Error updating post:", error);
      throw error;
    }
  },

  async deletePost(postId) {
    try {
      await deleteDoc(doc(db, "posts", postId));
      return true;
    } catch (error) {
      console.error("Error deleting post:", error);
      throw error;
    }
  },
};

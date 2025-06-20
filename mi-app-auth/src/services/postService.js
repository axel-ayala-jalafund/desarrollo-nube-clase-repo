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
import { imageService } from "./imageService";

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

  async createPost(postData, imageFile = null) {
    try {
      const timestamp = new Date().toISOString();

      let fullPostData = {
        ...postData,
        createdAt: timestamp,
        updatedAt: timestamp,
        imageURL: null,
        imagePublicId: null,
      };

      if (imageFile) {
        const imageResult = await imageService.uploadImage(
          imageFile,
          postData.userId
        );
        fullPostData.imageURL = imageResult.url;
        fullPostData.imagePublicId = imageResult.publicId;
      }

      const docRef = await addDoc(collection(db, "posts"), fullPostData);

      return {
        id: docRef.id,
        ...fullPostData,
      };
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  },

  async updatePost(
    postId,
    postData,
    imageFile = null,
    currentImagePublicId = null
  ) {
    try {
      const updateData = {
        ...postData,
        updatedAt: new Date().toISOString(),
      };

      if (imageFile) {
        if (currentImagePublicId) {
          await imageService.deleteImage(currentImagePublicId);
        }

        const imageResult = await imageService.uploadImage(
          imageFile,
          postData.userId
        );
        updateData.imageURL = imageResult.url;
        updateData.imagePublicId = imageResult.publicId;
      }

      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, updateData);

      return { id: postId, ...updateData };
    } catch (error) {
      console.error("Error updating post:", error);
      throw error;
    }
  },

  async deletePost(postId, imagePublicId = null) {
    try {
      if (imagePublicId) {
        await imageService.deleteImage(imagePublicId);
      }

      await deleteDoc(doc(db, "posts", postId));
      return true;
    } catch (error) {
      console.error("Error deleting post:", error);
      throw error;
    }
  },
};

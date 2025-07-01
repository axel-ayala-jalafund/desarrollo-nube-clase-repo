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

const FUNCTIONS_URL =
  "https://us-central1-mi-app-auth-1c0a7.cloudfunctions.net";
// "http://localhost:5001/mi-app-auth-1c0a7/us-central1" For localhost

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

  async getAllPosts() {
    try {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

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
      console.error("Error getting all posts:", error);
      throw error;
    }
  },

  async createPost(postData, imageFile = null) {
    try {
      const timestamp = new Date().toISOString();

      const moderationResponse = await fetch(`${FUNCTIONS_URL}/moderatePost`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: postData.title,
          content: postData.content,
        }),
      });

      if (!moderationResponse.ok) {
        console.warn(
          "Moderation service failed, proceeding without moderation"
        );
      }

      let moderatedData = postData;
      try {
        const moderationResult = await moderationResponse.json();
        moderatedData = {
          ...postData,
          title: moderationResult.title,
          content: moderationResult.content,
          moderated: moderationResult.hasInappropriateContent,
        };
      } catch (moderationError) {
        console.warn("Error parsing moderation response:", moderationError);
      }

      let fullPostData = {
        ...moderatedData,
        createdAt: timestamp,
        updatedAt: timestamp,
        imageURL: null,
        imagePublicId: null,
        likes: [],
        dislikes: [],
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

      try {
        await fetch(`${FUNCTIONS_URL}/notifyNewPost`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            authorName: fullPostData.userDisplayName,
            postTitle: fullPostData.title,
            authorId: fullPostData.userId,
          }),
        });
      } catch (notificationError) {
        console.warn("Error sending notification:", notificationError);
      }

      return {
        id: docRef.id,
        ...fullPostData,
      };
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  },

  async handleReaction(postId, reaction, user, post) {
    try {
      const response = await fetch(`${FUNCTIONS_URL}/handlePostReaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId: postId,
          userId: user.uid,
          userName: user.displayName || user.email,
          reaction: reaction,
          postTitle: post.title,
          postOwnerId: post.userId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to handle reaction");
      }

      return await response.json();
    } catch (error) {
      console.error("Error handling reaction:", error);
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
      const moderationResponse = await fetch(`${FUNCTIONS_URL}/moderatePost`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: postData.title,
          content: postData.content,
        }),
      });

      let updateData = { ...postData };

      if (moderationResponse.ok) {
        try {
          const moderationResult = await moderationResponse.json();
          updateData = {
            ...postData,
            title: moderationResult.title,
            content: moderationResult.content,
            moderated: moderationResult.hasInappropriateContent,
          };
        } catch (moderationError) {
          console.warn("Error parsing moderation response:", moderationError);
        }
      }

      updateData.updatedAt = new Date().toISOString();

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

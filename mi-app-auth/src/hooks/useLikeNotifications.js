import { useState, useEffect, useRef } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "./useAuth";
import { useNotificationSound } from "./useNotificationSound";

export const useLikeNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();
  const { playSound } = useNotificationSound();
  const previousLikeCounts = useRef(new Map());

  useEffect(() => {
    if (!user) return;

    // Listens changes only ours
    const q = query(
      collection(db, "posts"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "modified") {
          const post = { id: change.doc.id, ...change.doc.data() };
          const postId = post.id;

          const currentLikes = post.likes?.length || 0;
          const currentDislikes = post.dislikes?.length || 0;
          const previousData = previousLikeCounts.current.get(postId) || {
            likes: 0,
            dislikes: 0,
          };

          // Verify if likes increase
          if (currentLikes > previousData.likes) {
            const notification = {
              id: `like_${postId}_${Date.now()}`,
              type: "like",
              authorName: "Nueva reacción",
              title: `Le gustó tu post: "${post.title}"`,
              imageURL: post.imageURL || null,
              createdAt: new Date().toISOString(),
              timestamp: Date.now(),
            };

            setNotifications((prev) => [notification, ...prev]);
            playSound();

            setTimeout(() => {
              setNotifications((prev) =>
                prev.filter((n) => n.id !== notification.id)
              );
            }, 4000);
          }

          // Verify if dislikes increase
          if (currentDislikes > previousData.dislikes) {
            const notification = {
              id: `dislike_${postId}_${Date.now()}`,
              type: "dislike",
              authorName: "Nueva reacción",
              title: `No le gustó tu post: "${post.title}"`,
              imageURL: post.imageURL || null,
              createdAt: new Date().toISOString(),
              timestamp: Date.now(),
            };

            setNotifications((prev) => [notification, ...prev]);
            playSound();

            setTimeout(() => {
              setNotifications((prev) =>
                prev.filter((n) => n.id !== notification.id)
              );
            }, 4000);
          }

          // Update previus count
          previousLikeCounts.current.set(postId, {
            likes: currentLikes,
            dislikes: currentDislikes,
          });
        }

        // Init count for post news
        if (change.type === "added") {
          const post = { id: change.doc.id, ...change.doc.data() };
          previousLikeCounts.current.set(post.id, {
            likes: post.likes?.length || 0,
            dislikes: post.dislikes?.length || 0,
          });
        }
      });
    });

    return () => unsubscribe();
  }, [user, playSound]);

  const removeNotification = (notificationId) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return {
    notifications,
    removeNotification,
    clearAllNotifications,
  };
};

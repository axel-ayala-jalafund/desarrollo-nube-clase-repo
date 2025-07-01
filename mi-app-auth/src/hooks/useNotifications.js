import { useState, useEffect, useRef } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "./useAuth";
import { useNotificationSound } from "./useNotificationSound";
import { useLikeNotifications } from "./useLikeNotifications";

export const useNotifications = () => {
  const [postNotifications, setPostNotifications] = useState([]);
  const { user } = useAuth();
  const { playSound } = useNotificationSound();
  const isInitialLoad = useRef(true);
  const processedPosts = useRef(new Set());

  const { notifications: likeNotifications } = useLikeNotifications();

  useEffect(() => {
    if (!user) return;

    const postsQuery = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      if (isInitialLoad.current) {
        snapshot.docs.forEach((doc) => {
          processedPosts.current.add(doc.id);
        });
        isInitialLoad.current = false;
        return;
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const newPost = { id: change.doc.id, ...change.doc.data() };

          if (
            newPost.userId !== user.uid &&
            !processedPosts.current.has(newPost.id)
          ) {
            const notification = {
              id: `post_${newPost.id}_${Date.now()}`,
              type: "new_post",
              authorName: newPost.userDisplayName || "Usuario",
              title: newPost.title || "Nueva publicación",
              imageURL: newPost.imageURL || null,
              createdAt: newPost.createdAt,
              timestamp: Date.now(),
            };

            setPostNotifications((prev) => [notification, ...prev]);
            playSound();

            setTimeout(() => {
              setPostNotifications((prev) =>
                prev.filter((n) => n.id !== notification.id)
              );
            }, 5000);
          }

          processedPosts.current.add(newPost.id);
        }
      });
    });

    return () => {
      unsubscribe();
    };
  }, [user, playSound]);

  const allNotifications = [...postNotifications, ...likeNotifications]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 3);

  const removeNotification = (notificationId) => {
    setPostNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  const clearAllNotifications = () => {
    setPostNotifications([]);
  };

  return {
    notifications: allNotifications,
    removeNotification,
    clearAllNotifications,
  };
};

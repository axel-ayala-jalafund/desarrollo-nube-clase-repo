import { useState, useEffect } from "react";
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

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [lastPostTime, setLastPostTime] = useState(Date.now());
  const { user } = useAuth();
  const { playSound } = useNotificationSound();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const newPost = { id: change.doc.id, ...change.doc.data() };
          const postTime = new Date(newPost.createdAt).getTime();

          if (
            newPost.userId !== user.uid &&
            postTime > lastPostTime &&
            Date.now() - postTime < 30000
          ) {
            const notification = {
              id: `notification_${newPost.id}_${Date.now()}`,
              authorName: newPost.userDisplayName || "Usuario",
              title: newPost.title || "Nueva publicación",
              imageURL: newPost.imageURL || null,
              createdAt: newPost.createdAt,
              timestamp: Date.now(),
            };

            setNotifications((prev) => [notification, ...prev]);

            playSound();

            setTimeout(() => {
              setNotifications((prev) =>
                prev.filter((n) => n.id !== notification.id)
              );
            }, 5000);
          }
        }
      });
    });

    return () => unsubscribe();
  }, [user, lastPostTime]);

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

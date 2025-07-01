import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "./useAuth";

export const useRealtimePosts = (viewMode = "mine") => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setPosts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    let q;
    if (viewMode === "mine") {
      q = query(
        collection(db, "posts"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
    } else {
      q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const postsData = [];
        snapshot.forEach((doc) => {
          postsData.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        setPosts(postsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading posts:", error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, viewMode]);

  return { posts, loading, error };
};

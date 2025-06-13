import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "./useAuth";

export const useProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        setProfile(userDoc.data());
      } else {
        const basicProfile = {
          displayName: user.displayName || "",
          email: user.email || "",
          address: "",
          birthDate: "",
          age: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await setDoc(userDocRef, basicProfile);
        setProfile(basicProfile);
      }
    } catch (error) {
      setError(error.message);
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (profileData) => {
    try {
      setError(null);

      const dataToSave = {
        ...profileData,
        updatedAt: new Date().toISOString(),
      };

      const userDocRef = doc(db, "users", user.uid);

      if (profile) {
        await updateDoc(userDocRef, dataToSave);
      } else {
        await setDoc(userDocRef, {
          ...dataToSave,
          createdAt: new Date().toISOString(),
        });
      }

      setProfile((prev) => ({ ...prev, ...dataToSave }));
      return true;
    } catch (error) {
      setError(error.message);
      console.error("Error saving profile:", error);
      return false;
    }
  };

  return {
    profile,
    loading,
    error,
    saveProfile,
    loadProfile,
  };
};

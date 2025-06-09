import { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  linkWithPopup,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider, facebookProvider } from "../config/firebase";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signUpWithEmail = async (email, password, displayName) => {
    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const signInWithEmail = async (email, password) => {
    try {
      setError(null);
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      return await signInWithPopup(auth, googleProvider);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const signInWithFacebook = async () => {
    try {
      setError(null);
      return await signInWithPopup(auth, facebookProvider);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const linkWithGoogle = async () => {
    try {
      setError(null);
      const result = await linkWithPopup(auth.currentUser, googleProvider);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const linkWithFacebook = async () => {
    try {
      setError(null);
      const result = await linkWithPopup(auth.currentUser, facebookProvider);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const getLinkedProviders = () => {
    if (!user) return [];
    return user.providerData.map((provider) => ({
      providerId: provider.providerId,
      email: provider.email,
      displayName: provider.displayName,
    }));
  };

  return {
    user,
    loading,
    error,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signInWithFacebook,
    linkWithGoogle,
    linkWithFacebook,
    logout,
    getLinkedProviders,
  };
};

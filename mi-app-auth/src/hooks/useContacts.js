import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "./useAuth";

export const useContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadContacts();
    } else {
      setContacts([]);
      setLoading(false);
    }
  }, [user]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      setError(null);

      const q = query(
        collection(db, "contacts"),
        where("userId", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);

      const contactsData = [];
      querySnapshot.forEach((doc) => {
        contactsData.push({ id: doc.id, ...doc.data() });
      });

      setContacts(contactsData);
    } catch (error) {
      setError(error.message);
      console.error("Error loading contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const addContact = async (contactData) => {
    try {
      setError(null);

      const dataToSave = {
        ...contactData,
        userId: user.uid,
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, "contacts"), dataToSave);
      setContacts((prev) => [...prev, { id: docRef.id, ...dataToSave }]);

      return true;
    } catch (error) {
      setError(error.message);
      console.error("Error adding contact:", error);
      return false;
    }
  };

  const updateContact = async (contactId, contactData) => {
    try {
      setError(null);

      const contactRef = doc(db, "contacts", contactId);
      await updateDoc(contactRef, contactData);

      setContacts((prev) =>
        prev.map((contact) =>
          contact.id === contactId ? { ...contact, ...contactData } : contact
        )
      );

      return true;
    } catch (error) {
      setError(error.message);
      console.error("Error updating contact:", error);
      return false;
    }
  };

  const deleteContact = async (contactId) => {
    try {
      setError(null);

      await deleteDoc(doc(db, "contacts", contactId));
      setContacts((prev) => prev.filter((contact) => contact.id !== contactId));

      return true;
    } catch (error) {
      setError(error.message);
      console.error("Error deleting contact:", error);
      return false;
    }
  };

  return {
    contacts,
    loading,
    error,
    addContact,
    updateContact,
    deleteContact,
    loadContacts,
  };
};

const { getMessaging } = require("firebase-admin/messaging");
const { Profile } = require("../models/Profile");

class UserRepository {
  constructor(firestore) {
    this.firestore = firestore;
    this.collectionName = "users";
  }

  async getProfileById(id) {
    try {
      const doc = await this.firestore
        .collection(this.collectionName)
        .doc(id)
        .get();

      if (doc.exists) {
        const data = doc.data();
        return Profile.fromFirestore(doc.id, data);
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error getting document:", error);
      throw error;
    }
  }

  async getAllUsersExcept(excludeUserId) {
    try {
      const snapshot = await this.firestore
        .collection(this.collectionName)
        .get();
      const users = [];

      snapshot.forEach((doc) => {
        if (doc.id !== excludeUserId) {
          try {
            const profile = Profile.fromFirestore(doc.id, doc.data());
            users.push(profile);
          } catch (error) {
            console.warn(`Error parsing profile ${doc.id}:`, error);
          }
        }
      });

      return users;
    } catch (error) {
      console.error("Error getting all users:", error);
      throw error;
    }
  }

  async subscribeToTopic(profile, topic) {
    if (!profile.id) {
      console.error("Profile ID is required to subscribe to topic.");
      return;
    }

    try {
      const response = await getMessaging().subscribeToTopic(
        profile.notificationTokens,
        topic
      );
      console.log(
        `Successfully subscribed profile ${profile.id} to topic:`,
        response
      );
    } catch (error) {
      console.error(`Error subscribing profile ${profile.id} to topic:`, error);
      throw error;
    }
  }

  async updateNotificationTokens(userId, tokens) {
    try {
      await this.firestore.collection(this.collectionName).doc(userId).update({
        notificationTokens: tokens,
        updatedAt: new Date().toISOString(),
      });
      console.log(`Updated notification tokens for user ${userId}`);
    } catch (error) {
      console.error("Error updating notification tokens:", error);
      throw error;
    }
  }
}

module.exports = { UserRepository };

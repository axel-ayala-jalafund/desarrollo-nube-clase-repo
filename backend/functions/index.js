const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/v2/https");
const {
  onDocumentCreated,
  onDocumentUpdated,
} = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const cors = require("cors");

const {UserRepository} = require("./src/repositories/UserRepository");
const {
  NotificationsRepository,
} = require("./src/repositories/NotificationsRepository");
const {ModerationService} = require("./src/services/ModerationService");

admin.initializeApp();

const corsHandler = cors({
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://mi-app-auth-1c0a7.web.app",
    "https://mi-app-auth-1c0a7.firebaseapp.com",
  ],
  credentials: true,
});

setGlobalOptions({maxInstances: 10});

exports.subscribeToTopic = onRequest((request, response) =>
  corsHandler(request, response, async () => {
    if (request.method !== "POST") {
      response.status(405).send("Method Not Allowed");
      return;
    }

    const {topic, userId} = request.body;

    if (!topic || !userId) {
      response.status(400).send("Bad Request: Missing topic or userId");
      return;
    }

    try {
      const userRepository = new UserRepository(admin.firestore());
      const userProfile = await userRepository.getProfileById(userId);

      if (!userProfile) {
        response.status(404).send("Not Found: User profile not found");
        return;
      }

      if (
        !userProfile.notificationTokens ||
        userProfile.notificationTokens.length === 0
      ) {
        response
            .status(400)
            .send("Bad Request: No notification tokens found for user");
        return;
      }

      await userRepository.subscribeToTopic(userProfile, topic);
      logger.info(`Successfully subscribed user ${userId} to topic ${topic}`);

      response.status(200).send({success: true});
    } catch (error) {
      logger.error("Error subscribing to topic:", error);
      response
          .status(500)
          .send("Internal Server Error: Failed to subscribe to topic");
    }
  }),
);

exports.sendMessageToTopic = onRequest((request, response) =>
  corsHandler(request, response, async () => {
    if (request.method !== "POST") {
      response.status(405).send("Method Not Allowed");
      return;
    }

    const {topic, title, body} = request.body;

    if (!topic || !title || !body) {
      response.status(400).send("Bad Request: Missing topic, title, or body");
      return;
    }

    try {
      const notificationsRepository = new NotificationsRepository();
      const result = await notificationsRepository.sendMessageToTopic(
          topic,
          title,
          body,
      );

      logger.info("Message sent successfully:", result);
      response.status(200).send({success: true});
    } catch (error) {
      logger.error("Error sending message:", error);
      response
          .status(500)
          .send("Internal Server Error: Failed to send message");
    }
  }),
);

exports.notifyNewPost = onRequest((request, response) =>
  corsHandler(request, response, async () => {
    if (request.method !== "POST") {
      response.status(405).send("Method Not Allowed");
      return;
    }

    const {authorName, postTitle, authorId} = request.body;

    if (!authorName || !postTitle || !authorId) {
      response.status(400).send("Bad Request: Missing required fields");
      return;
    }

    try {
      const userRepository = new UserRepository(admin.firestore());
      const notificationsRepository = new NotificationsRepository();

      const allUsers = await userRepository.getAllUsersExcept(authorId);

      for (const user of allUsers) {
        if (user.notificationTokens && user.notificationTokens.length > 0) {
          await notificationsRepository.sendMessageToUser(
              user.notificationTokens,
              "Nueva publicación",
              `${authorName} ha publicado: "${postTitle}"`,
          );
        }
      }

      logger.info(`Notifications sent for new post by ${authorName}`);
      response.status(200).send({success: true});
    } catch (error) {
      logger.error("Error sending new post notifications:", error);
      response
          .status(500)
          .send("Internal Server Error: Failed to send notifications");
    }
  }),
);

exports.handlePostReaction = onRequest((request, response) =>
  corsHandler(request, response, async () => {
    if (request.method !== "POST") {
      response.status(405).send("Method Not Allowed");
      return;
    }

    const {postId, userId, userName, reaction, postTitle, postOwnerId} =
      request.body;

    if (!postId || !userId || !userName || !reaction || !postOwnerId) {
      response.status(400).send("Bad Request: Missing required fields");
      return;
    }

    if (reaction !== "like" && reaction !== "dislike") {
      response.status(400).send("Bad Request: Invalid reaction type");
      return;
    }

    try {
      const db = admin.firestore();
      const postRef = db.collection("posts").doc(postId);
      const userRepository = new UserRepository(db);
      const notificationsRepository = new NotificationsRepository();

      const reactionField = reaction === "like" ? "likes" : "dislikes";
      const oppositeField = reaction === "like" ? "dislikes" : "likes";

      await db.runTransaction(async (transaction) => {
        const postDoc = await transaction.get(postRef);
        if (!postDoc.exists) {
          throw new Error("Post not found");
        }

        const postData = postDoc.data();
        const currentLikes = postData.likes || [];
        const currentDislikes = postData.dislikes || [];

        const newOppositeReactions = (
          reaction === "like" ? currentDislikes : currentLikes
        ).filter((id) => id !== userId);

        const currentReactions =
          reaction === "like" ? currentLikes : currentDislikes;
        const hasReacted = currentReactions.includes(userId);

        let newReactions;
        if (hasReacted) {
          newReactions = currentReactions.filter((id) => id !== userId);
        } else {
          newReactions = [...currentReactions, userId];
        }

        const updates = {
          [reactionField]: newReactions,
          [oppositeField]: newOppositeReactions,
          updatedAt: new Date().toISOString(),
        };

        transaction.update(postRef, updates);
      });

      if (userId !== postOwnerId) {
        const postOwner = await userRepository.getProfileById(postOwnerId);

        if (
          postOwner &&
          postOwner.notificationTokens &&
          postOwner.notificationTokens.length > 0
        ) {
          const reactionText =
            reaction === "like" ? "👍 le gustó" : "👎 no le gustó";
          await notificationsRepository.sendMessageToUser(
              postOwner.notificationTokens,
              "Reacción a tu publicación",
              `A ${userName} ${reactionText} tu post: "${
                postTitle || "tu publicación"
              }"`,
          );
        }
      }

      logger.info(`User ${userId} ${reaction}d post ${postId}`);
      response.status(200).send({success: true});
    } catch (error) {
      logger.error("Error handling post reaction:", error);
      response
          .status(500)
          .send("Internal Server Error: Failed to handle reaction");
    }
  }),
);

exports.moderatePost = onRequest((request, response) =>
  corsHandler(request, response, async () => {
    if (request.method !== "POST") {
      response.status(405).send("Method Not Allowed");
      return;
    }

    const {title, content} = request.body;

    if (!title || !content) {
      response.status(400).send("Bad Request: Missing title or content");
      return;
    }

    try {
      const moderationService = new ModerationService();

      const moderatedContent = {
        title: moderationService.moderateText(title),
        content: moderationService.moderateText(content),
        hasInappropriateContent: moderationService.hasInappropriateContent(
            title + " " + content,
        ),
      };

      logger.info("Content moderated successfully");
      response.status(200).send(moderatedContent);
    } catch (error) {
      logger.error("Error moderating content:", error);
      response
          .status(500)
          .send("Internal Server Error: Failed to moderate content");
    }
  }),
);

exports.onPostCreated = onDocumentCreated("posts/{postId}", async (event) => {
  try {
    const postData = event.data.data();
    const {userDisplayName, title, userId} = postData;

    logger.info("New post created:", {userDisplayName, title, userId});

    const userRepository = new UserRepository(admin.firestore());
    const notificationsRepository = new NotificationsRepository();

    const allUsers = await userRepository.getAllUsersExcept(userId);

    for (const user of allUsers) {
      if (user.notificationTokens && user.notificationTokens.length > 0) {
        await notificationsRepository.sendMessageToUser(
            user.notificationTokens,
            "Nueva publicación",
            `${userDisplayName} ha publicado: "${title}"`,
        );
      }
    }

    logger.info(`Auto-notifications sent for new post by ${userDisplayName}`);
  } catch (error) {
    logger.error("Error in onPostCreated trigger:", error);
  }
});

exports.onPostUpdated = onDocumentUpdated("posts/{postId}", async (event) => {
  try {
    const before = event.data.before.data();
    const after = event.data.after.data();

    if (before.content !== after.content || before.title !== after.title) {
      const moderationService = new ModerationService();
      const db = admin.firestore();
      const postRef = db.collection("posts").doc(event.params.postId);

      const moderatedTitle = moderationService.moderateText(after.title);
      const moderatedContent = moderationService.moderateText(after.content);

      if (
        moderatedTitle !== after.title ||
        moderatedContent !== after.content
      ) {
        await postRef.update({
          title: moderatedTitle,
          content: moderatedContent,
          moderated: true,
          moderatedAt: new Date().toISOString(),
        });

        logger.info(`Post ${event.params.postId} auto-moderated`);
      }
    }
  } catch (error) {
    logger.error("Error in auto-moderation:", error);
  }
});

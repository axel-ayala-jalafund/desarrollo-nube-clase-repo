const { setGlobalOptions } = require("firebase-functions");
const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const cors = require("cors");

const { UserRepository } = require("./src/repositories/UserRepository");
const {
  NotificationsRepository,
} = require("./src/repositories/NotificationsRepository");

admin.initializeApp();

const corsHandler = cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true,
});

setGlobalOptions({ maxInstances: 10 });

exports.subscribeToTopic = onRequest((request, response) =>
  corsHandler(request, response, async () => {
    if (request.method !== "POST") {
      response.status(405).send("Method Not Allowed");
      return;
    }

    const { topic, userId } = request.body;

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

      response.status(200).send({ success: true });
    } catch (error) {
      logger.error("Error subscribing to topic:", error);
      response
        .status(500)
        .send("Internal Server Error: Failed to subscribe to topic");
    }
  })
);

exports.sendMessageToTopic = onRequest((request, response) =>
  corsHandler(request, response, async () => {
    if (request.method !== "POST") {
      response.status(405).send("Method Not Allowed");
      return;
    }

    const { topic, title, body } = request.body;

    if (!topic || !title || !body) {
      response.status(400).send("Bad Request: Missing topic, title, or body");
      return;
    }

    try {
      const notificationsRepository = new NotificationsRepository();
      const result = await notificationsRepository.sendMessageToTopic(
        topic,
        title,
        body
      );

      logger.info("Message sent successfully:", result);
      response.status(200).send({ success: true });
    } catch (error) {
      logger.error("Error sending message:", error);
      response
        .status(500)
        .send("Internal Server Error: Failed to send message");
    }
  })
);

exports.notifyNewPost = onRequest((request, response) =>
  corsHandler(request, response, async () => {
    if (request.method !== "POST") {
      response.status(405).send("Method Not Allowed");
      return;
    }

    const { authorName, postTitle, authorId } = request.body;

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
            `${authorName} ha publicado: "${postTitle}"`
          );
        }
      }

      logger.info(`Notifications sent for new post by ${authorName}`);
      response.status(200).send({ success: true });
    } catch (error) {
      logger.error("Error sending new post notifications:", error);
      response
        .status(500)
        .send("Internal Server Error: Failed to send notifications");
    }
  })
);

exports.onPostCreated = onDocumentCreated("posts/{postId}", async (event) => {
  try {
    const postData = event.data.data();
    const { userDisplayName, title, userId } = postData;

    logger.info("New post created:", { userDisplayName, title, userId });

    const userRepository = new UserRepository(admin.firestore());
    const notificationsRepository = new NotificationsRepository();

    const allUsers = await userRepository.getAllUsersExcept(userId);

    for (const user of allUsers) {
      if (user.notificationTokens && user.notificationTokens.length > 0) {
        await notificationsRepository.sendMessageToUser(
          user.notificationTokens,
          "Nueva publicación",
          `${userDisplayName} ha publicado: "${title}"`
        );
      }
    }

    logger.info(`Auto-notifications sent for new post by ${userDisplayName}`);
  } catch (error) {
    logger.error("Error in onPostCreated trigger:", error);
  }
});

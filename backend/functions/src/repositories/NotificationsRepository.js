const {getMessaging} = require("firebase-admin/messaging");

class NotificationsRepository {
  async sendMessageToTopic(topic, title, body) {
    try {
      const payload = {
        topic: topic,
        notification: {
          title: title,
          body: body,
        },
        data: {
          type: "post_notification",
          timestamp: new Date().toISOString(),
        },
      };

      const response = await getMessaging().send(payload);
      console.log("Message sent successfully to topic:", response);
      return response;
    } catch (error) {
      console.error("Error sending message to topic:", error);
      throw error;
    }
  }

  async sendMessageToUser(tokens, title, body) {
    try {
      if (!tokens || tokens.length === 0) {
        console.warn("No tokens provided for sending message");
        return {successCount: 0, failureCount: 0};
      }

      const payload = {
        tokens: tokens,
        notification: {
          title: title,
          body: body,
        },
        data: {
          type: "post_notification",
          timestamp: new Date().toISOString(),
        },
      };

      const response = await getMessaging().sendEachForMulticast(payload);
      console.log(
          `Message sent successfully to ${response.successCount} tokens`,
      );

      if (response.failureCount > 0) {
        console.warn(`Failed to send to ${response.failureCount} tokens`);
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            console.warn(`Token ${idx} failed:`, resp.error);
          }
        });
      }

      return response;
    } catch (error) {
      console.error("Error sending message to user:", error);
      throw error;
    }
  }

  async sendWelcomeNotification(tokens, userName) {
    try {
      await this.sendMessageToUser(
          tokens,
          "¡Bienvenido!",
          `Hola ${userName}, bienvenido a nuestra red social. ¡Comienza a compartir tus publicaciones!`,
      );
    } catch (error) {
      console.error("Error sending welcome notification:", error);
      throw error;
    }
  }
}

module.exports = {NotificationsRepository};

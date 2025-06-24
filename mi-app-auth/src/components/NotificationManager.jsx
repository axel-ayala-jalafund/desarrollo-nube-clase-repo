import { Box } from "@mui/material";
import { useNotifications } from "../hooks/useNotifications";
import NotificationPopup from "./NotificationPopup";

const NotificationManager = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <Box
      sx={{
        position: "fixed",
        top: 80,
        right: 16,
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      {notifications.slice(0, 3).map((notification, index) => (
        <Box
          key={notification.id}
          sx={{
            mb: 1,
            transform: `translateY(${index * 10}px)`,
            opacity: 1 - index * 0.2,
            pointerEvents: "auto",
          }}
        >
          <NotificationPopup
            notification={notification}
            open={true}
            onClose={() => removeNotification(notification.id)}
          />
        </Box>
      ))}
    </Box>
  );
};

export default NotificationManager;

import {
  Snackbar,
  Alert,
  AlertTitle,
  Box,
  Typography,
  Avatar,
  IconButton,
  Slide,
} from "@mui/material";
import { Close, Article } from "@mui/icons-material";

const SlideTransition = (props) => {
  return <Slide {...props} direction="down" />;
};

const NotificationPopup = ({ notification, open, onClose }) => {
  if (!notification) return null;

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={5000}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      TransitionComponent={SlideTransition}
      sx={{ mt: 8 }} 
    >
      <Alert
        severity="info"
        variant="filled"
        sx={{
          minWidth: "350px",
          maxWidth: "400px",
          backgroundColor: "#1976d2",
          color: "white",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          border: "1px solid rgba(255,255,255,0.2)",
          "& .MuiAlert-icon": {
            color: "white",
          },
        }}
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={onClose}
          >
            <Close fontSize="inherit" />
          </IconButton>
        }
      >
        <AlertTitle sx={{ mb: 1, fontSize: "0.9rem", fontWeight: "bold" }}>
          Nueva Publicación
        </AlertTitle>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {notification.imageURL ? (
            <Avatar
              src={notification.imageURL}
              sx={{
                width: 40,
                height: 40,
                border: "2px solid rgba(255,255,255,0.3)",
              }}
            />
          ) : (
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: "rgba(255,255,255,0.2)",
                border: "2px solid rgba(255,255,255,0.3)",
              }}
            >
              <Article />
            </Avatar>
          )}

          {/* COntent of popup */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: "bold",
                mb: 0.5,
                color: "white",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {notification.authorName}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: "rgba(255,255,255,0.9)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                mb: 0.5,
              }}
            >
              "{notification.title}"
            </Typography>

            {notification.createdAt && (
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: "0.75rem",
                }}
              >
                {formatTime(notification.createdAt)}
              </Typography>
            )}
          </Box>
        </Box>
      </Alert>
    </Snackbar>
  );
};

export default NotificationPopup;

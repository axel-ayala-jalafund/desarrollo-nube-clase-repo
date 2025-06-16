import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  Chip,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";

const PostCard = ({ post, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card elevation={2} sx={{ mb: 2 }}>
      <CardContent>
        {/* Post header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" component="h3" gutterBottom>
              {post.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDate(post.createdAt)}
              {post.updatedAt !== post.createdAt && " (editado)"}
            </Typography>
          </Box>

          {/* ACtions */}
          <Box>
            <IconButton onClick={() => onEdit(post)} size="small">
              <Edit />
            </IconButton>
            <IconButton
              onClick={() => onDelete(post.id)}
              size="small"
              color="error"
            >
              <Delete />
            </IconButton>
          </Box>
        </Box>

        {/* Post content */}
        <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", mb: 2 }}>
          {post.content}
        </Typography>

        {/* Autor */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Chip
            label={`Por: ${post.userDisplayName}`}
            size="small"
            variant="outlined"
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default PostCard;

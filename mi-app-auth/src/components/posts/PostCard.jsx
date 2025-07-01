import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Box,
  Chip,
  Divider,
} from "@mui/material";
import {
  Edit,
  Delete,
  ThumbUp,
  ThumbDown,
  ThumbUpOutlined,
  ThumbDownOutlined,
} from "@mui/icons-material";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

const PostCard = ({ post, onEdit, onDelete, onReaction, canEdit }) => {
  const [reactionLoading, setReactionLoading] = useState(false);
  const { user } = useAuth();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const showEditActions = canEdit ? canEdit(post) : false;

  // Here we will verify if user already reacted to post
  const userLiked = post.likes && post.likes.includes(user?.uid);
  const userDisliked = post.dislikes && post.dislikes.includes(user?.uid);

  // Count reactions
  const likesCount = post.likes ? post.likes.length : 0;
  const dislikesCount = post.dislikes ? post.dislikes.length : 0;

  const handleReaction = async (reaction) => {
    if (!user || reactionLoading) return;

    setReactionLoading(true);
    try {
      await onReaction(post.id, reaction, post);
    } catch (error) {
      console.error("Error handling reaction:", error);
    }
    setReactionLoading(false);
  };

  return (
    <Card elevation={2} sx={{ mb: 2 }}>
      {post.imageURL && (
        <CardMedia
          component="img"
          height="300"
          image={post.imageURL}
          alt={post.title}
          sx={{ objectFit: "cover" }}
        />
      )}

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
              {post.moderated && (
                <Chip
                  label="Moderado"
                  size="small"
                  color="warning"
                  sx={{ ml: 1 }}
                />
              )}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDate(post.createdAt)}
              {post.updatedAt !== post.createdAt && " (editado)"}
            </Typography>
          </Box>

          {/* Shows only if user can edit */}
          {showEditActions && (
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
          )}
        </Box>

        {/* Post content */}
        <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", mb: 2 }}>
          {post.content}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Reactions */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", gap: 1 }}>
            {/* Boton Like */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <IconButton
                onClick={() => handleReaction("like")}
                disabled={reactionLoading}
                color={userLiked ? "primary" : "default"}
                size="small"
              >
                {userLiked ? <ThumbUp /> : <ThumbUpOutlined />}
              </IconButton>
              <Typography variant="body2" color="text.secondary">
                {likesCount}
              </Typography>
            </Box>

            {/* Boton Dislike */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <IconButton
                onClick={() => handleReaction("dislike")}
                disabled={reactionLoading}
                color={userDisliked ? "error" : "default"}
                size="small"
              >
                {userDisliked ? <ThumbDown /> : <ThumbDownOutlined />}
              </IconButton>
              <Typography variant="body2" color="text.secondary">
                {dislikesCount}
              </Typography>
            </Box>
          </Box>

          {/* Autor */}
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

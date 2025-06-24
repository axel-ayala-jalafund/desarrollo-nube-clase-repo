import { Box, Typography, CircularProgress, Alert } from "@mui/material";
import PostCard from "./PostCard";

const PostList = ({ posts, loading, error, onEdit, onDelete, canEdit }) => {
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (posts.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No hay publicaciones
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Publica presionando el boton de arriba
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onEdit={onEdit}
          onDelete={onDelete}
          canEdit={canEdit} 
        />
      ))}
    </Box>
  );
};

export default PostList;

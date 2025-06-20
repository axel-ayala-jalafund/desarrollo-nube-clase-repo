import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Button,
  AppBar,
  Toolbar,
  IconButton,
} from "@mui/material";
import { Add, ArrowBack } from "@mui/icons-material";
import { usePosts } from "../hooks/usePosts";
import PostForm from "../components/posts/PostForm";
import PostList from "../components/posts/PostList";

const PostsPage = () => {
  const [postFormOpen, setPostFormOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const navigate = useNavigate();
  const { posts, loading, error, createPost, updatePost, deletePost } =
    usePosts();

  const handleCreatePost = async (postData, imageFile) => {
    setFormLoading(true);
    const success = await createPost(postData, imageFile); 

    if (success) {
      setPostFormOpen(false);
      setSelectedPost(null);
    }

    setFormLoading(false);
  };

  const handleEditPost = async (postData, imageFile) => {
    setFormLoading(true);
    const success = await updatePost(selectedPost.id, postData, imageFile);

    if (success) {
      setPostFormOpen(false);
      setSelectedPost(null);
    }

    setFormLoading(false);
  };

  const handleDeletePost = async (postId) => {
    if (confirm("¿Estás seguro de eliminar esta publicación?")) {
      await deletePost(postId);
    }
  };

  const openCreateForm = () => {
    setSelectedPost(null);
    setPostFormOpen(true);
  };

  const openEditForm = (post) => {
    setSelectedPost(post);
    setPostFormOpen(true);
  };

  const closeForm = () => {
    setPostFormOpen(false);
    setSelectedPost(null);
  };

  return (
    <>
      {/* Navbar */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate("/")}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>

          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Mis Publicaciones
          </Typography>

          <Button color="inherit" startIcon={<Add />} onClick={openCreateForm}>
            Nueva Publicación
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main content */}
      <Container maxWidth="md" sx={{ py: 4 }}>
        <PostList
          posts={posts}
          loading={loading}
          error={error}
          onEdit={openEditForm}
          onDelete={handleDeletePost}
        />
      </Container>

      {/* Form to create posts */}
      <PostForm
        open={postFormOpen}
        onClose={closeForm}
        onSubmit={selectedPost ? handleEditPost : handleCreatePost}
        post={selectedPost}
        loading={formLoading}
        error={error}
      />
    </>
  );
};

export default PostsPage;

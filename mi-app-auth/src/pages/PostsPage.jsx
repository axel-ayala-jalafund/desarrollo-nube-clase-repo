import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Box,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { Add, ArrowBack, Person, People } from "@mui/icons-material";
import { usePosts } from "../hooks/usePosts";
import { useAuth } from "../hooks/useAuth";
import PostForm from "../components/posts/PostForm";
import PostList from "../components/posts/PostList";
import NotificationManager from "../components/NotificationManager";

const PostsPage = () => {
  const [postFormOpen, setPostFormOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [viewMode, setViewMode] = useState("mine");

  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    posts,
    loading,
    error,
    createPost,
    updatePost,
    deletePost,
    loadPosts,
    loadAllPosts,
  } = usePosts();

  const handleCreatePost = async (postData, imageFile) => {
    setFormLoading(true);
    const success = await createPost(postData, imageFile);

    if (success) {
      setPostFormOpen(false);
      setSelectedPost(null);
      if (viewMode === "mine") {
        loadPosts();
      } else {
        loadAllPosts();
      }
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

  const handleViewModeChange = (event, newViewMode) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
      if (newViewMode === "mine") {
        loadPosts();
      } else {
        loadAllPosts();
      }
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

  const canEditPost = (post) => {
    return post.userId === user?.uid;
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
            {viewMode === "mine"
              ? "Mis Publicaciones"
              : "Todas las Publicaciones"}
          </Typography>

          <Button color="inherit" startIcon={<Add />} onClick={openCreateForm}>
            Nueva Publicación
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main content */}
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Toggle to change views */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            aria-label="modo de vista"
          >
            <ToggleButton value="mine" aria-label="mis publicaciones">
              <Person sx={{ mr: 1 }} />
              Mis Publicaciones
            </ToggleButton>
            <ToggleButton value="all" aria-label="todas las publicaciones">
              <People sx={{ mr: 1 }} />
              Todas las Publicaciones
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <PostList
          posts={posts}
          loading={loading}
          error={error}
          onEdit={openEditForm}
          onDelete={handleDeletePost}
          canEdit={canEditPost}
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

      {user && <NotificationManager />}
    </>
  );
};

export default PostsPage;

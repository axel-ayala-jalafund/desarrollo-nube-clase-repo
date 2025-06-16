import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";

const PostForm = ({
  open,
  onClose,
  onSubmit,
  post = null,
  loading = false,
  error = null,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });

  useEffect(() => {
    if (open) {
      if (post) {
        setFormData({
          title: post.title || "",
          content: post.content || "",
        });
      } else {
        setFormData({
          title: "",
          content: "",
        });
      }
    }
  }, [open, post]);

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      return;
    }

    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {post ? "Editar Publicación" : "Nueva Publicación"}
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="Título"
              value={formData.title}
              onChange={handleChange("title")}
              required
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Contenido"
              value={formData.content}
              onChange={handleChange("content")}
              multiline
              rows={4}
              required
              disabled={loading}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={
              loading || !formData.title.trim() || !formData.content.trim()
            }
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? "Guardando..." : post ? "Actualizar" : "Publicar"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PostForm;

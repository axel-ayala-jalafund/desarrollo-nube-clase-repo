import { useState, useEffect, useRef } from "react";
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
  IconButton,
  Typography,
} from "@mui/material";
import { PhotoCamera, Delete } from "@mui/icons-material";

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
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (open) {
      if (post) {
        setFormData({
          title: post.title || "",
          content: post.content || "",
        });
        setImagePreview(post.imageURL || null);
        setSelectedImage(null);
      } else {
        setFormData({
          title: "",
          content: "",
        });
        setImagePreview(null);
        setSelectedImage(null);
      }
    }
  }, [open, post]);

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];

    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Por favor selecciona solo archivos de imagen");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen debe ser menor a 5MB");
        return;
      }

      setSelectedImage(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(post?.imageURL || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      return;
    }

    onSubmit(formData, selectedImage);
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

            <Box sx={{ border: "1px dashed #ccc", borderRadius: 1, p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Imagen (opcional)
              </Typography>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: "none" }}
                ref={fileInputRef}
                disabled={loading}
              />

              {/* Image prev */}
              {imagePreview && (
                <Box sx={{ mb: 2, position: "relative" }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      width: "100%",
                      maxHeight: 200,
                      objectFit: "cover",
                      borderRadius: 4,
                    }}
                  />
                  <IconButton
                    onClick={handleRemoveImage}
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      backgroundColor: "rgba(0,0,0,0.5)",
                      color: "white",
                      "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" },
                    }}
                    size="small"
                    disabled={loading}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              )}

              <Button
                startIcon={<PhotoCamera />}
                onClick={() => fileInputRef.current?.click()}
                variant={imagePreview ? "outlined" : "contained"}
                disabled={loading}
              >
                {imagePreview ? "Cambiar Imagen" : "Seleccionar Imagen"}
              </Button>
            </Box>
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

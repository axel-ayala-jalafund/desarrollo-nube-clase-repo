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
import { useContacts } from "../hooks/useContacts";

const ContactForm = ({ open, onClose, contact = null }) => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    birthDate: "",
    age: "",
  });
  const [saving, setSaving] = useState(false);

  const { addContact, updateContact, error } = useContacts();

  useEffect(() => {
    if (open) {
      if (contact) {
        setFormData({
          name: contact.name || "",
          address: contact.address || "",
          birthDate: contact.birthDate || "",
          age: contact.age || "",
        });
      } else {
        setFormData({
          name: "",
          address: "",
          birthDate: "",
          age: "",
        });
      }
    }
  }, [open, contact]);

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));

    if (field === "birthDate" && event.target.value) {
      const birthDate = new Date(event.target.value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        setFormData((prev) => ({ ...prev, age: (age - 1).toString() }));
      } else {
        setFormData((prev) => ({ ...prev, age: age.toString() }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    let success;
    if (contact) {
      success = await updateContact(contact.id, formData);
    } else {
      success = await addContact(formData);
    }

    if (success) {
      onClose();
      window.location.reload();
    }

    setSaving(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {contact ? "Editar Contacto" : "Agregar Contacto"}
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
              label="Nombre"
              value={formData.name}
              onChange={handleChange("name")}
              required
            />

            <TextField
              fullWidth
              label="Dirección"
              value={formData.address}
              onChange={handleChange("address")}
              multiline
              rows={2}
            />

            <TextField
              fullWidth
              label="Fecha de Nacimiento"
              type="date"
              value={formData.birthDate}
              onChange={handleChange("birthDate")}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              fullWidth
              label="Edad"
              value={formData.age}
              onChange={handleChange("age")}
              type="number"
              helperText="Se calcula automáticamente"
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            startIcon={saving && <CircularProgress size={20} />}
          >
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ContactForm;

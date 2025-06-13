import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import { useContacts } from "../hooks/useContacts";
import ContactForm from "./ContactForm";

const ContactList = () => {
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  const { contacts, loading, error, deleteContact } = useContacts();

  const handleEdit = (contact) => {
    setSelectedContact(contact);
    setContactFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedContact(null);
    setContactFormOpen(true);
  };

  const handleDelete = async (contactId) => {
    if (confirm("¿Estás seguro de eliminar este contacto?")) {
      const success = await deleteContact(contactId);
      if (success) {
        window.location.reload();
      }
    }
  };

  const handleCloseForm = () => {
    setContactFormOpen(false);
    setSelectedContact(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">Mis Contactos</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>
          Agregar Contacto
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {contacts.length === 0 ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center", py: 4 }}
        >
          No tienes contactos guardados
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Dirección</TableCell>
                <TableCell>Fecha Nacimiento</TableCell>
                <TableCell>Edad</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>{contact.name}</TableCell>
                  <TableCell>{contact.address || "-"}</TableCell>
                  <TableCell>
                    {contact.birthDate
                      ? new Date(contact.birthDate).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {contact.age ? `${contact.age} años` : "-"}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleEdit(contact)}
                      size="small"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(contact.id)}
                      size="small"
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <ContactForm
        open={contactFormOpen}
        onClose={handleCloseForm}
        contact={selectedContact}
      />
    </Box>
  );
};

export default ContactList;

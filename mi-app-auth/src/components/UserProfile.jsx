import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  Alert,
  Chip,
  Stack,
  Divider,
  Grid,
  CircularProgress,
} from "@mui/material";
import {
  Google,
  Facebook,
  Email,
  Link,
  Logout,
  Edit,
  LocationOn,
  Cake,
  Person,
} from "@mui/icons-material";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useProfile } from "../hooks/useProfile";
import ProfileForm from "./ProfileForm";
import ContactList from "./ContactList";

const UserProfile = () => {
  const [profileFormOpen, setProfileFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    user,
    logout,
    linkWithGoogle,
    linkWithFacebook,
    getLinkedProviders,
    error: authError,
  } = useAuth();

  const {
    profile,
    loading: profileLoading,
    error: profileError,
  } = useProfile();

  const linkedProviders = getLinkedProviders();

  const handleLinkProvider = async (provider) => {
    setLoading(true);
    try {
      if (provider === "google") {
        await linkWithGoogle();
      } else if (provider === "facebook") {
        await linkWithFacebook();
      }
    } catch (error) {
      console.error("Error linking provider:", error);
    }
    setLoading(false);
  };

  const isProviderLinked = (providerId) => {
    return linkedProviders.some(
      (provider) => provider.providerId === providerId
    );
  };

  const getProviderIcon = (providerId) => {
    switch (providerId) {
      case "google.com":
        return <Google />;
      case "facebook.com":
        return <Facebook />;
      case "password":
        return <Email />;
      default:
        return <Email />;
    }
  };

  const getProviderName = (providerId) => {
    switch (providerId) {
      case "google.com":
        return "Google";
      case "facebook.com":
        return "Facebook";
      case "password":
        return "Email";
      default:
        return providerId;
    }
  };

  if (profileLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", mt: 4, p: 2 }}>
      <Card elevation={3}>
        <CardContent>
          {/* Here's basic profile information */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <Avatar src={user?.photoURL} sx={{ width: 80, height: 80, mr: 3 }}>
              {(profile?.displayName || user?.displayName)?.[0] ||
                user?.email?.[0] ||
                "U"}
            </Avatar>

            <Box sx={{ flex: 1 }}>
              <Typography variant="h4">
                {profile?.displayName || user?.displayName || "Usuario"}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                {user?.email}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => setProfileFormOpen(true)}
                size="small"
              >
                Editar Perfil
              </Button>
            </Box>
          </Box>

          {(authError || profileError) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {authError || profileError}
            </Alert>
          )}

          {/* Aditional info */}
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" gutterBottom>
            Información Personal
          </Typography>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LocationOn color="action" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Dirección
                  </Typography>
                  <Typography variant="body1">
                    {profile?.address || "No especificada"}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Cake color="action" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Fecha de Nacimiento
                  </Typography>
                  <Typography variant="body1">
                    {profile?.birthDate
                      ? new Date(profile.birthDate).toLocaleDateString()
                      : "No especificada"}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Person color="action" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Edad
                  </Typography>
                  <Typography variant="body1">
                    {profile?.age ? `${profile.age} años` : "No especificada"}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Connected suppliers */}
          <Typography variant="h6" gutterBottom>
            Proveedores Conectados
          </Typography>

          <Stack spacing={1} sx={{ mb: 3 }}>
            {linkedProviders.map((provider, index) => (
              <Chip
                key={index}
                icon={getProviderIcon(provider.providerId)}
                label={`${getProviderName(provider.providerId)} - ${
                  provider.email
                }`}
                variant="outlined"
                color="primary"
              />
            ))}
          </Stack>

          <Typography variant="h6" gutterBottom>
            Conectar Más Proveedores
          </Typography>

          <Stack spacing={1} sx={{ mb: 3 }}>
            {!isProviderLinked("google.com") && (
              <Button
                variant="outlined"
                startIcon={<Google />}
                endIcon={<Link />}
                onClick={() => handleLinkProvider("google")}
                disabled={loading}
                sx={{
                  justifyContent: "flex-start",
                  color: "#db4437",
                  borderColor: "#db4437",
                }}
              >
                Conectar Google
              </Button>
            )}

            {!isProviderLinked("facebook.com") && (
              <Button
                variant="outlined"
                startIcon={<Facebook />}
                endIcon={<Link />}
                onClick={() => handleLinkProvider("facebook")}
                disabled={loading}
                sx={{
                  justifyContent: "flex-start",
                  color: "#4267B2",
                  borderColor: "#4267B2",
                }}
              >
                Conectar Facebook
              </Button>
            )}
          </Stack>

          {/* List of contacts for profile*/}
          <ContactList />

          <Divider sx={{ my: 2 }} />

          <Button
            variant="contained"
            color="error"
            startIcon={<Logout />}
            onClick={logout}
            fullWidth
          >
            Cerrar Sesión
          </Button>
        </CardContent>
      </Card>

      <ProfileForm
        open={profileFormOpen}
        onClose={() => setProfileFormOpen(false)}
      />
    </Box>
  );
};

export default UserProfile;

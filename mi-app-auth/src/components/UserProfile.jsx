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
} from "@mui/material";
import { Google, Facebook, Email, Link, Logout } from "@mui/icons-material";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

const UserProfile = () => {
  const {
    user,
    logout,
    linkWithGoogle,
    linkWithFacebook,
    getLinkedProviders,
    error,
  } = useAuth();

  const [loading, setLoading] = useState(false);
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

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4, p: 2 }}>
      <Card elevation={3}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <Avatar src={user?.photoURL} sx={{ width: 60, height: 60, mr: 2 }}>
              {user?.displayName?.[0] || user?.email?.[0] || "U"}
            </Avatar>
            <Box>
              <Typography variant="h5">
                {user?.displayName || "Usuario"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Divider sx={{ my: 2 }} />

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
    </Box>
  );
};

export default UserProfile;

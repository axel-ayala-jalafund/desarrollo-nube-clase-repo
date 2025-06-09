import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Divider,
  Paper,
} from "@mui/material";
import { Google, Facebook, Email } from "@mui/icons-material";
import { useAuth } from "../hooks/useAuth";

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithFacebook,
    error,
  } = useAuth();

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, displayName);
      }
    } catch (error) {
      console.error("Error:", error);
    }
    setLoading(false);
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Error:", error);
    }
    setLoading(false);
  };

  const handleFacebookAuth = async () => {
    setLoading(true);
    try {
      await signInWithFacebook();
    } catch (error) {
      console.error("Error:", error);
    }
    setLoading(false);
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: "auto", mt: 4 }}>
      <Typography variant="h5" component="h1" gutterBottom align="center">
        {isLogin ? "Iniciar Sesión" : "Registrarse"}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleEmailAuth} sx={{ mb: 3 }}>
        {!isLogin && (
          <TextField
            fullWidth
            label="Nombre"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            margin="normal"
            required
          />
        )}

        <TextField
          fullWidth
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          required
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading}
          startIcon={<Email />}
          sx={{ mt: 2 }}
        >
          {isLogin ? "Iniciar Sesión" : "Registrarse"}
        </Button>
      </Box>

      <Divider sx={{ mb: 2 }}>o</Divider>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Google />}
          onClick={handleGoogleAuth}
          disabled={loading}
          sx={{
            color: "#db4437",
            borderColor: "#db4437",
            "&:hover": {
              borderColor: "#db4437",
              backgroundColor: "rgba(219, 68, 55, 0.04)",
            },
          }}
        >
          Continuar con Google
        </Button>

        <Button
          fullWidth
          variant="outlined"
          startIcon={<Facebook />}
          onClick={handleFacebookAuth}
          disabled={loading}
          sx={{
            color: "#4267B2",
            borderColor: "#4267B2",
            "&:hover": {
              borderColor: "#4267B2",
              backgroundColor: "rgba(66, 103, 178, 0.04)",
            },
          }}
        >
          Continuar con Facebook
        </Button>
      </Box>

      <Box sx={{ mt: 2, textAlign: "center" }}>
        <Button
          variant="text"
          onClick={() => setIsLogin(!isLogin)}
          disabled={loading}
        >
          {isLogin
            ? "¿No tienes cuenta? Regístrate"
            : "¿Ya tienes cuenta? Inicia sesión"}
        </Button>
      </Box>
    </Paper>
  );
};

export default AuthForm;

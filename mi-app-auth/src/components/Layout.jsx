import { Box, CircularProgress, Container } from "@mui/material";
import { useAuth } from "../hooks/useAuth";
import AuthForm from "./AuthForm";
import UserProfile from "./UserProfile";
import NotificationManager from "./NotificationManager";

const Layout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      {user ? <UserProfile /> : <AuthForm />}

      {/* Only if user is logged */}
      {user && <NotificationManager />}
    </Container>
  );
};

export default Layout;

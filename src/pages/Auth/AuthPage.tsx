import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const AuthPage: React.FC = () => {
  const { user, loading, signUp, signIn, signOut } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) setError(error.message);
      } else {
        const { error } = await signUp(email, password);
        if (error) setError(error.message);
      }
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setPending(false);
    }
  };

  const handleLogout = async () => {
    setPending(true);
    setError(null);
    try {
      await signOut();
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setPending(false);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
      <Paper sx={{ p: 4, minWidth: 320 }}>
        <Typography variant="h4" gutterBottom>
          Authentication
        </Typography>
        {user ? (
          <>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Logged in as <b>{user.email}</b>
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleLogout}
              disabled={pending}
            >
              Log out
            </Button>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
              disabled={pending}
            >
              {isLogin ? "Log In" : "Sign Up"}
            </Button>
            <Button
              onClick={() => setIsLogin(!isLogin)}
              color="secondary"
              fullWidth
              sx={{ mt: 1 }}
            >
              {isLogin
                ? "Need an account? Sign Up"
                : "Already have an account? Log In"}
            </Button>
          </form>
        )}
      </Paper>
    </Box>
  );
};

export default AuthPage;

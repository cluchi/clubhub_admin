import React, { useEffect, useState } from "react";
import type { Database } from "../../types/supabase";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import { supabase } from "../../services/supabase";
import { useAuth } from "../../hooks/useAuth";

const EditClubPage: React.FC = () => {
  const { user } = useAuth();
  type Club = Database["public"]["Tables"]["clubs"]["Row"];
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    // Add more fields as needed
  });

  useEffect(() => {
    const fetchClub = async () => {
      setLoading(true);
      setError(null);
      setSuccess(null);
      // Find the user's club via club_members
      const { data: clubMemberRows, error: clubMemberError } = await supabase
        .from("club_members")
        .select("club_id")
        .eq("profile_id", user?.id)
        .limit(1)
        .maybeSingle();
      if (clubMemberError || !clubMemberRows || !clubMemberRows.club_id) {
        setError("No club membership found for your account.");
        setLoading(false);
        return;
      }
      const clubId = clubMemberRows.club_id;
      const { data, error } = await supabase
        .from("clubs")
        .select("*")
        .eq("id", clubId)
        .single();
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setClub(data);
      setForm({
        name: data.name || "",
        description: data.description || "",
      });
      setLoading(false);
    };
    if (user?.id) fetchClub();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    if (!club) return;
    const { error } = await supabase
      .from("clubs")
      .update({
        name: form.name,
        description: form.description,
      })
      .eq("id", club.id);
    if (error) {
      setError(error.message);
    } else {
      setSuccess("Club details updated successfully.");
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!club)
    return <Alert severity="info">No club found for your account.</Alert>;

  return (
    <Box maxWidth={500} mx="auto" mt={4}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" mb={2}>
          Edit Club Details
        </Typography>
        <TextField
          label="Club Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Description"
          name="description"
          value={form.description}
          onChange={handleChange}
          fullWidth
          margin="normal"
          multiline
          minRows={2}
        />
        {/* Add more fields as needed */}
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          sx={{ mt: 2 }}
        >
          Save Changes
        </Button>
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default EditClubPage;

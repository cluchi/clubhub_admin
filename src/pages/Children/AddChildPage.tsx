import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from "@mui/material";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../services/supabase";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import type { Parent, Club, Child } from "../../types";

const AddChildPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [parents, setParents] = useState<(Parent & { clubs: Club[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    date_of_birth: "",
    parent_id: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setSuccess(null);

      try {
        // Get user's club memberships
        const { data: clubMemberRows, error: clubMemberError } = await supabase
          .from("club_members")
          .select("club_id")
          .eq("profile_id", user?.id);
        if (clubMemberError) throw clubMemberError;

        const userClubIds = clubMemberRows.map((cm) => cm.club_id);

        // Get user's clubs
        const { data: allClubs, error: clubsError } = await supabase
          .from("clubs")
          .select("*");
        if (clubsError) throw clubsError;


        // Get parents with their clubs (only those in user's clubs)
        const { data: parentsData, error: parentsError } = await supabase
          .from("parents")
          .select("*");
        if (parentsError) throw parentsError;

        const { data: parentClubs, error: parentClubsError } = await supabase
          .from("parent_clubs")
          .select("parent_id, club_id");
        if (parentClubsError) throw parentClubsError;

        const clubMap = new Map(allClubs.map((club) => [club.id, club]));
        const parentClubMap = new Map<string, string[]>();

        parentClubs.forEach(({ parent_id, club_id }) => {
          if (!parentClubMap.has(parent_id)) {
            parentClubMap.set(parent_id, []);
          }
          parentClubMap.get(parent_id)!.push(club_id);
        });

        const parentsWithClubs = parentsData.map((parent) => ({
          ...parent,
          clubs: (parentClubMap.get(parent.id) || []).map(
            (clubId) => clubMap.get(clubId)!,
          ),
        }));

        // Filter parents to only those in user's clubs
        const filteredParents = parentsWithClubs.filter((parent) =>
          parent.clubs.some((club) => userClubIds.includes(club.id)),
        );

        setParents(filteredParents);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchData();
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      setError("Child name is required.");
      return false;
    }
    if (!form.parent_id) {
      setError("Please select a parent.");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    if (!validateForm()) return;

    try {
      const childData: Omit<Child, "id" | "created_at"> = {
        parent_id: form.parent_id,
        name: form.name.trim(),
        date_of_birth: form.date_of_birth || null,
      };

      const { error } = await supabase
        .from("children")
        .insert([childData])
        .select()
        .single();

      if (error) {
        setError("Failed to create child. Please try again.");
      } else {
        setSuccess("Child created successfully!");
        // Reset form
        setForm({
          name: "",
          date_of_birth: "",
          parent_id: "",
        });
      }
    } catch (err) {
      console.error("Error creating child:", err);
      setError("An error occurred while creating the child. Please try again.");
    }
  };

  if (loading) return <CircularProgress />;
  if (error && !success) return <Alert severity="error">{error}</Alert>;

  return (
    <Box maxWidth={600} mx="auto" mt={4}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/children")}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h5">Add New Child</Typography>
        </Box>

        <TextField
          label="Child Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Date of Birth (Optional)"
          name="date_of_birth"
          type="date"
          value={form.date_of_birth}
          onChange={handleChange}
          fullWidth
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
        />

        <FormControl fullWidth margin="normal" required>
          <InputLabel>Parent</InputLabel>
          <Select
            value={form.parent_id}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, parent_id: e.target.value }))
            }
            label="Parent"
          >
            {parents.map((parent) => (
              <MenuItem key={parent.id} value={parent.id}>
                <Box>
                  <Typography variant="subtitle1">{parent.name}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {parent.email}
                  </Typography>
                  <Box mt={1}>
                    {parent.clubs.map((club: Club) => (
                      <Chip
                        key={club.id}
                        label={club.name}
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {parents.length === 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            No parents found.{" "}
            <Button
              startIcon={<AddIcon />}
              onClick={() => navigate("/parents/add")}
              sx={{ p: 0, minWidth: "auto" }}
            >
              Add a parent first
            </Button>
            .
          </Alert>
        )}

        <Box display="flex" justifyContent="space-between" mt={3}>
          <Button variant="outlined" onClick={() => navigate("/children")}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={parents.length === 0}
          >
            Create Child
          </Button>
        </Box>

        {success && (
          <Alert severity="success" sx={{ mt: 3 }}>
            {success}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default AddChildPage;

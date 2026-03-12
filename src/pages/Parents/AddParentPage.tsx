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
  Checkbox,
  ListItemText,
  Chip,
} from "@mui/material";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../services/supabase";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import type { Club } from "../../types";

const AddParentPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userClubs, setUserClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    status: "Active",
    clubIds: [] as string[],
  });

  useEffect(() => {
    const fetchClubs = async () => {
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

        // Get all clubs
        const { data: allClubs, error: clubsError } = await supabase
          .from("clubs")
          .select("*");
        if (clubsError) throw clubsError;

        // Filter clubs to only those user has access to
        const userClubsData = allClubs.filter((club) =>
          userClubIds.includes(club.id),
        );

        setUserClubs(userClubsData);

        // Auto-select first club if user has only one club
        if (userClubsData.length === 1) {
          setForm((prev) => ({
            ...prev,
            clubIds: [userClubsData[0].id],
          }));
        }
      } catch (err) {
        console.error("Error fetching clubs:", err);
        setError("Failed to load clubs. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchClubs();
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleClubChange = (event: {
    target: { value: string | string[] };
  }) => {
    const {
      target: { value },
    } = event;
    setForm((prev) => ({
      ...prev,
      clubIds: typeof value === "string" ? value.split(",") : value,
    }));
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      setError("Name is required.");
      return false;
    }
    if (!form.email.trim()) {
      setError("Email is required.");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (form.clubIds.length === 0) {
      setError("Please select at least one club.");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    if (!validateForm()) return;

    try {
      const parentData = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        status: form.status,
      };

      const result = await import("../../services/api/parents");
      const createdParent = await result.createParentWithClubs(
        parentData,
        form.clubIds,
      );

      if (createdParent) {
        setSuccess("Parent created successfully!");
        // Reset form
        setForm({
          name: "",
          email: "",
          phone: "",
          status: "Active",
          clubIds: userClubs.length === 1 ? [userClubs[0].id] : [],
        });
      } else {
        setError("Failed to create parent. Please try again.");
      }
    } catch (err) {
      console.error("Error creating parent:", err);
      setError(
        "An error occurred while creating the parent. Please try again.",
      );
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
            onClick={() => navigate("/parents")}
            sx={{ mr: 2 }}
          >
            Back to Parents
          </Button>
          <Typography variant="h5">Add New Parent</Typography>
        </Box>

        <TextField
          label="Parent Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Email Address"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Phone Number (Optional)"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />

        <FormControl fullWidth margin="normal" required>
          <InputLabel>Status</InputLabel>
          <Select
            name="status"
            value={form.status}
            label="Status"
            onChange={(e) =>
              setForm((prev) => ({ ...prev, status: e.target.value }))
            }
          >
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Suspended">Suspended</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal" required>
          <InputLabel>Clubs</InputLabel>
          <Select
            multiple
            value={form.clubIds}
            onChange={handleClubChange}
            label="Clubs"
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {selected.map((clubId) => {
                  const club = userClubs.find((c) => c.id === clubId);
                  return (
                    <Chip
                      key={clubId}
                      label={club?.name || clubId}
                      size="small"
                    />
                  );
                })}
              </Box>
            )}
          >
            {userClubs.map((club) => (
              <MenuItem key={club.id} value={club.id}>
                <Checkbox checked={form.clubIds.indexOf(club.id) > -1} />
                <ListItemText primary={club.name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {userClubs.length === 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            You don't have access to any clubs. Please contact your
            administrator.
          </Alert>
        )}

        <Box display="flex" justifyContent="space-between" mt={3}>
          <Button variant="outlined" onClick={() => navigate("/parents")}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={userClubs.length === 0}
          >
            Create Parent
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

export default AddParentPage;

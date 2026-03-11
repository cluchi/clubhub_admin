import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../services/supabase";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import type { Parent, Club } from "../../types";

const ParentsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [parents, setParents] = useState<(Parent & { clubs: Club[] })[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [userClubs, setUserClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClubId, setSelectedClubId] = useState<string>("all");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

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
        const userClubsData = allClubs.filter((club: Club) =>
          userClubIds.includes(club.id),
        );
        setUserClubs(userClubsData);

        // Get parents with their clubs
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
        setError("Failed to load parents. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchData();
    }
  }, [user]);

  const handleDelete = async (parentId: string) => {
    if (!window.confirm("Are you sure you want to delete this parent?")) return;

    try {
      await supabase.from("parents").delete().eq("id", parentId);
      setParents(parents.filter((parent) => parent.id !== parentId));
    } catch (err) {
      console.error("Error deleting parent:", err);
      setError("Failed to delete parent. Please try again.");
    }
  };

  const filteredParents =
    selectedClubId === "all"
      ? parents
      : parents.filter((parent) =>
          parent.clubs.some((club) => club.id === selectedClubId),
        );

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">Parents</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/parents/add")}
        >
          Add Parent
        </Button>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <FormControl fullWidth>
          <InputLabel>Filter by Club</InputLabel>
          <Select
            value={selectedClubId}
            label="Filter by Club"
            onChange={(e) => setSelectedClubId(e.target.value)}
          >
            <MenuItem value="all">All Clubs</MenuItem>
            {userClubs.map((club) => (
              <MenuItem key={club.id} value={club.id}>
                {club.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Clubs</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredParents.map((parent) => (
              <TableRow key={parent.id}>
                <TableCell>{parent.name}</TableCell>
                <TableCell>{parent.email}</TableCell>
                <TableCell>{parent.phone || "-"}</TableCell>
                <TableCell>
                  {parent.clubs.map((club: Club) => (
                    <Chip
                      key={club.id}
                      label={club.name}
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => navigate(`/parents/edit/${parent.id}`)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(parent.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredParents.length === 0 && (
        <Alert severity="info" sx={{ mt: 3 }}>
          No parents found.{" "}
          {userClubs.length > 0
            ? "Add a parent to get started."
            : "You don't have access to any clubs yet."}
        </Alert>
      )}
    </Box>
  );
};

export default ParentsPage;

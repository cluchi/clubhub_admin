import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  getTrainersByClub,
  createTrainer,
  updateTrainer,
  deleteTrainer,
} from "../../services/api/trainers";
import type { Trainer } from "../../services/api/trainers";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../services/supabase";

const TrainersPage: React.FC = () => {
  const { user } = useAuth();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addValues, setAddValues] = useState({
    name: "",
    bio: "",
    avatar: "",
    experience: "",
  });
  const [addError, setAddError] = useState<string | null>(null);
  const [clubIds, setClubIds] = useState<string[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editValues, setEditValues] = useState({
    id: "",
    name: "",
    bio: "",
    avatar: "",
    experience: "",
  });
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrainers = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: clubMembers, error: clubError } = await supabase
          .from("club_members")
          .select("club_id")
          .eq("profile_id", user?.id);
        if (clubError) throw clubError;
        const ids = clubMembers?.map((cm) => cm.club_id) || [];
        setClubIds(ids);
        if (ids.length === 0) {
          setTrainers([]);
          setLoading(false);
          return;
        }
        let allTrainers: Trainer[] = [];
        for (const clubId of ids) {
          const trainersForClub = await getTrainersByClub(clubId);
          allTrainers = allTrainers.concat(trainersForClub);
        }
        setTrainers(allTrainers);
      } catch (err: unknown) {
        if (err && typeof err === "object" && "message" in err) {
          setError(
            (err as { message?: string }).message || "Failed to load trainers"
          );
        } else {
          setError("Failed to load trainers");
        }
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchTrainers();
  }, [user]);

  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTrainer = async () => {
    setAddError(null);
    if (!addValues.name) {
      setAddError("Name is required");
      return;
    }
    if (clubIds.length === 0) {
      setAddError("You must be a member of a club to add a trainer.");
      return;
    }
    const trainerData = {
      ...addValues,
      club_id: clubIds[0],
    };
    const result = await createTrainer(trainerData);
    if (!result) {
      setAddError("Failed to add trainer");
      return;
    }
    setAddDialogOpen(false);
    setAddValues({ name: "", bio: "", avatar: "", experience: "" });
    const trainersForClub = await getTrainersByClub(clubIds[0]);
    setTrainers(trainersForClub);
  };

  const handleEditSave = async () => {
    setEditError(null);
    if (!editValues.name) {
      setEditError("Name is required");
      return;
    }
    const result = await updateTrainer(editValues.id, {
      name: editValues.name,
      bio: editValues.bio,
      avatar: editValues.avatar,
      experience: editValues.experience,
    });
    if (!result) {
      setEditError("Failed to update trainer");
      return;
    }
    setEditDialogOpen(false);
    if (clubIds.length > 0) {
      const trainersForClub = await getTrainersByClub(clubIds[0]);
      setTrainers(trainersForClub);
    }
  };

  return (
    <Box>
      <Typography variant="h4">Trainers</Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setAddDialogOpen(true)}
        sx={{ my: 2 }}
      >
        Add Trainer
      </Button>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Paper>
          <List>
            {trainers.map((trainer) => (
              <ListItem
                key={trainer.id}
                alignItems="flex-start"
                secondaryAction={
                  <Box display="flex" gap={1}>
                    <IconButton
                      edge="end"
                      aria-label="edit"
                      onClick={() => {
                        setEditValues({
                          id: trainer.id,
                          name: trainer.name,
                          bio: trainer.bio || "",
                          avatar: trainer.avatar || "",
                          experience: trainer.experience || "",
                        });
                        setEditDialogOpen(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={async () => {
                        if (window.confirm("Delete this trainer?")) {
                          await deleteTrainer(trainer.id);
                          if (clubIds.length > 0) {
                            const trainersForClub = await getTrainersByClub(
                              clubIds[0]
                            );
                            setTrainers(trainersForClub);
                          }
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemAvatar>
                  <Avatar>{trainer.avatar || trainer.name[0]}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={trainer.name}
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        {trainer.experience}
                      </Typography>
                      {trainer.bio ? ` — ${trainer.bio}` : ""}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
        <DialogTitle>Add Trainer</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            name="name"
            value={addValues.name}
            onChange={handleAddChange}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label="Bio"
            name="bio"
            value={addValues.bio}
            onChange={handleAddChange}
            fullWidth
            multiline
          />
          <TextField
            margin="dense"
            label="Avatar (initial or emoji)"
            name="avatar"
            value={addValues.avatar}
            onChange={handleAddChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Experience"
            name="experience"
            value={addValues.experience}
            onChange={handleAddChange}
            fullWidth
          />
          {addError && <Typography color="error">{addError}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddTrainer} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Trainer</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            name="name"
            value={editValues.name}
            onChange={(e) =>
              setEditValues((v) => ({ ...v, name: e.target.value }))
            }
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label="Bio"
            name="bio"
            value={editValues.bio}
            onChange={(e) =>
              setEditValues((v) => ({ ...v, bio: e.target.value }))
            }
            fullWidth
            multiline
          />
          <TextField
            margin="dense"
            label="Avatar (initial or emoji)"
            name="avatar"
            value={editValues.avatar}
            onChange={(e) =>
              setEditValues((v) => ({ ...v, avatar: e.target.value }))
            }
            fullWidth
          />
          <TextField
            margin="dense"
            label="Experience"
            name="experience"
            value={editValues.experience}
            onChange={(e) =>
              setEditValues((v) => ({ ...v, experience: e.target.value }))
            }
            fullWidth
          />
          {editError && <Typography color="error">{editError}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TrainersPage;

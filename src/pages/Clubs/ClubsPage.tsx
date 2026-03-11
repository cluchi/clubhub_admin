import React, { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import InputAdornment from "@mui/material/InputAdornment";
import {
  getClubs,
  updateClub,
  deleteClub,
  createClub,
} from "../../services/api/clubs";
import type { Club } from "../../types";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";

const ClubsPage: React.FC = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editClub, setEditClub] = useState<Club | null>(null);
  type EditClubValues = Partial<Club>;
  const [editValues, setEditValues] = useState<EditClubValues>({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    contact_person: "",
    contact_email: "",
    contact_phone: "",
    status: "active",
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  type CreateClubValues = Partial<Club>;
  const [createValues, setCreateValues] = useState<CreateClubValues>({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    contact_person: "",
    contact_email: "",
    contact_phone: "",
    status: "active",
  });
  const [createError, setCreateError] = useState<string | null>(null);

  const handleCreateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCreateValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateSave = async () => {
    setLoading(true);
    setCreateError(null);
    try {
      const payload = {
        ...createValues,
      };
      console.log("Creating club with payload:", payload);
      const result = await createClub(payload);
      if (!result) {
        setCreateError("Failed to create club. Please check your input.");
        setLoading(false);
        return;
      }
      setCreateDialogOpen(false);
      setCreateValues({
        name: "",
        description: "",
        address: "",
        phone: "",
        email: "",
        website: "",
        contact_person: "",
        contact_email: "",
        contact_phone: "",
        status: "active",
      });
      fetchClubs();
    } catch (err) {
      if (err instanceof Error) {
        setCreateError(err.message);
      } else {
        setCreateError("Unknown error");
      }
      setLoading(false);
    }
  };

  const { user } = useAuth();

  const fetchClubs = () => {
    if (user?.id) {
      setLoading(true);
      getClubs(user.id)
        .then((data) => setClubs(data))
        .catch((err) => setError(err.message || "Failed to load clubs"))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchClubs();
  }, [user]);

  const [editError, setEditError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleEdit = (club: Club) => {
    setEditClub(club);
    setEditValues({
      ...club,
      name: club.name ?? "",
      description: club.description ?? "",
      address: club.address ?? "",
      phone: club.phone ?? "",
      email: club.email ?? "",
      website: club.website ?? "",
      contact_person: club.contact_person ?? "",
      contact_email: club.contact_email ?? "",
      contact_phone: club.contact_phone ?? "",
      status: club.status ?? "active",
    });
    setEditError(null);
    setEditDialogOpen(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async () => {
    if (editClub && editValues) {
      setLoading(true);
      setEditError(null);
      try {
        const payload = {
          ...editValues,
        };
        const result = await updateClub(editClub.id, payload);
        if (!result) {
          setEditError("Failed to update club. Please check your input.");
          setLoading(false);
          return;
        }
        setEditDialogOpen(false);
        setEditClub(null);
        fetchClubs();
      } catch (err) {
        if (err instanceof Error) {
          setEditError(err.message);
        } else {
          setEditError("Unknown error");
        }
        setLoading(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    setDeleteError(null);
    try {
      const result = await deleteClub(id);
      if (!result) {
        setDeleteError("Failed to delete club.");
        setLoading(false);
        return;
      }
      setDeleteId(null);
      fetchClubs();
    } catch (err) {
      if (err instanceof Error) {
        setDeleteError(err.message);
      } else {
        setDeleteError("Unknown error");
      }
      setLoading(false);
    }
  };

  const filteredClubs = clubs.filter((club) => {
    const matchesSearch =
      club.name.toLowerCase().includes(search.toLowerCase()) ||
      club.description?.toLowerCase().includes(search.toLowerCase()) ||
      club.address?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Clubs
      </Typography>
      <Typography gutterBottom>Manage your clubs here.</Typography>
      <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
        <Button variant="contained" onClick={() => setCreateDialogOpen(true)}>
          Add Club
        </Button>
        {/* Create Dialog */}
        <Dialog
          open={createDialogOpen}
          onClose={() => {
            setCreateDialogOpen(false);
            setCreateError(null);
          }}
        >
          <DialogTitle>Add New Club</DialogTitle>
          <DialogContent
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              minWidth: 300,
            }}
          >
            {createError && (
              <Typography color="error" sx={{ mb: 1 }}>
                {createError}
              </Typography>
            )}
            <TextField
              label="Name"
              name="name"
              value={createValues.name || ""}
              onChange={handleCreateChange}
              fullWidth
              required
            />
            <TextField
              label="Description"
              name="description"
              value={createValues.description || ""}
              onChange={handleCreateChange}
              fullWidth
            />
            <TextField
              label="Address"
              name="address"
              value={createValues.address || ""}
              onChange={handleCreateChange}
              fullWidth
            />
            <TextField
              label="Phone"
              name="phone"
              value={createValues.phone || ""}
              onChange={handleCreateChange}
              fullWidth
            />
            <TextField
              label="Email"
              name="email"
              value={createValues.email || ""}
              onChange={handleCreateChange}
              fullWidth
            />
            <TextField
              label="Website"
              name="website"
              value={createValues.website || ""}
              onChange={handleCreateChange}
              fullWidth
            />
            <TextField
              label="Contact Person"
              name="contact_person"
              value={createValues.contact_person || ""}
              onChange={handleCreateChange}
              fullWidth
            />
            <TextField
              label="Contact Email"
              name="contact_email"
              value={createValues.contact_email || ""}
              onChange={handleCreateChange}
              fullWidth
            />
            <TextField
              label="Contact Phone"
              name="contact_phone"
              value={createValues.contact_phone || ""}
              onChange={handleCreateChange}
              fullWidth
            />
            <TextField
              select
              label="Status"
              name="status"
              value={createValues.status || "active"}
              onChange={handleCreateChange}
              fullWidth
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateSave} variant="contained">
              Create
            </Button>
          </DialogActions>
        </Dialog>
        <TextField
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredClubs.map((club) => (
                <TableRow key={club.id}>
                  <TableCell>{club.name}</TableCell>
                  <TableCell>{club.description}</TableCell>
                  <TableCell>{club.address}</TableCell>
                  <TableCell>
                    {club.contact_person}
                    {club.contact_person && club.contact_email ? " - " : ""}
                    {club.contact_email}
                  </TableCell>
                  <TableCell>{club.status}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleEdit(club)} size="small">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      onClick={() => setDeleteId(club.id)}
                      size="small"
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setEditError(null);
        }}
      >
        <DialogTitle>Edit Club</DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            minWidth: 300,
          }}
        >
          {editError && (
            <Typography color="error" sx={{ mb: 1 }}>
              {editError}
            </Typography>
          )}
          <TextField
            label="Name"
            name="name"
            value={editValues.name || ""}
            onChange={handleEditChange}
            fullWidth
            required
          />
          <TextField
            label="Description"
            name="description"
            value={editValues.description || ""}
            onChange={handleEditChange}
            fullWidth
          />
          <TextField
            label="Address"
            name="address"
            value={editValues.address || ""}
            onChange={handleEditChange}
            fullWidth
          />
          <TextField
            label="Phone"
            name="phone"
            value={editValues.phone || ""}
            onChange={handleEditChange}
            fullWidth
          />
          <TextField
            label="Email"
            name="email"
            value={editValues.email || ""}
            onChange={handleEditChange}
            fullWidth
          />
          <TextField
            label="Website"
            name="website"
            value={editValues.website || ""}
            onChange={handleEditChange}
            fullWidth
          />
          <TextField
            label="Contact Person"
            name="contact_person"
            value={editValues.contact_person || ""}
            onChange={handleEditChange}
            fullWidth
          />
          <TextField
            label="Contact Email"
            name="contact_email"
            value={editValues.contact_email || ""}
            onChange={handleEditChange}
            fullWidth
          />
          <TextField
            label="Contact Phone"
            name="contact_phone"
            value={editValues.contact_phone || ""}
            onChange={handleEditChange}
            fullWidth
          />
          <TextField
            select
            label="Status"
            name="status"
            value={editValues.status || "active"}
            onChange={handleEditChange}
            fullWidth
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteId}
        onClose={() => {
          setDeleteId(null);
          setDeleteError(null);
        }}
      >
        <DialogTitle>Delete Club</DialogTitle>
        <DialogContent>
          {deleteError && (
            <Typography color="error" sx={{ mb: 1 }}>
              {deleteError}
            </Typography>
          )}
          Are you sure you want to delete this club?
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteId(null);
              setDeleteError(null);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => deleteId && handleDelete(deleteId)}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClubsPage;

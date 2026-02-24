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
  getCourses,
  updateCourse,
  deleteCourse,
  createCourse,
} from "../../services/api/courses";
import { getTrainersByClub } from "../../services/api/trainers";
import type { Trainer } from "../../services/api/trainers";
import type { Course } from "../../types";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";

const ClassesPage: React.FC = () => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  type CourseWithTrainer = Course & { trainer?: Trainer };
  const [courses, setCourses] = useState<CourseWithTrainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  type EditCourseValues = Partial<Course> & {
    trainer?: Trainer;
  };
  const [editValues, setEditValues] = useState<EditCourseValues>({
    pricing: { drop_in: 0, monthly: 0, quarterly: 0 },
    age_range: "",
    skill_level: "",
    spots_available: 0,
    total_spots: 0,
    category: "",
    trainer_id: "",
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterClubId, setFilterClubId] = useState<string>("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  type CreateCourseValues = Partial<Course> & {
    trainer?: Trainer;
  };
  const [createValues, setCreateValues] = useState<CreateCourseValues>({
    pricing: { drop_in: 0, monthly: 0, quarterly: 0 },
    age_range: "",
    skill_level: "",
    spots_available: 0,
    total_spots: 0,
    category: "",
    trainer_id: "",
  });
  const [createError, setCreateError] = useState<string | null>(null);
  const handleCreateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("pricing.")) {
      const key = name.split(".")[1];
      setCreateValues((prev) => ({
        ...prev,
        pricing: {
          drop_in: prev.pricing?.drop_in ?? 0,
          monthly: prev.pricing?.monthly ?? 0,
          quarterly: prev.pricing?.quarterly ?? 0,
          [key]: value === "" ? 0 : Number(value),
        },
      }));
    } else {
      setCreateValues((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCreateSave = async () => {
    setLoading(true);
    setCreateError(null);
    try {
      const payload = {
        ...createValues,
      };
      // ...existing code...
      if ("trainer" in payload) {
        delete payload.trainer;
      }
      console.log("Creating course with payload:", payload);
      const result = await createCourse(payload);
      if (!result) {
        setCreateError("Failed to create course. Please check your input.");
        setLoading(false);
        return;
      }
      setCreateDialogOpen(false);
      setCreateValues({
        pricing: { drop_in: 0, monthly: 0, quarterly: 0 },
        age_range: "",
        skill_level: "",
        spots_available: 0,
        total_spots: 0,
        category: "",
      });
      fetchCourses();
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
  // Fetch trainers for a club
  const fetchTrainers = async (clubId: string) => {
    try {
      const data = await getTrainersByClub(clubId);
      setTrainers(data);
    } catch {
      setTrainers([]);
    }
  };

  const fetchCourses = () => {
    if (user?.id) {
      setLoading(true);
      getCourses(user.id)
        .then((data) => setCourses(data))
        .catch((err) => setError(err.message || "Failed to load courses"))
        .finally(() => setLoading(false));
    }
  };
  useEffect(() => {
    // Fetch trainers when club changes in create dialog
    if (createValues.club_id) {
      fetchTrainers(createValues.club_id);
    } else {
      setTrainers([]);
    }
  }, [createValues.club_id]);

  // Fetch trainers when club changes in edit dialog
  useEffect(() => {
    if (editValues.club_id) {
      fetchTrainers(editValues.club_id);
    } else {
      setTrainers([]);
    }
  }, [editValues.club_id]);

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const [editError, setEditError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleEdit = (course: Course) => {
    setEditCourse(course);
    setEditValues({
      ...course,
      pricing: {
        drop_in: course.pricing?.drop_in ?? 0,
        monthly: course.pricing?.monthly ?? 0,
        quarterly: course.pricing?.quarterly ?? 0,
      },
      age_range: course.age_range ?? "",
      skill_level: course.skill_level ?? "",
      spots_available: course.spots_available ?? 0,
      total_spots: course.total_spots ?? 0,
      category: course.category ?? "",
      trainer_id: course.trainer_id || "",
    });
    setEditError(null);
    setEditDialogOpen(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("pricing.")) {
      const key = name.split(".")[1];
      setEditValues((prev) => ({
        ...prev,
        pricing: {
          drop_in: prev.pricing?.drop_in ?? 0,
          monthly: prev.pricing?.monthly ?? 0,
          quarterly: prev.pricing?.quarterly ?? 0,
          [key]: value === "" ? 0 : Number(value),
        },
      }));
    } else {
      setEditValues((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEditSave = async () => {
    if (editCourse && editValues) {
      setLoading(true);
      setEditError(null);
      try {
        const payload = {
          ...editValues,
        };
        // ...existing code...
        if ("trainer" in payload) {
          delete payload.trainer;
        }
        const result = await updateCourse(editCourse.id, payload);
        if (!result) {
          setEditError("Failed to update course. Please check your input.");
          setLoading(false);
          return;
        }
        setEditDialogOpen(false);
        setEditCourse(null);
        fetchCourses();
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
      const result = await deleteCourse(id);
      if (!result) {
        setDeleteError("Failed to delete course.");
        setLoading(false);
        return;
      }
      setDeleteId(null);
      fetchCourses();
    } catch (err) {
      if (err instanceof Error) {
        setDeleteError(err.message);
      } else {
        setDeleteError("Unknown error");
      }
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(search.toLowerCase()) ||
      course.description?.toLowerCase().includes(search.toLowerCase());
    const matchesClub = filterClubId ? course.club_id === filterClubId : true;
    return matchesSearch && matchesClub;
  });

  const uniqueClubIds = Array.from(new Set(courses.map((c) => c.club_id)));

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Classes
      </Typography>
      <Typography gutterBottom>Manage your club's classes here.</Typography>
      <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
        <Button variant="contained" onClick={() => setCreateDialogOpen(true)}>
          Add Class
        </Button>
        {/* Create Dialog */}
        <Dialog
          open={createDialogOpen}
          onClose={() => {
            setCreateDialogOpen(false);
            setCreateError(null);
          }}
        >
          <DialogTitle>Add New Class</DialogTitle>
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
            />
            <TextField
              label="Description"
              name="description"
              value={createValues.description || ""}
              onChange={handleCreateChange}
              fullWidth
            />
            <TextField
              label="Club ID"
              name="club_id"
              value={createValues.club_id || ""}
              onChange={handleCreateChange}
              fullWidth
            />
            <TextField
              select
              label="Trainer"
              name="trainer_id"
              value={createValues.trainer_id || ""}
              onChange={handleCreateChange}
              fullWidth
              required
            >
              <MenuItem value="">Select Trainer</MenuItem>
              {trainers.map((trainer) => (
                <MenuItem key={trainer.id} value={trainer.id}>
                  {trainer.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Schedule"
              name="schedule"
              value={createValues.schedule || ""}
              onChange={handleCreateChange}
              fullWidth
              required
            />
            <TextField
              label="Age Range"
              name="age_range"
              value={createValues.age_range || ""}
              onChange={handleCreateChange}
              fullWidth
              required
            />
            <TextField
              label="Skill Level"
              name="skill_level"
              value={createValues.skill_level || ""}
              onChange={handleCreateChange}
              fullWidth
              required
            />
            <TextField
              label="Spots Available"
              name="spots_available"
              type="number"
              value={createValues.spots_available ?? 0}
              onChange={handleCreateChange}
              fullWidth
              required
            />
            <TextField
              label="Total Spots"
              name="total_spots"
              type="number"
              value={createValues.total_spots ?? 0}
              onChange={handleCreateChange}
              fullWidth
              required
            />
            <TextField
              label="Category"
              name="category"
              value={createValues.category || ""}
              onChange={handleCreateChange}
              fullWidth
              required
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Drop-in Price"
                name="pricing.drop_in"
                type="number"
                value={createValues.pricing?.drop_in ?? ""}
                onChange={handleCreateChange}
                fullWidth
                required
              />
              <TextField
                label="Monthly Price"
                name="pricing.monthly"
                type="number"
                value={createValues.pricing?.monthly ?? ""}
                onChange={handleCreateChange}
                fullWidth
                required
              />
              <TextField
                label="Quarterly Price"
                name="pricing.quarterly"
                type="number"
                value={createValues.pricing?.quarterly ?? ""}
                onChange={handleCreateChange}
                fullWidth
                required
              />
            </Box>
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
        <TextField
          label="Filter by Club"
          select
          value={filterClubId}
          onChange={(e) => setFilterClubId(e.target.value)}
          size="small"
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">All</MenuItem>
          {uniqueClubIds.map((id) => (
            <MenuItem key={id} value={id}>
              {id}
            </MenuItem>
          ))}
        </TextField>
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
                <TableCell>Club ID</TableCell>
                <TableCell>Trainer</TableCell>
                <TableCell>Schedule</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCourses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>{course.name}</TableCell>
                  <TableCell>{course.description}</TableCell>
                  <TableCell>{course.club_id}</TableCell>
                  <TableCell>
                    {course.trainer && course.trainer.name
                      ? course.trainer.name
                      : course.trainer_id || ""}
                  </TableCell>
                  <TableCell>
                    {Array.isArray(course.schedule)
                      ? course.schedule.map(
                          (
                            slot: { days?: string[]; time?: string },
                            idx: number,
                          ) => (
                            <div key={idx}>
                              {slot.days?.join(", ")}
                              {slot.days && slot.time ? " - " : ""}
                              {slot.time}
                            </div>
                          ),
                        )
                      : typeof course.schedule === "object" &&
                          course.schedule !== null
                        ? JSON.stringify(course.schedule)
                        : String(course.schedule)}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleEdit(course)} size="small">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      onClick={() => setDeleteId(course.id)}
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
        <DialogTitle>Edit Course</DialogTitle>
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
          />
          <TextField
            label="Description"
            name="description"
            value={editValues.description || ""}
            onChange={handleEditChange}
            fullWidth
          />
          <TextField
            label="Club ID"
            name="club_id"
            value={editValues.club_id || ""}
            onChange={handleEditChange}
            fullWidth
          />
          <TextField
            select
            label="Trainer"
            name="trainer_id"
            value={editValues.trainer_id || ""}
            onChange={handleEditChange}
            fullWidth
            required
          >
            <MenuItem value="">Select Trainer</MenuItem>
            {trainers.map((trainer) => (
              <MenuItem key={trainer.id} value={trainer.id}>
                {trainer.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Schedule"
            name="schedule"
            value={editValues.schedule || ""}
            onChange={handleEditChange}
            fullWidth
            required
          />
          <TextField
            label="Age Range"
            name="age_range"
            value={editValues.age_range || ""}
            onChange={handleEditChange}
            fullWidth
            required
          />
          <TextField
            label="Skill Level"
            name="skill_level"
            value={editValues.skill_level || ""}
            onChange={handleEditChange}
            fullWidth
            required
          />
          <TextField
            label="Spots Available"
            name="spots_available"
            type="number"
            value={editValues.spots_available ?? 0}
            onChange={handleEditChange}
            fullWidth
            required
          />
          <TextField
            label="Total Spots"
            name="total_spots"
            type="number"
            value={editValues.total_spots ?? 0}
            onChange={handleEditChange}
            fullWidth
            required
          />
          <TextField
            label="Category"
            name="category"
            value={editValues.category || ""}
            onChange={handleEditChange}
            fullWidth
            required
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Drop-in Price"
              name="pricing.drop_in"
              type="number"
              value={editValues.pricing?.drop_in ?? ""}
              onChange={handleEditChange}
              fullWidth
              required
            />
            <TextField
              label="Monthly Price"
              name="pricing.monthly"
              type="number"
              value={editValues.pricing?.monthly ?? ""}
              onChange={handleEditChange}
              fullWidth
              required
            />
            <TextField
              label="Quarterly Price"
              name="pricing.quarterly"
              type="number"
              value={editValues.pricing?.quarterly ?? ""}
              onChange={handleEditChange}
              fullWidth
              required
            />
          </Box>
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
        <DialogTitle>Delete Course</DialogTitle>
        <DialogContent>
          {deleteError && (
            <Typography color="error" sx={{ mb: 1 }}>
              {deleteError}
            </Typography>
          )}
          Are you sure you want to delete this course?
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

export default ClassesPage;

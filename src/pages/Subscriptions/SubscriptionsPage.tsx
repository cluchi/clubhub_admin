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
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Chip from "@mui/material/Chip";
import type { Subscription, Course, Child } from "../../types";
import {
  getSubscriptions,
  updateSubscription,
  deleteSubscription,
  createSubscription,
} from "../../services/api/subscriptions";
import { getCourses } from "../../services/api/courses";
import { getChildren } from "../../services/api/children";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import CancelIcon from "@mui/icons-material/Cancel";
import { styled } from "@mui/material/styles";

const StatusChip = styled(Chip)<{ status: string }>(({ theme, status }) => ({
  backgroundColor:
    status === "active"
      ? theme.palette.success.light
      : status === "pending"
        ? theme.palette.warning.light
        : theme.palette.error.light,
  color:
    status === "active"
      ? theme.palette.success.contrastText
      : status === "pending"
        ? theme.palette.warning.contrastText
        : theme.palette.error.contrastText,
}));

const SubscriptionsPage: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterCourse, setFilterCourse] = useState<string>("");
  const [filterChild, setFilterChild] = useState<string>("");

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editSubscription, setEditSubscription] = useState<Subscription | null>(
    null,
  );
  const [editValues, setEditValues] = useState<Partial<Subscription>>({
    status: "pending",
  });

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createValues, setCreateValues] = useState<Partial<Subscription>>({
    status: "pending",
  });

  // Error states
  const [createError, setCreateError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { user } = useAuth();

  const fetchSubscriptions = () => {
    if (user?.id) {
      setLoading(true);
      getSubscriptions(user.id)
        .then((data) => setSubscriptions(data))
        .catch((err) => setError(err.message || "Failed to load subscriptions"))
        .finally(() => setLoading(false));
    }
  };

  const fetchCourses = () => {
    if (user?.id) {
      getCourses(user.id)
        .then((data) => setCourses(data))
        .catch((err) => console.error("Failed to load courses:", err));
    }
  };

  const fetchChildren = () => {
    getChildren()
      .then((data) => setChildren(data))
      .catch((err) => console.error("Failed to load children:", err));
  };

  useEffect(() => {
    fetchSubscriptions();
    fetchCourses();
    fetchChildren();
  }, [user]);

  // Handle create subscription
  const handleCreateChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>,
  ) => {
    const { name, value } = e.target;
    setCreateValues((prev) => ({ ...prev, [name as string]: value }));
  };

  const handleCreateSave = async () => {
    setLoading(true);
    setCreateError(null);
    try {
      // Validate that child is selected
      if (!createValues.child_id) {
        setCreateError("Please select a child.");
        setLoading(false);
        return;
      }

      const payload = {
        ...createValues,
      };
      console.log("Creating subscription with payload:", payload);
      const result = await createSubscription(payload);
      if (!result) {
        setCreateError(
          "Failed to create subscription. Please check your input.",
        );
        setLoading(false);
        return;
      }
      setCreateDialogOpen(false);
      setCreateValues({ status: "pending" });
      fetchSubscriptions();
    } catch (err) {
      if (err instanceof Error) {
        setCreateError(err.message);
      } else {
        setCreateError("Unknown error");
      }
      setLoading(false);
    }
  };

  // Handle edit subscription
  const handleEdit = (subscription: Subscription) => {
    setEditSubscription(subscription);
    setEditValues({
      ...subscription,
      status: subscription.status ?? "pending",
    });
    setEditError(null);
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (editSubscription && editValues) {
      setLoading(true);
      setEditError(null);
      try {
        const payload = {
          ...editValues,
        };
        const result = await updateSubscription(editSubscription.id, payload);
        if (!result) {
          setEditError(
            "Failed to update subscription. Please check your input.",
          );
          setLoading(false);
          return;
        }
        setEditDialogOpen(false);
        setEditSubscription(null);
        fetchSubscriptions();
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

  // Handle delete subscription
  const handleDelete = async (id: string) => {
    setLoading(true);
    setDeleteError(null);
    try {
      const result = await deleteSubscription(id);
      if (!result) {
        setDeleteError("Failed to delete subscription.");
        setLoading(false);
        return;
      }
      setDeleteId(null);
      fetchSubscriptions();
    } catch (err) {
      if (err instanceof Error) {
        setDeleteError(err.message);
      } else {
        setDeleteError("Unknown error");
      }
      setLoading(false);
    }
  };

  // Get course name by ID
  const getCourseName = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    return course ? course.name : courseId;
  };

  // Get child name by ID
  const getChildName = (childId: string) => {
    const child = children.find((c) => c.id === childId);
    return child ? child.name : childId;
  };

  // Get course details for display
  const getCourseDetails = (courseId: string) => {
    return courses.find((c) => c.id === courseId);
  };

  // Filter subscriptions
  const filteredSubscriptions = subscriptions.filter((subscription) => {
    const matchesSearch =
      getCourseName(subscription.course_id)
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      getChildName(subscription.child_id)
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      subscription.status.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = filterStatus
      ? subscription.status === filterStatus
      : true;
    const matchesCourse = filterCourse
      ? subscription.course_id === filterCourse
      : true;
    const matchesChild = filterChild
      ? subscription.child_id === filterChild
      : true;

    return matchesSearch && matchesStatus && matchesCourse && matchesChild;
  });

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircleIcon fontSize="small" />;
      case "pending":
        return <PendingIcon fontSize="small" />;
      case "cancelled":
        return <CancelIcon fontSize="small" />;
      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Subscriptions
      </Typography>
      <Typography gutterBottom>
        Manage course subscriptions for children.
      </Typography>

      {/* Action Bar */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 2,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Add Subscription
        </Button>

        <TextField
          label="Search subscriptions"
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
          sx={{ minWidth: 250 }}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filterStatus}
            label="Status"
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Course</InputLabel>
          <Select
            value={filterCourse}
            label="Course"
            onChange={(e) => setFilterCourse(e.target.value)}
          >
            <MenuItem value="">All Courses</MenuItem>
            {courses.map((course) => (
              <MenuItem key={course.id} value={course.id}>
                {course.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Child</InputLabel>
          <Select
            value={filterChild}
            label="Child"
            onChange={(e) => setFilterChild(e.target.value)}
          >
            <MenuItem value="">All Children</MenuItem>
            {children.map((child) => (
              <MenuItem key={child.id} value={child.id}>
                {child.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Subscription List */}
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Child Name</TableCell>
                <TableCell>Course Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Course Details</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSubscriptions.map((subscription) => {
                const courseDetails = getCourseDetails(subscription.course_id);
                return (
                  <TableRow key={subscription.id}>
                    <TableCell>
                      <Typography variant="body1" fontWeight="medium">
                        {getChildName(subscription.child_id)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1">
                        {getCourseName(subscription.course_id)}
                      </Typography>
                      {courseDetails && (
                        <Typography variant="body2" color="textSecondary">
                          {courseDetails.club_id}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusChip
                        label={subscription.status}
                        icon={getStatusIcon(subscription.status)}
                        status={subscription.status}
                      />
                    </TableCell>
                    <TableCell>
                      {courseDetails && (
                        <Box>
                          <Typography variant="body2">
                            Schedule:{" "}
                            {Array.isArray(courseDetails.schedule)
                              ? courseDetails.schedule.map(
                                  (
                                    slot: { days: string[]; time: string },
                                    idx: number,
                                  ) => (
                                    <span key={idx}>
                                      {slot.days?.join(", ")} - {slot.time}
                                      {idx <
                                        courseDetails.schedule.length - 1 &&
                                        ", "}
                                    </span>
                                  ),
                                )
                              : courseDetails.schedule || "No schedule"}
                          </Typography>
                          <Typography variant="body2">
                            Pricing: Drop-in $
                            {courseDetails.pricing?.drop_in || 0} | Monthly $
                            {courseDetails.pricing?.monthly || 0} | Quarterly $
                            {courseDetails.pricing?.quarterly || 0}
                          </Typography>
                          <Typography variant="body2">
                            Age: {courseDetails.age_range} | Level:{" "}
                            {courseDetails.skill_level}
                          </Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={() => handleEdit(subscription)}
                        size="small"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        onClick={() => setDeleteId(subscription.id)}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create Subscription Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => {
          setCreateDialogOpen(false);
          setCreateError(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Subscription</DialogTitle>
        <DialogContent>
          {createError && (
            <Typography color="error" sx={{ mb: 2 }}>
              {createError}
            </Typography>
          )}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Child</InputLabel>
              <Select
                name="child_id"
                value={createValues.child_id || ""}
                label="Child"
                onChange={(e) => {
                  const { name, value } = e.target;
                  setCreateValues((prev) => ({
                    ...prev,
                    [name as string]: value,
                  }));
                }}
                required
              >
                <MenuItem value="">Select Child</MenuItem>
                {children.map((child) => (
                  <MenuItem key={child.id} value={child.id}>
                    {child.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Course</InputLabel>
              <Select
                name="course_id"
                value={createValues.course_id || ""}
                label="Course"
                onChange={(e) => {
                  const { name, value } = e.target;
                  setCreateValues((prev) => ({
                    ...prev,
                    [name as string]: value,
                  }));
                }}
                required
              >
                <MenuItem value="">Select Course</MenuItem>
                {courses.map((course) => (
                  <MenuItem key={course.id} value={course.id}>
                    {course.name} - {course.club_id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={createValues.status || "pending"}
                label="Status"
                onChange={(e) => {
                  const { name, value } = e.target;
                  setCreateValues((prev) => ({
                    ...prev,
                    [name as string]: value,
                  }));
                }}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateSave} variant="contained">
            Create Subscription
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Subscription Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setEditError(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Subscription</DialogTitle>
        <DialogContent>
          {editError && (
            <Typography color="error" sx={{ mb: 2 }}>
              {editError}
            </Typography>
          )}
          {editSubscription && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography variant="subtitle1" color="textSecondary">
                Child: {getChildName(editSubscription.child_id)}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                Course: {getCourseName(editSubscription.course_id)}
              </Typography>

              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={
                    editValues.status || editSubscription.status || "pending"
                  }
                  label="Status"
                  onChange={(e) => {
                    const { name, value } = e.target;
                    setEditValues((prev) => ({
                      ...prev,
                      [name as string]: value,
                    }));
                  }}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">
            Save Changes
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
        <DialogTitle>Delete Subscription</DialogTitle>
        <DialogContent>
          {deleteError && (
            <Typography color="error" sx={{ mb: 1 }}>
              {deleteError}
            </Typography>
          )}
          <Typography>
            Are you sure you want to delete this subscription? This action
            cannot be undone.
          </Typography>
          {deleteId && (
            <Box sx={{ mt: 2, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
              <Typography variant="body2">
                Child:{" "}
                {getChildName(
                  subscriptions.find((s) => s.id === deleteId)?.child_id || "",
                )}
              </Typography>
              <Typography variant="body2">
                Course:{" "}
                {getCourseName(
                  subscriptions.find((s) => s.id === deleteId)?.course_id || "",
                )}
              </Typography>
              <Typography variant="body2">
                Status: {subscriptions.find((s) => s.id === deleteId)?.status}
              </Typography>
            </Box>
          )}
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

export default SubscriptionsPage;

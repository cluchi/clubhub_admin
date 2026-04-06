import React, { useEffect, useState, useCallback } from "react";
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
import type { Booking, Subscription, Course, Child } from "../../types";
import {
  getBookings,
  updateBooking,
  deleteBooking,
  createBooking,
} from "../../services/api/bookings";
import { getSubscriptions } from "../../services/api/subscriptions";
import { getCourses } from "../../services/api/courses";
import { getChildren } from "../../services/api/children";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EventIcon from "@mui/icons-material/Event";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import CancelIcon from "@mui/icons-material/Cancel";
import { styled } from "@mui/material/styles";
import { format } from "date-fns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const StatusChip = styled(Chip)<{ status: string }>(({ theme, status }) => ({
  backgroundColor:
    status === "confirmed"
      ? theme.palette.success.light
      : status === "pending"
        ? theme.palette.warning.light
        : theme.palette.error.light,
  color:
    status === "confirmed"
      ? theme.palette.success.contrastText
      : status === "pending"
        ? theme.palette.warning.contrastText
        : theme.palette.error.contrastText,
}));

const BookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterCourse, setFilterCourse] = useState<string>("");
  const [filterChild, setFilterChild] = useState<string>("");
  const [filterDate, setFilterDate] = useState<Date | null>(null);

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  const [editValues, setEditValues] = useState<
    Partial<Booking> & { status?: string }
  >({
    status: "pending",
  });

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createValues, setCreateValues] = useState<
    Partial<Booking> & { status?: string }
  >({
    status: "pending",
  });

  // Error states
  const [createError, setCreateError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { user } = useAuth();

  const fetchBookings = useCallback(() => {
    if (user?.id) {
      setLoading(true);
      getBookings(user.id)
        .then((data) => setBookings(data))
        .catch((err) => setError(err.message || "Failed to load bookings"))
        .finally(() => setLoading(false));
    }
  }, [user?.id]);

  const fetchSubscriptions = useCallback(() => {
    if (user?.id) {
      getSubscriptions(user.id)
        .then((data) => setSubscriptions(data))
        .catch((err) => console.error("Failed to load subscriptions:", err));
    }
  }, [user?.id]);

  const fetchCourses = useCallback(() => {
    if (user?.id) {
      getCourses(user.id)
        .then((data) => setCourses(data))
        .catch((err) => console.error("Failed to load courses:", err));
    }
  }, [user?.id]);

  const fetchChildren = useCallback(() => {
    getChildren()
      .then((data) => setChildren(data))
      .catch((err) => console.error("Failed to load children:", err));
  }, []);

  useEffect(() => {
    fetchBookings();
    fetchSubscriptions();
    fetchCourses();
    fetchChildren();
  }, [fetchBookings, fetchSubscriptions, fetchCourses, fetchChildren]);

  // Handle create booking
  const handleCreateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCreateValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateDateChange = (date: Date | null) => {
    setCreateValues((prev) => ({
      ...prev,
      date: date ? date.toISOString() : undefined,
    }));
  };

  const handleCreateSave = async () => {
    setLoading(true);
    setCreateError(null);
    try {
      const payload = {
        ...createValues,
      };
      console.log("Creating booking with payload:", payload);
      const result = await createBooking(payload);
      if (!result) {
        setCreateError("Failed to create booking. Please check your input.");
        setLoading(false);
        return;
      }
      setCreateDialogOpen(false);
      setCreateValues({ status: "pending" });
      fetchBookings();
    } catch (err) {
      if (err instanceof Error) {
        setCreateError(err.message);
      } else {
        setCreateError("Unknown error");
      }
      setLoading(false);
    }
  };

  // Handle edit booking
  const handleEdit = (booking: Booking) => {
    setEditBooking(booking);
    setEditValues({
      ...booking,
      status: booking.status ?? "pending",
      date: booking.date ? new Date(booking.date) : null,
    });
    setEditError(null);
    setEditDialogOpen(true);
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>,
  ) => {
    const { name, value } = e.target;
    setEditValues((prev) => ({ ...prev, [name as string]: value }));
  };

  const handleEditDateChange = (date: Date | null) => {
    setEditValues((prev) => ({
      ...prev,
      date: date ? date.toISOString() : undefined,
    }));
  };

  const handleEditSave = async () => {
    if (editBooking && editValues) {
      setLoading(true);
      setEditError(null);
      try {
        const payload = {
          ...editValues,
        };
        const result = await updateBooking(editBooking.id, payload);
        if (!result) {
          setEditError("Failed to update booking. Please check your input.");
          setLoading(false);
          return;
        }
        setEditDialogOpen(false);
        setEditBooking(null);
        fetchBookings();
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

  // Handle delete booking
  const handleDelete = async (id: string) => {
    setLoading(true);
    setDeleteError(null);
    try {
      const result = await deleteBooking(id);
      if (!result) {
        setDeleteError("Failed to delete booking.");
        setLoading(false);
        return;
      }
      setDeleteId(null);
      fetchBookings();
    } catch (err) {
      if (err instanceof Error) {
        setDeleteError(err.message);
      } else {
        setDeleteError("Unknown error");
      }
      setLoading(false);
    }
  };

  // Get subscription details
  const getSubscriptionDetails = (subscriptionId: string) => {
    return subscriptions.find((s) => s.id === subscriptionId);
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

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy 'at' HH:mm");
    } catch {
      return dateString;
    }
  };

  // Filter bookings
  const filteredBookings = bookings.filter((booking) => {
    const subscriptionDetails = getSubscriptionDetails(booking.subscription_id);
    const childName = subscriptionDetails
      ? getChildName(subscriptionDetails.child_id)
      : "";
    const courseName = subscriptionDetails
      ? getCourseName(subscriptionDetails.course_id)
      : "";

    const matchesSearch =
      childName.toLowerCase().includes(search.toLowerCase()) ||
      courseName.toLowerCase().includes(search.toLowerCase()) ||
      booking.status.toLowerCase().includes(search.toLowerCase()) ||
      formatDate(booking.date).toLowerCase().includes(search.toLowerCase());

    const matchesStatus = filterStatus ? booking.status === filterStatus : true;
    const matchesCourse = filterCourse
      ? subscriptionDetails?.course_id === filterCourse
      : true;
    const matchesChild = filterChild
      ? subscriptionDetails?.child_id === filterChild
      : true;
    const matchesDate = filterDate
      ? new Date(booking.date).toDateString() === filterDate.toDateString()
      : true;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesCourse &&
      matchesChild &&
      matchesDate
    );
  });

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
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
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Bookings
        </Typography>
        <Typography gutterBottom>
          Manage session bookings for children.
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
            Add Booking
          </Button>

          <TextField
            label="Search bookings"
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
              onChange={(e) => setFilterStatus(e.target.value as string)}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="confirmed">Confirmed</MenuItem>
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

          <DatePicker
            label="Filter by Date"
            value={filterDate}
            onChange={setFilterDate}
            slotProps={{
              textField: {
                size: "small",
              },
            }}
            format="MM/dd/yyyy"
          />
        </Box>

        {/* Booking List */}
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              mt: 2,
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Child Name</TableCell>
                  <TableCell>Course Name</TableCell>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Subscription Info</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBookings.map((booking) => {
                  const subscriptionDetails = getSubscriptionDetails(
                    booking.subscription_id,
                  );
                  const courseDetails = subscriptionDetails
                    ? getCourseDetails(subscriptionDetails.course_id)
                    : null;

                  return (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <Typography variant="body1" fontWeight="medium">
                          {subscriptionDetails
                            ? getChildName(subscriptionDetails.child_id)
                            : "Unknown"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1">
                          {subscriptionDetails
                            ? getCourseName(subscriptionDetails.course_id)
                            : "Unknown"}
                        </Typography>
                        {courseDetails && (
                          <Typography variant="body2" color="textSecondary">
                            {courseDetails.club_id}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {formatDate(booking.date)}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            <EventIcon
                              fontSize="small"
                              sx={{ mr: 0.5, verticalAlign: "middle" }}
                            />
                            {subscriptionDetails?.status || "Unknown"}{" "}
                            Subscription
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <StatusChip
                          label={booking.status}
                          icon={getStatusIcon(booking.status)}
                          status={booking.status}
                        />
                      </TableCell>
                      <TableCell>
                        {subscriptionDetails && courseDetails && (
                          <Box>
                            <Typography variant="body2">
                              Pricing: Drop-in $
                              {courseDetails.pricing?.drop_in || 0} | Monthly $
                              {courseDetails.pricing?.monthly || 0} | Quarterly
                              ${courseDetails.pricing?.quarterly || 0}
                            </Typography>
                            <Typography variant="body2">
                              Age: {courseDetails.age_range} | Level:{" "}
                              {courseDetails.skill_level}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
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
                                : String(courseDetails.schedule)}
                            </Typography>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={() => handleEdit(booking)}
                          size="small"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          onClick={() => setDeleteId(booking.id)}
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

        {/* Create Booking Dialog */}
        <Dialog
          open={createDialogOpen}
          onClose={() => {
            setCreateDialogOpen(false);
            setCreateError(null);
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Add New Booking</DialogTitle>
          <DialogContent>
            {createError && (
              <Typography color="error" sx={{ mb: 2 }}>
                {createError}
              </Typography>
            )}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Subscription</InputLabel>
                <Select
                  name="subscription_id"
                  value={createValues.subscription_id || ""}
                  label="Subscription"
                  onChange={(e) => {
                    const syntheticEvent = {
                      target: {
                        name: "subscription_id",
                        value: e.target.value,
                      },
                    } as React.ChangeEvent<HTMLInputElement>;
                    handleCreateChange(syntheticEvent);
                  }}
                  required
                >
                  <MenuItem value="">Select Subscription</MenuItem>
                  {subscriptions.map((subscription) => {
                    const childName = getChildName(subscription.child_id);
                    const courseName = getCourseName(subscription.course_id);
                    return (
                      <MenuItem key={subscription.id} value={subscription.id}>
                        {childName} - {courseName} ({subscription.status})
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>

              <DatePicker
                label="Booking Date & Time"
                value={createValues.date ? new Date(createValues.date) : null}
                onChange={handleCreateDateChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                  },
                }}
                format="MM/dd/yyyy HH:mm"
              />

              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={createValues.status || "pending"}
                  label="Status"
                  onChange={(e) => {
                    const syntheticEvent = {
                      target: {
                        name: "status",
                        value: e.target.value,
                      },
                    } as React.ChangeEvent<HTMLInputElement>;
                    handleCreateChange(syntheticEvent);
                  }}
                >
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateSave} variant="contained">
              Create Booking
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Booking Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false);
            setEditError(null);
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Edit Booking</DialogTitle>
          <DialogContent>
            {editError && (
              <Typography color="error" sx={{ mb: 2 }}>
                {editError}
              </Typography>
            )}
            {editBooking && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography variant="subtitle1" color="textSecondary">
                  Child:{" "}
                  {getSubscriptionDetails(editBooking.subscription_id)
                    ? getChildName(
                        getSubscriptionDetails(editBooking.subscription_id)!
                          .child_id,
                      )
                    : "Unknown"}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  Course:{" "}
                  {getSubscriptionDetails(editBooking.subscription_id)
                    ? getCourseName(
                        getSubscriptionDetails(editBooking.subscription_id)!
                          .course_id,
                      )
                    : "Unknown"}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  Current Date: {formatDate(editBooking.date)}
                </Typography>

                <DatePicker
                  label="New Date & Time"
                  value={editValues.date ? new Date(editValues.date) : null}
                  onChange={handleEditDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                    },
                  }}
                  format="MM/dd/yyyy HH:mm"
                />

                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={editValues.status || editBooking.status || "pending"}
                    label="Status"
                    onChange={(e) => {
                      const syntheticEvent = {
                        target: {
                          name: "status",
                          value: e.target.value,
                        },
                      } as React.ChangeEvent<HTMLInputElement>;
                      handleEditChange(syntheticEvent);
                    }}
                  >
                    <MenuItem value="confirmed">Confirmed</MenuItem>
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
          <DialogTitle>Delete Booking</DialogTitle>
          <DialogContent>
            {deleteError && (
              <Typography color="error" sx={{ mb: 1 }}>
                {deleteError}
              </Typography>
            )}
            <Typography>
              Are you sure you want to delete this booking? This action cannot
              be undone.
            </Typography>
            {deleteId && (
              <Box sx={{ mt: 2, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
                {(() => {
                  const booking = bookings.find((b) => b.id === deleteId);
                  const subscriptionDetails = booking
                    ? getSubscriptionDetails(booking.subscription_id)
                    : null;
                  return (
                    <>
                      <Typography variant="body2">
                        Child:{" "}
                        {subscriptionDetails
                          ? getChildName(subscriptionDetails.child_id)
                          : "Unknown"}
                      </Typography>
                      <Typography variant="body2">
                        Course:{" "}
                        {subscriptionDetails
                          ? getCourseName(subscriptionDetails.course_id)
                          : "Unknown"}
                      </Typography>
                      <Typography variant="body2">
                        Date: {booking ? formatDate(booking.date) : "Unknown"}
                      </Typography>
                      <Typography variant="body2">
                        Status: {booking?.status || "Unknown"}
                      </Typography>
                    </>
                  );
                })()}
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
    </LocalizationProvider>
  );
};

export default BookingsPage;

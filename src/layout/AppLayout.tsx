import React from "react";
import { useAuth } from "../hooks/useAuth";
import LogoutIcon from "@mui/icons-material/Logout";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ClassIcon from "@mui/icons-material/Class";
import BookIcon from "@mui/icons-material/Book";
import PeopleIcon from "@mui/icons-material/People";
import PaymentIcon from "@mui/icons-material/Payment";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import BusinessIcon from "@mui/icons-material/Business";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";

const drawerWidth = 220;

const navItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
  { text: "Classes", icon: <ClassIcon />, path: "/classes" },
  { text: "Clubs", icon: <BusinessIcon />, path: "/clubs" },
  { text: "Parents", icon: <PeopleIcon />, path: "/parents" },
  { text: "Add Parent", icon: <AddIcon />, path: "/parents/add" },
  { text: "Add Child", icon: <AddIcon />, path: "/children/add" },
  { text: "Subscriptions", icon: <BookIcon />, path: "/subscriptions" },
  { text: "Bookings", icon: <BookIcon />, path: "/bookings" },
  { text: "Trainers", icon: <PeopleIcon />, path: "/trainers" },
  { text: "Payments", icon: <PaymentIcon />, path: "/payments" },
  { text: "Edit Club", icon: <BusinessIcon />, path: "/clubs/edit" },
  {
    text: "Notifications",
    icon: <NotificationsIcon />,
    path: "/notifications",
  },
  { text: "Settings", icon: <SettingsIcon />, path: "/settings" },
];

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = React.useState(true);
  const navigate = useNavigate();

  const { user, signOut } = useAuth();

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar position="fixed" sx={{ zIndex: 1201 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setOpen(!open)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            ClubHub Admin
          </Typography>
          {user && (
            <>
              <Typography
                variant="subtitle1"
                noWrap
                component="div"
                sx={{ ml: 2 }}
              >
                {user.user_metadata?.name || user.email}
              </Typography>
              <IconButton
                color="inherit"
                sx={{ ml: 1 }}
                onClick={async () => {
                  await signOut();
                  navigate("/auth");
                }}
                title="Logout"
              >
                <LogoutIcon />
              </IconButton>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Drawer
        variant="persistent"
        // open={open}
        open
        onClose={() => setOpen(false)}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
        }}
      >
        <Toolbar />
        <List>
          {navItems.map((item) => (
            <ListItemButton
              key={item.text}
              onClick={() => {
                navigate(item.path);
                setOpen(false);
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: "100%",
          height: "100vh",
          // ml: open ? `${drawerWidth}px` : 0,
          transition: "margin 0.3s",
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default AppLayout;

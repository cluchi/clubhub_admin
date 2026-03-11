import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import DashboardPage from "../pages/Dashboard/DashboardPage";
import ClassesPage from "../pages/Classes/ClassesPage";
import SubscriptionsPage from "../pages/Subscriptions/SubscriptionsPage";
import BookingsPage from "../pages/Bookings/BookingsPage";
import TrainersPage from "../pages/Trainers/TrainersPage";
import PaymentsPage from "../pages/Payments/PaymentsPage";
import NotificationsPage from "../pages/Notifications/NotificationsPage";
import SettingsPage from "../pages/Settings/SettingsPage";
import ClubsPage from "../pages/Clubs/ClubsPage";
import EditClubPage from "../pages/Clubs/EditClubPage";
import ParentsPage from "../pages/Parents/ParentsPage";
import AddParentPage from "../pages/Parents/AddParentPage";
import AddChildPage from "../pages/Children/AddChildPage";
import AuthPage from "../pages/Auth/AuthPage";

const AppRoutes = () => (
  <Routes>
    <Route path="/auth/*" element={<AuthPage />} />
    <Route
      path="/*"
      element={
        <ProtectedRoute>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/classes" element={<ClassesPage />} />
            <Route path="/subscriptions" element={<SubscriptionsPage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/trainers" element={<TrainersPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/clubs" element={<ClubsPage />} />
            <Route path="/clubs/edit" element={<EditClubPage />} />
            <Route path="/parents" element={<ParentsPage />} />
            <Route path="/parents/add" element={<AddParentPage />} />
            <Route path="/children/add" element={<AddChildPage />} />
          </Routes>
        </ProtectedRoute>
      }
    />
  </Routes>
);

export default AppRoutes;

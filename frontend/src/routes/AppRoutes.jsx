import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import DashboardLayout from "../layouts/DashboardLayout";

/* AUTH */
import Login from "../pages/Auth/Login";
import Signup from "../pages/Auth/Signup";

/* DASHBOARD PAGES */
import DashboardHome from "../pages/Dashboard/DashboardHome";
import Clients from "../pages/Dashboard/Clients";
import Invoices from "../pages/Dashboard/Invoices";
import Payments from "../pages/Dashboard/Payments";
import ReminderHistory from "../pages/Dashboard/ReminderHistory";
import Profile from "../pages/Dashboard/Profile";
import Settings from "../pages/Dashboard/Settings";

export default function AppRoutes() {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      {/* PROTECTED DASHBOARD */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          {/* Default */}
          <Route index element={<DashboardHome />} />

          {/* Pages */}
          <Route path="clients" element={<Clients />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="payments" element={<Payments />} />
          <Route path="reminders" element={<ReminderHistory />} />

          {/* Account */}
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "./store/authStore";

/* AUTH PAGES */
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";

/* DASHBOARD LAYOUT */
import DashboardLayout from "./components/dashboard/DashboardLayout";

/* DASHBOARD PAGES */
import DashboardHome from "./pages/Dashboard/DashboardHome";
import Clients from "./pages/Dashboard/Clients";
import Invoices from "./pages/Dashboard/Invoices";
import Payments from "./pages/Dashboard/Payments";
import ReminderHistory from "./pages/Dashboard/ReminderHistory";
import Profile from "./pages/Dashboard/Profile";
import Settings from "./pages/Dashboard/Settings"; // ✅ NEW

/* ROUTE GUARD */
import ProtectedRoute from "./routes/ProtectedRoute";

export default function App() {
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <BrowserRouter>
      <Routes>
        {/* ===================== */}
        {/* PUBLIC ROUTES */}
        {/* ===================== */}
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/signup"
          element={user ? <Navigate to="/" replace /> : <Signup />}
        />

        {/* ===================== */}
        {/* PROTECTED DASHBOARD */}
        {/* ===================== */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* MAIN DASHBOARD */}
          <Route index element={<DashboardHome />} />

          {/* CORE PAGES */}
          <Route path="clients" element={<Clients />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="payments" element={<Payments />} />
          <Route path="reminders" element={<ReminderHistory />} />

          {/* ACCOUNT */}
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} /> {/* ✅ NEW */}
        </Route>

        {/* ===================== */}
        {/* FALLBACK */}
        {/* ===================== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

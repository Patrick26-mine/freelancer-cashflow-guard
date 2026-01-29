import { Outlet } from "react-router-dom";
import Sidebar from "../ui/Sidebar";
import Navbar from "../ui/Navbar";

import { useState } from "react";
import "../../pages/Dashboard/DashboardLayout.css";

export default function DashboardLayout() {
  // ✅ Mobile Sidebar Toggle State
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="dashboard-shell">
      {/* ✅ Sidebar gets mobile toggle props */}
      <Sidebar
        mobileOpen={mobileOpen}
        closeMobile={() => setMobileOpen(false)}
      />

      <div className="dashboard-main">
        {/* ✅ Navbar gets hamburger toggle */}
        <Navbar onMenuClick={() => setMobileOpen(true)} />

       <div className="dashboard-page mobile-safe">
  <Outlet />
</div>

      </div>
    </div>
  );
}

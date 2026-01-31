import { Outlet } from "react-router-dom";
import Sidebar from "../ui/Sidebar";
import Navbar from "../ui/Navbar";

import { useState } from "react";
import "../../pages/Dashboard/DashboardLayout.css";

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="dashboard-shell">
      <Sidebar
        mobileOpen={mobileOpen}
        closeMobile={() => setMobileOpen(false)}
      />

      <div className="dashboard-main">
        <Navbar onMenuClick={() => setMobileOpen(true)} />

        {/* ✅ Page wrapper always full height */}
        <div className="dashboard-page">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

import { Outlet } from "react-router-dom";
import Sidebar from "../ui/Sidebar";
import Navbar from "../ui/Navbar";
import "../../pages/Dashboard/DashboardLayout.css";

export default function DashboardLayout() {
  return (
    <div className="dashboard-shell">
      <Sidebar />

      <div className="dashboard-main">
        {/* Navbar will be removed in next step */}
        <Navbar />

        <div className="dashboard-page">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

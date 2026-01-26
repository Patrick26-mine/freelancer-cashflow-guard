import { useAuthStore } from "../../store/authStore";

export default function Navbar() {
  const { user } = useAuthStore();

  return (
    <div className="navbar">
      <h2 className="navbar-title">Freelancer Cashflow Guard</h2>

      {/* Removed Profile + Logout (now only in Sidebar) */}
      {user && <div className="navbar-spacer" />}
    </div>
  );
}

import { useAuthStore } from "../../store/authStore";
import "./Navbar.css";

export default function Navbar() {
  const { user } = useAuthStore();

  return (
    <div className="navbar">
      {/* LEFT BRAND */}
      <div className="navbar-brand">
        <img
          src="/logo.png"
          alt="Logo"
          className="navbar-logo"
        />
        <h2 className="navbar-title">Freelancer Cashflow Guard</h2>
      </div>

      {/* RIGHT PROFILE ICON (Mobile + Desktop) */}
      {user && (
        <div className="navbar-profile">
          <div className="profile-circle">
            {user.email?.[0]?.toUpperCase()}
          </div>
        </div>
      )}
    </div>
  );
}

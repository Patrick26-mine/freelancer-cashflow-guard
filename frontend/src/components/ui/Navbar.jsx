import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import LogoMark from "./LogoMark";
import "./Navbar.css";

export default function Navbar() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="navbar">
      {/* LEFT BRAND — Clickable Logo */}
      <Link to="/" className="navbar-brand" style={{ textDecoration: "none" }}>
        <LogoMark size={28} />
        <h2 className="navbar-title">Freelancer Cashflow Guard</h2>
      </Link>

      {/* RIGHT PROFILE ICON */}
      {user && (
        <div
          className="navbar-profile"
          onClick={() => navigate("/profile")}
          style={{ cursor: "pointer" }}
          title="Profile"
        >
          <div className="profile-circle">
            {user.email?.[0]?.toUpperCase()}
          </div>
        </div>
      )}
    </div>
  );
}

import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Users,
  FileText,
  CreditCard,
  Bell,
  Settings,
  LogOut,
  User,
} from "lucide-react";

import { useSidebarStore } from "../../store/sidebarStore";
import { useAuthStore } from "../../store/authStore";
import { supabase } from "../../lib/supabaseClient";

import { useEffect, useState } from "react";
import "../ui/Sidebar.css";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const { isCollapsed, setCollapsed } = useSidebarStore();
  const user = useAuthStore((s) => s.user);

  const [profile, setProfile] = useState(null);

  const isMobile = window.innerWidth <= 768;

  useEffect(() => {
    if (!user) return;

    supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => setProfile(data));
  }, [user]);

  const avatarLetter =
    profile?.username?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase();

  async function handleLogout() {
    await supabase.auth.signOut();
    useAuthStore.getState().logout();
    navigate("/login");
  }

  return (
    <aside
      className={`sidebar ${isCollapsed && !isMobile ? "collapsed" : ""}`}
      onMouseEnter={() => !isMobile && setCollapsed(false)}
      onMouseLeave={() => !isMobile && setCollapsed(true)}
    >
      {/* ===== BRAND ===== */}
      {!isMobile && (
        <div className="sidebar-top">
          <div className="brand">
            <div className="brand-mark">
              <svg width="26" height="26" viewBox="0 0 100 100" fill="none">
                <path
                  d="M20 15 L35 85 L50 40 L65 85 L80 15"
                  stroke="#1f1f1f"
                  strokeWidth="8"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            {!isCollapsed && (
              <span className="brand-text">Cashflow Guard</span>
            )}
          </div>
        </div>
      )}

      {/* ===== NAV ===== */}
      <nav className="sidebar-nav">
        <NavItem to="/" label="Dashboard" icon={<Home size={22} />} active={location.pathname === "/"} mobile={isMobile} />
        <NavItem to="/clients" label="Clients" icon={<Users size={22} />} active={location.pathname === "/clients"} mobile={isMobile} />
        <NavItem to="/invoices" label="Invoices" icon={<FileText size={22} />} active={location.pathname === "/invoices"} mobile={isMobile} />
        <NavItem to="/payments" label="Payments" icon={<CreditCard size={22} />} active={location.pathname === "/payments"} mobile={isMobile} />
        <NavItem to="/reminders" label="Reminders" icon={<Bell size={22} />} active={location.pathname === "/reminders"} mobile={isMobile} />
        <NavItem to="/settings" label="Settings" icon={<Settings size={22} />} active={location.pathname === "/settings"} mobile={isMobile} />
        <NavItem to="/profile" label="Profile" icon={<User size={22} />} active={location.pathname === "/profile"} mobile={isMobile} />
      </nav>

      {/* ===== ACCOUNT FOOTER ===== */}
      {!isMobile && user && (
        <div className="sidebar-footer">
          <div
            style={{
              background: "rgba(255,255,255,0.7)",
              borderRadius: 16,
              padding: 14,
              margin: 12,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "#6366f1",
                color: "#fff",
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 10,
              }}
            >
              {avatarLetter}
            </div>

            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, color: "#64748b" }}>Account</div>
              <div
                style={{
                  background: "#fff7ed",
                  padding: "6px 10px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#9a3412",
                  maxWidth: 180,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={user.email}
              >
                {user.email}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => navigate("/profile")}
                style={{
                  flex: 1,
                  borderRadius: 10,
                  padding: "6px 10px",
                  fontSize: 12,
                  fontWeight: 700,
                  border: "1px solid #c7d2fe",
                  background: "#eef2ff",
                  cursor: "pointer",
                }}
              >
                View Profile
              </button>

              <button
                onClick={handleLogout}
                style={{
                  borderRadius: 10,
                  padding: "6px 10px",
                  fontSize: 12,
                  fontWeight: 700,
                  border: "1px solid #fecdd3",
                  background: "#fff1f2",
                  color: "#9f1239",
                  cursor: "pointer",
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

function NavItem({ to, icon, active, mobile, label }) {
  return (
    <Link
      to={to}
      className={`nav-item ${active ? "active" : ""}`}
      title={label}
    >
      {icon}
      {!mobile && <span className="nav-label">{label}</span>}
    </Link>
  );
}

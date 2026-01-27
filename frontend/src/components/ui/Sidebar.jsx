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
  ChevronUp,
} from "lucide-react";

import { useSidebarStore } from "../../store/sidebarStore";
import { useAuthStore } from "../../store/authStore";
import { supabase } from "../../lib/supabaseClient";

import { useState } from "react";
import "../ui/Sidebar.css";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const { isCollapsed, setCollapsed } = useSidebarStore();
  const user = useAuthStore((s) => s.user);

  const [openMenu, setOpenMenu] = useState(false);

const [profile, setProfile] = useState(null);

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
  profile?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase();

  // ✅ Logout Handler (FIXED)
  const handleLogout = async () => {
    await supabase.auth.signOut();

    // ✅ Clear Zustand user state
    useAuthStore.getState().logout();

    // ✅ Redirect to login
    navigate("/login");
  };

  return (
    <aside
      className={`sidebar ${isCollapsed ? "collapsed" : ""}`}
      onMouseEnter={() => setCollapsed(false)}
      onMouseLeave={() => {
        setCollapsed(true);
        setOpenMenu(false);
      }}
    >
      {/* ===== BRAND ===== */}
      <div className="sidebar-top">
        <div className="brand">
          {/* Embedded Logo */}
          <div className="brand-mark">
            <svg width="26" height="26" viewBox="0 0 100 100" fill="none">
              <path
                d="M20 15 L35 85 L50 40 L65 85 L80 15"
                stroke="#1f1f1f"
                strokeWidth="8"
                strokeLinejoin="round"
              />
              <path
                d="M28 25 C18 40, 18 60, 28 78"
                stroke="#1f1f1f"
                strokeWidth="3"
              />
              <path
                d="M25 35 C18 32, 18 42, 25 40"
                stroke="#1f1f1f"
                strokeWidth="2"
              />
              <path
                d="M25 50 C18 47, 18 57, 25 55"
                stroke="#1f1f1f"
                strokeWidth="2"
              />
              <path
                d="M25 65 C18 62, 18 72, 25 70"
                stroke="#1f1f1f"
                strokeWidth="2"
              />
            </svg>
          </div>

          {!isCollapsed && <span className="brand-text">Cashflow Guard</span>}
        </div>
      </div>

      {/* ===== NAV ===== */}
      <nav className="sidebar-nav">
        <NavItem
          to="/"
          label="Dashboard"
          icon={<Home size={20} />}
          active={location.pathname === "/"}
          collapsed={isCollapsed}
        />
        <NavItem
          to="/clients"
          label="Clients"
          icon={<Users size={20} />}
          active={location.pathname === "/clients"}
          collapsed={isCollapsed}
        />
        <NavItem
          to="/invoices"
          label="Invoices"
          icon={<FileText size={20} />}
          active={location.pathname === "/invoices"}
          collapsed={isCollapsed}
        />
        <NavItem
          to="/payments"
          label="Payments"
          icon={<CreditCard size={20} />}
          active={location.pathname === "/payments"}
          collapsed={isCollapsed}
        />
        <NavItem
          to="/reminders"
          label="Reminders"
          icon={<Bell size={20} />}
          active={location.pathname === "/reminders"}
          collapsed={isCollapsed}
        />

        <NavItem
          to="/settings"
          label="Settings"
          icon={<Settings size={20} />}
          active={location.pathname === "/settings"}
          collapsed={isCollapsed}
        />
      </nav>

      {/* ===== PROFILE DROPDOWN FOOTER ===== */}
      <div className="sidebar-footer">
        <div
          className="profile-trigger"
          onClick={() => setOpenMenu(!openMenu)}
        >
<div className="mini-avatar">
  {profile?.avatar_url ? (
    <img src={profile.avatar_url} alt="avatar" />
  ) : (
    avatarLetter
  )}
</div>

          {!isCollapsed && (
            <>
              <div className="profile-meta">
<p className="profile-email">{profile?.username}</p>
                <span className="profile-role">Account</span>
              </div>
              <ChevronUp size={18} />
            </>
          )}
        </div>

        {/* Dropdown */}
        {openMenu && !isCollapsed && (
          <div className="profile-menu">
            <button onClick={() => navigate("/profile")}>
              <User size={16} />
              Profile
            </button>

            <button onClick={handleLogout} className="danger">
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

function NavItem({ to, label, icon, active, collapsed }) {
  return (
    <Link
      to={to}
      className={`nav-item ${active ? "active" : ""}`}
      title={collapsed ? label : undefined}
    >
      {icon}
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}

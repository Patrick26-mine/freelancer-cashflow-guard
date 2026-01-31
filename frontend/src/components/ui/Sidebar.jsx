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

import { useState, useEffect } from "react";
import "../ui/Sidebar.css";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const { isCollapsed, setCollapsed } = useSidebarStore();
  const user = useAuthStore((s) => s.user);

  const [openMenu, setOpenMenu] = useState(false);
  const [profile, setProfile] = useState(null);

  // ✅ Mobile detection
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
    profile?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase();

  // ✅ Logout Handler
  const handleLogout = async () => {
    await supabase.auth.signOut();
    useAuthStore.getState().logout();
    navigate("/login");
  };

  return (
    <aside
      className={`sidebar ${isCollapsed && !isMobile ? "collapsed" : ""}`}
      onMouseEnter={() => {
        if (!isMobile) setCollapsed(false);
      }}
      onMouseLeave={() => {
        if (!isMobile) {
          setCollapsed(true);
          setOpenMenu(false);
        }
      }}
    >
      {/* ===== BRAND (Desktop Only) ===== */}
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
        <NavItem
          to="/"
          icon={<Home size={22} />}
          active={location.pathname === "/"}
          mobile={isMobile}
          label="Dashboard"
        />
        <NavItem
          to="/clients"
          icon={<Users size={22} />}
          active={location.pathname === "/clients"}
          mobile={isMobile}
          label="Clients"
        />
        <NavItem
          to="/invoices"
          icon={<FileText size={22} />}
          active={location.pathname === "/invoices"}
          mobile={isMobile}
          label="Invoices"
        />
        <NavItem
          to="/payments"
          icon={<CreditCard size={22} />}
          active={location.pathname === "/payments"}
          mobile={isMobile}
          label="Payments"
        />
        <NavItem
          to="/reminders"
          icon={<Bell size={22} />}
          active={location.pathname === "/reminders"}
          mobile={isMobile}
          label="Reminders"
        />
        <NavItem
          to="/settings"
          icon={<Settings size={22} />}
          active={location.pathname === "/settings"}
          mobile={isMobile}
          label="Settings"
        />
        <NavItem
          to="/profile"
          icon={<User size={22} />}
          active={location.pathname === "/profile"}
          mobile={isMobile}
          label="Profile"
        />
      </nav>

      {/* ===== FOOTER (Desktop Only) ===== */}
      {!isMobile && (
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

      {/* ✅ Label wrapper added */}
      {!mobile && <span className="nav-label">{label}</span>}
    </Link>
  );
}

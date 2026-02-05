import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useThemeStore } from "../../store/themeStore";
import { supabase } from "../../lib/supabaseClient";
import "./Profile.css";

export default function Profile() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const colors = useThemeStore((s) => s.colors);
  const navigate = useNavigate();

  const [username, setUsername] = useState("");

  if (!user) return null;

  /* ✅ Load username from DB */
  useEffect(() => {
    const loadProfile = async () => {
      const { data } = await supabase
        .from("user_profiles")
        .select("username")
        .eq("user_id", user.id)
        .single();

      if (data?.username) setUsername(data.username);
    };

    loadProfile();
  }, [user]);

  const letter = username
    ? username.charAt(0).toUpperCase()
    : user.email.charAt(0).toUpperCase();

  /* ✅ Copy Handler */
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    alert("Copied!");
  }

  /* ✅ Logout */
  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    navigate("/login");
  }

  return (
    <div className="profile-page">
      {/* TITLE */}
      <div className="profile-headline">
        <h2>Profile</h2>
        <p>Your account identity, security, and preferences.</p>
      </div>

      {/* CARD */}
      <div className="profile-card">
        {/* HERO */}
        <div className="profile-hero">
          <div className="avatar-circle">{letter}</div>

          <div className="hero-meta">
            <div className="hero-email" title={user.email}>
              {user.email}
            </div>

            <div className="hero-status">
              Account active • Freelancer Cashflow Guard™
            </div>
          </div>
        </div>

        <div className="divider" />

        {/* ACCOUNT SECTION */}
        <section className="profile-section">
          <h4>Account</h4>

          <div className="info-row">
            <span>User ID</span>

            <code
              title="Click to copy full ID"
              onClick={() => copyToClipboard(user.id)}
              style={{
                cursor: "pointer",
                background: "#fff7ed",
                padding: "6px 10px",
                borderRadius: 10,
                fontSize: 12,
                maxWidth: "180px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.id}
            </code>
          </div>

          <div className="info-row">
            <span>Email</span>
            <strong
              style={{
                background: "#fef3c7",
                padding: "6px 10px",
                borderRadius: 10,
                fontWeight: 700,
              }}
            >
              {user.email}
            </strong>
          </div>

          <div className="info-row">
            <span>Username</span>
            <strong
              style={{
                background: "#fef3c7",
                padding: "6px 10px",
                borderRadius: 10,
                fontWeight: 700,
              }}
            >
              {username || "Not set yet"}
            </strong>
          </div>
        </section>

        <div className="divider" />

        {/* ✅ LOGOUT */}
        <div style={{ textAlign: "right" }}>
          <button
            onClick={handleLogout}
            style={{
              background: "#fee2e2",
              color: "#991b1b",
              border: "1px solid #fecaca",
              borderRadius: 12,
              padding: "10px 18px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react"; // ✅ FIXED
import { useAuthStore } from "../../store/authStore";
import { useThemeStore } from "../../store/themeStore";
import { supabase } from "../../lib/supabaseClient";
import "./Profile.css";

export default function Profile() {
  const user = useAuthStore((s) => s.user);
  const colors = useThemeStore((s) => s.colors);

  const [username, setUsername] = useState("");

  if (!user) return null;

  // ✅ Load username from DB
  useEffect(() => {
    const loadProfile = async () => {
      const { data } = await supabase
        .from("user_profiles")
        .select("username")
        .eq("user_id", user.id)
        .single();

      if (data?.username) {
        setUsername(data.username);
      }
    };

    loadProfile();
  }, [user]);

  const letter = username
    ? username.charAt(0).toUpperCase()
    : user.email.charAt(0).toUpperCase();

  return (
    <div className="profile-page" style={{ background: colors.bg }}>
      <div className="profile-headline">
        <h2>Profile</h2>
        <p>Your account identity, security, and preferences.</p>
      </div>

      <div className="profile-card">
        <div className="profile-hero">
          <div className="avatar-circle">{letter}</div>

          <div className="hero-meta">
            <div className="hero-email">
              {username || user.email}
            </div>

            <div className="hero-status">
              Account active • Freelancer Cashflow Guard™
            </div>
          </div>
        </div>

        <div className="divider" />

        <section className="profile-section">
          <h4>Account</h4>

          <div className="info-row">
            <span>User ID</span>
            <code>{user.id}</code>
          </div>

          <div className="info-row">
            <span>Email</span>
            <strong>{user.email}</strong>
          </div>

          <div className="info-row">
            <span>Username</span>
            <strong>{username || "Not set yet"}</strong>
          </div>
        </section>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuthStore } from "../../store/authStore";
import { useThemeStore } from "../../store/themeStore";
import "./Profile.css";

export default function Profile() {
  const user = useAuthStore((s) => s.user);
  const colors = useThemeStore((s) => s.colors);

  // ✅ New States
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [status, setStatus] = useState("");

  if (!user) return null;

  const letter = username
    ? username.charAt(0).toUpperCase()
    : user.email?.charAt(0).toUpperCase();

  // ================================
  // ✅ Load Profile Data
  // ================================
  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      const { data } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setUsername(data.username || "");
        setAvatarUrl(data.avatar_url || "");
      }
    };

    loadProfile();
  }, [user]);

  // ================================
  // ✅ Save Profile Data
  // ================================
  const saveProfile = async () => {
    setStatus("Saving...");

    // Save in DB
    await supabase.from("user_profiles").upsert({
      user_id: user.id,
      username,
      avatar_url: avatarUrl,
      updated_at: new Date(),
    });

    // Save username into Supabase Auth metadata (for emails)
    await supabase.auth.updateUser({
      data: { username },
    });

    setStatus("Profile updated ✅");
    setTimeout(() => setStatus(""), 2500);
  };

  return (
    <div className="profile-page" style={{ background: colors.bg }}>
      {/* ===== HEADER STRIP ===== */}
      <div className="profile-headline">
        <h2>Profile</h2>
        <p>Your account identity, security, and preferences.</p>
      </div>

      {/* ===== MAIN CARD ===== */}
      <div className="profile-card">
        {/* ===== TOP IDENTITY ===== */}
        <div className="profile-hero">
          {/* ✅ Avatar Image or Letter */}
          <div className="avatar-circle">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="avatar"
                className="avatar-img"
              />
            ) : (
              letter
            )}
          </div>

          <div className="hero-meta">
            <div className="hero-email">
              {username ? username : user.email}
            </div>

            <div className="hero-status">
              Account active • Freelancer Cashflow Guard™
            </div>
          </div>
        </div>

        <div className="divider" />

        {/* ===== ACCOUNT ===== */}
        <section className="profile-section">
          <h4>Account Identity</h4>

          {/* ✅ Username */}
          <div className="info-row">
            <span>Username</span>
            <input
              className="input"
              value={username}
              placeholder="Set your username"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* ✅ Avatar */}
          <div className="info-row">
            <span>Profile Image URL</span>
            <input
              className="input"
              value={avatarUrl}
              placeholder="Paste avatar image link"
              onChange={(e) => setAvatarUrl(e.target.value)}
            />
          </div>

          {/* Primary Email */}
          <div className="info-row">
            <span>Primary Email</span>
            <strong>{user.email}</strong>
          </div>

          {/* Save Button */}
          <div className="profile-save-wrap">
            <button className="profile-save-btn" onClick={saveProfile}>
              Save Profile
            </button>
          </div>

          {/* Status */}
          {status && <p className="profile-status">{status}</p>}
        </section>

        <div className="divider" />

        {/* ===== SECURITY ===== */}
        <section className="profile-section">
          <h4>Security</h4>

          <div className="coming-soon">
            Password management — coming soon
          </div>
          <div className="coming-soon">
            Two-factor authentication — coming soon
          </div>
        </section>

        <div className="divider" />

        {/* ===== PREFERENCES ===== */}
        <section className="profile-section">
          <h4>Preferences</h4>

          <div className="coming-soon">
            Notification settings — coming soon
          </div>
          <div className="coming-soon">
            Billing & plans — coming soon
          </div>
        </section>
      </div>
    </div>
  );
}

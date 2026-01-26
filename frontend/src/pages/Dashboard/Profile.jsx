import { useAuthStore } from "../../store/authStore";
import { useThemeStore } from "../../store/themeStore";
import "./Profile.css";

export default function Profile() {
  const user = useAuthStore((s) => s.user);
  const colors = useThemeStore((s) => s.colors);

  if (!user) return null;

  const letter = user.email?.charAt(0).toUpperCase();

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
          <div className="avatar-circle">{letter}</div>

          <div className="hero-meta">
            <div className="hero-email">{user.email}</div>
            <div className="hero-status">
              Account active • Freelancer Cashflow Guard™
            </div>
          </div>
        </div>

        <div className="divider" />

        {/* ===== ACCOUNT ===== */}
        <section className="profile-section">
          <h4>Account</h4>

          <div className="info-row">
            <span>User ID</span>
            <code>{user.id}</code>
          </div>

          <div className="info-row">
            <span>Primary Email</span>
            <strong>{user.email}</strong>
          </div>

          <div className="info-row">
            <span>Recovery Email</span>
            <input
              placeholder="Add recovery email (Premium)"
              className="input premium-disabled"
              disabled
            />
          </div>
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

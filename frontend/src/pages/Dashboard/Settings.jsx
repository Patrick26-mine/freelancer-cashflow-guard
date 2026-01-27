import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuthStore } from "../../store/authStore";
import "./Settings.css";

export default function Settings() {
  const user = useAuthStore((s) => s.user);

  const [loading, setLoading] = useState(true);

  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [reminderAlerts, setReminderAlerts] = useState(true);
  const [paymentAlerts, setPaymentAlerts] = useState(true);

  const [status, setStatus] = useState("");

  // ============================
  // Load Settings
  // ============================
  useEffect(() => {
    if (!user) return;

    const fetchSettings = async () => {
      setLoading(true);

      const { data } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setRecoveryEmail(data.recovery_email || "");
        setReminderAlerts(data.reminder_alerts);
        setPaymentAlerts(data.payment_alerts);
      }

      setLoading(false);
    };

    fetchSettings();
  }, [user]);

  // ============================
  // Save Settings (DB Backup)
  // ============================
  const saveSettings = async () => {
    setStatus("Saving...");

    await supabase.from("user_settings").upsert({
      user_id: user.id,
      recovery_email: recoveryEmail,
      reminder_alerts: reminderAlerts,
      payment_alerts: paymentAlerts,
      updated_at: new Date(),
    });

    setStatus("Saved successfully ✅");
    setTimeout(() => setStatus(""), 2500);
  };

  // ============================
  // Verify Recovery Email (Supabase Auth)
  // ============================
  const verifyRecoveryEmail = async () => {
    if (!recoveryEmail) {
      setStatus("Enter a valid email ❌");
      return;
    }

    setStatus("Sending verification email...");

    const { error } = await supabase.auth.updateUser({
      email: recoveryEmail,
    });

    if (error) {
      setStatus("Error: " + error.message);
    } else {
      setStatus("Verification email sent ✅ Check inbox.");
    }

    setTimeout(() => setStatus(""), 4000);
  };

// ============================
// Password Reset Email (With Redirect)
// ============================
const sendPasswordReset = async () => {
  setStatus("Sending reset email...");

  const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
    redirectTo:
      "https://freelancer-cashflow-guard.vercel.app/reset-password",
  });

  if (error) {
    setStatus("Error sending reset email ❌ " + error.message);
  } else {
    setStatus("Password reset email sent ✅ Check inbox.");
  }

  setTimeout(() => setStatus(""), 4000);
};


  if (loading) {
    return (
      <div className="settings-page">
        <h2>Loading Settings...</h2>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-headline">
        <h2>Settings</h2>
        <p>Manage alerts, recovery email, and security.</p>
      </div>

      <div className="settings-card">
        {/* ================= ACCOUNT ================= */}
        <section className="settings-section">
          <h4>Account Recovery</h4>

          <div className="settings-row">
            <span>Recovery Email</span>

            <input
              className="input"
              value={recoveryEmail}
              placeholder="Add backup email"
              onChange={(e) => setRecoveryEmail(e.target.value)}
            />
          </div>

          {/* ✅ TWO BUTTONS NOW */}
          <div className="settings-actions-row">
            <button className="settings-action" onClick={saveSettings}>
              Save Recovery Email
            </button>

            <button
              className="settings-action secondary"
              onClick={verifyRecoveryEmail}
            >
              Verify Recovery Email →
            </button>
          </div>
        </section>

        <div className="divider" />

        {/* ================= ALERTS ================= */}
        <section className="settings-section">
          <h4>Notifications</h4>

          <div className="toggle-row">
            <span>Reminder Alerts</span>
            <input
              type="checkbox"
              checked={reminderAlerts}
              onChange={() => setReminderAlerts(!reminderAlerts)}
            />
          </div>

          <div className="toggle-row">
            <span>Payment Alerts</span>
            <input
              type="checkbox"
              checked={paymentAlerts}
              onChange={() => setPaymentAlerts(!paymentAlerts)}
            />
          </div>

          <button className="settings-action" onClick={saveSettings}>
            Save Alert Preferences
          </button>
        </section>

        <div className="divider" />

        {/* ================= SECURITY ================= */}
        <section className="settings-section">
          <h4>Security</h4>

          <button
            className="settings-action danger"
            onClick={sendPasswordReset}
          >
            Send Password Reset Email
          </button>
        </section>

        {/* STATUS */}
        {status && <p className="settings-status">{status}</p>}
      </div>
    </div>
  );
}

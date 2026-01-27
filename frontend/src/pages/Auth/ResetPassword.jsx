import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState("");

  // ============================
  // Update Password
  // ============================
  const handleReset = async (e) => {
    e.preventDefault();
    setStatus("Updating password...");

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setStatus("Error ❌ " + error.message);
    } else {
      setStatus("Password updated successfully ✅");

      // Redirect back to login
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleReset}>
        <h2>Reset Password</h2>

        <p style={{ fontSize: "14px", color: "#555" }}>
          Enter a new password to secure your account.
        </p>

        <input
          type="password"
          placeholder="New Password (min 6 chars)"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <button type="submit">Update Password</button>

        {status && (
          <p style={{ marginTop: "12px", fontSize: "14px" }}>{status}</p>
        )}
      </form>
    </div>
  );
}

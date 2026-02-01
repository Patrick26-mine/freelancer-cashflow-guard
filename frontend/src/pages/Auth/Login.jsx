import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";

import LogoMark from "../../components/ui/LogoMark";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // ✅ prevents spam clicks

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (loading) return;
    setLoading(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      // ✅ Friendly rate limit message
      if (err.message.toLowerCase().includes("rate limit")) {
        setError("Too many login attempts. Please wait 10 minutes and try again.");
      } else {
        setError(err.message);
      }
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleLogin}>
        {/* BRAND */}
        <div className="auth-brand">
          <div className="auth-logo">
            <LogoMark size={30} />
          </div>

          <h1>Freelancer Cashflow Guard</h1>
          <p>Login to continue</p>
        </div>

        {error && <p className="error">{error}</p>}

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* PASSWORD + TOGGLE */}
        <div className="password-wrap">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <span
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </span>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="auth-footer">
          Don’t have an account? <Link to="/signup">Sign up</Link>
        </p>
      </form>
    </div>
  );
}

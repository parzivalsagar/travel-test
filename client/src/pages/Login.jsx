import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login({ email, password });
      navigate(location.state?.from || "/home", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-bg">
      <div className="login-wrapper">
        <div className="login-box">
          <h2>Welcome Traveller {"\uD83C\uDF3F"}</h2>
          <p className="login-sub">Log in to continue your journey to Chikkamagaluru</p>

          {error && <div className="alert alert-danger py-2 small">{error}</div>}

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              className="form-control"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              className="form-control mt-3"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button className="btn btn-success w-100 mt-4" disabled={busy}>
              {busy ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-3 mb-0 small">
            New here?{" "}
            <Link to="/register" className="text-decoration-none">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
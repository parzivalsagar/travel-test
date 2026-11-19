import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await register({ name, email, password });
      navigate("/home", { replace: true });
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
          <p className="login-sub">Begin your peaceful journey to Chikkamagaluru</p>

          {error && <div className="alert alert-danger py-2 small">{error}</div>}

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              className="form-control"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="email"
              className="form-control mt-3"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              className="form-control mt-3"
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
            <button className="btn btn-success w-100 mt-4" disabled={busy}>
              {busy ? "Creating..." : "Create Account"}
            </button>
          </form>

          <p className="mt-3 mb-0 small">
            Already have an account?{" "}
            <Link to="/login" className="text-decoration-none">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
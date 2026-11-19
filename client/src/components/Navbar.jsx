import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTrip } from "../context/TripContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { trip } = useTrip();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const count = trip?.destinations?.length || 0;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark custom-nav">
      <div className="container">
        <Link className="navbar-brand fw-bold" to={user ? "/home" : "/login"}>
          The Chikkamagaluru Escape
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-controls="mainNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="mainNav">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
            {user && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/home">Home</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/places">Destinations</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/plan">
                    My Plan{count > 0 ? ` (${count})` : ""}
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/dashboard">Dashboard</NavLink>
                </li>
                <li className="nav-item">
                  <span className="nav-link disabled text-white-50">
                    Hi, {user.name?.split(" ")[0]}
                  </span>
                </li>
                <li className="nav-item">
                  <button className="btn btn-sm btn-outline-light" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            )}
            {!user && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/places">Destinations</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/login">Login</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="btn btn-sm btn-success" to="/register">Register</NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

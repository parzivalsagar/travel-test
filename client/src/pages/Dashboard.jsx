import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useTrip } from "../context/TripContext";
import { formatINR } from "../services/format";

export default function Dashboard() {
  const navigate = useNavigate();
  const { setActiveTrip } = useTrip();

  const [trips, setTrips] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAll() {
    setLoading(true);
    try {
      const [t, b] = await Promise.all([api.get("/trips"), api.get("/bookings")]);
      setTrips(t.data.trips);
      setBookings(b.data.bookings);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  function openInPlan(trip) {
    setActiveTrip(trip);
    navigate("/plan");
  }

  function bookTrip(trip) {
    setActiveTrip(trip);
    navigate("/checkout");
  }

  function formatDate(value) {
    return new Date(value).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success" role="status" />
      </div>
    );
  }

  return (
    <div className="container my-4 mb-5">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h2 className="mb-0">Your Journeys {"\uD83D\uDCDA"}</h2>
        <Link to="/places" className="btn btn-success">Plan a New Trip</Link>
      </div>

      {error && <div className="alert alert-danger mt-3">{error}</div>}

      <h5 className="mt-4">Trips</h5>
      {trips.length === 0 && (
        <p className="text-muted">No trips yet. Browse destinations to build one.</p>
      )}
      <div className="row g-3">
        {trips.map((t) => (
          <div className="col-md-6 col-lg-4" key={t._id}>
            <div className="card h-100 p-3">
              <div className="d-flex justify-content-between">
                <h6 className="mb-1">{t.name}</h6>
                <span className="text-success small">{"\uD83D\uDCB0"} {formatINR(t.totalCost)}</span>
              </div>
              <p className="small text-muted mb-1">
                {t.travellers} traveller{t.travellers > 1 ? "s" : ""} {"\u00B7"} {t.destinations.length} destination{t.destinations.length !== 1 ? "s" : ""} {"\u00B7"} {t.status}
              </p>
              <p className="small text-muted mb-2">
                {t.destinations.map((d) => d.name).join(", ") || "Empty plan"}
              </p>
              {t.destinations.length > 0 ? (
                <div className="mt-auto d-grid gap-2">
                  <button className="btn btn-sm btn-outline-success" onClick={() => openInPlan(t)}>
                    Continue Planning
                  </button>
                  <button className="btn btn-sm btn-success" onClick={() => bookTrip(t)}>
                    Book This Trip
                  </button>
                </div>
              ) : (
                <button className="btn btn-sm btn-outline-success mt-auto" onClick={() => openInPlan(t)}>
                  Add Destinations
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <h5 className="mt-5">Bookings</h5>
      {bookings.length === 0 && (
        <p className="text-muted">No bookings yet.</p>
      )}
      <div className="row g-3">
        {bookings.map((b) => (
          <div className="col-md-6 col-lg-4" key={b._id}>
            <div className="card h-100 p-3">
              <div className="d-flex justify-content-between">
                <strong className="small">{b.reference}</strong>
                <span className="badge bg-success">{b.status}</span>
              </div>
              <p className="small text-muted mb-1">
                {formatDate(b.travelDate)} {"\u00B7"} {b.travellers} traveller{b.travellers > 1 ? "s" : ""}
              </p>
              <p className="small mb-1">
                {b.destinations.map((d) => d.name).join(", ")}
              </p>
              <div className="d-flex justify-content-between align-items-center mt-auto pt-2">
                <strong className="text-success">{formatINR(b.totalAmount)}</strong>
                <Link to={`/receipt/${b._id}`} className="btn btn-sm btn-outline-success">
                  View Receipt
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
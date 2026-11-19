import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTrip } from "../context/TripContext";
import { formatINR } from "../services/format";

export default function Plan() {
  const { trip, loadTrip, removeDestination, updateTrip, startNewTrip, loading } =
    useTrip();
  const navigate = useNavigate();

  const [travellers, setTravellers] = useState("");
  const [budget, setBudget] = useState("");
  const [saved, setSaved] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadTrip();
  }, [loadTrip]);

  useEffect(() => {
    setTravellers(trip?.travellers ?? "");
    setBudget(trip?.budget ?? "");
  }, [trip?._id, trip?.travellers, trip?.budget]);

  async function handleRemove(destId) {
    try {
      await removeDestination(destId);
      setSaved("Destination removed");
      setTimeout(() => setSaved(""), 2000);
    } catch (err) {
      setError(err.message);
    }
  }

  async function applySettings() {
    const t = Number(travellers);
    const b = Number(budget);
    if (!t || t < 1) {
      setError("Travellers must be at least 1");
      return;
    }
    if (Number.isNaN(b) || b < 0) {
      setError("Budget cannot be negative");
      return;
    }
    setError("");
    try {
      await updateTrip({ travellers: t, budget: b });
      setSaved("Plan updated");
      setTimeout(() => setSaved(""), 2000);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleNewTrip() {
    await startNewTrip();
  }

  const destinations = trip?.destinations || [];
  const total = trip?.totalCost || 0;
  const perPerson = trip?.perPerson || 0;
  const withinBudget = trip?.withinBudget;

  let budgetBadge = null;
  if (trip && trip.budget > 0) {
    budgetBadge = withinBudget ? (
      <span className="badge bg-success">Within budget</span>
    ) : (
      <span className="badge bg-danger">Over budget by {formatINR(total - trip.budget)}</span>
    );
  }

  return (
    <div className="container my-4 mb-5">
      <h2 className="text-center mb-1">Your Travel Plan {"\uD83E\uDEF6"}</h2>
      <p className="text-center fst-italic mb-4">
        {"\u201C"}Take only memories, leave only footprints.{"\u201D"}
      </p>

      {error && <div className="alert alert-danger">{error}</div>}
      {saved && <div className="alert alert-success py-2">{saved}</div>}

      {!loading && destinations.length === 0 && (
        <div className="text-center py-5">
          <p className="text-muted fs-5 mb-3">
            Your plan is empty. Add some destinations to get started.
          </p>
          <Link to="/places" className="btn btn-success">
            Browse Destinations
          </Link>
        </div>
      )}

      {destinations.length > 0 && (
        <div className="row g-4">
          <div className="col-lg-3">
            <div className="card p-3 mb-3">
              <h6>Settings</h6>
              <label className="form-label small mt-1">Travellers</label>
              <input
                type="number"
                className="form-control"
                min="1"
                max="50"
                value={travellers}
                onChange={(e) => setTravellers(e.target.value)}
                onBlur={applySettings}
              />
              <label className="form-label small mt-3">Budget (₹)</label>
              <input
                type="number"
                className="form-control"
                min="0"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                onBlur={applySettings}
              />
              <p className="mt-2 mb-1 small">
                {"\uD83D\uDCB0"} Per person total: <strong>{formatINR(perPerson)}</strong>
              </p>
              <p className="mb-1 small">
                {"\uD83E\uDDFE"} Total for {travellers || trip?.travellers}:
              </p>
              <h4 className="text-success">{formatINR(total)}</h4>
              {budgetBadge}
            </div>

            <button className="btn btn-success w-100" onClick={() => navigate("/checkout")}>
              Proceed to Booking
            </button>
            <button className="btn btn-outline-secondary w-100 mt-2" onClick={handleNewTrip}>
              Start New Trip
            </button>
          </div>

          <div className="col-lg-9">
            {destinations.map((d, i) => (
              <div key={d._id} className="card mb-3 p-3">
                <div className="d-flex align-items-center gap-3">
                  <img
                    src={d.image}
                    alt={d.name}
                    style={{ width: 90, height: 70, objectFit: "cover", borderRadius: 12 }}
                  />
                  <div className="flex-grow-1">
                    <h6 className="mb-1">{i + 1}. {d.name}</h6>
                    <p className="small text-muted mb-0">{d.category} {"\u00B7"} {d.distanceKm} km</p>
                  </div>
                  <div className="text-end">
                    <p className="mb-1">{formatINR(d.price)} <small className="text-muted">/ person</small></p>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleRemove(d._id)}>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <Link to="/places" className="btn btn-outline-success">
              + Add more destinations
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
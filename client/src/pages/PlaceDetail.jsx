import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { useTrip } from "../context/TripContext";
import { useAuth } from "../context/AuthContext";
import { formatINR } from "../services/format";

export default function PlaceDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addDestination, hasDestination, loading: tripLoading } = useTrip();

  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/destinations/${id}`)
      .then(({ data }) => setPlace(data.destination))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleAdd() {
    if (!user) {
      navigate("/login", { state: { from: `/places/${id}` } });
      return;
    }
    setBusy(true);
    try {
      await addDestination(id);
      setToast("Added to your plan");
      setTimeout(() => setToast(""), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success" role="status" />
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error || "Destination not found"}</div>
        <Link to="/places" className="btn btn-outline-secondary">Back to places</Link>
      </div>
    );
  }

  const added = hasDestination(place._id);

  return (
    <div className="container my-4">
      <div className="card overflow-hidden rounded-4">
        <img
          src={place.image}
          alt={place.name}
          style={{ width: "100%", maxHeight: 420, objectFit: "cover" }}
        />
        <div className="card-body p-4">
          <div className="d-flex flex-wrap justify-content-between align-items-start gap-2">
            <div>
              <h2>{place.name}</h2>
              <p className="fst-italic text-muted">{place.quote}</p>
            </div>
            <div className="text-end">
              <span className="badge-soft d-inline-block mb-1">{place.category}</span>
              <h4 className="text-success">{formatINR(place.price)} <small className="text-muted">/ person</small></h4>
              <p className="mb-0 small text-muted">{"\uD83D\uDCCD"} {place.distanceKm} km from town</p>
            </div>
          </div>

          <p className="mt-3">{place.description}</p>

          <div className="mt-4 d-flex gap-2 flex-wrap">
            {added ? (
              <Link to="/plan" className="btn btn-outline-success">
                Added {"\u2713"} View My Plan
              </Link>
            ) : (
              <button className="btn btn-success" onClick={handleAdd} disabled={busy || tripLoading}>
                {busy ? "Adding..." : "Add to My Plan"}
              </button>
            )}
            <Link to="/places" className="btn btn-outline-secondary">
              Back to Places
            </Link>
          </div>
        </div>
      </div>

      {toast && <div className="toast-box show">{toast}</div>}
    </div>
  );
}
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useTrip } from "../context/TripContext";
import { formatINR } from "../services/format";

export default function Checkout() {
  const { trip, loadTrip, loading } = useTrip();
  const navigate = useNavigate();

  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [tripError, setTripError] = useState("");

  useEffect(() => {
    loadTrip().catch((err) => setTripError(err.message));
  }, [loadTrip]);

  const destinations = trip?.destinations || [];

  async function handleBook(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
try {
        const res = await api.post("/bookings", {
          tripId: trip._id,
          contactName,
          phone,
          travelDate,
        });
        navigate(`/receipt/${res.data.booking._id}`);
      } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <div className="container py-5 text-center spinner-border text-success" role="status" />;
  }

  if (!loading && (!trip || destinations.length === 0)) {
    return (
      <div className="container py-5 text-center">
        <p className="fs-5">{tripError || "Your plan is empty. Add destinations before booking."}</p>
        <Link to="/places" className="btn btn-success">Browse Destinations</Link>
      </div>
    );
  }

  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  return (
    <div className="container my-4 mb-5">
      <h2 className="text-center mb-4">Booking Details {"\uD83E\uDDFE"}</h2>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card p-4 mb-4">
            <h5>Trip Summary</h5>
            {destinations.map((d) => (
              <div key={d._id} className="d-flex justify-content-between py-1 border-bottom small">
                <span>{d.name}</span>
                <span className="text-muted">{formatINR(d.price)} {"\u00D7"} {trip.travellers}</span>
              </div>
            ))}
            <div className="d-flex justify-content-between mt-2">
              <span>Travellers</span><span>{trip.travellers}</span>
            </div>
            <div className="d-flex justify-content-between">
              <strong>Total</strong>
              <strong className="text-success">{formatINR(trip.totalCost)}</strong>
            </div>
            {trip.budget > 0 && (
              <div className="d-flex justify-content-between small text-muted">
                <span>Budget</span><span>{formatINR(trip.budget)}</span>
              </div>
            )}
          </div>

          <form className="card p-4" onSubmit={handleBook}>
            <h5>Contact Details</h5>
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <label className="form-label small mt-2">Full Name</label>
            <input
              className="form-control"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              required
            />
            <label className="form-label small mt-3">Phone Number</label>
            <input
              className="form-control"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9876543210"
              required
            />
            <label className="form-label small mt-3">Travel Date</label>
            <input
              type="date"
              className="form-control"
              min={tomorrow}
              value={travelDate}
              onChange={(e) => setTravelDate(e.target.value)}
              required
            />
            <button className="btn btn-success w-100 mt-4" disabled={busy}>
              {busy ? "Confirming..." : "Confirm Booking"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
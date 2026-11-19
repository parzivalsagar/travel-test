import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import { formatINR } from "../services/format";

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function Receipt() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    api
      .get(`/bookings/${id}`)
      .then(({ data }) => setBooking(data.booking))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success" role="status" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error || "Booking not found"}</div>
        <Link to="/dashboard">Back to dashboard</Link>
      </div>
    );
  }

  return (
    <div className="container my-4 mb-5">
      <div className="receipt-box card p-4 p-md-5">
        <div className="text-center mb-4">
          <h2>Booking Confirmed {"\u2714"}</h2>
          <p className="fst-italic text-muted">
            {"\u201C"}May your journey be light, your heart full, and your
            memories everlasting.{"\u201D"}
          </p>
        </div>

        <div className="d-flex justify-content-between flex-wrap gap-2 mb-3">
          <div>
            <div className="small text-muted">Booking Reference</div>
            <strong>{booking.reference}</strong>
          </div>
          <div className="text-md-end">
            <div className="small text-muted">Booked On</div>
            <span>{formatDate(booking.createdAt)}</span>
          </div>
        </div>

        <hr />
        <h5>Itinerary</h5>
        {booking.destinations.map((d) => (
          <div key={d._id} className="d-flex justify-content-between py-1 border-bottom small">
            <span>{d.name}</span>
            <span className="text-muted">{formatINR(d.price)} {"\u00D7"} {booking.travellers}</span>
          </div>
        ))}
        <div className="d-flex justify-content-between mt-2">
          <span>Contact</span>
          <span className="text-muted">{booking.contactName} {"\u00B7"} {booking.phone}</span>
        </div>
        <div className="d-flex justify-content-between">
          <span>Travel Date</span>
          <span className="text-muted">{formatDate(booking.travelDate)}</span>
        </div>
        <div className="d-flex justify-content-between">
          <span>Travellers</span>
          <span className="text-muted">{booking.travellers}</span>
        </div>
        <div className="d-flex justify-content-between mt-3 fs-5">
          <strong>Total Amount</strong>
          <strong className="text-success">{formatINR(booking.totalAmount)}</strong>
        </div>

        <div className="no-print mt-4 d-flex gap-2 flex-wrap">
          <button className="btn btn-success" onClick={() => window.print()}>
            Print Receipt
          </button>
          <Link to="/dashboard" className="btn btn-outline-secondary">
            View My Trips
          </Link>
        </div>
      </div>
    </div>
  );
}
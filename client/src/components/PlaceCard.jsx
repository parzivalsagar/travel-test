import { Link } from "react-router-dom";
import { formatINR } from "../services/format";

export default function PlaceCard({ place, added, onAdd, index = 0 }) {
  return (
    <div
      className="col-md-6 col-lg-4 mb-4 place-appear"
      style={{ animationDelay: `${index * 0.2}s` }}
    >
      <div className="card place-card h-100">
        <img src={place.image} className="card-img-top" alt={place.name} />
        <div className="card-body d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start">
            <h5 className="card-title mb-1">{place.name}</h5>
            <span className="badge-soft">{place.category}</span>
          </div>
          <p className="fst-italic small text-muted">{place.quote}</p>
          <p className="mb-1">{"\uD83D\uDCB0"} {formatINR(place.price)} / person</p>
          <p className="mb-2">{"\uD83D\uDCCD"} {place.distanceKm} km from town</p>

          <div className="mt-auto d-grid gap-2">
            <Link to={`/places/${place._id}`} className="btn btn-outline-secondary btn-sm">
              View Details
            </Link>
            {onAdd &&
              (added ? (
                <Link to="/plan" className="btn btn-outline-success btn-sm">
                  Added {"\u2713"} View My Plan
                </Link>
              ) : (
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => onAdd(place._id)}
                >
                  Add to Plan
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

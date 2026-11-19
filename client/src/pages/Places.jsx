import { useEffect, useMemo, useRef, useState } from "react";
import api from "../services/api";
import PlaceCard from "../components/PlaceCard";
import Toast from "../components/Toast";
import { useTrip } from "../context/TripContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Places() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addDestination, hasDestination } = useTrip();

  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [maxDistance, setMaxDistance] = useState("");
  const [sort, setSort] = useState("");
  const [categories, setCategories] = useState([]);

  const debounce = useRef(null);

  useEffect(() => {
    setLoading(true);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (category) params.set("category", category);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      if (maxDistance) params.set("maxDistance", maxDistance);
      if (sort) params.set("sort", sort);
      try {
        const { data } = await api.get(`/destinations?${params.toString()}`);
        setDestinations(data.destinations);
        setCategories((prev) => {
          const all = [...new Set(data.destinations.map((d) => d.category))];
          return prev.length ? prev : [...new Set([...prev, ...all])];
        });
        setError("");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(debounce.current);
  }, [search, category, minPrice, maxPrice, maxDistance, sort]);

  const resultCount = useMemo(() => destinations.length, [destinations]);

  async function handleAdd(destId) {
    if (!user) {
      navigate("/login", { state: { from: "/places" } });
      return;
    }
    try {
      await addDestination(destId);
      setToast("Added to your plan");
      setTimeout(() => setToast(""), 2500);
    } catch (err) {
      setError(err.message);
    }
  }

  function clearFilters() {
    setSearch("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setMaxDistance("");
    setSort("");
  }

  return (
    <div className="container mt-4 mb-5">
      <h2 className="text-center mb-1">Places to Explore {"\uD83C\uDF04"}</h2>
      <p className="text-center fst-italic mb-4">
        {"\u201C"}Take only memories, leave only footprints.{"\u201D"}
      </p>

      <div className="filter-bar mb-4">
        <div className="row g-2 align-items-end">
          <div className="col-md-4">
            <label className="form-label small mb-1">Search</label>
            <input
              type="text"
              className="form-control"
              placeholder="Mountains, waterfalls, coffee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="col-md-3 col-sm-6">
            <label className="form-label small mb-1">Category</label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="col-md-2 col-sm-6">
            <label className="form-label small mb-1">Max price (₹)</label>
            <input
              type="number"
              className="form-control"
              placeholder="Any"
              min="0"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
          <div className="col-md-2 col-sm-6">
            <label className="form-label small mb-1">Max distance (km)</label>
            <input
              type="number"
              className="form-control"
              placeholder="Any"
              min="0"
              value={maxDistance}
              onChange={(e) => setMaxDistance(e.target.value)}
            />
          </div>
          <div className="col-md-1 col-sm-6 d-grid">
            <button className="btn btn-outline-secondary" onClick={clearFilters}>
              Reset
            </button>
          </div>
        </div>
        <div className="row g-2 mt-2">
          <div className="col-md-4 col-sm-6">
            <label className="form-label small mb-1">Min price (₹)</label>
            <input
              type="number"
              className="form-control"
              placeholder="0"
              min="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </div>
          <div className="col-md-4 col-sm-6">
            <label className="form-label small mb-1">Sort by</label>
            <select
              className="form-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="">Name (A-Z)</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
              <option value="distance_asc">Distance: nearest first</option>
            </select>
          </div>
        </div>
      </div>

      <p className="text-muted small mb-3">
        {loading ? "Loading..." : `${resultCount} destination${resultCount === 1 ? "" : "s"} found`}
      </p>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row" id="places">
        {!loading &&
          destinations.map((place, i) => (
            <PlaceCard
              key={place._id}
              place={place}
              index={i}
              added={hasDestination(place._id)}
              onAdd={handleAdd}
            />
          ))}
        {!loading && destinations.length === 0 && (
          <div className="col-12 text-center py-5 text-muted">
            No destinations match your filters.
          </div>
        )}
      </div>

      <Toast message={toast} show={Boolean(toast)} />
    </div>
  );
}
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const features = [
  {
    title: "Live Destination Feed",
    desc: "Browse mountain peaks, waterfalls and coffee estates fetched straight from the database.",
    icon: "\uD83C\uDFD4\uFE0F",
  },
  {
    title: "Search & Filter",
    desc: "Filter by price, distance or category to find exactly the escape you need.",
    icon: "\uD83D\uDD0D",
  },
  {
    title: "Plan & Budget",
    desc: "Build your trip, set a budget and travellers, and watch the total update instantly.",
    icon: "\uD83E\uDDFE",
  },
  {
    title: "Book Instantly",
    desc: "Confirm your journey and get a printable receipt with a booking reference.",
    icon: "\uD83C\uDF81",
  },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div>
      <section className="hero-premium">
        <div className="hero-content">
          <h1>Escape to Chikkamagaluru</h1>
          <p>Where mountains, mist, and coffee slow life down</p>
          <Link
            to={user ? "/places" : "/register"}
            className="btn btn-success btn-lg mt-3"
          >
            Plan Your Trip {"\uD83C\uDF3F"}
          </Link>
          {!user && (
            <p className="small mt-3 text-white-50">
              Already registered? <Link to="/login" className="text-white">Login</Link>
            </p>
          )}
        </div>
        <div className="scroll-hint">{"\u2193"} Scroll</div>
      </section>

      <section className="section-light">
        <div className="container">
          <h2 className="section-title mb-2">Why Travel With Us?</h2>
          <p className="section-sub mb-5">
            A complete travel management experience for the coffee capital of Karnataka.
          </p>
          <div className="row g-4">
            {features.map((f) => (
              <div className="col-md-6 col-lg-3" key={f.title}>
                <div className="feature-card">
                  <div style={{ fontSize: "2rem" }}>{f.icon}</div>
                  <h5 className="mt-2">{f.title}</h5>
                  <p className="small text-muted mb-0">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="quote-section">
        <h3 className="mb-0">
          {"\u201C"}Take only memories, leave only footprints.{"\u201D"}
        </h3>
      </section>

      <footer className="footer">
        The Chikkamagaluru Escape {"\u00B7"} Coffee, Mountains & Mist
      </footer>
    </div>
  );
}
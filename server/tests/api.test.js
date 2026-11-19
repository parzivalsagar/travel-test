process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret_key_for_jest";
process.env.JWT_EXPIRES_IN = "1h";

const mongoose = require("mongoose");
const request = require("supertest");
const connectDB = require("../config/db");
const app = require("../app");
const Destination = require("../models/Destination");
const User = require("../models/User");
const Trip = require("../models/Trip");
const Booking = require("../models/Booking");

const TEST_URI =
  process.env.TEST_MONGO_URI ||
  "mongodb://127.0.0.1:27017/chikkamagaluru_tourism_test";

let destA;
let destB;

async function registerUser(overrides = {}) {
  const payload = {
    name: "Test User",
    email: `user${Date.now()}${Math.random()}@test.com`,
    password: "secret123",
    ...overrides,
  };
  const res = await request(app).post("/api/auth/register").send(payload);
  return { res, payload };
}

beforeAll(async () => {
  await connectDB(TEST_URI);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Promise.all([
    User.deleteMany({}),
    Destination.deleteMany({}),
    Trip.deleteMany({}),
    Booking.deleteMany({}),
  ]);

  destA = await Destination.create({
    name: "Mullayanagiri",
    slug: "mullayanagiri",
    description: "Highest peak",
    price: 1500,
    distanceKm: 20,
    category: "Trekking",
    image: "/images/mullayanagiri.jpg",
  });
  destB = await Destination.create({
    name: "Hebbe Falls",
    slug: "hebbe-falls",
    description: "Waterfall",
    price: 1800,
    distanceKm: 30,
    category: "Waterfall",
    image: "/images/hebbefalls.jpg",
  });
});

describe("Health", () => {
  test("GET /api/health returns ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe("Auth", () => {
  test("registers a new user and returns token", async () => {
    const { res, payload } = await registerUser();
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(payload.email);
    expect(res.body.user.password).toBeUndefined();
  });

  test("rejects duplicate email with 409", async () => {
    const { payload } = await registerUser();
    const res = await request(app).post("/api/auth/register").send(payload);
    expect(res.status).toBe(409);
  });

  test("rejects invalid registration input with 400", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "", email: "not-an-email", password: "123" });
    expect(res.status).toBe(400);
    expect(res.body.details.length).toBeGreaterThan(0);
  });

  test("logs in with valid credentials", async () => {
    const { payload } = await registerUser();
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: payload.email, password: payload.password });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test("rejects wrong password with 401", async () => {
    const { payload } = await registerUser();
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: payload.email, password: "wrongpass" });
    expect(res.status).toBe(401);
  });

  test("stores password hashed, not plaintext", async () => {
    const { payload } = await registerUser();
    const user = await User.findOne({ email: payload.email }).select("+password");
    expect(user.password).not.toBe(payload.password);
  });
});

describe("Destinations", () => {
  test("lists destinations", async () => {
    const res = await request(app).get("/api/destinations");
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(2);
  });

  test("filters by search and price range", async () => {
    const search = await request(app).get("/api/destinations?search=falls");
    expect(search.body.count).toBe(1);
    expect(search.body.destinations[0].name).toBe("Hebbe Falls");

    const priced = await request(app).get(
      "/api/destinations?minPrice=1400&maxPrice=1600"
    );
    expect(priced.body.count).toBe(1);
    expect(priced.body.destinations[0].name).toBe("Mullayanagiri");
  });

  test("gets destination by slug and 404 for unknown", async () => {
    const ok = await request(app).get("/api/destinations/mullayanagiri");
    expect(ok.status).toBe(200);

    const missing = await request(app).get("/api/destinations/does-not-exist");
    expect(missing.status).toBe(404);
  });
});

describe("Trips (protected + ownership)", () => {
  async function authUser() {
    const { res, payload } = await registerUser();
    return { token: res.body.token, payload };
  }

  test("requires auth for trip list", async () => {
    const res = await request(app).get("/api/trips");
    expect(res.status).toBe(401);
  });

  test("creates trip, adds/removes destinations, computes totals", async () => {
    const { token } = await authUser();

    const created = await request(app)
      .post("/api/trips")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "My Trip", travellers: 2, budget: 7000 });
    expect(created.status).toBe(201);

    const tripId = created.body.trip._id;

    const added = await request(app)
      .post(`/api/trips/${tripId}/destinations`)
      .set("Authorization", `Bearer ${token}`)
      .send({ destinationId: destA._id });
    expect(added.body.trip.destinations.length).toBe(1);

    const addedB = await request(app)
      .post(`/api/trips/${tripId}/destinations`)
      .set("Authorization", `Bearer ${token}`)
      .send({ destinationId: destB._id });
    // (1500 + 1800) * 2 = 6600
    expect(addedB.body.trip.totalCost).toBe(6600);
    expect(addedB.body.trip.withinBudget).toBe(true);

    const duplicate = await request(app)
      .post(`/api/trips/${tripId}/destinations`)
      .set("Authorization", `Bearer ${token}`)
      .send({ destinationId: destA._id });
    expect(duplicate.body.trip.destinations.length).toBe(2);

    const removed = await request(app)
      .delete(`/api/trips/${tripId}/destinations/${destB._id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(removed.body.trip.destinations.length).toBe(1);
    expect(removed.body.trip.totalCost).toBe(3000);
  });

  test("prevents access to another user's trip (403)", async () => {
    const owner = await authUser();
    const other = await authUser();

    const created = await request(app)
      .post("/api/trips")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ travellers: 1 });
    const tripId = created.body.trip._id;

    const res = await request(app)
      .get(`/api/trips/${tripId}`)
      .set("Authorization", `Bearer ${other.token}`);
    expect(res.status).toBe(403);
  });
});

describe("Bookings", () => {
  async function setupBookableTrip() {
    const { res } = await registerUser();
    const token = res.body.token;
    const trip = await request(app)
      .post("/api/trips")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Book Trip", travellers: 2, budget: 5000 });
    const tripId = trip.body.trip._id;
    await request(app)
      .post(`/api/trips/${tripId}/destinations`)
      .set("Authorization", `Bearer ${token}`)
      .send({ destinationId: destA._id });
    return { token, tripId };
  }

  test("creates a booking with computed total and reference", async () => {
    const { token, tripId } = await setupBookableTrip();
    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send({
        tripId,
        contactName: "Jane Doe",
        phone: "+91 9876543210",
        travelDate: "2026-11-01",
      });
    expect(res.status).toBe(201);
    expect(res.body.booking.reference).toMatch(/^CKM-/);
    expect(res.body.booking.totalAmount).toBe(3000); // 1500 * 2
  });

  test("rejects booking an empty trip", async () => {
    const { res } = await registerUser();
    const token = res.body.token;
    const trip = await request(app)
      .post("/api/trips")
      .set("Authorization", `Bearer ${token}`)
      .send({ travellers: 1 });
    const res2 = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send({
        tripId: trip.body.trip._id,
        contactName: "Jane",
        phone: "9876543210",
        travelDate: "2026-11-01",
      });
    expect(res2.status).toBe(400);
  });

  test("rejects invalid booking input", async () => {
    const { token, tripId } = await setupBookableTrip();
    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send({ tripId, contactName: "", phone: "abc", travelDate: "nope" });
    expect(res.status).toBe(400);
  });

  test("prevents viewing another user's booking (403)", async () => {
    const { token, tripId } = await setupBookableTrip();
    const booking = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send({
        tripId,
        contactName: "Jane",
        phone: "9876543210",
        travelDate: "2026-11-01",
      });
    const bookingId = booking.body.booking._id;

    const { res: other } = await registerUser();
    const res = await request(app)
      .get(`/api/bookings/${bookingId}`)
      .set("Authorization", `Bearer ${other.body.token}`);
    expect(res.status).toBe(403);
  });
});

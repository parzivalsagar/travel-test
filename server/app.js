const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const destinationRoutes = require("./routes/destinationRoutes");
const tripRoutes = require("./routes/tripRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(null, false);
    },
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => {
  res.json({ success: true, status: "ok", service: "Chikkamagaluru Travel API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/destinations", destinationRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/bookings", bookingRoutes);

// Serve the built React app in production if present
const clientBuild = path.join(__dirname, "..", "client", "dist");
app.use(express.static(clientBuild));
app.get(/^(?!\/api).*/, (req, res, next) => {
  res.sendFile(path.join(clientBuild, "index.html"), (err) => {
    if (err) next();
  });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;

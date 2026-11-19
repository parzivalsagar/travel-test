const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const Trip = require("../models/Trip");
const Destination = require("../models/Destination");

function serializeTrip(trip) {
  const plain = trip.toObject ? trip.toObject() : trip;
  const perPerson = (plain.destinations || []).reduce(
    (sum, d) => sum + (d.price || 0),
    0
  );
  const totalCost = perPerson * plain.travellers;
  return {
    ...plain,
    perPerson,
    totalCost,
    withinBudget: plain.budget >= totalCost,
  };
}

const listTrips = asyncHandler(async (req, res) => {
  const trips = await Trip.find({ user: req.user._id })
    .populate("destinations")
    .sort({ createdAt: -1 });
  res.json({ success: true, count: trips.length, trips: trips.map(serializeTrip) });
});

const createTrip = asyncHandler(async (req, res) => {
  const { name, travellers, budget } = req.body;
  const trip = await Trip.create({
    user: req.user._id,
    name,
    travellers,
    budget,
    destinations: [],
  });
  await trip.populate("destinations");
  res.status(201).json({ success: true, trip: serializeTrip(trip) });
});

async function findOwnedTrip(id, userId) {
  const trip = await Trip.findById(id).populate("destinations");
  if (!trip) throw new ApiError(404, "Trip not found");
  if (trip.user.toString() !== userId.toString()) {
    throw new ApiError(403, "You do not have access to this trip");
  }
  return trip;
}

const getTrip = asyncHandler(async (req, res) => {
  const trip = await findOwnedTrip(req.params.id, req.user._id);
  res.json({ success: true, trip: serializeTrip(trip) });
});

const updateTrip = asyncHandler(async (req, res) => {
  const trip = await findOwnedTrip(req.params.id, req.user._id);
  const { name, travellers, budget, status } = req.body;
  if (name !== undefined) trip.name = name;
  if (travellers !== undefined) trip.travellers = travellers;
  if (budget !== undefined) trip.budget = budget;
  if (status !== undefined) trip.status = status;
  await trip.save();
  await trip.populate("destinations");
  res.json({ success: true, trip: serializeTrip(trip) });
});

const deleteTrip = asyncHandler(async (req, res) => {
  const trip = await findOwnedTrip(req.params.id, req.user._id);
  await trip.deleteOne();
  res.json({ success: true, message: "Trip deleted" });
});

const addDestination = asyncHandler(async (req, res) => {
  const trip = await findOwnedTrip(req.params.id, req.user._id);
  const { destinationId } = req.body;

  const destination = await Destination.findById(destinationId);
  if (!destination) throw new ApiError(404, "Destination not found");

  const already = trip.destinations.some(
    (d) => d._id.toString() === destinationId.toString()
  );
  if (!already) {
    trip.destinations.push(destination._id);
    await trip.save();
    await trip.populate("destinations");
  }
  res.json({ success: true, trip: serializeTrip(trip) });
});

const removeDestination = asyncHandler(async (req, res) => {
  const trip = await findOwnedTrip(req.params.id, req.user._id);
  trip.destinations = trip.destinations.filter(
    (d) => d._id.toString() !== req.params.destinationId
  );
  await trip.save();
  await trip.populate("destinations");
  res.json({ success: true, trip: serializeTrip(trip) });
});

module.exports = {
  listTrips,
  createTrip,
  getTrip,
  updateTrip,
  deleteTrip,
  addDestination,
  removeDestination,
  serializeTrip,
  findOwnedTrip,
};

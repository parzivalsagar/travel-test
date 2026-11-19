const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const Booking = require("../models/Booking");
const Trip = require("../models/Trip");
const { serializeTrip, findOwnedTrip } = require("./tripController");

function generateReference() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `CKM-${stamp}-${rand}`;
}

const createBooking = asyncHandler(async (req, res) => {
  const { tripId, contactName, phone, travelDate } = req.body;

  const trip = await findOwnedTrip(tripId, req.user._id);
  if (trip.destinations.length === 0) {
    throw new ApiError(400, "Cannot book an empty trip. Add destinations first.");
  }

  const serialized = serializeTrip(trip);
  const booking = await Booking.create({
    user: req.user._id,
    trip: trip._id,
    reference: generateReference(),
    contactName,
    phone,
    travelDate,
    travellers: trip.travellers,
    totalAmount: serialized.totalCost,
    destinations: trip.destinations.map((d) => d._id),
  });

  trip.status = "booked";
  await trip.save();

  const populated = await booking.populate([
    { path: "destinations" },
    { path: "trip" },
  ]);

  res.status(201).json({ success: true, booking: populated });
});

const listBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate("destinations")
    .populate("trip")
    .sort({ createdAt: -1 });
  res.json({ success: true, count: bookings.length, bookings });
});

const getBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate("destinations")
    .populate("trip");
  if (!booking) throw new ApiError(404, "Booking not found");
  if (booking.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You do not have access to this booking");
  }
  res.json({ success: true, booking });
});

module.exports = { createBooking, listBookings, getBooking };

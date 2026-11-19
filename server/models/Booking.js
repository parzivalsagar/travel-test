const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },
    reference: {
      type: String,
      required: true,
      unique: true,
    },
    contactName: {
      type: String,
      required: [true, "Contact name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^[0-9+\-\s]{7,15}$/, "Please provide a valid phone number"],
    },
    travelDate: {
      type: Date,
      required: [true, "Travel date is required"],
    },
    travellers: {
      type: Number,
      required: true,
      min: [1, "At least one traveller is required"],
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, "Total cannot be negative"],
    },
    destinations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Destination",
      },
    ],
    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);

const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      default: "My Chikkamagaluru Trip",
    },
    travellers: {
      type: Number,
      default: 1,
      min: [1, "At least one traveller is required"],
      max: [50, "Too many travellers"],
    },
    budget: {
      type: Number,
      default: 0,
      min: [0, "Budget cannot be negative"],
    },
    destinations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Destination",
      },
    ],
    status: {
      type: String,
      enum: ["planning", "booked"],
      default: "planning",
    },
  },
  { timestamps: true }
);

tripSchema.methods.calculateTotal = function calculateTotal() {
  const perPerson = this.destinations.reduce(
    (sum, d) => sum + (d.price || 0),
    0
  );
  return perPerson * this.travellers;
};

module.exports = mongoose.model("Trip", tripSchema);

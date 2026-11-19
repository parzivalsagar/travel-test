const mongoose = require("mongoose");

const destinationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Destination name is required"],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    quote: {
      type: String,
      trim: true,
      default: "",
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    distanceKm: {
      type: Number,
      required: [true, "Distance is required"],
      min: [0, "Distance cannot be negative"],
    },
    category: {
      type: String,
      trim: true,
      default: "Nature",
    },
    image: {
      type: String,
      required: [true, "Image path is required"],
    },
  },
  { timestamps: true }
);

destinationSchema.index({ name: "text", description: "text", category: "text" });

module.exports = mongoose.model("Destination", destinationSchema);

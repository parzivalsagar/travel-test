const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const Destination = require("../models/Destination");

const listDestinations = asyncHandler(async (req, res) => {
  const { search, category, minPrice, maxPrice, maxDistance, sort } = req.query;
  const filter = {};

  if (search) {
    const rx = new RegExp(String(search).trim(), "i");
    filter.$or = [{ name: rx }, { description: rx }, { quote: rx }, { category: rx }];
  }
  if (category) {
    filter.category = new RegExp(`^${category}$`, "i");
  }
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
    if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
  }
  if (maxDistance !== undefined) {
    filter.distanceKm = { $lte: Number(maxDistance) };
  }

  const sortMap = {
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    distance_asc: { distanceKm: 1 },
    distance_desc: { distanceKm: -1 },
    name_asc: { name: 1 },
  };

  const destinations = await Destination.find(filter).sort(
    sortMap[sort] || { name: 1 }
  );

  res.json({ success: true, count: destinations.length, destinations });
});

const getDestination = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { slug: id };
  const destination = await Destination.findOne(query);
  if (!destination) {
    throw new ApiError(404, "Destination not found");
  }
  res.json({ success: true, destination });
});

module.exports = { listDestinations, getDestination };

const { verifyToken } = require("../utils/token");
const ApiError = require("../utils/ApiError");
const User = require("../models/User");

async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) {
      throw new ApiError(401, "Not authorized, no token provided");
    }
    const token = header.split(" ")[1];
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new ApiError(401, "Not authorized, user no longer exists");
    }
    req.user = user;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return next(new ApiError(401, "Not authorized, invalid or expired token"));
    }
    next(err);
  }
}

module.exports = { protect };

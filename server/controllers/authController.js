const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { signToken } = require("../utils/token");
const User = require("../models/User");

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ApiError(409, "An account with that email already exists");
  }

  const user = await User.create({ name, email, password });
  const token = signToken(user._id);

  res.status(201).json({ success: true, token, user: user.toSafeJSON() });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password"
  );
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = signToken(user._id);
  res.json({ success: true, token, user: user.toSafeJSON() });
});

const me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toSafeJSON() });
});

module.exports = { register, login, me };

const mongoose = require("mongoose");

async function connectDB(uri) {
  const mongoUri = uri || process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI is not defined");
  }
  mongoose.set("strictQuery", true);
  const conn = await mongoose.connect(mongoUri);
  return conn;
}

module.exports = connectDB;

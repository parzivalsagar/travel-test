require("dotenv").config();
const connectDB = require("./config/db");
const mongoose = require("mongoose");
const Destination = require("./models/Destination");

const destinations = [
  {
    name: "Mullayanagiri",
    slug: "mullayanagiri",
    description:
      "The highest peak in Karnataka, wrapped in mist and rolling grasslands. A sunrise here above the clouds is unforgettable.",
    quote: "Climb the mountains and feel the peace.",
    price: 1500,
    distanceKm: 20,
    category: "Trekking",
    image: "/images/mullayanagiri.jpg",
  },
  {
    name: "Baba Budangiri",
    slug: "baba-budangiri",
    description:
      "A sacred mountain range famous for its coffee estates and the historic shrine that sits among the clouds.",
    quote: "Where nature whispers serenity.",
    price: 1200,
    distanceKm: 25,
    category: "Nature",
    image: "/images/bababudangiri.jpg",
  },
  {
    name: "Hebbe Falls",
    slug: "hebbe-falls",
    description:
      "A stunning two-tier waterfall hidden deep inside a coffee estate, reached by a bumpy off-road jeep ride.",
    quote: "Let the water wash away your worries.",
    price: 1800,
    distanceKm: 30,
    category: "Waterfall",
    image: "/images/hebbefalls.jpg",
  },
];

async function seed() {
  try {
    await connectDB();
    console.log("Connected to MongoDB for seeding...");

    for (const d of destinations) {
      await Destination.findOneAndUpdate({ slug: d.slug }, d, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      });
      console.log(`Seeded: ${d.name}`);
    }

    console.log("Seeding complete.");
  } catch (err) {
    console.error("Seeding failed:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

seed();
